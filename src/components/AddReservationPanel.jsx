import { useState, useRef, useEffect } from 'react';
import SlidePanel from './SlidePanel';
import { UploadCloud, X } from 'lucide-react';

const initialState = {
  name: '', email: '', phone: '', nextOfKin: '', nextOfKinPhone: '',
  appointmentType: '', appointmentWith: '', appointmentLocation: '',
  appointmentDate: '', appointmentTime: '', appointmentAM: 'AM',
  consultationFee: '', paymentStatus: '', paymentGateway: '',
  additionalInfo: '', fabricPreference: '', trainLength: '',
  sleevePreference: '', silhouettePreference: '',
  weddingDate: '', weddingLocation: '', ceremonyType: '', budget: '',
  images: [],
};

const field = (label, children) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] placeholder-[#C0B8A8] focus:outline-none focus:border-[#B8860B] transition-colors";
const selectCls = inputCls + " cursor-pointer";

export default function AddReservationPanel({ open, onClose, onSubmit, initial = null }) {
  const [form, setForm] = useState(initialState);
  const fileRef = useRef();

  // populate form when editing
  useEffect(() => {
    if (initial) setForm({ ...initialState, ...initial, images: initial.images || [] });
    else setForm(initialState);
  }, [initial, open]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setForm((p) => ({ ...p, images: [...p.images, ...files] }));
  };

  const removeImage = (i) =>
    setForm((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
    setForm(initialState);
    onClose();
  };

  return (
    <SlidePanel open={open} onClose={onClose} title={initial ? 'Edit Reservation' : 'New Reservation'} width="w-[540px]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── Client Info ── */}
        <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">Client Info</p>

        {field('Full Name', <input className={inputCls} placeholder="Aaminah Yusuf" value={form.name} onChange={set('name')} required />)}
        {field('Email', <input type="email" className={inputCls} placeholder="client@email.com" value={form.email} onChange={set('email')} />)}
        {field('Phone Number', <input type="tel" className={inputCls} placeholder="+234 800 000 0000" value={form.phone} onChange={set('phone')} />)}
        {field('Next of Kin', <input className={inputCls} placeholder="Next of kin name" value={form.nextOfKin} onChange={set('nextOfKin')} />)}
        {field('Next of Kin Phone', <input type="tel" className={inputCls} placeholder="+234 800 000 0000" value={form.nextOfKinPhone} onChange={set('nextOfKinPhone')} />)}

        <hr className="border-[#E5E0D8]" />

        {/* ── Appointment ── */}
        <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">Appointment</p>

        {field('Appointment Type',
          <select className={selectCls} value={form.appointmentType} onChange={set('appointmentType')} required>
            <option value="">Select type</option>
            {['Physical Bridal Consultation','Virtual Bridal Consultation','Fitting Session','Measurement Session'].map(o => <option key={o}>{o}</option>)}
          </select>
        )}

        {field('Appointment With',
          <select className={selectCls} value={form.appointmentWith} onChange={set('appointmentWith')}>
            <option value="">Select person</option>
            {['Design Team','Maimuna Anka'].map(o => <option key={o}>{o}</option>)}
          </select>
        )}

        {field('Location',
          <select className={selectCls} value={form.appointmentLocation} onChange={set('appointmentLocation')}>
            <option value="">Select location</option>
            {['MalaabisbyMaymz Abuja Branch','MalaabisbyMaymz Kano Branch'].map(o => <option key={o}>{o}</option>)}
          </select>
        )}

        <div className="grid grid-cols-2 gap-4">
          {field('Date', <input type="date" className={inputCls} value={form.appointmentDate} onChange={set('appointmentDate')} required />)}
          {field('Time',
            <div className="flex gap-2">
              <input type="time" className={inputCls} value={form.appointmentTime} onChange={set('appointmentTime')} />
              <select className="px-2 rounded-lg border border-[#E5E0D8] bg-[#FDFAF5] text-sm text-[#2C1F0E] focus:outline-none focus:border-[#B8860B]" value={form.appointmentAM} onChange={set('appointmentAM')}>
                <option>AM</option><option>PM</option>
              </select>
            </div>
          )}
        </div>

        <hr className="border-[#E5E0D8]" />

        {/* ── Payment ── */}
        <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">Payment</p>

        {field('Consultation Fee (₦)', <input type="number" className={inputCls} placeholder="0.00" value={form.consultationFee} onChange={set('consultationFee')} />)}

        <div className="grid grid-cols-2 gap-4">
          {field('Payment Status',
            <select className={selectCls} value={form.paymentStatus} onChange={set('paymentStatus')}>
              <option value="">Select</option>
              {['Paid','Pending','Unpaid'].map(o => <option key={o}>{o}</option>)}
            </select>
          )}
          {field('Payment Gateway',
            <select className={selectCls} value={form.paymentGateway} onChange={set('paymentGateway')}>
              <option value="">Select</option>
              {['Paystack','Flutterwave','Bank Transfer','Cash'].map(o => <option key={o}>{o}</option>)}
            </select>
          )}
        </div>

        <hr className="border-[#E5E0D8]" />

        {/* ── Bridal Details ── */}
        <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">Bridal Details</p>

        {field('Fabric Preference', <input className={inputCls} placeholder="e.g. Lace, Silk" value={form.fabricPreference} onChange={set('fabricPreference')} />)}

        <div className="grid grid-cols-2 gap-4">
          {field('Train Length', <input className={inputCls} placeholder="e.g. Cathedral, Short" value={form.trainLength} onChange={set('trainLength')} />)}
          {field('Sleeve Preference', <input className={inputCls} placeholder="e.g. Long, Sleeveless" value={form.sleevePreference} onChange={set('sleevePreference')} />)}
        </div>

        {field('Silhouette Preference', <input className={inputCls} placeholder="e.g. A-Line, Mermaid" value={form.silhouettePreference} onChange={set('silhouettePreference')} />)}

        <hr className="border-[#E5E0D8]" />

        {/* ── Wedding Info ── */}
        <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">Wedding Info</p>

        <div className="grid grid-cols-2 gap-4">
          {field('Wedding Date', <input type="date" className={inputCls} value={form.weddingDate} onChange={set('weddingDate')} />)}
          {field('Budget (₦)', <input type="number" className={inputCls} placeholder="0.00" value={form.budget} onChange={set('budget')} />)}
        </div>

        {field('Wedding Location', <input className={inputCls} placeholder="City, Venue" value={form.weddingLocation} onChange={set('weddingLocation')} />)}

        {field('Ceremony Type',
          <select className={selectCls} value={form.ceremonyType} onChange={set('ceremonyType')}>
            <option value="">Select</option>
            {['Traditional','White Wedding','Nikkah','Court','Combined'].map(o => <option key={o}>{o}</option>)}
          </select>
        )}

        <hr className="border-[#E5E0D8]" />

        {/* ── Inspiration & Notes ── */}
        <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">Inspiration & Notes</p>

        {field('Inspiration Images',
          <div>
            <div
              onClick={() => fileRef.current.click()}
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#E5E0D8] rounded-lg py-6 cursor-pointer hover:border-[#B8860B] transition-colors bg-[#FDFAF5]"
            >
              <UploadCloud size={22} className="text-[#B8860B]" />
              <span className="text-xs text-[#8B7355]">Click to upload images</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt="" className="w-16 h-16 object-cover rounded-lg border border-[#E5E0D8]" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute -top-1.5 -right-1.5 bg-white rounded-full border border-[#E5E0D8] p-0.5 text-[#8B7355] hover:text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {field('Additional Info',
          <textarea className={inputCls + ' resize-none'} rows={3} placeholder="Any extra notes..." value={form.additionalInfo} onChange={set('additionalInfo')} />
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          className="w-full py-3 mt-2 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9A7209] transition-colors"
        >
          Save {initial ? 'Changes' : 'Reservation'}
        </button>

      </form>
    </SlidePanel>
  );
}
