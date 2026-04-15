import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export function useConsultationPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'consultation-packages'));
      // use the Firestore document ID as the id
      setPackages(snap.docs.map(d => ({ ...d.data(), id: d.id })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updatePrices = async (id, options) => {
    console.log('Updating doc ID:', id);
    await updateDoc(doc(db, 'consultation-packages', id), { options });
    setPackages(prev => prev.map(p => p.id === id ? { ...p, options } : p));
  };

  return { packages, loading, error, updatePrices };
}
