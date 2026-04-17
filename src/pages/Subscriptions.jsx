import { useState, useRef, useEffect } from 'react';
import { Users, CalendarDays, Plus, MoreVertical } from 'lucide-react';
import SlidePanel from '../components/SlidePanel';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] placeholder-[#C0B8A8] focus:outline-none focus:border-[#B8860B] transition-colors";
const lbl = (label, children) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const blank = { name: '', email: '', date: '' };

function SubscriptionForm({ initial, onSubmit, saving }) {
  const [form, setForm] = useState(initial || blank);
  useEffect(() => setForm(initial || blank), [initial]);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col gap-5">
      {lbl('Name', <input className={inputCls} value={form.name} onChange={set('name')} required placeholder="Full name" />)}
      {lbl('Email', <input type="email" className={inputCls} value={form.email} onChange={set('email')} required placeholder="email@example.com" />)}
      {lbl('Date', <input type="date" className={inputCls} value={form.date?.split('T')[0] || ''} onChange={set('date')} />)}
      <button type="submit" disabled={saving}
        className="w-full py-3 mt-2 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A7209] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
        {saving && <Spinner size={16} />} Save
      </button>
    </form>
  );
}

function ActionMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-[#F5F0E8] text-[#8B7355] transition-colors">
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 bg-white border border-[#E5E0D8] rounded-xl shadow-lg w-32 py-1">
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[#4A4035] hover:bg-[#F5F0E8]">Edit</button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Delete</button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, small }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E0D8] px-5 py-4 flex items-center gap-4">
      <div className="text-[#B8860B] bg-[#FAF8F5] p-2 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-[#8B7355]">{label}</p>
        <p className={`font-semibold text-[#B8860B] ${small ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      </div>
    </div>
  );
}

export default function Subscriptions() {
  const { subscriptions, loading, error, create, update, remove } = useSubscriptions();
  const { toast } = useToast();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await create(form);
      setPanelOpen(false);
      toast('Subscriber added');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await update(editing.id, form);
      setEditing(null);
      setPanelOpen(false);
      toast('Subscriber updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove(id);
      toast('Subscriber removed', 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const latest = subscriptions.length
    ? subscriptions.reduce((a, b) => new Date(a.createdAt) > new Date(b.createdAt) ? a : b)
    : null;

  const filtered = subscriptions.filter(s => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
  });

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size={36} /></div>;
  if (error)   return <div className="p-8 text-red-500 text-sm">Failed to load subscriptions: {error}</div>;

  return (
    <div className="px-10 py-8 min-h-screen bg-[#FAF8F5]">
      <div className="mb-6">
        <p className="text-[#B8860B] text-sm font-medium mb-0.5">Welcome back, Aaminah</p>
        <h1 className="text-[2rem] font-bold text-[#2C1F0E] font-serif leading-tight">Subscriptions</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard icon={<Users size={20} />} label="Total Subscribers" value={subscriptions.length} />
        <StatCard icon={<CalendarDays size={20} />} label="Latest Subscription"
          value={latest ? new Date(latest.createdAt || latest.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} small />
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-4 mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="flex-1 px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-full text-sm text-[#8B7355] placeholder-[#C0B8A8] focus:outline-none focus:border-[#B8860B]" />
        <button onClick={() => { setEditing(null); setPanelOpen(true); }}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-medium hover:bg-[#9A7209] transition-colors whitespace-nowrap">
          <Plus size={15} /> + Add
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E0D8] overflow-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E0D8] bg-[#FAF8F5]">
              {['#', 'Name', 'Email', 'Date', ''].map((h, i) => (
                <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-[#8B7355] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-[#A09080]">No subscribers found.</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} className="border-b border-[#F0EBE3] last:border-0 hover:bg-[#FAF8F5] transition-colors">
                <td className="px-5 py-3 text-[#8B7355]">{i + 1}</td>
                <td className="px-5 py-3 font-medium text-[#111827]">{s.name}</td>
                <td className="px-5 py-3 text-[#4b5563]">{s.email}</td>
                <td className="px-5 py-3 text-[#4b5563]">
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : s.date ? new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td className="px-4 py-3">
                  <ActionMenu
                    onEdit={() => { setEditing(s); setPanelOpen(true); }}
                    onDelete={() => handleDelete(s.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel open={panelOpen} onClose={() => { setPanelOpen(false); setEditing(null); }} title={editing ? 'Edit Subscriber' : 'New Subscriber'} width="w-[400px]">
        <SubscriptionForm initial={editing} onSubmit={editing ? handleEdit : handleAdd} saving={saving} />
      </SlidePanel>
    </div>
  );
}
