import React from 'react'
import { Loader2, Download, AlertTriangle, Bot } from 'lucide-react'

interface GradingQueueProps {
  gradingQueue: any[];
  actionLoading: boolean;
  feedbackTextMap: Record<string, string>;
  handleFeedbackChange: (id: string, text: string) => void;
  handleGradeSubmission: (id: string, status: 'approved' | 'rejected') => void;
  handleFlagAI: (id: string, isFlagged: boolean) => void;
}

const GradingQueue: React.FC<GradingQueueProps> = ({
  gradingQueue,
  actionLoading,
  feedbackTextMap,
  handleFeedbackChange,
  handleGradeSubmission,
  handleFlagAI
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.25rem', fontWeight: 800 }}>Project Submission Reviews</h3>
      {gradingQueue.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No pending assignments to grade.</div>
      ) : (
        gradingQueue.map(sub => (
          <div key={sub.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{sub.profiles?.full_name || 'Anonymous'}</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {sub.profiles?.student_id || 'N/A'}</span>
              </div>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                M{sub.assignments?.modules?.order_index || 1}
              </span>
            </div>
            
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Assignment: {sub.assignments?.title}</p>
              {sub.submission_text && (
                <p style={{ fontFamily: '"Courier New", Courier, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginBottom: '8px' }}>{sub.submission_text}</p>
              )}
              {sub.submission_file && (
                <div style={{ marginTop: '8px', padding: '6px 0', borderTop: '1px solid var(--border-color)' }}>
                  <a 
                    href={sub.submission_file} 
                    download={sub.submission_file.startsWith('data:text/html') ? 'student_project.html' : 'student_project.zip'}
                    style={{ fontSize: '0.75rem', color: 'var(--color-blue)', fontWeight: 600, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={13} /> Download Submitted File
                  </a>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.7rem' }}>FEEDBACK NOTES</label>
              <textarea 
                className="input-field" 
                placeholder="Write feedback remarks for the student..." 
                value={feedbackTextMap[sub.id] || ''}
                onChange={(e) => handleFeedbackChange(sub.id, e.target.value)}
                style={{ minHeight: '60px', padding: '8px', fontSize: '0.8rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <button 
                className="btn" 
                onClick={() => handleGradeSubmission(sub.id, 'approved')}
                disabled={actionLoading}
                style={{ backgroundColor: 'var(--color-success)', color: '#FFFFFF', padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'Approve & Grade'}
              </button>
              <button 
                className="btn" 
                onClick={() => handleGradeSubmission(sub.id, 'rejected')}
                disabled={actionLoading}
                style={{ backgroundColor: 'var(--color-danger)', color: '#FFFFFF', padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Reject (Resubmit)
              </button>
              <button 
                type="button"
                onClick={() => handleFlagAI(sub.id, !sub.is_ai_flagged)}
                className="btn"
                style={{ 
                  padding: '8px 12px', 
                  fontSize: '0.8rem', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '4px',
                  backgroundColor: sub.is_ai_flagged ? 'var(--color-danger)' : 'var(--bg-primary)',
                  color: sub.is_ai_flagged ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
                disabled={actionLoading}
              >
                {sub.is_ai_flagged
                  ? <><AlertTriangle size={14} /> AI Flagged (Click to Clear)</>
                  : <><Bot size={14} /> Flag for AI Review</>}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default GradingQueue
