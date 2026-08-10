import React from 'react';
import { Users, BookOpen, Clock, ChevronRight } from 'lucide-react';

interface WaitlistManagerProps {
  waitlistQueue: any[];
  courseCapacities: any[];
  actionLoading: boolean;
  onPromoteStudent: (enrollmentId: string, targetBatch: number) => void;
}

const WaitlistManager: React.FC<WaitlistManagerProps> = ({ 
  waitlistQueue, 
  courseCapacities, 
  actionLoading, 
  onPromoteStudent 
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Capacities Section */}
      <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="text-blue-500" size={24} />
          <h3 className="text-xl font-bold tracking-tight">Per-Course Batch Capacities</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseCapacities.map((cap: any) => (
            <div key={cap.course_id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-blue-500/30 transition-colors">
              <h4 className="font-bold text-[var(--text-primary)] mb-3 flex items-center justify-between">
                {cap.title || cap.course_id}
                {cap.single_batch_only && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full uppercase tracking-wider">Single Batch</span>}
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center text-[var(--muted)]">
                  <span>WhatsApp Cap:</span> <span className="font-mono text-[var(--text-primary)]">{cap.whatsapp_group_cap}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--muted)]">
                  <span>Platform Cap:</span> <span className="font-mono text-[var(--text-primary)]">{cap.platform_access_cap}</span>
                </div>
                <div className="h-px w-full bg-[var(--border)] my-2"></div>
                <div className="flex justify-between items-center text-[var(--muted)]">
                  <span>Enrolled:</span> <span className="font-mono text-green-400">{cap.enrolled_count || 0}</span>
                </div>
                <div className="flex justify-between items-center text-[var(--muted)]">
                  <span>Waitlisted:</span> <span className="font-mono text-yellow-400">{cap.waitlist_count || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Waitlist Queue Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-yellow-500" size={24} />
          <h3 className="text-xl font-bold tracking-tight">Waitlist Queue <span className="text-sm font-medium bg-[var(--surface-dark)] border border-[var(--border)] px-3 py-1 rounded-full text-[var(--muted)] ml-2">{waitlistQueue.length} pending</span></h3>
        </div>

        {waitlistQueue.length === 0 ? (
          <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <Users className="text-[var(--muted)] opacity-50 mb-3" size={48} />
            <p className="text-[var(--muted)] font-medium">No students currently on the waitlist.</p>
          </div>
        ) : (
          <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
            {waitlistQueue.map(item => (
              <div key={item.id} className="p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-[var(--surface)] transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-[var(--text-primary)] text-lg">{item.full_name || 'Anonymous Student'}</h4>
                    <span className="text-[10px] bg-[var(--bg-main)] border border-[var(--border)] px-2 py-0.5 rounded font-mono text-[var(--muted)]">{item.student_display_id || 'N/A'}</span>
                  </div>
                  <div className="text-sm text-[var(--muted)] mb-2">{item.email || 'No email'}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded font-medium">Course: {item.course_id}</span>
                    <span className={`text-xs border px-2 py-1 rounded font-medium ${item.has_platform_access ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      Platform Access: {item.has_platform_access ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <button 
                    onClick={() => onPromoteStudent(item.id, 1)}
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    disabled={actionLoading}
                  >
                    Promote to Batch 1 <ChevronRight size={16} />
                  </button>
                  <button 
                    onClick={() => onPromoteStudent(item.id, 2)}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    disabled={actionLoading}
                  >
                    Promote to Batch 2 <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitlistManager;
