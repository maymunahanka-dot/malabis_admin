import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL;

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/portfolio`);
      const data = await res.json();
      setPortfolio(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (formData) => {
    const res = await fetch(`${API}/portfolio`, { method: 'POST', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create');
    setPortfolio((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id, formData) => {
    const res = await fetch(`${API}/portfolio/${id}`, { method: 'PUT', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
    setPortfolio((prev) => prev.map((p) => (p._id === id ? data : p)));
    return data;
  };

  const remove = async (id) => {
    const res = await fetch(`${API}/portfolio/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    setPortfolio((prev) => prev.filter((p) => p._id !== id));
  };

  return { portfolio, loading, error, create, update, remove };
}
