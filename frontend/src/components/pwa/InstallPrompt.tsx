import { useState, useEffect } from "react";
import { X, Zap, WifiOff, Layout } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed",
    platform: string
  }>;
  prompt(): Promise<void>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const triggerInstall = () => setShowModal(true);

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("codeme-install", triggerInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("codeme-install", triggerInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }
    
    setDeferredPrompt(null);
    setShowModal(false);
  };

  // If there is a prompt available, we could automatically show the modal,
  // but to be less intrusive, we expose it globally or let the user click a button.
  // For the sake of the requirement, we will show a small floating action button that opens the modal.
  // Note: We keep the modal render but remove the floating button so it only triggers from sidebar or auto.
  return (
    <>
      {showModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: "var(--space-4)"
        }}>
          <div style={{
            background: "var(--surface-default)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-6)",
            maxWidth: "400px",
            width: "100%",
            position: "relative",
            border: "1px solid var(--border-subtle)"
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer"
              }}
            >
              <X size={20} />
            </button>
            
            <div style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>
              <img src="/codeme.jpg" alt="CodeMe Logo" style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto var(--space-3)" }} />
              <h2 style={{ margin: "0 0 var(--space-2)" }}>Install CodeMe Academy</h2>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>Get the premium experience directly on your device.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <div style={{ background: "rgba(139,92,246,0.1)", padding: 8, borderRadius: 8, color: "var(--primary)" }}>
                  <Zap size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Fast & Smooth</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>Loads instantly like a native app</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <div style={{ background: "rgba(139,92,246,0.1)", padding: 8, borderRadius: 8, color: "var(--primary)" }}>
                  <WifiOff size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Offline Access</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>Read lessons without internet</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <div style={{ background: "rgba(139,92,246,0.1)", padding: 8, borderRadius: 8, color: "var(--primary)" }}>
                  <Layout size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>Desktop Workspace</h4>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>Dedicated window for focused learning</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="btn btn-primary"
              style={{ width: "100%", padding: "var(--space-3)", fontSize: "16px" }}
            >
              Install Application
            </button>
          </div>
        </div>
      )}
    </>
  );
};
