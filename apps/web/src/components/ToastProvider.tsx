"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  showSuccess: () => {},
  showError: () => {},
  showInfo: () => {},
  showWarning: () => {},
  dismissToast: () => {},
});

const typeColors: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
};

const typeIcons: Record<ToastType, JSX.Element> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5v.5M10 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5l7.5 13H2.5l7.5-13z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 7.5v4M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration: number = 5000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast: Toast = { id, type, message, duration };
      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    []
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) => showToast("success", message, duration),
    [showToast]
  );

  const showError = useCallback(
    (message: string, duration?: number) => showToast("error", message, duration),
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => showToast("info", message, duration),
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => showToast("warning", message, duration),
    [showToast]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Don't render toasts during SSR
  if (!isClient) {
    return <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning, dismissToast }}>{children}</ToastContext.Provider>;
  }

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showInfo, showWarning, dismissToast }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-[300px] max-w-md animate-slide-up ${typeColors[toast.type]}`}
          >
            <span className="flex-shrink-0">{typeIcons[toast.type]}</span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
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
