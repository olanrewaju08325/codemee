import { useState, useEffect } from "react";
import { X, Zap, WifiOff, Layout, Share, PlusSquare, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed",
    platform: string
  }>;
  prompt(): Promise<void>;
}

// Detect iOS Safari, which never fires `beforeinstallprompt` — installing
// there is a manual "Add to Home Screen" flow we have to explain instead.
const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  // iPadOS 13+ reports as Mac but is touch-capable.
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// True once the app is running as an installed PWA (so we don't nag).
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (window.navigator as any).standalone === true;

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const triggerInstall = () => setShowModal(true);
    const onInstalled = () => {
      setInstalled(true);
      setShowModal(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("codeme-install", triggerInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("codeme-install", triggerInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Native path: Chrome/Edge/Android have a deferred prompt to replay.
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
      return;
    }
    // No native prompt (iOS, or browsers that haven't offered it): the modal
    // already shows manual instructions, so just acknowledge/close.
    setShowModal(false);
  };

  const ios = isIOS();
  // Manual instructions are the only route when there's no deferred prompt.
  const showManualSteps = !deferredPrompt;

  if (!showModal) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 500,
      padding: "var(--space-4)"
    }}>
      <div style={{
        background: "var(--surface-default)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        maxWidth: "400px",
        width: "100%",
        position: "relative",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-xl)"
      }}>
        <button
          onClick={() => setShowModal(false)}
          aria-label="Close"
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
          <img src="/codeme.jpg" alt="CodeMe Logo" style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto var(--space-3)", objectFit: "contain" }} />
          <h2 style={{ margin: "0 0 var(--space-2)" }}>
            {installed ? "You're all set" : "Install CodeMe Academy"}
          </h2>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            {installed
              ? "CodeMe is installed on this device. Enjoy the app!"
              : "Get the premium experience directly on your device."}
          </p>
        </div>

        {!installed && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
              <Feature icon={<Zap size={20} />} title="Fast & Smooth" desc="Loads instantly like a native app" />
              <Feature icon={<WifiOff size={20} />} title="Offline Access" desc="Read lessons without internet" />
              <Feature icon={<Layout size={20} />} title="Desktop Workspace" desc="Dedicated window for focused learning" />
            </div>

            {showManualSteps ? (
              <div style={{
                background: "var(--bg-surface-hover)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
              }}>
                <p style={{ margin: "0 0 var(--space-3)", fontWeight: "var(--weight-semibold)", color: "var(--text-primary)" }}>
                  {ios ? "Add to your Home Screen" : "Install from your browser menu"}
                </p>
                {ios ? (
                  <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <Step n={1} icon={<Share size={16} />}>Tap the <strong>Share</strong> button in Safari's toolbar.</Step>
                    <Step n={2} icon={<PlusSquare size={16} />}>Choose <strong>Add to Home Screen</strong>.</Step>
                    <Step n={3} icon={<CheckCircle2 size={16} />}>Tap <strong>Add</strong> — CodeMe appears on your home screen.</Step>
                  </ol>
                ) : (
                  <ol style={{ margin: 0, paddingLeft: "var(--space-5)", color: "var(--text-secondary)", fontSize: "var(--text-sm)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    <li>Open your browser menu (⋮ or the address-bar install icon).</li>
                    <li>Choose <strong>Install app</strong> / <strong>Add to Home screen</strong>.</li>
                    <li>Confirm — CodeMe opens in its own window.</li>
                  </ol>
                )}
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="btn btn-primary"
                style={{ width: "100%", padding: "var(--space-3)", fontSize: "16px" }}
              >
                Install Application
              </button>
            )}
          </>
        )}

        {installed && (
          <button
            onClick={() => setShowModal(false)}
            className="btn btn-primary"
            style={{ width: "100%", padding: "var(--space-3)", fontSize: "16px" }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

const Feature = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
    <div style={{ background: "var(--color-secondary-100)", padding: 8, borderRadius: 8, color: "var(--primary)", flexShrink: 0, display: "flex" }}>
      {icon}
    </div>
    <div>
      <h4 style={{ margin: 0 }}>{title}</h4>
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>{desc}</p>
    </div>
  </div>
);

const Step = ({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) => (
  <li style={{ display: "flex", gap: "var(--space-3)", alignItems: "center", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 26, height: 26, borderRadius: "var(--radius-full)", flexShrink: 0,
      background: "var(--primary)", color: "#fff", fontSize: 13, fontWeight: 700
    }}>{n}</span>
    <span style={{ color: "var(--primary)", display: "flex", flexShrink: 0 }}>{icon}</span>
    <span>{children}</span>
  </li>
);
