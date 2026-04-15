import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, UploadCloud, Star, Youtube } from 'lucide-react';
import { useTestimonials } from '../hooks/useTestimonials';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const blankT = { imageFile: null, imagePreview: '', name: '', text: '', stars: 5, isFeatured: false };
const blankV = { youtubeUrl: '', name: '', order: 0 };

const inputCls = "w-full px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]";

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={18} className={n <= value ? 'text-[#C9A962] fill-[#C9A962]' : 'text-gray-300'} />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const { testimonials, videos, loading, createTestimonial, updateTestimonial, deleteTestimonial, setFeatured, createVideo, deleteVideo } = useTestimonials();
  const { toast } = useToast();
  const [tab, setTab] = useState('testimonials');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankT);
  const [videoForm, setVideoForm] = useState(blankV);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setV = k => e => setVideoForm(p => ({ ...p, [k]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setForm(p => ({ ...p, imageFile: f, imagePreview: URL.createObjectURL(f) }));
  };

  const openAdd = () => { setEditing(null); setForm(blankT); setPanelOpen(true); };
  const openEdit = (t) => {
    setEditing(t);
    setForm({ imageFile: null, imagePreview: t.image || '', name: t.name, text: t.text, stars: t.stars || 5, isFeatured: t.isFeatured || false });
    setPanelOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await updateTestimonial(editing.id, form); toast('Updated'); }
      else { await createTestimonial(form); toast('Added'); }
      setPanelOpen(false);
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleAddVideo = async () => {
    if (!videoForm.youtubeUrl) { toast('Enter a YouTube URL', 'error'); return; }
    setSaving(true);
    try { await createVideo(videoForm); setVideoForm(blankV); toast('Video added'); }
    catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size={36} /></div>;

  return (
    <div className="px-10 py-8 bg-[#F5F0E8] min-h-screen font-sans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[#B8860B] text-sm font-medium mb-0.5">Manage</p>
          <h1 className="text-[2rem] font-bold text-[#2C1F0E] font-serif leading-tight">Testimonials</h1>
        </div>
        {tab === 'testimonials' && (
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-medium hover:bg-[#9A7209]">
            <Plus size={15} /> Add Testimonial
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {['testimonials','videos'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-[#B8860B] text-white' : 'bg-white text-[#8B7355] border border-[#E5E0D8]'}`}>
            {t === 'testimonials' ? 'Testimonials' : 'Videos'}
          </button>
        ))}
      </div>

      {tab === 'testimonials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3 relative">
              {t.isFeatured && (
                <span className="absolute top-3 right-3 bg-[#B8860B] text-white text-[10px] px-2 py-0.5 rounded-full">Featured</span>
              )}
              <div className="flex items-center gap-3">
                {t.image && <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />}
                <div>
                  <p className="text-sm font-semibold text-[#2C1F0E]">{t.name}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={12} className={n <= (t.stars||5) ? 'text-[#C9A962] fill-[#C9A962]' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#6B5E4E] leading-relaxed line-clamp-3">"{t.text}"</p>
              <div className="flex gap-2 mt-auto">
                {!t.isFeatured && (
                  <button onClick={() => setFeatured(t.id).then(() => toast('Set as featured'))}
                    className="flex-1 py-1.5 text-xs border border-[#B8860B] text-[#B8860B] rounded-lg hover:bg-[#F5F0E8]">
                    Set Featured
                  </button>
                )}
                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-[#F5F0E8] text-[#8B7355]"><Pencil size={14} /></button>
                <button onClick={() => deleteTestimonial(t.id).then(() => toast('Deleted', 'info'))} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'videos' && (
        <div className="flex flex-col gap-6 max-w-xl">
          {/* Add video form */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-[#2C1F0E]">Add YouTube Video</h3>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">YouTube URL</label>
              <input value={videoForm.youtubeUrl} onChange={setV('youtubeUrl')} placeholder="https://youtube.com/watch?v=..." className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Name / Label</label>
              <input value={videoForm.name} onChange={setV('name')} placeholder="Bride name" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Order</label>
              <input type="number" value={videoForm.order} onChange={setV('order')} className={inputCls} />
            </div>
            <button onClick={handleAddVideo} disabled={saving}
              className="w-full py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A7209] disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Spinner size={16} />} <Youtube size={16} /> Add Video
            </button>
          </div>

          {/* Video list */}
          {videos.map(v => (
            <div key={v.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#2C1F0E]">{v.name || 'Untitled'}</p>
                <p className="text-xs text-[#A09080] truncate max-w-xs">{v.youtubeUrl}</p>
              </div>
              <button onClick={() => deleteVideo(v.id).then(() => toast('Deleted', 'info'))}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Testimonial Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setPanelOpen(false)} />
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E0D8]">
              <h2 className="text-base font-semibold text-[#2C1F0E]">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
              <button onClick={() => setPanelOpen(false)}><X size={20} className="text-[#8B7355]" /></button>
            </div>
            <div className="flex-1 px-6 py-5 flex flex-col gap-4">
              {/* Image */}
              {form.imagePreview ? (
                <div className="relative">
                  <img src={form.imagePreview} alt="" className="w-full h-40 object-cover rounded-xl border border-[#E5E0D8]" />
                  <button onClick={() => setForm(p => ({ ...p, imageFile: null, imagePreview: '' }))}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-red-400"><X size={14} /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E5E0D8] rounded-xl py-6 cursor-pointer hover:border-[#B8860B] bg-[#FDFAF5]">
                  <UploadCloud size={20} className="text-[#B8860B]" />
                  <span className="text-xs text-[#8B7355]">Upload photo (optional)</span>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </label>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Name</label>
                <input value={form.name} onChange={set('name')} className={inputCls} placeholder="Bride name" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Testimonial</label>
                <textarea value={form.text} onChange={set('text')} rows={4} className={inputCls + ' resize-none'} placeholder="What they said..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">Stars</label>
                <StarPicker value={form.stars} onChange={v => setForm(p => ({ ...p, stars: v }))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
                <span className="text-sm text-[#6B5E4E]">Set as Featured Testimonial</span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-[#E5E0D8] flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#B8860B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#9A7209] disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Spinner size={16} />} {editing ? 'Save Changes' : 'Add'}
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
