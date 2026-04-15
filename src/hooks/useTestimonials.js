import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/uploadToCloudinary';

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [tSnap, vSnap] = await Promise.all([
      getDocs(query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'testimonial-videos'), orderBy('order', 'asc'))),
    ]);
    setTestimonials(tSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setVideos(vSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createTestimonial = async ({ imageFile, imagePreview, name, text, stars, isFeatured }) => {
    const image = imageFile ? await uploadToCloudinary(imageFile) : imagePreview || '';
    const ref = await addDoc(collection(db, 'testimonials'), { name, text, stars: Number(stars), isFeatured: !!isFeatured, image, createdAt: serverTimestamp() });
    setTestimonials(prev => [{ id: ref.id, name, text, stars, isFeatured, image }, ...prev]);
  };

  const updateTestimonial = async (id, { imageFile, imagePreview, name, text, stars, isFeatured }) => {
    const image = imageFile ? await uploadToCloudinary(imageFile) : imagePreview || '';
    await updateDoc(doc(db, 'testimonials', id), { name, text, stars: Number(stars), isFeatured: !!isFeatured, image });
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, name, text, stars, isFeatured, image } : t));
  };

  const deleteTestimonial = async (id) => {
    await deleteDoc(doc(db, 'testimonials', id));
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const setFeatured = async (id) => {
    // unset all, then set this one
    await Promise.all(testimonials.map(t =>
      updateDoc(doc(db, 'testimonials', t.id), { isFeatured: t.id === id })
    ));
    setTestimonials(prev => prev.map(t => ({ ...t, isFeatured: t.id === id })));
  };

  const createVideo = async ({ youtubeUrl, name, order }) => {
    const ref = await addDoc(collection(db, 'testimonial-videos'), { youtubeUrl, name, order: Number(order) || 0 });
    setVideos(prev => [...prev, { id: ref.id, youtubeUrl, name, order }].sort((a, b) => a.order - b.order));
  };

  const deleteVideo = async (id) => {
    await deleteDoc(doc(db, 'testimonial-videos', id));
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  return { testimonials, videos, loading, createTestimonial, updateTestimonial, deleteTestimonial, setFeatured, createVideo, deleteVideo };
}
