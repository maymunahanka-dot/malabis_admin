import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'subscriptions'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      setSubscriptions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (body) => {
    const ref = await addDoc(collection(db, 'subscriptions'), { ...body, date: serverTimestamp() });
    const newDoc = { id: ref.id, ...body };
    setSubscriptions(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const update = async (id, body) => {
    await updateDoc(doc(db, 'subscriptions', id), body);
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...body } : s));
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'subscriptions', id));
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  return { subscriptions, loading, error, create, update, remove };
}
