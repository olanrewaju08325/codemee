import { useState, useEffect } from "react";
import { Activity, Server, Database, Cloud, Shield, Mail } from "lucide-react";
import { supabase } from "../../supabaseClient";

export const SystemHealthDashboard = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/monitoring/health`, {
          headers: { "Authorization": `Bearer ${session?.access_token}` }
        });
        if (res.ok) {
          setHealth(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch health data", e);
      }
      setLoading(false);
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !health) return <div className="p-4 text-[var(--muted)]">Loading telemetry...</div>;

  const SubsystemRow = ({ name, status, icon: Icon }: any) => (
    <div className="flex justify-between items-center p-3 border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface)]">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded ${status === "Operational" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
          <Icon size={18} />
        </div>
        <span className="font-medium capitalize">{name.replace("_", " ")}</span>
      </div>
      <span className={`text-sm ${status === "Operational" ? "text-green-400" : "text-yellow-400"}`}>
        {status}
      </span>
    </div>
  );

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
        <h3 className="font-bold flex items-center gap-2"><Activity size={18} className="text-emerald-400"/> System Health</h3>
        <span className="text-xs font-mono text-[var(--muted)]">Overall Score: <strong className="text-emerald-400">{health.score}%</strong></span>
      </div>
      
      <div className="flex flex-col">
        <SubsystemRow name="frontend" status={health.subsystems.frontend} icon={Server} />
        <SubsystemRow name="backend" status={health.subsystems.backend} icon={Server} />
        <SubsystemRow name="database" status={health.subsystems.database} icon={Database} />
        <SubsystemRow name="storage" status={health.subsystems.storage} icon={Cloud} />
        <SubsystemRow name="authentication" status={health.subsystems.authentication} icon={Shield} />
        <SubsystemRow name="ai_services" status={health.subsystems.ai_services} icon={Activity} />
        <SubsystemRow name="email_services" status={health.subsystems.email_services} icon={Mail} />
      </div>
    </div>
  );
};

