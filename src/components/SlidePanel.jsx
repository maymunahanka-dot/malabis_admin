import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable slide-in panel from the right.
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - title: string
 *  - children: ReactNode
 *  - width: string (tailwind class, default 'w-[520px]')
 */
export default function SlidePanel({ open, onClose, title, children, width = 'w-[520px]' }) {
  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full ${width} bg-white shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E0D8]">
          <h2 className="text-lg font-bold text-[#B8860B] font-serif flex-1">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B7355] hover:bg-[#F5F0E8] hover:text-[#B8860B] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
      </div>
    </>
  );
}
