/// <reference types="vite-plugin-pwa/client" />
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

export const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log("[PWA] Service Worker Registered", r);
    },
    onRegisterError(error: any) {
      console.error("[PWA] Service Worker Registration Failed", error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--surface-sunken)",
      border: "1px solid var(--primary)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--space-3) var(--space-4)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
      zIndex: 50,
      color: "var(--text-primary)"
    }}>
      <div>
        <h4 style={{ margin: 0, fontSize: "14px" }}>Update Available</h4>
        <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary)" }}>A new version of CodeMe Academy is ready.</p>
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)" }}>
        <button
          onClick={() => updateServiceWorker(true)}
          className="btn btn-primary"
          style={{ padding: "var(--space-2) var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "12px" }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            padding: "var(--space-2)"
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
