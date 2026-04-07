import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL;

export function useBlockDays() {
  const [blockDays, setBlockDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/block-days`);
      const data = await res.json();
      setBlockDays(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const block = async (date) => {
    const res = await fetch(`${API}/block-days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to block day');
    setBlockDays((prev) => [...prev, data]);
    return data;
  };

  const unblock = async (id) => {
    const res = await fetch(`${API}/block-days/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to unblock day');
    setBlockDays((prev) => prev.filter((d) => d._id !== id));
  };

  return { blockDays, loading, error, block, unblock };
}
