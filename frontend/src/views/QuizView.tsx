import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, HelpCircle, Check, Upload, Loader2, Clock, Flag, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import apiClient from '../apiClient';
import { Button } from '../components/ui/Button';

// Mock explanation helper (retain from previous implementation)
const getExplanationForQuestion = (text: string): string => {
  const t = text.toLowerCase()
  if (t.includes('html stand for')) return 'HTML stands for HyperText Markup Language. It is the core framework used to define webpage structural templates.'
  if (t.includes('img /> element require')) return 'False. <img> is a self-closing (or void) tag. It does not require a closing </img> partner.'
  return 'Review your syllabus study guides and documentation to master this concept.'
}

interface QuizViewProps {
  session: any;
  quizId: string;
  onNavigate: (view: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ session, quizId, onNavigate }) => {
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Assessment Engine States
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0: Start, 1: Taking, 2: Result, 3: Review, 4: Payment
  
  // Assessment Engine State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // seconds
  const [submitting, setSubmitting] = useState(false);
  
  // Results
  const [latestAttempt, setLatestAttempt] = useState<any>(null);

  // Timer Ref
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizData, attemptsList, paymentsList] = await Promise.all([
          apiClient.quizzes.getQuiz(quizId),
          apiClient.quizzes.getQuizAttempts(quizId).catch(() => []),
          apiClient.payments.getMyPayments(quizId).catch(() => [])
        ]);

        setQuiz(quizData);
        setQuestions(quizData.questions || []);

        // Business Logic for Blocks
        const attemptsTaken = attemptsList.length;
        const hasPassed = attemptsList.some((a: any) => a.passed);
        const approvedPayments = paymentsList.filter((p: any) => p.status === 'approved').length;
        const totalAllowed = 1 + (approvedPayments * 2);

        if (hasPassed) {
          setIsBlocked(false);
          setLatestAttempt(attemptsList.find((a: any) => a.passed) || attemptsList[attemptsList.length - 1]);
          setActiveStep(2); // Go straight to results if already passed
        } else if (attemptsTaken >= totalAllowed) {
          setIsBlocked(true);
        } else {
          // Check local storage for draft
          const draftAnswers = localStorage.getItem(`codeme_quiz_draft_${quizId}`);
          const draftTime = localStorage.getItem(`codeme_quiz_time_${quizId}`);
          
          if (draftAnswers) setSelectedAnswers(JSON.parse(draftAnswers));
          if (draftTime) setTimeRemaining(parseInt(draftTime, 10));
          else setTimeRemaining(30 * 60); // 30 minutes default
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [quizId, session]);

  // Auto Save
  useEffect(() => {
    if (activeStep === 1) {
      localStorage.setItem(`codeme_quiz_draft_${quizId}`, JSON.stringify(selectedAnswers));
    }
  }, [selectedAnswers, activeStep, quizId]);

  // Timer logic
  useEffect(() => {
    if (activeStep === 1 && timeRemaining !== null && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          const next = prev ? prev - 1 : 0;
          if (next % 10 === 0) {
             localStorage.setItem(`codeme_quiz_time_${quizId}`, next.toString());
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStep, timeRemaining]);

  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    handleSubmit(true);
  };

  const handleSelect = (qId: string, aId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: aId }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged(prev => prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]);
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !window.confirm("Are you sure you want to submit? You cannot change your answers after submission.")) return;
    
    try {
      setSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const res = await apiClient.quizzes.submitQuiz(quizId, selectedAnswers);
      setLatestAttempt(res);
      
      // Clear drafts
      localStorage.removeItem(`codeme_quiz_draft_${quizId}`);
      localStorage.removeItem(`codeme_quiz_time_${quizId}`);
      
      setActiveStep(2); // Go to results
    } catch (e) {
      console.error(e);
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const startQuiz = () => {
    setActiveStep(1);
    if (!timeRemaining) setTimeRemaining(30 * 60);
  };

  // Payment simulated logic
  const handlePayment = async () => {
    try {
      setSubmitting(true);
      await apiClient.payments.submitPayment({
        quiz_id: quizId,
        receipt_file_path: '/receipts/mock_quiz_receipt.jpg',
        amount: 25000 // mock price
      });
      alert('Receipt uploaded. An admin will review it shortly.');
      window.location.reload();
    } catch {
      alert('Payment submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ height: '60px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-4)', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button onClick={() => onNavigate('dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>{quiz?.title || 'Assessment'}</h2>
        </div>
        
        {activeStep === 1 && timeRemaining !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: timeRemaining < 300 ? '#EF4444' : 'var(--text-primary)', fontWeight: 'var(--weight-bold)' }}>
            <Clock size={16} /> {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Taking Quiz View */}
        {activeStep === 1 && (
          <>
            {/* Sidebar Navigator */}
            <div style={{ width: '280px', borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', flexShrink: 0 }} className="hidden-mobile">
              <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-default)' }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)' }}>Question Navigator</h3>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {Object.keys(selectedAnswers).length} / {questions.length} Answered
                </div>
              </div>
              <div style={{ padding: 'var(--space-4)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', overflowY: 'auto' }}>
                {questions.map((q, idx) => {
                  const isAnswered = !!selectedAnswers[q.id];
                  const isFlagged = flagged.includes(q.id);
                  const isActive = currentIdx === idx;
                  return (
                    <button 
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      style={{
                        aspectRatio: '1/1',
                        borderRadius: 'var(--radius-sm)',
                        border: isActive ? '2px solid var(--color-blue)' : '1px solid var(--border-default)',
                        backgroundColor: isAnswered ? 'var(--color-blue)' : 'var(--bg-primary)',
                        color: isAnswered ? 'white' : 'var(--text-primary)',
                        position: 'relative',
                        cursor: 'pointer',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--weight-bold)'
                      }}
                    >
                      {idx + 1}
                      {isFlagged && <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', backgroundColor: '#F59E0B', borderRadius: '50%' }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Question Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 'var(--space-6)' }}>
              <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
                
                {questions[currentIdx] && (
                  <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 'var(--weight-bold)' }}>
                        Question {currentIdx + 1} of {questions.length}
                      </span>
                      <button 
                        onClick={() => toggleFlag(questions[currentIdx].id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: flagged.includes(questions[currentIdx].id) ? '#F59E0B' : 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}
                      >
                        <Flag size={16} fill={flagged.includes(questions[currentIdx].id) ? '#F59E0B' : 'none'} /> 
                        {flagged.includes(questions[currentIdx].id) ? 'Flagged' : 'Flag for review'}
                      </button>
                    </div>

                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
                      <ReactMarkdown>{questions[currentIdx].text}</ReactMarkdown>
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {questions[currentIdx].options && Object.entries(questions[currentIdx].options).map(([key, value]) => (
                        <div 
                          key={key}
                          onClick={() => handleSelect(questions[currentIdx].id, key)}
                          style={{
                            padding: 'var(--space-4)',
                            border: `2px solid ${selectedAnswers[questions[currentIdx].id] === key ? 'var(--color-blue)' : 'var(--border-default)'}`,
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: selectedAnswers[questions[currentIdx].id] === key ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-primary)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ 
                            width: '24px', height: '24px', borderRadius: '50%', 
                            border: `2px solid ${selectedAnswers[questions[currentIdx].id] === key ? 'var(--color-blue)' : 'var(--border-default)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {selectedAnswers[questions[currentIdx].id] === key && <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-blue)', borderRadius: '50%' }} />}
                          </div>
                          <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{String(value)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between' }}>
                      <Button variant="outline" disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)}>Previous</Button>
                      
                      {currentIdx < questions.length - 1 ? (
                        <Button onClick={() => setCurrentIdx(prev => prev + 1)}>Next</Button>
                      ) : (
                        <Button onClick={() => handleSubmit(false)} isLoading={submitting} style={{ backgroundColor: '#10B981', color: 'white' }}>Submit Assessment</Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Start / Blocked Screen */}
        {activeStep === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
            <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)' }}>
                <Check size={32} color="white" />
              </div>
              <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>{quiz?.title}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                {isBlocked 
                  ? 'You have exceeded the maximum allowed attempts for this assessment. You must pay a retake fee to unlock further attempts.' 
                  : 'This is a timed assessment. Once you begin, the timer cannot be paused. Ensure you have a stable connection.'}
              </p>

              {isBlocked ? (
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Unlock Retake</h3>
                  <Button fullWidth onClick={handlePayment} isLoading={submitting} style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                    <Upload size={16} /> Upload Payment Receipt (₦25,000)
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><HelpCircle size={16} /> {questions.length} Questions</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} /> 30 Minutes</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={16} /> 80% to Pass</div>
                  </div>
                  <Button fullWidth onClick={startQuiz}>Start Assessment</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Screen */}
        {activeStep === 2 && latestAttempt && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
            <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: latestAttempt.passed ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)', color: 'white' }}>
                  {latestAttempt.passed ? <Check size={48} /> : <X size={48} />}
                </div>
                <h2 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
                  {latestAttempt.passed ? 'Assessment Passed!' : 'Assessment Failed'}
                </h2>
                <div style={{ fontSize: 'var(--text-6xl)', fontWeight: 'var(--weight-bold)', color: latestAttempt.passed ? '#10B981' : '#EF4444', margin: 'var(--space-6) 0' }}>
                  {latestAttempt.score}%
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
                  {latestAttempt.passed ? 'Excellent work. You have demonstrated mastery of this module.' : 'You did not meet the required 80% passing threshold. Please review the material and try again.'}
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                  <Button variant="outline" onClick={() => onNavigate('dashboard')}>Return to Dashboard</Button>
                  <Button onClick={() => setActiveStep(3)}>Review Answers</Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Review Mode */}
        {activeStep === 3 && latestAttempt && (
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
            <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)' }}>Assessment Review</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveStep(2)}>Back to Results</Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {questions.map((q) => {
                  const userAnswer = latestAttempt.answers?.[q.id] || selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correct_answer;
                  
                  return (
                    <div key={q.id} style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>
                          <ReactMarkdown>{q.text}</ReactMarkdown>
                        </h3>
                        <div style={{ padding: '4px 12px', borderRadius: '999px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', backgroundColor: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: isCorrect ? '#10B981' : '#EF4444' }}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        {q.options && Object.entries(q.options).map(([key, val]) => {
                          let bgColor = 'var(--bg-primary)';
                          let borderColor = 'var(--border-default)';
                          if (key === q.correct_answer) {
                            bgColor = 'rgba(16,185,129,0.1)'; borderColor = '#10B981';
                          } else if (key === userAnswer && !isCorrect) {
                            bgColor = 'rgba(239,68,68,0.1)'; borderColor = '#EF4444';
                          }

                          return (
                            <div key={key} style={{ padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', backgroundColor: bgColor, border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{String(val)}</span>
                              {key === userAnswer && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginLeft: 'auto' }}>(Your Answer)</span>}
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ padding: 'var(--space-4)', backgroundColor: 'rgba(37,99,235,0.05)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-blue)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--color-blue)', marginBottom: '4px', textTransform: 'uppercase' }}>Teacher Explanation</div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{getExplanationForQuestion(q.text)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
