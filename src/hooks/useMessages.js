import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL;

export function useMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/messages`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = async (body) => {
    const res = await fetch(`${API}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create');
    setMessages((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id, body) => {
    const res = await fetch(`${API}/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
    setMessages((prev) => prev.map((m) => (m._id === id ? data : m)));
    return data;
  };

  const remove = async (id) => {
    const res = await fetch(`${API}/messages/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    setMessages((prev) => prev.filter((m) => m._id !== id));
  };

  return { messages, loading, error, create, update, remove };
}
