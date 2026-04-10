import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/uploadToCloudinary';

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'portfolio'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setPortfolio(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async ({ imageFile, category, brideName, weddingLocation, fabricType, dressDescription, hoverText }) => {
    if (!imageFile) throw new Error('Image is required');
    const imageUrl = await uploadToCloudinary(imageFile);
    const data = { category, brideName, weddingLocation, fabricType, dressDescription, hoverText, image: imageUrl };
    const ref = await addDoc(collection(db, 'portfolio'), { ...data, createdAt: serverTimestamp() });
    const newDoc = { id: ref.id, ...data };
    setPortfolio(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const update = async (id, { imageFile, imagePreview, ...rest }) => {
    let image = imagePreview; // keep existing URL if no new file
    if (imageFile) image = await uploadToCloudinary(imageFile);
    const data = { ...rest, image };
    await updateDoc(doc(db, 'portfolio', id), data);
    setPortfolio(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    return data;
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'portfolio', id));
    setPortfolio(prev => prev.filter(p => p.id !== id));
  };

  return { portfolio, loading, error, create, update, remove };
}
