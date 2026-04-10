import { useState, useRef, useEffect } from 'react';
import { Mail, MailOpen, Pencil, Trash2, Plus, MoreVertical } from 'lucide-react';
import SlidePanel from '../components/SlidePanel';
import { useMessages } from '../hooks/useMessages';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const inputCls = "w-full border border-[#E5E0D8] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#B8860B]";
const blank = { name: '', email: '', phoneNumber: '', subject: '', message: '' };

const row = (label, value) =>
  value ? (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[#2C1F0E]">{value}</span>
    </div>
  ) : null;

function MessageForm({ initial, onSubmit, saving, onClose }) {
  const [form, setForm] = useState(initial || blank);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="flex flex-col gap-4">
      <Field label="Full Name"    value={form.name}        onChange={set('name')}        />
      <Field label="Email"        value={form.email}       onChange={set('email')}       />
      <Field label="Phone Number" value={form.phoneNumber} onChange={set('phoneNumber')} />
      <Field label="Subject"      value={form.subject}     onChange={set('subject')}     />
      <Field label="Message"      value={form.message}     onChange={set('message')}     textarea />
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 bg-[#B8860B] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#9a7009] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <Spinner size={16} />} Save
        </button>
        <button type="button" onClick={onClose}
          className="flex-1 border border-[#E5E0D8] text-[#8B7355] py-2 rounded-lg text-sm font-medium hover:bg-[#F5F0E8] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E0D8] px-5 py-4 flex items-center gap-4">
      <div className="text-[#B8860B] bg-[#FAF8F5] p-2 rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-[#8B7355]">{label}</p>
        <p className="text-2xl font-semibold text-[#B8860B]">{value}</p>
      </div>
    </div>
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
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
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

function Field({ label, value, onChange, textarea }) {  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[#8B7355]">{label}</label>
      {textarea
        ? <textarea value={value} onChange={onChange} rows={4} className={inputCls + ' resize-none'} />
        : <input value={value} onChange={onChange} className={inputCls} />}
    </div>
  );
}

export default function Messages() {
  const { messages, loading, error, create, update, remove } = useMessages();
  const { toast } = useToast();
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const openDetail = (msg) => { setSelected(msg); setDetailOpen(true); };

  const openEdit = () => {
    setEditForm({ ...selected, name: selected.name });
    setDetailOpen(false);
    setEditOpen(true);
  };

  const handleDelete = async () => {
    try {
      await remove(selected.id);
      setDetailOpen(false);
      setSelected(null);
      toast('Message deleted', 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleEditSave = async (form) => {
    setSaving(true);
    try {
      const updated = await update(selected.id, form);
      setSelected(updated);
      setEditOpen(false);
      toast('Message updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await create(form);
      setAddOpen(false);
      toast('Message added');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = messages.filter(m => {
    const q = search.toLowerCase();
    return !q || m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q);
  });

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size={36} /></div>;
  if (error)   return <div className="p-8 text-red-500 text-sm">Failed to load messages: {error}</div>;

  return (
    <div className="px-10 py-8 min-h-screen bg-[#FAF8F5]">
      <div className="mb-6">
        <p className="text-[#B8860B] text-sm font-medium mb-0.5">Welcome back, Aaminah</p>
        <h1 className="text-[2rem] font-bold text-[#2C1F0E] font-serif leading-tight">Messages</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard icon={<Mail size={20} />}     label="Total Messages" value={messages.length} />
        <StatCard icon={<MailOpen size={20} />} label="This Month"
          value={messages.filter(m => new Date(m.createdAt).getMonth() === new Date().getMonth()).length} />
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-4 mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email or subject"
          className="flex-1 px-4 py-2.5 bg-white border border-[#E5E0D8] rounded-full text-sm text-[#8B7355] placeholder-[#C0B8A8] focus:outline-none focus:border-[#B8860B]" />
        <button onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-medium hover:bg-[#9A7209] transition-colors whitespace-nowrap">
          <Plus size={15} /> + Add
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E0D8] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E0D8] bg-[#FAF8F5]">
              {['#','Full Name','Email','Subject','Date',''].map((h, i) => (
                <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-[#8B7355] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-[#A09080]">No messages found.</td></tr>
            ) : filtered.map((msg, i) => (
              <tr key={msg.id} onClick={() => openDetail(msg)}
                className="border-b border-[#F0EBE3] last:border-0 hover:bg-[#FAF8F5] transition-colors cursor-pointer">
                <td className="px-5 py-3 text-[#8B7355]">{i + 1}</td>
                <td className="px-5 py-3 font-medium text-[#111827]">{msg.name}</td>
                <td className="px-5 py-3 text-[#4b5563]">{msg.email}</td>
                <td className="px-5 py-3 text-[#4b5563]">{msg.subject}</td>
                <td className="px-5 py-3 text-[#4b5563]">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td className="px-4 py-3">
                  <ActionMenu
                    onEdit={() => { setSelected(msg); setEditForm({ ...msg }); setEditOpen(true); }}
                    onDelete={async () => {
                      try { await remove(msg.id); toast('Message deleted', 'info'); }
                      catch (err) { toast(err.message, 'error'); }
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      <SlidePanel open={detailOpen} onClose={() => setDetailOpen(false)} width="w-[480px]"
        title={selected && (
          <div className="flex items-center justify-between w-full pr-2">
            <span>{selected.name}</span>
            <div className="flex items-center gap-2">
              <button onClick={openEdit} className="p-1.5 rounded-lg text-[#8B7355] hover:bg-[#F5F0E8] hover:text-[#B8860B] transition-colors">
                <Pencil size={16} />
              </button>
              <button onClick={handleDelete} className="p-1.5 rounded-lg text-[#8B7355] hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}>
        {selected && (
          <div className="flex flex-col gap-4">
            <p className="text-xs text-[#8B7355]">
              {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </p>
            <hr className="border-[#E5E0D8]" />
            <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">Sender Info</p>
            {row('Full Name', selected.name)}
            {row('Email', selected.email)}
            {row('Phone Number', selected.phoneNumber)}
            <hr className="border-[#E5E0D8]" />
            <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">Message</p>
            {row('Subject', selected.subject)}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Message</span>
              <p className="text-sm text-[#2C1F0E] whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            </div>
          </div>
        )}
      </SlidePanel>

      {/* Edit Panel */}
      <SlidePanel open={editOpen} onClose={() => setEditOpen(false)} width="w-[480px]" title="Edit Message">
        {editForm && (
          <MessageForm initial={editForm} onSubmit={handleEditSave} saving={saving} onClose={() => setEditOpen(false)} />
        )}
      </SlidePanel>

      {/* Add Panel */}
      <SlidePanel open={addOpen} onClose={() => setAddOpen(false)} width="w-[480px]" title="New Message">
        <MessageForm initial={blank} onSubmit={handleAdd} saving={saving} onClose={() => setAddOpen(false)} />
      </SlidePanel>
    </div>
  );
}
