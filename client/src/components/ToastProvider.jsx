import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const ToastContext = createContext({
  notify: () => {},
});

const TOAST_TIMEOUT_MS = 3500;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const alertBackupRef = useRef(null);
  const idRef = useRef(1);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, type = "info") => {
      const text = String(message || "Done.");
      const id = idRef.current++;

      setToasts((prev) => [...prev, { id, text, type }]);

      window.setTimeout(() => {
        removeToast(id);
      }, TOAST_TIMEOUT_MS);
    },
    [removeToast],
  );

  useEffect(() => {
    alertBackupRef.current = window.alert;
    window.alert = (message) => notify(message, "info");

    return () => {
      if (alertBackupRef.current) {
        window.alert = alertBackupRef.current;
      }
    };
  }, [notify]);

  const contextValue = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-[10000] space-y-2 w-[min(92vw,360px)] pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-xl border border-gray-200 bg-white text-gray-900 shadow-lg px-4 py-3 flex items-start justify-between gap-3"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm leading-5">{toast.text}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-gray-800 text-sm"
              aria-label="Dismiss notification"
            >
              x
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

