import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let addToastFn: ((message: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'success') {
  addToastFn?.(message, type);
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

const styles = {
  success: 'bg-emerald-900/90 border-emerald-500/40 text-emerald-100',
  error: 'bg-red-900/90 border-red-500/40 text-red-100',
  warning: 'bg-amber-900/90 border-amber-500/40 text-amber-100',
};

const iconStyles = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  warning: 'text-amber-400',
};

function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: (id: number) => void }) {
  const Icon = icons[data.type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(data.id), 5000);
    return () => clearTimeout(timer);
  }, [data.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl max-w-sm ${styles[data.type]}`}
    >
      <Icon size={18} className={`mt-0.5 flex-shrink-0 ${iconStyles[data.type]}`} />
      <p className="text-sm font-medium leading-snug flex-1">{data.message}</p>
      <button
        onClick={() => onDismiss(data.id)}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Cerrar notificacion"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = (message: string, type: ToastType) => {
      setToasts(prev => [...prev, { id: ++toastId, message, type }]);
    };
    return () => { addToastFn = null; };
  }, []);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem data={t} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
