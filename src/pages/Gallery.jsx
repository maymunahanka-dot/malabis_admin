import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, UploadCloud } from 'lucide-react';
import { useGallery } from '../hooks/useGallery';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const blank = { imageFile: null, imagePreview: '', description: '', height: '400px', order: 0 };

export default function GalleryPage() {
  const { items, loading, error, create, update, remove } = useGallery();
  const { toast } = useToast();
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setForm(p => ({ ...p, imageFile: f, imagePreview: URL.createObjectURL(f) }));
  };

  const openAdd = () => { setEditing(null); setForm(blank); setPanelOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ imageFile: null, imagePreview: item.image, description: item.description || '', height: item.height || '400px', order: item.order || 0 });
    setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!form.imagePreview && !form.imageFile) { toast('Please upload an image', 'error'); return; }
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
          <Plus size={15} /> Add Image
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-[#A09080] text-sm">No gallery items yet. Add your first image.</div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {items.map(item => (
            <div key={item.id} className="break-inside-avoid bg-white rounded-xl overflow-hidden shadow-sm group relative">
              <img src={item.image} alt="" className="w-full object-cover" style={{ height: item.height || '300px' }} />
              {item.description && (
                <div className="p-3">
                  <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(item)} className="bg-white/90 p-1.5 rounded-md shadow text-[#B8860B] hover:bg-white">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="bg-white/90 p-1.5 rounded-md shadow text-red-500 hover:bg-white">
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="absolute top-2 left-2 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded">#{item.order}</span>
            </div>
          ))}
        </div>
      )}

      {/* Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setPanelOpen(false)} />
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E0D8]">
              <h2 className="text-base font-semibold text-[#2C1F0E]">{editing ? 'Edit Item' : 'Add Gallery Image'}</h2>
              <button onClick={() => setPanelOpen(false)}><X size={20} className="text-[#8B7355]" /></button>
            </div>
            <div className="flex-1 px-6 py-5 flex flex-col gap-4">
              {/* Image */}
              {form.imagePreview ? (
                <div className="relative">
                  <img src={form.imagePreview} alt="" className="w-full h-48 object-cover rounded-xl border border-[#E5E0D8]" />
                  <button onClick={() => setForm(p => ({ ...p, imageFile: null, imagePreview: '' }))}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-red-400"><X size={14} /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E5E0D8] rounded-xl py-8 cursor-pointer hover:border-[#B8860B] bg-[#FDFAF5]">
                  <UploadCloud size={22} className="text-[#B8860B]" />
                  <span className="text-xs text-[#8B7355]">Click to upload image</span>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </label>
              )}
              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={set('description')} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B] resize-none" />
              </div>
              {/* Height */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Height (e.g. 400px)</label>
                <input value={form.height} onChange={set('height')}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]" />
              </div>
              {/* Order */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Order (display position)</label>
                <input type="number" value={form.order} onChange={set('order')}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E5E0D8] flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#B8860B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#9A7209] disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Spinner size={16} />} {editing ? 'Save Changes' : 'Add Image'}
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
