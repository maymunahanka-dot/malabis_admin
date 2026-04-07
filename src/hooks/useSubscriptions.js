import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL;

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/subscriptions`);
      const data = await res.json();
      const sorted = Array.isArray(data) ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setSubscriptions(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (body) => {
    const res = await fetch(`${API}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create');
    setSubscriptions((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id, body) => {
    const res = await fetch(`${API}/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
    setSubscriptions((prev) => prev.map((s) => (s._id === id ? data : s)));
    return data;
  };

  const remove = async (id) => {
    const res = await fetch(`${API}/subscriptions/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    setSubscriptions((prev) => prev.filter((s) => s._id !== id));
  };

  return { subscriptions, loading, error, create, update, remove };
}
