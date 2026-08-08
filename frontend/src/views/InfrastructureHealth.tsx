import { useState, useEffect } from "react";
import { Activity, Database, Server, Settings, CheckCircle, AlertTriangle } from "lucide-react";
import apiClient from "../apiClient";
export const InfrastructureHealth = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await apiClient.system.getHealth();
        setHealth(data);
      } catch (error) {
        console.error("Failed to fetch infrastructure health:", error);
        setHealth({ status: "degraded", database: "unhealthy", ai_service: "unhealthy", storage: "unhealthy" });
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[var(--muted)]">Loading infrastructure metrics...</div>;
  }

  const renderStatus = (status: string) => {
    if (status === "healthy" || status === "configured") {
      return <span className="flex items-center text-green-500"><CheckCircle size={16} className="mr-2" /> OK</span>;
    }
    return <span className="flex items-center text-red-500"><AlertTriangle size={16} className="mr-2" /> {status}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Infrastructure Health</h2>
        <p className="text-[var(--muted)]">Real-time status of critical platform services.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl bg-[var(--surface-dark)] border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-[var(--primary)]" />
            <h3 className="font-semibold">Overall System</h3>
          </div>
          <div className="text-xl font-bold">
            {renderStatus(health?.status || "unknown")}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[var(--surface-dark)] border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Database className="text-blue-400" />
            <h3 className="font-semibold">Database (Supabase)</h3>
          </div>
          <div className="text-xl font-bold">
            {renderStatus(health?.database || "unknown")}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[var(--surface-dark)] border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Server className="text-purple-400" />
            <h3 className="font-semibold">AI Services (Groq)</h3>
          </div>
          <div className="text-xl font-bold">
            {renderStatus(health?.ai_service || "unknown")}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-[var(--surface-dark)] border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-amber-400" />
            <h3 className="font-semibold">Storage & Auth</h3>
          </div>
          <div className="text-xl font-bold">
            {renderStatus(health?.storage || "unknown")}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-[var(--surface-dark)] border border-[var(--border)]">
        <h3 className="font-semibold mb-4">Environment Metrics</h3>
        <ul className="space-y-3">
          <li className="flex justify-between border-b border-[var(--border)] pb-2">
            <span className="text-[var(--muted)]">API Version</span>
            <span>{health?.version || "N/A"}</span>
          </li>
          <li className="flex justify-between border-b border-[var(--border)] pb-2">
            <span className="text-[var(--muted)]">Host OS</span>
            <span>{health?.system?.os || "N/A"}</span>
          </li>
          <li className="flex justify-between border-b border-[var(--border)] pb-2">
            <span className="text-[var(--muted)]">Python Runtime</span>
            <span>{health?.system?.python_version || "N/A"}</span>
          </li>
          <li className="flex justify-between border-b border-[var(--border)] pb-2">
            <span className="text-[var(--muted)]">Frontend URL</span>
            <span>{window.location.origin}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

