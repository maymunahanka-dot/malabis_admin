import { useState, useRef, useEffect } from 'react';
import { Search, Plus, TrendingUp, CreditCard, Clock3, RotateCcw, MoreVertical } from 'lucide-react';
import SlidePanel from '../components/SlidePanel';
import { usePayments } from '../hooks/usePayments';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const fmt = (n) => `₦${Number(n).toLocaleString()}`;

const statusBadge = (s) => {
  if (s === 'Paid')    return 'bg-green-100 text-green-700';
  if (s === 'Pending') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] placeholder-[#C0B8A8] focus:outline-none focus:border-[#B8860B] transition-colors";
const selectCls = inputCls + " cursor-pointer";
const lbl = (label, children) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const blank = { clientName: '', service: '', amount: '', paymentMethod: 'Cash', date: '', status: 'Pending' };

function PaymentForm({ initial, onSubmit, saving }) {
  const [form, setForm] = useState(initial || blank);
  useEffect(() => setForm(initial || blank), [initial]);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col gap-5">
      {lbl('Client Name', <input className={inputCls} value={form.clientName} onChange={set('clientName')} required placeholder="Full name" />)}
      {lbl('Service',
        <select className={selectCls} value={form.service} onChange={set('service')} required>
          <option value="">Select service</option>
          {['Physical Bridal Consultation','Virtual Bridal Consultation','Fitting Session','Measurement Session'].map(o => <option key={o}>{o}</option>)}
        </select>
      )}
      {lbl('Amount (₦)', <input type="number" className={inputCls} value={form.amount} onChange={set('amount')} required placeholder="0" />)}
      {lbl('Payment Method',
        <select className={selectCls} value={form.paymentMethod} onChange={set('paymentMethod')}>
          {['Cash','Bank Transfer','Card','Other'].map(o => <option key={o}>{o}</option>)}
        </select>
      )}
      {lbl('Date', <input type="date" className={inputCls} value={form.date?.split('T')[0] || ''} onChange={set('date')} required />)}
      {lbl('Status',
        <select className={selectCls} value={form.status} onChange={set('status')}>
          {['Paid','Pending','Overdue'].map(o => <option key={o}>{o}</option>)}
        </select>
      )}
      <button type="submit" disabled={saving} className="w-full py-3 mt-2 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A7209] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
        {saving && <Spinner size={16} />} Save Payment
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

export default function Payments() {
  const { payments, loading, error, create, update, remove } = usePayments();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await create({ ...form, amount: Number(form.amount) });
      setPanelOpen(false);
      toast('Payment added');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await update(editing._id, { ...form, amount: Number(form.amount) });
      setEditing(null);
      setPanelOpen(false);
      toast('Payment updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove(id);
      toast('Payment deleted', 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const paid    = payments.filter(p => p.status === 'Paid');
  const pending = payments.filter(p => p.status === 'Pending');
  const overdue = payments.filter(p => p.status === 'Overdue');
  const total   = paid.reduce((a, p) => a + Number(p.amount), 0);
  const pendAmt = pending.reduce((a, p) => a + Number(p.amount), 0);
  const overdueAmt = overdue.reduce((a, p) => a + Number(p.amount), 0);

  const stats = [
    { label: 'Total Revenue',    sublabel: 'All paid',              value: fmt(total),      icon: TrendingUp },
    { label: 'Payment Received', sublabel: `${paid.length} transactions`, value: fmt(total), icon: CreditCard },
    { label: 'Pending Payment',  sublabel: `${pending.length} pending`,   value: fmt(pendAmt), icon: Clock3 },
    { label: 'Overdue Payment',  sublabel: `${overdue.length} overdue`,   value: fmt(overdueAmt), icon: RotateCcw },
  ];

  const filtered = payments.filter(p => {
    const matchTab = activeTab === 'All' || p.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || p.clientName?.toLowerCase().includes(q) || p.service?.toLowerCase().includes(q) || p.paymentMethod?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size={36} /></div>;
  if (error)   return <div className="p-8 text-red-500 text-sm">Failed to load payments: {error}</div>;

  return (
    <div className="px-10 py-8 bg-[#F5F0E8] min-h-screen font-sans">
      <div className="mb-6">
        <p className="text-[#B8860B] text-sm font-medium mb-0.5">Welcome back, Aaminah</p>
        <h1 className="text-[2rem] font-bold text-[#2C1F0E] font-serif leading-tight">Payments</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, sublabel, value, icon: Icon }, i) => (
          <div key={i} className="bg-white rounded-2xl px-6 pt-5 pb-6 shadow-sm flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <Icon size={20} className="text-[#B8860B] mb-1" />
              <p className="text-sm font-semibold text-[#2C1F0E] leading-snug">{label}</p>
              <p className="text-xs text-[#A09080]">{sublabel}</p>
            </div>
            <p className="text-[2.2rem] font-bold text-[#1A1208] leading-none mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-4 mb-5">
        <h2 className="text-lg font-bold text-[#B8860B] font-serif whitespace-nowrap">Payments</h2>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0A898]" size={15} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, service or method"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E0D8] rounded-full text-sm text-[#8B7355] placeholder-[#C0B8A8] focus:outline-none focus:border-[#B8860B]"
          />
        </div>
        <button onClick={() => { setEditing(null); setPanelOpen(true); }}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-medium hover:bg-[#9A7209] transition-colors whitespace-nowrap">
          <Plus size={15} /> + Add
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-7 mb-4">
        {['All','Paid','Pending','Overdue'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`text-sm pb-1.5 transition-colors ${activeTab === tab ? 'text-[#B8860B] font-semibold border-b-2 border-[#B8860B]' : 'text-[#6B5E4E] hover:text-[#B8860B]'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-[#EDEAE4]">
              {['Client','Service','Amount','Method','Date','Status',''].map((h, i) => (
                <th key={i} className="px-6 py-4 text-sm font-semibold text-[#2C1F0E]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-[#A09080]">No records found.</td></tr>
            ) : filtered.map((p, i) => (
              <tr key={i} className="border-b border-[#F0EBE3] last:border-0 hover:bg-[#FDFAF5] transition-colors">
                <td className="px-6 py-4 text-sm text-[#4A4035]">{p.clientName}</td>
                <td className="px-6 py-4 text-sm text-[#4A4035]">{p.service}</td>
                <td className="px-6 py-4 text-sm text-[#4A4035]">{fmt(p.amount)}</td>
                <td className="px-6 py-4 text-sm text-[#4A4035]">{p.paymentMethod}</td>
                <td className="px-6 py-4 text-sm text-[#4A4035]">{p.date?.split('T')[0]}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-4 py-4">
                  <ActionMenu
                    onEdit={() => { setEditing(p); setPanelOpen(true); }}
                    onDelete={() => handleDelete(p._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel open={panelOpen} onClose={() => { setPanelOpen(false); setEditing(null); }} title={editing ? 'Edit Payment' : 'New Payment'} width="w-[440px]">
        <PaymentForm initial={editing} onSubmit={editing ? handleEdit : handleAdd} saving={saving} />
      </SlidePanel>
    </div>
  );
}
