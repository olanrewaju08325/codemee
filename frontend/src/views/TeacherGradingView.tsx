import React, { useState, useEffect } from 'react';
import { ChevronLeft, Check, AlertTriangle, MessageSquare, Loader2, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import apiClient from '../apiClient';
import { Button } from '../components/ui/Button';

interface TeacherGradingViewProps {
  session: any;
  onNavigate: (view: string) => void;
}

export const TeacherGradingView: React.FC<TeacherGradingViewProps> = ({ onNavigate }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Grading State
  const [status, setStatus] = useState('graded');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        // Assuming admin/teacher endpoint to fetch submissions
        const data = await apiClient.courses.getAssignmentSubmissions();
        setSubmissions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const handleSelectSubmission = (sub: any) => {
    setSelectedSub(sub);
    setStatus(sub.status === 'submitted' ? 'graded' : sub.status);
    setFeedback(sub.feedback || '');
    setMessage(null);
  };

  const handleSaveGrade = async () => {
    if (!selectedSub) return;
    try {
      setSaving(true);
      setMessage(null);
      await apiClient.admin.gradeAssignment(selectedSub.id, { status, feedback });
      
      setMessage({ type: 'success', text: 'Grade and feedback saved successfully.' });
      
      // Update local state
      setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? { ...s, status, feedback } : s));
      setSelectedSub((prev: any) => ({ ...prev, status, feedback }));
      
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Failed to save grade.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar: Submission Queue */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-default)' }}>
          <button onClick={() => onNavigate('teacher-panel')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <ChevronLeft size={16} /> Back to Dashboard
          </button>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Submissions</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {submissions.length === 0 ? (
            <div style={{ padding: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>No submissions found.</div>
          ) : (
            submissions.map(sub => (
              <div 
                key={sub.id} 
                onClick={() => handleSelectSubmission(sub)}
                style={{ 
                  padding: 'var(--space-4)', 
                  borderBottom: '1px solid var(--border-default)', 
                  backgroundColor: selectedSub?.id === sub.id ? 'var(--bg-primary)' : 'transparent',
                  borderLeft: selectedSub?.id === sub.id ? '3px solid var(--color-blue)' : '3px solid transparent',
                  cursor: 'pointer' 
                }}
              >
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>Assignment: {sub.assignment_id.substring(0, 8)}...</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '8px' }}>Student: {sub.student_id.substring(0, 8)}...</div>
                
                <span style={{ 
                  padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 'var(--weight-bold)', textTransform: 'uppercase',
                  backgroundColor: sub.status === 'graded' ? 'rgba(16,185,129,0.1)' : sub.status === 'revision_requested' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                  color: sub.status === 'graded' ? '#10B981' : sub.status === 'revision_requested' ? '#EF4444' : '#F59E0B'
                }}>
                  {sub.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content: Grading Panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
        {selectedSub ? (
          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Review Submission</h2>
            
            {message && (
              <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', backgroundColor: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: message.type === 'success' ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {message.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)' }}>{message.text}</span>
              </div>
            )}

            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
              <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Student Work</h3>
              </div>
              <div style={{ padding: 'var(--space-6)' }}>
                {selectedSub.submission_text && (
                  <div style={{ marginBottom: selectedSub.submission_file ? 'var(--space-6)' : 0 }}>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-secondary)', marginBottom: '8px' }}>TEXT RESPONSE</div>
                    <div className="markdown-body" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      <ReactMarkdown>{selectedSub.submission_text}</ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {selectedSub.submission_file && (
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-secondary)', marginBottom: '8px' }}>ATTACHED FILE</div>
                    <a href={selectedSub.submission_file} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-blue)', textDecoration: 'underline' }}>
                      {selectedSub.submission_file.split('/').pop()}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
              <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Grading & Feedback</h3>
              </div>
              <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '8px' }}>Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}
                  >
                    <option value="submitted">Submitted (Pending)</option>
                    <option value="graded">Graded / Approved</option>
                    <option value="revision_requested">Revision Requested</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '8px' }}>Feedback Comments</label>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback for the student..."
                    style={{ width: '100%', minHeight: '120px', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <Button onClick={handleSaveGrade} isLoading={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-blue)', color: 'white' }}>
                    <Save size={16} /> Save Grade
                  </Button>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>Select a Submission</h3>
            <p style={{ fontSize: 'var(--text-sm)' }}>Choose a student submission from the queue to review and grade.</p>
          </div>
        )}
      </div>
    </div>
  );
};
