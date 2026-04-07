import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL;

export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/clients`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (body) => {
    const res = await fetch(`${API}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create');
    setClients((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id, body) => {
    const res = await fetch(`${API}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
    setClients((prev) => prev.map((c) => (c._id === id ? data : c)));
    return data;
  };

  const remove = async (id) => {
    const res = await fetch(`${API}/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    setClients((prev) => prev.filter((c) => c._id !== id));
  };

  return { clients, loading, error, create, update, remove };
}
