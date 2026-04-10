import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (body) => {
    const ref = await addDoc(collection(db, 'messages'), { ...body, createdAt: serverTimestamp() });
    const newDoc = { id: ref.id, ...body };
    setMessages(prev => [newDoc, ...prev]);
    return newDoc;
  };

  const update = async (id, body) => {
    await updateDoc(doc(db, 'messages', id), body);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...body } : m));
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'messages', id));
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return { messages, loading, error, create, update, remove };
}
