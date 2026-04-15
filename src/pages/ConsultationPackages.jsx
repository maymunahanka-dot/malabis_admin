import { useState } from 'react';
import { useConsultationPackages } from '../hooks/useConsultationPackages';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

export default function ConsultationPackages() {
  const { packages, loading, error, updatePrices } = useConsultationPackages();
  const { toast } = useToast();
  const [editing, setEditing] = useState(null); // { pkgId, options: [...] }
  const [saving, setSaving] = useState(false);

  const openEdit = (pkg) => {
    setEditing({
      pkgId: pkg.id,
      options: (pkg.options || []).map(o => ({ ...o })),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePrices(editing.pkgId, editing.options);
      toast('Prices updated');
      setEditing(null);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const setFee = (optIdx, value) => {
    setEditing(prev => ({
      ...prev,
      options: prev.options.map((o, i) => i === optIdx ? { ...o, fee: Number(value) } : o),
    }));
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner size={36} /></div>;
  if (error)   return <div className="p-8 text-red-500 text-sm">Failed to load packages: {error}</div>;

  return (
    <div className="px-10 py-8 bg-[#F5F0E8] min-h-screen font-sans">
      <div className="mb-6">
        <p className="text-[#B8860B] text-sm font-medium mb-0.5">Manage</p>
        <h1 className="text-[2rem] font-bold text-[#2C1F0E] font-serif leading-tight">Consultation Packages</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#2C1F0E]">{pkg.title}</h2>
              <p className="text-xs text-[#A09080] mt-1">{pkg.desc}</p>
            </div>

            <div className="flex flex-col gap-2">
              {(pkg.options || []).map((opt, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-[#6B5E4E]">{opt.label}</span>
                  <span className="font-semibold text-[#B8860B]">₦{Number(opt.fee).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => openEdit(pkg)}
              className="mt-auto w-full py-2 border border-[#B8860B] text-[#B8860B] rounded-lg text-sm font-medium hover:bg-[#F5F0E8] transition-colors"
            >
              Edit Prices
            </button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-base font-semibold text-[#2C1F0E] mb-4">
              Edit Prices — {packages.find(p => p.id === editing.pkgId)?.title}
            </h3>
            <div className="flex flex-col gap-4">
              {editing.options.map((opt, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">{opt.label}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#A09080]">₦</span>
                    <input
                      type="number"
                      value={opt.fee}
                      onChange={e => setFee(i, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A7209] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Spinner size={16} />} Save
              </button>
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2.5 border border-[#E5E0D8] text-[#8B7355] rounded-lg text-sm font-medium hover:bg-[#F5F0E8] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
