import { useState, useEffect } from "react";
import { Database, Server, HardDrive, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "../../supabaseClient";

export const DatabaseHealth = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/database/health`, {
        headers: {
          "Authorization": `Bearer ${session?.access_token}`
        }
      });
      if (response.ok) {
        const json = await response.json();
        setData(json);
      } else {
        setError("Failed to fetch database health.");
      }
    } catch {
      setError("An error occurred while connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) return <div className="p-8 text-center text-[var(--muted)]">Analyzing database metrics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Database Health & Operations</h2>
          <p className="text-[var(--muted)]">Production database monitoring and administrative tools.</p>
        </div>
        <button 
          onClick={fetchHealth}
          className="flex items-center gap-2 bg-[var(--surface-dark)] hover:bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-[var(--muted)] mb-1">Status</p>
              <h3 className="text-2xl font-bold capitalize text-green-500">{data.status}</h3>
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface-dark)] text-green-500">
              <Database size={24} />
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">Supabase PostgreSQL</p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-[var(--muted)] mb-1">Ping Latency</p>
              <h3 className="text-2xl font-bold">{data.ping_ms} ms</h3>
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface-dark)] text-blue-400">
              <Server size={24} />
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">FastAPI to Database</p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-[var(--muted)] mb-1">Slow Queries</p>
              <h3 className="text-2xl font-bold">{data.slow_queries_active}</h3>
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface-dark)] text-yellow-500">
              <AlertTriangle size={24} />
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">Queries &gt; 5 seconds</p>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-[var(--muted)] mb-1">Last Backup</p>
              <h3 className="text-sm font-bold mt-1">PITR Enabled</h3>
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface-dark)] text-purple-400">
              <HardDrive size={24} />
            </div>
          </div>
          <p className="text-xs text-[var(--muted)]">{data.last_backup}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Database size={18} /> Table Statistics
          </h3>
          <div className="space-y-4">
            {Object.entries(data.row_counts).map(([table, count]) => (
              <div key={table} className="flex justify-between items-center p-3 bg-[var(--surface-dark)] rounded-lg">
                <span className="font-mono text-sm text-[var(--muted)]">{table}</span>
                <span className="font-bold">{Number(count).toLocaleString()} rows</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Server size={18} /> System Information
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-[var(--surface-dark)] rounded-lg">
              <p className="text-sm text-[var(--muted)] mb-1">Database Version</p>
              <p className="font-mono text-sm">{data.version}</p>
            </div>
            <div className="p-4 bg-[var(--surface-dark)] rounded-lg">
              <p className="text-sm text-[var(--muted)] mb-1">Migration Status</p>
              <p className="font-mono text-sm text-green-400">{data.migration_status}</p>
            </div>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-bold text-yellow-500 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} /> Admin Notice
              </h4>
              <p className="text-sm text-yellow-500/80">
                Direct SQL execution and manual index rebuilding is disabled in the production environment. Please use Supabase Dashboard for direct database operations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

