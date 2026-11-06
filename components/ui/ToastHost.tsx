"use client";

import { useEffect, useRef, useState } from "react";

type Toast = { id: number; message: string; tone: "success" | "danger" };

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    function onToast(event: Event) {
      const detail = (event as CustomEvent<{ message: string; tone?: "success" | "danger" }>).detail;
      if (!detail?.message) return;
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message: detail.message, tone: detail.tone ?? "success" }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 3800);
    }
    window.addEventListener("app:toast", onToast);
    return () => window.removeEventListener("app:toast", onToast);
  }, []);

  return (
    <div className="toast-wrap" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-item show ${toast.tone === "danger" ? "border-danger" : ""}`}
          role="status"
        >
          <i
            className={`fa-solid ${toast.tone === "danger" ? "fa-circle-exclamation" : "fa-circle-check"} me-2`}
            aria-hidden="true"
          />
          {toast.message}
        </div>
      ))}
    </div>
  );
}
