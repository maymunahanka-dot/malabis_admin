import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../lib/uploadToCloudinary';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import { UploadCloud, X } from 'lucide-react';

const HERO_SECTIONS = [
  { key: 'hero',                  label: 'Home Page Hero' },
  { key: 'portfolio',             label: 'Bridal Portfolio Hero' },
  { key: 'consultation',          label: 'Consultation Hero' },
  { key: 'consultation-options',  label: 'Consultation Options Hero' },
  { key: 'packages',              label: 'Bridal / Bespoke Packages Hero' },
  { key: 'process',               label: 'Bridal Process Hero' },
  { key: 'bridal-process-preview',label: 'Home — Bridal Process Preview Image' },
  { key: 'founder',               label: 'Founder — Maimuna Abubakar Photo' },
  { key: 'popup-subscription',    label: 'Home — Subscription Popup Image' },
  { key: 'portfolio-card-couture',       label: 'Portfolio Card — Couture Gowns 1' },
  { key: 'portfolio-card-modest',        label: 'Portfolio Card — Modest Brides' },
  { key: 'portfolio-card-reception',     label: 'Portfolio Card — Reception Dresses' },
  { key: 'portfolio-card-embellishment', label: 'Portfolio Card — Embellishment Details' },
  { key: 'portfolio-card-veil',          label: 'Portfolio Card — Veil Designs' },
  { key: 'portfolio-card-couture-2',     label: 'Portfolio Card — Couture Gowns 2' },
  { key: 'portfolio-hero-couture',       label: 'Portfolio Hero — Couture Gowns' },
  { key: 'portfolio-hero-modest',        label: 'Portfolio Hero — Modest Brides' },
  { key: 'portfolio-hero-reception',     label: 'Portfolio Hero — Reception Dresses' },
  { key: 'portfolio-hero-embellishment', label: 'Portfolio Hero — Embellishment Details' },
  { key: 'portfolio-hero-veil',          label: 'Portfolio Hero — Veil Designs' },
]

function HeroCard({ sectionKey, label }) {
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'site-settings', sectionKey))
      .then(snap => { if (snap.exists()) setCurrentImage(snap.data().imageUrl || null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sectionKey])

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSave = async () => {
    if (!file) return
    setSaving(true)
    try {
      const url = await uploadToCloudinary(file)
      await setDoc(doc(db, 'site-settings', sectionKey), { imageUrl: url }, { merge: true })
      setCurrentImage(url)
      setFile(null)
      setPreview(null)
      toast(`${label} updated`)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-[#2C1F0E]">{label}</h2>
        <p className="text-xs text-[#A09080] mt-0.5">Key: <code className="bg-[#F5F0E8] px-1 rounded">{sectionKey}</code></p>
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Spinner size={24} /></div>
      ) : (
        <>
          {(currentImage && !preview) && (
            <img src={currentImage} alt={label} className="w-full h-32 object-cover rounded-xl border border-[#E5E0D8]" />
          )}
          {preview && (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-[#E5E0D8]" />
              <button onClick={() => { setFile(null); setPreview(null) }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-red-400 hover:text-red-600">
                <X size={12} />
              </button>
            </div>
          )}
          {!preview && (
            <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-[#E5E0D8] rounded-xl py-5 cursor-pointer hover:border-[#B8860B] transition-colors bg-[#FDFAF5]">
              <UploadCloud size={20} className="text-[#B8860B]" />
              <span className="text-xs text-[#8B7355]">Upload image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          )}
          <button onClick={handleSave} disabled={!file || saving}
            className="w-full py-2.5 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A7209] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Spinner size={14} />} Save
          </button>
        </>
      )}
    </div>
  )
}

export default function Other() {
  return (
    <div className="px-10 py-8 bg-[#F5F0E8] min-h-screen font-sans">
      <div className="mb-6">
        <p className="text-[#B8860B] text-sm font-medium mb-0.5">Manage</p>
        <h1 className="text-[2rem] font-bold text-[#2C1F0E] font-serif leading-tight">Hero Images</h1>
        <p className="text-sm text-[#A09080] mt-1">Upload hero images for each page. Images are stored in Cloudinary and served from Firebase.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {HERO_SECTIONS.map(s => (
          <HeroCard key={s.key} sectionKey={s.key} label={s.label} />
        ))}
      </div>
    </div>
  );
}
