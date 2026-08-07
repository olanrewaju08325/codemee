import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      background: "#EF4444",
      color: "#fff",
      textAlign: "center",
      padding: "var(--space-2)",
      fontSize: "12px",
      fontWeight: "bold",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-2)",
      boxShadow: "0 2px 10px rgba(239,68,68,0.4)"
    }}>
      <WifiOff size={16} />
      You are offline. AI Chat, payments, and certain operations are disabled. You can still read cached lessons.
    </div>
  );
};
