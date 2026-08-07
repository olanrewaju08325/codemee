import React, { useState, useEffect } from 'react';
import { ChevronLeft, Upload, FileText, CheckCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import apiClient from '../apiClient';
import { Button } from '../components/ui/Button';

interface AssignmentViewProps {
  session: any;
  assignmentId: string;
  onNavigate: (view: string) => void;
}

export const AssignmentView: React.FC<AssignmentViewProps> = ({ session, assignmentId }) => {
  const [assignment, setAssignment] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Submission Draft State
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // We get assignment and any current submission
        const data = await apiClient.courses.getAssignmentForSubmit(assignmentId);
        setAssignment(data.assignment);
        setSubmission(data.submission);
        
        if (!data.submission) {
          // Load draft if it exists
          const draft = localStorage.getItem(`codeme_assign_draft_${assignmentId}`);
          if (draft) setSubmissionText(draft);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [assignmentId, session]);

  const handleTextChange = (val: string) => {
    setSubmissionText(val);
    localStorage.setItem(`codeme_assign_draft_${assignmentId}`, val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }
    setError(null);
    setSubmissionFile(file);
    setSubmissionFileName(file.name);
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && !submissionFile) {
      setError('Please provide a text response, a link, or upload a file.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      // Mock File Upload (since backend doesn't store actual files right now, just the name/path)
      const fileUrl = submissionFile ? `/uploads/${submissionFile.name}` : null;

      const res = await apiClient.courses.submitAssignment(assignmentId, {
        submission_text: submissionText,
        submission_file: fileUrl
      });
      
      setSubmission(res);
      localStorage.removeItem(`codeme_assign_draft_${assignmentId}`);
      
    } catch (e) {
      setError('Submission failed. Please try again.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'graded': return '#10B981';
      case 'submitted': return '#F59E0B';
      case 'revision_requested': return '#EF4444';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ height: '60px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', padding: '0 var(--space-4)', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={20} /> Back
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Details Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>{assignment?.title}</h1>
              {submission && (
                <div style={{ padding: '6px 12px', borderRadius: '999px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: getStatusColor(submission.status), backgroundColor: `${getStatusColor(submission.status)}15`, textTransform: 'uppercase' }}>
                  {submission.status}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 'var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> Due in 3 days</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={16} /> 100 Points</span>
            </div>

            <div className="markdown-body" style={{ color: 'var(--text-primary)', lineHeight: 1.6, backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
              <ReactMarkdown>{assignment?.description || 'No description provided.'}</ReactMarkdown>
            </div>
          </div>

          {/* Teacher Feedback Section (If Graded) */}
          {submission?.status === 'graded' && submission.feedback && (
            <div style={{ backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', color: '#10B981', marginBottom: 'var(--space-4)' }}>Teacher Feedback</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.5 }}>{submission.feedback}</p>
            </div>
          )}

          {/* Submission Section */}
          {!submission || submission.status === 'revision_requested' ? (
            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', backgroundColor: 'var(--bg-secondary)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Your Submission</h3>
              
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                  <AlertTriangle size={18} /> <span style={{ fontSize: 'var(--text-sm)' }}>{error}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>Text Response / Repository Link</label>
                  <textarea 
                    value={submissionText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Provide your project URL, GitHub repo link, or textual response here..."
                    style={{ width: '100%', minHeight: '150px', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', resize: 'vertical', fontSize: 'var(--text-sm)', fontFamily: 'inherit', color: 'var(--text-primary)' }}
                  />
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>Drafts are auto-saved to your local device.</p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>File Upload (Optional)</label>
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: 'var(--space-6)', border: '2px dashed var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}>
                    <Upload size={24} color="var(--text-secondary)" />
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                      {submissionFileName ? submissionFileName : 'Click to select a file (PDF, ZIP, Image)'}
                    </span>
                    <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                  <Button onClick={handleSubmit} isLoading={submitting} style={{ backgroundColor: 'var(--color-blue)', color: 'white' }}>
                    Submit Assignment
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', backgroundColor: 'var(--bg-secondary)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Submitted Work</h3>
              <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {submission.submission_text && (
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Response Content</div>
                    <p style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{submission.submission_text}</p>
                  </div>
                )}
                
                {submission.submission_file && (
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>Attached File</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)' }}>
                      <FileText size={16} /> <span>{submission.submission_file.split('/').pop()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
