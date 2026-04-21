import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { InstagramEmbed } from 'react-social-media-embed';
import { useGallery } from '../hooks/useGallery';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const blank = { url: '', order: 0 };

// Strip query params so Facebook oEmbed gets a clean URL
const cleanUrl = (raw) => {
  try { const u = new URL(raw.trim()); return u.origin + u.pathname; }
  catch { return raw.trim(); }
};

export default function GalleryPage() {
  const { items, loading, error, create, update, remove } = useGallery();
  const { toast } = useToast();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditing(null); setForm(blank); setPanelOpen(true); };
  const openEdit = item => {
    setEditing(item);
    setForm({ url: item.url, order: item.order || 0 });
    setPanelOpen(true);
  };

  // Clean URL on every keystroke so the preview also uses a clean URL
  const handleUrlChange = e => setForm(p => ({ ...p, url: cleanUrl(e.target.value) }));

  const handleSave = async () => {
    if (!form.url.trim()) { toast('Please enter an Instagram URL', 'error'); return; }
    setSaving(true);
    try {
      if (editing) {
        await update(editing.id, form);
        toast('Gallery item updated');
      } else {
        await create(form);
        toast('Gallery item added');
      }
      setPanelOpen(false);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try { await remove(id); toast('Deleted', 'info'); }
    catch (err) { toast(err.message, 'error'); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size={36} /></div>;
  if (error)   return <div className="p-8 text-red-500 text-sm">{error}</div>;

  return (
    <div className="px-10 py-8 bg-[#F5F0E8] min-h-screen font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#B8860B] text-sm font-medium mb-0.5">Manage</p>
          <h1 className="text-[2rem] font-bold text-[#2C1F0E] font-serif leading-tight">Gallery</h1>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-medium hover:bg-[#9A7209] transition-colors">
          <Plus size={15} /> Add Post
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-[#A09080] text-sm">
          No gallery items yet. Add your first Instagram post.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm group relative">
              <InstagramEmbed url={item.url} width="100%" />
              <span className="absolute top-2 left-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded">
                #{item.order}
              </span>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)}
                  className="bg-white/90 p-1.5 rounded-md shadow text-[#B8860B] hover:bg-white">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(item.id)}
                  className="bg-white/90 p-1.5 rounded-md shadow text-red-500 hover:bg-white">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setPanelOpen(false)} />
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E0D8]">
              <h2 className="text-base font-semibold text-[#2C1F0E]">
                {editing ? 'Edit Post' : 'Add Instagram Post'}
              </h2>
              <button onClick={() => setPanelOpen(false)}>
                <X size={20} className="text-[#8B7355]" />
              </button>
            </div>

            <div className="flex-1 px-6 py-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">
                  Instagram Post URL
                </label>
                <input
                  value={form.url}
                  onChange={handleUrlChange}
                  placeholder="https://www.instagram.com/p/..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              {form.url.trim() && (
                <div className="rounded-xl overflow-hidden border border-[#E5E0D8]">
                  <InstagramEmbed url={form.url} width={328} />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">
                  Order (display position)
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm(p => ({ ...p, order: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E5E0D8] flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#B8860B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#9A7209] disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Spinner size={16} />} {editing ? 'Save Changes' : 'Add Post'}
              </button>
              <button onClick={() => setPanelOpen(false)}
                className="flex-1 border border-[#E5E0D8] text-[#8B7355] py-2.5 rounded-lg text-sm font-medium hover:bg-[#F5F0E8]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
