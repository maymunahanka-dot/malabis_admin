import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, X, UploadCloud } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const CATEGORIES = ['All', 'Couture Gowns', 'Modest Brides', 'Reception Dresses', 'Embellishment Details', 'Veil Designs'];

const emptyForm = {
  category: 'Couture Gowns',
  imageFile: null,
  imagePreview: '',
  brideName: '',
  weddingLocation: '',
  fabricType: '',
  dressDescription: '',
  hoverText: '',
};

export default function BridalPortfolio() {
  const { portfolio, loading, error, create, update, remove } = usePortfolio();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('All');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = activeCategory === 'All' ? portfolio : portfolio.filter(p => p.category === activeCategory);

  const openCreate = () => { setEditingItem(null); setForm(emptyForm); setPanelOpen(true); };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      category:        item.category,
      imageFile:       null,
      imagePreview:    item.image,
      brideName:       item.brideName,
      weddingLocation: item.weddingLocation || '',
      fabricType:      item.fabricType || '',
      dressDescription:item.dressDescription || '',
      hoverText:       item.hoverText || '',
    });
    setPanelOpen(true);
  };

  const closePanel = () => { setPanelOpen(false); setEditingItem(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.brideName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        category:         form.category,
        brideName:        form.brideName,
        weddingLocation:  form.weddingLocation,
        fabricType:       form.fabricType,
        dressDescription: form.dressDescription,
        hoverText:        form.hoverText,
        imageFile:        form.imageFile,
        imagePreview:     form.imagePreview,
      };

      if (editingItem) {
        await update(editingItem.id, payload);
        toast('Portfolio item updated');
      } else {
        await create(payload);
        toast('Portfolio item added');
      }
      closePanel();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await remove(id);
      toast('Item deleted', 'info');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size={36} /></div>;
  if (error)   return <div className="p-8 text-red-500 text-sm">Failed to load portfolio: {error}</div>;

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif italic text-[#B8860B]">Bridal Portfolio</h1>
          <p className="text-sm text-[#8B7355] mt-1">{portfolio.length} pieces in collection</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#B8860B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#9a7009] transition-colors">
          <Plus size={16} /> Add Piece
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === cat
                ? 'bg-[#B8860B] text-white border-[#B8860B]'
                : 'bg-white text-[#8B7355] border-[#E5E0D8] hover:border-[#B8860B] hover:text-[#B8860B]'
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-[#8B7355] text-sm">No pieces in this category yet.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filtered.map(item => (
            <BridalCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Slide Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={closePanel} />
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E0D8]">
              <h2 className="text-lg font-serif italic text-[#B8860B]">{editingItem ? 'Edit Piece' : 'Add New Piece'}</h2>
              <button onClick={closePanel} className="text-[#8B7355] hover:text-[#B8860B]"><X size={20} /></button>
            </div>
            <div className="flex-1 px-6 py-5 flex flex-col gap-4">
              <Field label="Bride Name" value={form.brideName} onChange={v => setForm(f => ({ ...f, brideName: v }))} />
              <Field label="Wedding Location" value={form.weddingLocation} onChange={v => setForm(f => ({ ...f, weddingLocation: v }))} />
              <Field label="Fabric Type" value={form.fabricType} onChange={v => setForm(f => ({ ...f, fabricType: v }))} />
              <Field label="Dress Description" value={form.dressDescription} onChange={v => setForm(f => ({ ...f, dressDescription: v }))} textarea />
              <Field label="Hover Text" value={form.hoverText} onChange={v => setForm(f => ({ ...f, hoverText: v }))} textarea />
              <ImageDropField
                preview={form.imagePreview}
                onChange={(file, preview) => setForm(f => ({ ...f, imageFile: file, imagePreview: preview }))}
                onClear={() => setForm(f => ({ ...f, imageFile: null, imagePreview: '' }))}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#8B7355]">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="border border-[#E5E0D8] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#B8860B]">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E5E0D8] flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-[#B8860B] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#9a7009] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Spinner size={16} />} {editingItem ? 'Save Changes' : 'Add Piece'}
              </button>
              <button onClick={closePanel}
                className="flex-1 border border-[#E5E0D8] text-[#8B7355] py-2 rounded-lg text-sm font-medium hover:bg-[#F5F0E8] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BridalCard({ item, onEdit, onDelete }) {
  return (
    <div className="bridal-card break-inside-avoid relative group">
      <div className="bridal-card-img-wrap">
        <img src={item.image} alt={item.brideName} className="bridal-card-img" />
        <div className="bridal-card-hover-text">{item.hoverText}</div>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={() => onEdit(item)} className="bg-white/90 hover:bg-white text-[#B8860B] p-1.5 rounded-md shadow">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(item.id)} className="bg-white/90 hover:bg-white text-red-500 p-1.5 rounded-md shadow">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="bridal-card-body">
        <p className="bridal-card-row">Bride Name: <strong>{item.brideName}</strong></p>
        <p className="bridal-card-row">Wedding Location: <strong>{item.weddingLocation}</strong></p>
        <p className="bridal-card-row">Fabric Type: <strong>{item.fabricType}</strong></p>
        <p className="bridal-card-row">Dress Description: <strong>{item.dressDescription}</strong></p>
        <p className="bridal-card-row">Category: <strong>{item.category}</strong></p>
      </div>
    </div>
  );
}

function ImageDropField({ preview, onChange, onClear }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    onChange(file, URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[#8B7355]">Image</label>
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-[#E5E0D8]">
          <img src={preview} alt="preview" className="w-full h-48 object-cover" />
          <button onClick={onClear} className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500 p-1 rounded-md shadow">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current.click()}
          className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-colors ${
            dragging ? 'border-[#B8860B] bg-[#F5F0E8]' : 'border-[#E5E0D8] hover:border-[#B8860B] hover:bg-[#FAF8F5]'
          }`}
        >
          <UploadCloud size={28} className="text-[#B8860B]" />
          <p className="text-sm text-[#8B7355]">Drag & drop or <span className="text-[#B8860B] font-medium">browse</span></p>
          <p className="text-xs text-[#aaa]">PNG, JPG, WEBP</p>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, textarea }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[#8B7355]">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          className="border border-[#E5E0D8] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#B8860B] resize-none" />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)}
          className="border border-[#E5E0D8] rounded-lg px-3 py-2 text-sm text-[#111827] focus:outline-none focus:border-[#B8860B]" />
      )}
    </div>
  );
}
