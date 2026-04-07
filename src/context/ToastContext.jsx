import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle size={18} className="text-green-500 shrink-0" />,
  error:   <XCircle size={18} className="text-red-500 shrink-0" />,
  info:    <AlertCircle size={18} className="text-[#B8860B] shrink-0" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, visible: true }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, visible: false } : t));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 400);
    }, duration);
  }, []);

  const dismiss = (id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 400);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 bg-white border border-[#E5E0D8] shadow-lg rounded-xl px-4 py-3 min-w-[280px] max-w-sm pointer-events-auto transition-all duration-400 ${
              t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'
            }`}
          >
            {icons[t.type]}
            <span className="text-sm text-[#2C1F0E] flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-[#A09080] hover:text-[#2C1F0E]">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
