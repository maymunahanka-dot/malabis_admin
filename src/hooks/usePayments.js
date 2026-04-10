import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (body) => {
    const ref = await addDoc(collection(db, 'payments'), { ...body, createdAt: serverTimestamp() });
    const newDoc = { id: ref.id, ...body };
    setPayments(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const update = async (id, body) => {
    await updateDoc(doc(db, 'payments', id), body);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...body } : p));
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'payments', id));
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  return { payments, loading, error, create, update, remove };
}
