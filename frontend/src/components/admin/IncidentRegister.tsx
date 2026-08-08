import { useState, useEffect } from "react";
import { ListCollapse } from "lucide-react";
import { supabase } from "../../supabaseClient";

export const IncidentRegister = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(`${(import.meta.env.VITE_API_BASE_URL || '')}/api/admin/monitoring/incidents`, {
          headers: { "Authorization": `Bearer ${session?.access_token}` }
        });
        if (res.ok) {
          setIncidents(await res.json());
        }
      } catch (e) {
        console.error("Failed to fetch incidents", e);
      }
      setLoading(false);
    };
    fetchIncidents();
  }, []);

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-xl overflow-hidden mt-6">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
        <h3 className="font-bold flex items-center gap-2"><ListCollapse size={18} className="text-blue-400"/> Incident Register</h3>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-[var(--muted)]">Loading incidents...</div>
      ) : incidents.length === 0 ? (
        <div className="p-8 text-center text-[var(--muted)]">No active incidents.</div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-[var(--muted)] bg-[var(--surface)] uppercase border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Severity</th>
              <th className="px-6 py-3">Detection Time</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="px-6 py-3 font-medium">{i.title}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${i.status === "open" ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"}`}>
                    {i.status}
                  </span>
                </td>
                <td className="px-6 py-3 capitalize">{i.severity}</td>
                <td className="px-6 py-3 text-[var(--muted)]">{new Date(i.detection_time).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

