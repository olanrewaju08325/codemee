import { useState, useEffect } from "react";
import { Clock, Shield, Search } from "lucide-react";
import { supabase } from "../../supabaseClient";

export const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/audit-logs`, {
          headers: {
            "Authorization": `Bearer ${session?.access_token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-[var(--muted)]">Loading immutable audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Admin Audit Logs</h2>
          <p className="text-[var(--muted)]">Immutable record of all administrator actions.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-[var(--muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Search logs..." 
            className="pl-10 pr-4 py-2 bg-[var(--surface-dark)] border border-[var(--border)] rounded-lg w-64 focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--surface-dark)] border-b border-[var(--border)]">
            <tr>
              <th className="p-4 font-semibold text-[var(--muted)]">Timestamp</th>
              <th className="p-4 font-semibold text-[var(--muted)]">Admin</th>
              <th className="p-4 font-semibold text-[var(--muted)]">Action</th>
              <th className="p-4 font-semibold text-[var(--muted)]">Target Object</th>
              <th className="p-4 font-semibold text-[var(--muted)]">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--muted)]">No audit logs found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-dark)] transition-colors">
                  <td className="p-4 flex items-center gap-2">
                    <Clock size={14} className="text-[var(--muted)]" />
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-[var(--primary)]" />
                      {log.admin_name || log.admin_id.substring(0, 8)}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{log.action}</td>
                  <td className="p-4 font-mono text-sm text-[var(--muted)]">{log.target_object || "-"}</td>
                  <td className="p-4 font-mono text-sm">{log.ip_address || "Unknown"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

