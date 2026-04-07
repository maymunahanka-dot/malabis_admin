import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL;

export function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/payments`);
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (body) => {
    const res = await fetch(`${API}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create');
    setPayments((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id, body) => {
    const res = await fetch(`${API}/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
    setPayments((prev) => prev.map((p) => (p._id === id ? data : p)));
    return data;
  };

  const remove = async (id) => {
    const res = await fetch(`${API}/payments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    setPayments((prev) => prev.filter((p) => p._id !== id));
  };

  return { payments, loading, error, create, update, remove };
}
