import React, { createContext, useCallback, useContext, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "success", duration = 3200) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [remove]
  );

  const success = useCallback((msg, dur) => push(msg, "success", dur), [push]);
  const error = useCallback((msg, dur) => push(msg, "error", dur ?? 4500), [push]);
  const info = useCallback((msg, dur) => push(msg, "info", dur), [push]);

  return (
    <ToastContext.Provider value={{ push, success, error, info, remove }}>
      {children}

      <div className="toaststack" role="status" aria-live="polite">
        {toasts.map((t) => {
          const meta =
            t.type === "success"
              ? { icon: <FiCheckCircle />, cls: "toast-success" }
              : t.type === "error"
              ? { icon: <FiAlertCircle />, cls: "toast-error" }
              : { icon: <FiInfo />, cls: "toast-info" };
          return (
            <div key={t.id} className={`toast ${meta.cls}`}>
              <span className="toasticon">{meta.icon}</span>
              <span className="toastmessage">{t.message}</span>
              <button
                type="button"
                className="toastclose"
                onClick={() => remove(t.id)}
                aria-label="بستن"
              >
                <FiX />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};