import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export function useConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'consultations'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setConsultations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (body) => {
    const ref = await addDoc(collection(db, 'consultations'), { ...body, createdAt: serverTimestamp() });
    const newDoc = { id: ref.id, ...body };
    setConsultations(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const update = async (id, body) => {
    await updateDoc(doc(db, 'consultations', id), body);
    setConsultations(prev => prev.map(c => c.id === id ? { ...c, ...body } : c));
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'consultations', id));
    setConsultations(prev => prev.filter(c => c.id !== id));
  };

  return { consultations, loading, error, create, update, remove, refetch: fetchAll };
}
