import { useState, useRef, useEffect } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import SlidePanel from '../components/SlidePanel';
import { useClients } from '../hooks/useClients';
import { useConsultations } from '../hooks/useConsultations';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] placeholder-[#C0B8A8] focus:outline-none focus:border-[#B8860B] transition-colors";
const selectCls = inputCls + " cursor-pointer";
const lbl = (label, children) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const blank = { fullName: '', phoneNumber: '', email: '', clientType: 'Other', status: 'Pending' };

function ClientForm({ initial, onSubmit, saving, consultations }) {
  const [form, setForm] = useState(initial || blank);
  const [mode, setMode] = useState('manual');
  useEffect(() => { setForm(initial || blank); setMode('manual'); }, [initial]);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const fillFromConsultation = (c) => {
    setForm({
      fullName:    c.fullName || '',
      phoneNumber: c.phoneNumber || '',
      email:       c.email || '',
      clientType:  'Bride',
      status:      'Active',
    });
    setMode('manual');
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col gap-5">
      {!initial && (
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode('manual')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'manual' ? 'bg-[#B8860B] text-white border-[#B8860B]' : 'bg-white text-[#8B7355] border-[#E5E0D8]'}`}>
            New Client
          </button>
          <button type="button" onClick={() => setMode('consultation')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mode === 'consultation' ? 'bg-[#B8860B] text-white border-[#B8860B]' : 'bg-white text-[#8B7355] border-[#E5E0D8]'}`}>
            From Consultation
          </button>
        </div>
      )}

      {mode === 'consultation' && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#8B7355]">Select a consultation to auto-fill</p>
          <div className="max-h-52 overflow-y-auto flex flex-col gap-1">
            {consultations.length === 0
              ? <p className="text-xs text-[#A09080] py-4 text-center">No consultations found</p>
              : consultations.map((c, i) => (
                <button key={i} type="button" onClick={() => fillFromConsultation(c)}
                  className="text-left px-3 py-2.5 rounded-lg border border-[#E5E0D8] hover:border-[#B8860B] hover:bg-[#FDFAF5] transition-colors">
                  <p className="text-sm font-medium text-[#2C1F0E]">{c.fullName}</p>
                  <p className="text-xs text-[#8B7355]">{c.appointmentType} · {c.date?.split('T')[0]}</p>
                </button>
              ))
            }
          </div>
        </div>
      )}

      {mode === 'manual' && (
        <>
          {lbl('Full Name', <input className={inputCls} value={form.fullName} onChange={set('fullName')} required placeholder="Full name" />)}
          {lbl('Phone Number', <input type="tel" className={inputCls} value={form.phoneNumber} onChange={set('phoneNumber')} required placeholder="+234 800 000 0000" />)}
          {lbl('Email', <input type="email" className={inputCls} value={form.email} onChange={set('email')} required placeholder="client@email.com" />)}
          {lbl('Client Type',
            <select className={selectCls} value={form.clientType} onChange={set('clientType')}>
              {['Bride','Bridesmaid','Mother','Other'].map(o => <option key={o}>{o}</option>)}
            </select>
          )}
          {lbl('Status',
            <select className={selectCls} value={form.status} onChange={set('status')}>
              {['Active','Inactive','Pending'].map(o => <option key={o}>{o}</option>)}
            </select>
          )}
          <button type="submit" disabled={saving}
            className="w-full py-3 mt-2 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A7209] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Spinner size={16} />} Save Client
          </button>
        </>
      )}
    </form>
  );
}

function ActionMenu({ onEdit, onDelete, onToggleStatus, status }) {
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
        <div className="absolute right-0 top-8 z-20 bg-white border border-[#E5E0D8] rounded-xl shadow-lg w-36 py-1">
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[#4A4035] hover:bg-[#F5F0E8]">Edit</button>
          <button onClick={() => { onToggleStatus(); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-[#4A4035] hover:bg-[#F5F0E8]">
            Set {status === 'Active' ? 'Inactive' : 'Active'}
          </button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Delete</button>
        </div>
      )}
    </div>
  );
}

const statusBadge = (s) => {
  if (s === 'Active')   return 'bg-green-100 text-green-700';
  if (s === 'Inactive') return 'bg-red-100 text-red-500';
  return 'bg-yellow-100 text-yellow-700';
};

const typeBadge = (t) => {
  if (t === 'Bride')      return 'bg-pink-100 text-pink-700';
  if (t === 'Bridesmaid') return 'bg-purple-100 text-purple-700';
  if (t === 'Mother')     return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-600';
};

export default function Clients() {
  const { clients, loading, error, create, update, remove } = useClients();
  const { consultations } = useConsultations();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await create(form);
      setPanelOpen(false);
      toast('Client added');
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
      toast('Client updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove(id);
      toast('Client deleted', 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const toggleStatus = async (c) => {
    const newStatus = c.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await update(c.id, { ...c, status: newStatus });
      toast(`Set to ${newStatus}`, 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = clients.filter(c => {
    const matchTab = activeTab === 'All' || c.clientType === activeTab || c.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || c.fullName?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phoneNumber?.includes(q);
    return matchTab && matchSearch;
  });

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size={36} /></div>;
  if (error)   return <div className="p-8 text-red-500 text-sm">Failed to load clients: {error}</div>;

  return (
    <div className="px-10 py-8 bg-[#F5F0E8] min-h-screen font-sans">
      <div className="mb-6">
        <p className="text-[#B8860B] text-sm font-medium mb-0.5">Welcome back, Aaminah</p>
        <h1 className="text-[2rem] font-bold text-[#2C1F0E] font-serif leading-tight">Clients</h1>
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-4 mb-5">
        <h2 className="text-lg font-bold text-[#B8860B] font-serif whitespace-nowrap">Clients</h2>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B0A898]" size={15} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email or phone"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E0D8] rounded-full text-sm text-[#8B7355] placeholder-[#C0B8A8] focus:outline-none focus:border-[#B8860B]" />
        </div>
        <button onClick={() => { setEditing(null); setPanelOpen(true); }}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-medium hover:bg-[#9A7209] transition-colors whitespace-nowrap">
          <Plus size={15} /> + Add
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-7 mb-4">
        {['All','Bride','Bridesmaid','Mother','Other','Active','Inactive'].map(tab => (
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
              {["Client's Name", 'Phone', 'Email', 'Type', 'Status', ''].map((h, i) => (
                <th key={i} className="px-6 py-4 text-sm font-semibold text-[#2C1F0E]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-[#A09080]">No clients found.</td></tr>
            ) : filtered.map((c, i) => (
              <tr key={i} className="border-b border-[#F0EBE3] last:border-0 hover:bg-[#FDFAF5] transition-colors">
                <td className="px-6 py-4 text-sm text-[#4A4035]">{c.fullName}</td>
                <td className="px-6 py-4 text-sm text-[#4A4035]">{c.phoneNumber}</td>
                <td className="px-6 py-4 text-sm text-[#4A4035]">{c.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeBadge(c.clientType)}`}>{c.clientType}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(c.status)}`}>{c.status}</span>
                </td>
                <td className="px-4 py-4">
                  <ActionMenu
                    onEdit={() => { setEditing(c); setPanelOpen(true); }}
                    onDelete={() => handleDelete(c.id)}
                    onToggleStatus={() => toggleStatus(c)}
                    status={c.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SlidePanel open={panelOpen} onClose={() => { setPanelOpen(false); setEditing(null); }} title={editing ? 'Edit Client' : 'New Client'} width="w-[440px]">
        <ClientForm initial={editing} onSubmit={editing ? handleEdit : handleAdd} saving={saving} consultations={consultations} />
      </SlidePanel>
    </div>
  );
}
