import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Check, Lock, PlayCircle, FileText, HelpCircle, Trophy, Upload, User, CheckCircle } from 'lucide-react';
import apiClient from '../apiClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';

interface CourseDetailViewProps {
  session: any;
  courseId: string;
  onNavigate: (view: string) => void;
}

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({ session, courseId, onNavigate }) => {
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch specific course data, or filter from all courses
        const [allCourses, modulesList, progressData, paymentsData, settingsData] = await Promise.all([
          apiClient.courses.getCourses(),
          apiClient.courses.getCourseModules(courseId).catch(() => []),
          apiClient.courses.getProgress().catch(() => null),
          apiClient.payments.getMyPayments(courseId).catch(() => []),
          apiClient.publicAPI.getSettings().catch(() => [])
        ]);

        const selectedCourse = allCourses.find((c: any) => c.id === courseId) || null;
        setCourse(selectedCourse);
        setModules(modulesList);
        
        setEnrollment(progressData);

        // Fetch lessons for curriculum preview
        if (modulesList.length > 0) {
          const moduleIds = modulesList.map((m: any) => m.id);
          const lessonsData = await Promise.all(
            moduleIds.map((moduleId: string) => apiClient.courses.getModuleLessons(moduleId).catch(() => []))
          );
          setLessons(lessonsData.flat());
        }

        if (paymentsData && paymentsData.length > 0) {
          setPaymentStatus(paymentsData[0]); // latest payment
        }

        if (settingsData) {
          setPlatformSettings(settingsData);
        }
      } catch (error: any) {
        console.error('Failed to load course details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, session]);

  const handleEnroll = async () => {
    if (!course) return;
    try {
      setEnrollLoading(true);
      if (course.price === 0) {
        // Auto enroll
        await apiClient.enrollment.autoEnroll(course.id);
        window.location.reload();
      } else {
        // Manual payment flow logic here... (in reality this would open a modal or scroll to payment section)
        setActiveTab('enrollment');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to enroll');
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleSimulatePaymentUpload = async () => {
    try {
      setEnrollLoading(true);
      await apiClient.payments.submitPayment({
        quiz_id: courseId, // using courseId for the receipt association for now as per mock
        receipt_file_path: '/receipts/mock_receipt.jpg',
        amount: course.price
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Payment submission failed');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
        <Skeleton height={300} borderRadius="var(--radius-lg)" />
        <div style={{ marginTop: 'var(--space-6)', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
          <Skeleton height={500} borderRadius="var(--radius-lg)" />
          <Skeleton height={300} borderRadius="var(--radius-lg)" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <h2>Course not found</h2>
        <Button onClick={() => onNavigate('courses')}>Back to Catalog</Button>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const isFree = course.price === 0;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => onNavigate('courses')}
        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}
      >
        <ChevronLeft size={16} /> Back to Catalog
      </button>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ backgroundColor: 'var(--color-blue)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', color: 'white', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '999px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)' }}>{course.id.toUpperCase()}</span>
            <span style={{ backgroundColor: isFree ? '#10B981' : '#F59E0B', padding: '4px 12px', borderRadius: '999px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)' }}>
              {isFree ? 'Free Forever' : `₦${course.price.toLocaleString()}`}
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)', marginBottom: 'var(--space-4)', lineHeight: 1.1 }}>{course.title}</h1>
          <p style={{ fontSize: 'var(--text-lg)', opacity: 0.9 }}>{course.description}</p>
        </div>
      </motion.div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)', marginTop: 'var(--space-8)', '@media (min-width: 1024px)': { gridTemplateColumns: '2fr 1fr' } } as any}>
        
        {/* Left Column: Details & Curriculum */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 'var(--space-4)', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-2)' }}>
            {['overview', 'curriculum', 'enrollment'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)',
                  textTransform: 'capitalize',
                  color: activeTab === tab ? 'var(--color-blue)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab ? '2px solid var(--color-blue)' : '2px solid transparent',
                  paddingBottom: '8px', cursor: 'pointer', transition: 'all 0.2s ease'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <Card>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>What you will learn</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                    {['Build modern responsive websites', 'Master HTML5 semantic structures', 'Learn modern CSS layout (Grid/Flexbox)', 'Deploy your portfolio site'].map((outcome, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Check size={16} color="#10B981" />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Instructors</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <User size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 'var(--weight-bold)' }}>CodeMe Academy Staff</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Lead Instructors</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <Card>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Curriculum Preview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {modules.map((module, i) => {
                    const moduleLessons = lessons.filter(l => l.module_id === module.id);
                    return (
                      <div key={module.id} style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                        <h4 style={{ fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-3)' }}>Module {i + 1}: {module.title}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                          {moduleLessons.map((lesson: any, j: number) => (
                            <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <PlayCircle size={16} color="var(--color-blue)" />
                                <span style={{ fontSize: 'var(--text-sm)' }}>{j + 1}. {lesson.title}</span>
                              </div>
                              {!isEnrolled && <Lock size={14} color="var(--text-secondary)" />}
                            </div>
                          ))}
                          {moduleLessons.length === 0 && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Coming soon</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {activeTab === 'enrollment' && (
              <Card>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Enrollment & Payment</h3>
                
                {isEnrolled ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: '#10B981', padding: 'var(--space-4)', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)' }}>
                    <CheckCircle size={24} />
                    <span style={{ fontWeight: 'var(--weight-bold)' }}>You are fully enrolled in this course.</span>
                  </div>
                ) : isFree ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <p>This course is completely free. Click below to instantly enroll.</p>
                    <Button onClick={handleEnroll} isLoading={enrollLoading}>Enroll for Free</Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {paymentStatus ? (
                      <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: paymentStatus.status === 'approved' ? 'rgba(16,185,129,0.1)' : paymentStatus.status === 'pending' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)' }}>
                        <h4 style={{ fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)', textTransform: 'capitalize' }}>Payment {paymentStatus.status}</h4>
                        <p style={{ fontSize: 'var(--text-sm)' }}>
                          {paymentStatus.status === 'pending' ? 'Your payment receipt is under manual review by admins. You will be notified once approved.' : paymentStatus.status === 'rejected' ? `Rejected: ${paymentStatus.rejection_reason}. Please upload a valid receipt.` : 'Payment Approved. You should be enrolled.'}
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                          <h4 style={{ fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>Bank Transfer Details</h4>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Bank: <strong style={{ color: 'var(--text-primary)' }}>{platformSettings.find(s => s.setting_key === 'PAYMENT_BANK_NAME')?.setting_value || 'CodeMe Academy Bank'}</strong></p>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Account Name: <strong style={{ color: 'var(--text-primary)' }}>{platformSettings.find(s => s.setting_key === 'PAYMENT_ACCOUNT_NAME')?.setting_value || 'CodeMe Academy Limited'}</strong></p>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Account Number: <strong style={{ color: 'var(--text-primary)' }}>{platformSettings.find(s => s.setting_key === 'PAYMENT_ACCOUNT_NUMBER')?.setting_value || '0123456789'}</strong></p>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Amount: <strong style={{ color: 'var(--text-primary)' }}>₦{course.price.toLocaleString()}</strong></p>
                        </div>

                        <div>
                          <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>{platformSettings.find(s => s.setting_key === 'PAYMENT_INSTRUCTIONS')?.setting_value || 'After transferring the funds, upload your receipt here:'}</p>
                          <Button variant="outline" fullWidth style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }} onClick={handleSimulatePaymentUpload} isLoading={enrollLoading}>
                            <Upload size={16} /> Upload Receipt
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </motion.div>
        </div>

        {/* Right Column: Enrollment Card (Sticky) */}
        <div>
          <Card style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>
                {isFree ? 'Free' : `₦${course.price.toLocaleString()}`}
              </div>
              
              {isEnrolled ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                    <span>Your Progress</span>
                    <span>{enrollment.progress_percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${enrollment.progress_percentage}%`, backgroundColor: 'var(--color-blue)' }} />
                  </div>
                  <Button fullWidth onClick={() => onNavigate(`courses/${course.id}/learn`)} style={{ marginTop: 'var(--space-2)' }}>
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <Button fullWidth onClick={() => { setActiveTab('enrollment'); window.scrollTo({ top: 300, behavior: 'smooth' }); }}>
                  {isFree ? 'Enroll Now' : 'Pay & Enroll'}
                </Button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <h4 style={{ fontWeight: 'var(--weight-bold)' }}>This course includes:</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <FileText size={16} /> {lessons.length} lessons
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <HelpCircle size={16} /> Interactive quizzes
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <Trophy size={16} /> Certificate of completion
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
