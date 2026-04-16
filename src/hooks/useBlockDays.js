import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

export function useBlockDays() {
  const [blockDays, setBlockDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'blockdays'), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      setBlockDays(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const block = async (date, { location = 'all', appointmentWith = 'all', type = 'all' } = {}) => {
    const ref = await addDoc(collection(db, 'blockdays'), { date, location, appointmentWith, type });
    const newDoc = { id: ref.id, date, location, appointmentWith, type };
    setBlockDays(prev => [...prev, newDoc]);
    return newDoc;
  };

  const unblock = async (id) => {
    await deleteDoc(doc(db, 'blockdays', id));
    setBlockDays(prev => prev.filter(d => d.id !== id));
  };

  return { blockDays, loading, error, block, unblock };
}
