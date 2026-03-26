import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
  leaving?: boolean;
}

interface ToastContextType {
  toast: (message: string, type?: 'error' | 'success' | 'info', durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_LEAVE_MS = 280;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(0);

  const toast = useCallback(
    (message: string, type: 'error' | 'success' | 'info' = 'error', durationMs: number = 4000) => {
      const id = nextIdRef.current++;
      setToasts((t) => [...t, { id, message, type }]);
      const leaveAt = Math.max(0, durationMs - TOAST_LEAVE_MS);
      window.setTimeout(() => {
        setToasts((list) => list.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
      }, leaveAt);
      window.setTimeout(() => {
        setToasts((list) => list.filter((x) => x.id !== id));
      }, durationMs);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}${t.leaving ? ' toast-leaving' : ''}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
