import { useState } from 'react';
import SlidePanel from './SlidePanel';
import { Pencil, Trash2, X, Download } from 'lucide-react';

const row = (label, value) =>
  value ? (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-[#6B5E4E] uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[#2C1F0E]">{value}</span>
    </div>
  ) : null;

const section = (title) => (
  <p className="text-xs font-bold text-[#B8860B] uppercase tracking-widest pt-1">{title}</p>
);

const statusColor = (s) => {
  if (s === 'Paid') return 'bg-green-100 text-green-700';
  if (s === 'Pending') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
};

export default function ReservationDetailPanel({ open, onClose, reservation: r, onEdit, onDelete }) {
  const [lightbox, setLightbox] = useState(null);
  if (!r) return null;

  const handleDownload = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = url.split('/').pop();
    a.click();
  };

  return (
    <>
      <SlidePanel
        open={open}
        onClose={onClose}
        title={
          <div className="flex items-center justify-between w-full pr-2">
            <span>{r.name || r.fullName || 'Reservation'}</span>
            <div className="flex items-center gap-2">
              <button onClick={onEdit} className="p-1.5 rounded-lg text-[#8B7355] hover:bg-[#F5F0E8] hover:text-[#B8860B] transition-colors" title="Edit">
                <Pencil size={16} />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg text-[#8B7355] hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        }
        width="w-[480px]"
      >
        <div className="flex flex-col gap-4">

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8B7355]">{r._id?.slice(-6).toUpperCase()}</span>
            {r.paymentStatus && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(r.paymentStatus)}`}>
                {r.paymentStatus}
              </span>
            )}
          </div>

          <hr className="border-[#E5E0D8]" />
          {section('Client Info')}
          {row('Full Name', r.name)}
          {row('Email', r.email)}
          {row('Phone', r.phone)}
          {row('Next of Kin', r.nextOfKin)}
          {row('Next of Kin Phone', r.nextOfKinPhone)}

          <hr className="border-[#E5E0D8]" />
          {section('Appointment')}
          {row('Type', r.appointmentType)}
          {row('With', r.appointmentWith)}
          {row('Location', r.appointmentLocation)}
          {row('Date', r.appointmentDate)}
          {row('Time', r.appointmentTime ? `${r.appointmentTime} ${r.appointmentAM || ''}` : null)}

          <hr className="border-[#E5E0D8]" />
          {section('Payment')}
          {row('Consultation Fee', r.consultationFee ? `₦${Number(r.consultationFee).toLocaleString()}` : null)}
          {row('Payment Status', r.paymentStatus)}
          {row('Payment Gateway', r.paymentGateway)}

          <hr className="border-[#E5E0D8]" />
          {section('Bridal Details')}
          {row('Fabric Preference', r.fabricPreference)}
          {row('Train Length', r.trainLength)}
          {row('Sleeve Preference', r.sleevePreference)}
          {row('Silhouette Preference', r.silhouettePreference)}

          <hr className="border-[#E5E0D8]" />
          {section('Wedding Info')}
          {row('Wedding Date', r.weddingDate)}
          {row('Wedding Location', r.weddingLocation)}
          {row('Ceremony Type', r.ceremonyType)}
          {row('Budget', r.budget ? `₦${Number(r.budget).toLocaleString()}` : null)}

          {r.additionalInfo && (
            <>
              <hr className="border-[#E5E0D8]" />
              {section('Additional Info')}
              <p className="text-sm text-[#2C1F0E] whitespace-pre-wrap">{r.additionalInfo}</p>
            </>
          )}

          {r.images?.length > 0 && (
            <>
              <hr className="border-[#E5E0D8]" />
              {section('Inspiration Images')}
              <div className="flex flex-wrap gap-2">
                {r.images.map((img, i) => {
                  const src = typeof img === 'string' ? img : URL.createObjectURL(img);
                  return (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      onClick={() => setLightbox(src)}
                      className="w-20 h-20 object-cover rounded-lg border border-[#E5E0D8] cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  );
                })}
              </div>
            </>
          )}

        </div>
      </SlidePanel>

      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox} alt="" className="w-full max-h-[80vh] object-contain rounded-xl" />
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => handleDownload(lightbox)}
                className="p-2 bg-white rounded-full shadow text-[#2C1F0E] hover:bg-[#F5F0E8] transition-colors"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => setLightbox(null)}
                className="p-2 bg-white rounded-full shadow text-[#2C1F0E] hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
