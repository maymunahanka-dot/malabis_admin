import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL;

export function useConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/consultations`);
      const data = await res.json();
      setConsultations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (formData) => {
    const res = await fetch(`${API}/consultations`, {
      method: 'POST',
      body: formData, // multipart for image uploads
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create');
    setConsultations((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id, formData) => {
    const res = await fetch(`${API}/consultations/${id}`, {
      method: 'PUT',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
    setConsultations((prev) => prev.map((c) => (c._id === id ? data : c)));
    return data;
  };

  const remove = async (id) => {
    const res = await fetch(`${API}/consultations/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    setConsultations((prev) => prev.filter((c) => c._id !== id));
  };

  return { consultations, loading, error, create, update, remove, refetch: fetchAll };
}
