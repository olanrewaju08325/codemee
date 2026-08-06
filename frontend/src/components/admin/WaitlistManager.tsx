import React from 'react'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.1rem', fontWeight: 800 }}>Per-Course Batch Capacities</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {courseCapacities.map((cap: any) => (
            <div key={cap.course_id} style={{ padding: '10px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px' }}>{cap.title || cap.course_id}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                WhatsApp: {cap.whatsapp_group_cap} | Platform: {cap.platform_access_cap} | Batches: {cap.total_batches} {cap.single_batch_only ? '(Single)' : ''}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Enrolled: {cap.enrolled_count || 0} | Platform: {cap.platform_access_count || 0} | Waitlisted: {cap.waitlist_count || 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.25rem', fontWeight: 800 }}>Waitlisted Students ({waitlistQueue.length})</h3>
      {waitlistQueue.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No students currently on the waitlist.</div>
      ) : (
        waitlistQueue.map(item => (
          <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{item.full_name || 'Anonymous'}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID: {item.student_display_id || 'N/A'}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email: {item.email || 'N/A'}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-cyan)' }}>Course: {item.course_id} | Platform: {item.has_platform_access ? 'Yes' : 'No'}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => onPromoteStudent(item.id, 1)}
                className="btn"
                style={{ backgroundColor: 'var(--color-blue)', color: '#FFFFFF', padding: '6px 10px', fontSize: '0.75rem', cursor: 'pointer' }}
                disabled={actionLoading}
              >
                Promote to Batch 1
              </button>
              <button 
                onClick={() => onPromoteStudent(item.id, 2)}
                className="btn"
                style={{ backgroundColor: 'var(--color-purple)', color: '#FFFFFF', padding: '6px 10px', fontSize: '0.75rem', cursor: 'pointer' }}
                disabled={actionLoading}
              >
                Promote to Batch 2
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default WaitlistManager
