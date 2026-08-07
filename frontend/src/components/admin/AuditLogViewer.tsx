import { useState, useEffect } from "react";
import { Activity, ShieldAlert, Filter } from "lucide-react";
import { supabase } from "../../supabaseClient";

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/system/audit`, {
          headers: { "Authorization": `Bearer ${session?.access_token}` }
        });
        if (res.ok) {
          setLogs(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch audit logs", e);
      }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
        <h3 className="font-bold flex items-center gap-2"><Activity size={18} className="text-blue-400"/> System Audit Trail</h3>
        <button className="text-[var(--muted)] hover:text-white flex items-center gap-1 text-sm"><Filter size={14}/> Filter</button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-[var(--muted)]">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center text-[var(--muted)]">No audit logs found.</div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-[var(--muted)] bg-[var(--surface)] uppercase border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">User Role</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="px-6 py-3 text-[var(--muted)]">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="px-6 py-3 font-medium capitalize">{l.role}</td>
                <td className="px-6 py-3 font-medium">{l.action}</td>
                <td className="px-6 py-3 text-[var(--muted)] font-mono text-xs">{l.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="p-3 bg-red-500/10 text-red-400 text-xs flex items-center gap-2 border-t border-[var(--border)]">
        <ShieldAlert size={14} /> Audit logs are immutable and cannot be deleted.
      </div>
    </div>
  );
};

