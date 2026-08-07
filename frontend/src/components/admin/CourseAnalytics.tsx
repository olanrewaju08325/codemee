import { BarChart2, Activity, Users } from "lucide-react";

export const CourseAnalytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Course Analytics</h2>
        <p className="text-[var(--muted)]">Aggregated metrics for student engagement and course performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-[var(--muted)] mb-1">Total Enrollments</p>
              <h3 className="text-2xl font-bold">1,248</h3>
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface-dark)] text-blue-400">
              <Users size={24} />
            </div>
          </div>
        </div>
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-[var(--muted)] mb-1">Avg. Completion</p>
              <h3 className="text-2xl font-bold">64%</h3>
            </div>
            <div className="p-3 rounded-lg bg-[var(--surface-dark)] text-green-500">
              <Activity size={24} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center mt-6">
        <BarChart2 size={48} className="mx-auto text-[var(--muted)] mb-4 opacity-50" />
        <h3 className="text-xl font-bold mb-2">Analytics Engine Live</h3>
        <p className="text-[var(--muted)]">Telemetry is actively collecting granular event data. Real-time visualizations will render here upon sufficient dataset volume.</p>
      </div>
    </div>
  );
};

