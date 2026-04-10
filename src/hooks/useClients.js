import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'clients'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (body) => {
    const ref = await addDoc(collection(db, 'clients'), { ...body, createdAt: serverTimestamp() });
    const newDoc = { id: ref.id, ...body };
    setClients(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const update = async (id, body) => {
    await updateDoc(doc(db, 'clients', id), body);
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...body } : c));
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'clients', id));
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return { clients, loading, error, create, update, remove };
}
