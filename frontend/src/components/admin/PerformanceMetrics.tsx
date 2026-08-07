import { BarChart, Zap, Clock } from "lucide-react";

export const PerformanceMetrics = () => {
  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-xl overflow-hidden mt-6">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
        <h3 className="font-bold flex items-center gap-2"><BarChart size={18} className="text-purple-400"/> Performance Metrics</h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--muted)]">
            <Zap size={16} /> API Latency (p99)
          </div>
          <div className="text-2xl font-bold">124ms</div>
        </div>
        <div className="bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--muted)]">
            <Clock size={16} /> DB Query Avg
          </div>
          <div className="text-2xl font-bold">18ms</div>
        </div>
        <div className="bg-[var(--surface)] p-4 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-2 text-[var(--muted)]">
            <Zap size={16} /> AI Token Latency
          </div>
          <div className="text-2xl font-bold">850ms</div>
        </div>
      </div>
    </div>
  );
};

