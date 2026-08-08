import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import apiClient from "../../apiClient";

export const ErrorTracker = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchErrors = async () => {
      try {
        const data = await apiClient.system.getErrors();
        if (data) setErrors(data);
      } catch (e) {
        console.error("Failed to fetch errors", e);
      }
      setLoading(false);
    };
    fetchErrors();
  }, []);

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-xl overflow-hidden mt-6">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
        <h3 className="font-bold flex items-center gap-2"><AlertTriangle size={18} className="text-red-400"/> Error Tracker</h3>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-[var(--muted)]">Loading errors...</div>
      ) : errors.length === 0 ? (
        <div className="p-8 text-center text-[var(--muted)]">No recent errors detected.</div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-[var(--muted)] bg-[var(--surface)] uppercase border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((e) => (
              <tr key={e.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="px-6 py-3 whitespace-nowrap text-[var(--muted)]">{new Date(e.timestamp).toLocaleString()}</td>
                <td className="px-6 py-3 font-medium text-red-400">{e.error_type}</td>
                <td className="px-6 py-3 text-xs font-mono">{e.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

