import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy,
} from 'firebase/firestore';

export function useGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const snap = await getDocs(query(collection(db, 'gallery'), orderBy('order', 'asc')));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async ({ url, order }) => {
    const ref = await addDoc(collection(db, 'gallery'), {
      url,
      order: Number(order) || 0,
      createdAt: serverTimestamp(),
    });
    const newDoc = { id: ref.id, url, order: Number(order) || 0 };
    setItems(prev => [...prev, newDoc].sort((a, b) => a.order - b.order));
    return newDoc;
  };

  const update = async (id, { url, order }) => {
    await updateDoc(doc(db, 'gallery', id), { url, order: Number(order) || 0 });
    setItems(prev => prev.map(i => i.id === id ? { ...i, url, order: Number(order) || 0 } : i));
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'gallery', id));
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return { items, loading, error, create, update, remove };
}
