import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OnboardingFlow, isTourDoneLocally } from '../components/student/OnboardingFlow';
import apiClient from '../apiClient';
import { Grid } from '../components/ui/Grid';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

import { WelcomeWidget } from '../components/dashboard/widgets/WelcomeWidget';
import { ContinueLearningWidget } from '../components/dashboard/widgets/ContinueLearningWidget';
import { MyCoursesWidget } from '../components/dashboard/widgets/MyCoursesWidget';
import { UpcomingClassesWidget } from '../components/dashboard/widgets/UpcomingClassesWidget';
import { RecentAnnouncementsWidget } from '../components/dashboard/widgets/RecentAnnouncementsWidget';
import { AITutorWidget } from '../components/dashboard/widgets/AITutorWidget';
import { DeadlinesWidget } from '../components/dashboard/widgets/DeadlinesWidget';

// Volume 2 New Widgets
import { LearningProgressWidget } from '../components/dashboard/widgets/LearningProgressWidget';
import { AssignmentsWidget } from '../components/dashboard/widgets/AssignmentsWidget';
import { QuizzesWidget } from '../components/dashboard/widgets/QuizzesWidget';
import { CertificatesWidget } from '../components/dashboard/widgets/CertificatesWidget';
import { InvoicePaymentWidget } from '../components/dashboard/widgets/InvoicePaymentWidget';
import { QuickActionsWidget } from '../components/dashboard/widgets/QuickActionsWidget';
import { PersonalizedRecommendationsWidget } from '../components/dashboard/widgets/PersonalizedRecommendationsWidget';

interface DashboardProps {
  session: any;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ session, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  
  // Volume 2 Data States
  const [stats, setStats] = useState<any>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const cacheKey = `dashboard_data_${session?.user?.id || 'anon'}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      // 1. Instant load from cache if available
      if (cached) {
        try {
          const data = JSON.parse(cached);
          setProfile(data.profile);
          setCompletedCount(data.completedCount);
          setAllCourses(data.allCourses);
          setLiveClasses(data.liveClasses);
          setStats(data.stats);
          setAssignments(data.assignments);
          setQuizAttempts(data.quizAttempts);
          setCertificates(data.certificates);
          setAnnouncement(data.announcement);
          setEnrollment(data.enrollment);
          setShowOnboarding(data.showOnboarding);
          setLoading(false); // Instant UI render
        } catch (e) {
          console.error("Cache read error", e);
        }
      } else {
        setLoading(true);
      }

      // 2. Fetch fresh data in background
      try {
        setError(null);
        
        const [
          profileData,
          progressData,
          coursesData,
          liveClassesData,
          statsData,
          submissionsData,
          quizzesData,
          certsData
        ] = await Promise.all([
          apiClient.auth.getProfile().catch(() => null),
          apiClient.courses.getProgress().catch(() => []),
          apiClient.courses.getCourses().catch(() => []),
          apiClient.courses.getUpcomingClasses(5).catch(() => []),
          apiClient.courses.getGamificationStats().catch(() => null),
          apiClient.courses.getSubmissions().catch(() => []),
          apiClient.courses.getQuizAttempts().catch(() => []), 
          apiClient.certificates.getUserCertificates().catch(() => [])
        ]);
        
        let latestAnn = null;
        try { latestAnn = await apiClient.announcements.getLatest(); } catch { }

        if (profileData && statsData) {
          profileData.streak_count = statsData.streak_count;
        }

        let dashData = null;
        let shouldShowOnboarding = false;
        try {
          dashData = await apiClient.student.getDashboard();
          if (dashData && dashData.has_completed_onboarding === false && !isTourDoneLocally()) {
            shouldShowOnboarding = true;
          }
        } catch (e) {
          console.error("Dashboard api error", e);
        }

        const enrolledIds = dashData?.enrolled_course_ids || [];
        const newEnrollment = enrolledIds.length > 0 ? { status: 'active', enrolledIds, nextLesson: dashData?.next_recommended_lesson } : null;

        // Build the fresh data object
        const freshData = {
          profile: profileData,
          completedCount: progressData.length,
          allCourses: coursesData,
          liveClasses: liveClassesData,
          stats: statsData,
          assignments: submissionsData,
          quizAttempts: quizzesData,
          certificates: certsData,
          announcement: latestAnn,
          enrollment: newEnrollment,
          showOnboarding: shouldShowOnboarding
        };

        // Update state with fresh data
        setProfile(freshData.profile);
        setCompletedCount(freshData.completedCount);
        setAllCourses(freshData.allCourses);
        setLiveClasses(freshData.liveClasses);
        setStats(freshData.stats);
        setAssignments(freshData.assignments);
        setQuizAttempts(freshData.quizAttempts);
        setCertificates(freshData.certificates);
        setAnnouncement(freshData.announcement);
        setEnrollment(freshData.enrollment);
        setShowOnboarding(freshData.showOnboarding);

        // Update cache
        sessionStorage.setItem(cacheKey, JSON.stringify(freshData));

      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session?.user?.id]);

  const handleRetry = () => {
    window.location.reload(); 
  };

  if (error) {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <ErrorState onRetry={handleRetry} message="Failed to load your dashboard data." />
      </div>
    );
  }

  const totalLessons = 12;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);
  
  const activeDeadlines = assignments.filter(a => a.due_date && new Date(a.due_date) > new Date()).map(a => ({
    label: a.assignment_title || 'Pending Assignment',
    course: 'CodeMe',
    due: new Date(a.due_date).toLocaleDateString(),
  }));

  const recommendation = activeDeadlines.length > 0 ? {
    title: 'Upcoming Deadline',
    description: `You have an assignment due soon: ${activeDeadlines[0].label}`,
    actionLabel: 'Go to Assignments',
    actionId: 'assignments'
  } : {
    title: 'Keep up the momentum!',
    description: 'You are doing great. Continue your learning journey.',
    actionLabel: 'Resume Learning',
    actionId: 'resume'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show"
      style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}
    >
      {/* Top Row: Welcome & Quick Actions */}
      {showOnboarding && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}
      <Grid columns={{ sm: 1, md: 1, lg: 3 }} gap="lg">
        <motion.div variants={itemVariants} className="dash-col-welcome">
          {loading ? (
            <Skeleton height={140} borderRadius="var(--radius-lg)" />
          ) : (
            <WelcomeWidget
              fullName={profile?.full_name}
              studentId={profile?.student_id}
              batchName={enrollment?.status === 'waitlisted' ? 'Waitlisted' : `Batch ${enrollment?.batch || 1}`}
              avatarUrl={profile?.avatar_url}
            />
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="dash-col-side">
          {loading ? (
             <Skeleton height={140} borderRadius="var(--radius-lg)" />
          ) : (
             <QuickActionsWidget onAction={(action) => {
               if (action === 'ai_tutor') onNavigate('support');
               else if (['courses', 'resume', 'assignments'].includes(action)) onNavigate('courses');
               else onNavigate('dashboard');
             }} />
          )}
        </motion.div>
      </Grid>
      
      {/* Announcement Alert */}
      {!loading && announcement && (
        <motion.div variants={itemVariants}>
          <RecentAnnouncementsWidget announcement={announcement} />
        </motion.div>
      )}

      {/* Main Dashboard Layout (Premium Desktop Layout) */}
      <Grid columns={{ sm: 1, md: 2, lg: 4 }} gap="lg">
        
        {/* Main Content Area (Spans 3 columns on large desktop) */}
        <div className="dash-col-main" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {!enrollment && !loading ? (
            <motion.div variants={itemVariants}>
              <div style={{
                padding: 'var(--space-8)',
                background: 'var(--surface-color)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: 'var(--space-2)' }}>Welcome to CodeMe Academy!</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  You currently don't have access to any active courses. If you recently registered, please wait for an admin to grant you access or assign you to a batch.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => onNavigate('courses')}
                >
                  Browse Available Courses
                </button>
              </div>
            </motion.div>
          ) : (
            <Grid columns={{ sm: 1, md: 2, lg: 2 }} gap="lg">
              <motion.div variants={itemVariants}>
                {loading ? (
                  <Skeleton height={200} borderRadius="var(--radius-lg)" />
                ) : enrollment?.nextLesson ? (
                  <ContinueLearningWidget 
                    courseName={enrollment.nextLesson.course}
                    lessonName={enrollment.nextLesson.title}
                    progressPercent={progressPercent}
                    completedLessons={completedCount}
                    totalLessons={totalLessons}
                    onResume={() => onNavigate(`courses/${enrollment.nextLesson.course_id}/learn`)}
                    isWaitlisted={enrollment?.status === 'waitlisted'}
                  />
                ) : (
                  <div style={{
                    padding: 'var(--space-6)',
                    background: 'var(--surface-color)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    You're all caught up! Browse your courses to find more lessons.
                  </div>
                )}
              </motion.div>
              
              <motion.div variants={itemVariants}>
                {loading ? (
                  <Skeleton height={200} borderRadius="var(--radius-lg)" />
                ) : (
                  <LearningProgressWidget stats={stats} />
                )}
              </motion.div>
            </Grid>
          )}

          {!loading && <PersonalizedRecommendationsWidget recommendation={recommendation} onAction={() => onNavigate('course')} />}

          <Grid columns={{ sm: 1, md: 2, lg: 2 }} gap="lg">
            <motion.div variants={itemVariants}>
              {loading ? (
                <Skeleton height={250} borderRadius="var(--radius-lg)" />
              ) : (
                <AssignmentsWidget 
                  assignments={assignments}
                  onViewAssignments={() => {}}
                />
              )}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              {loading ? (
                <Skeleton height={250} borderRadius="var(--radius-lg)" />
              ) : (
                <QuizzesWidget 
                  attempts={quizAttempts}
                  onViewQuizzes={() => {}}
                />
              )}
            </motion.div>
          </Grid>

          <Grid columns={{ sm: 1, md: 2, lg: 2 }} gap="lg">
             <motion.div variants={itemVariants}>
              {loading ? (
                <Skeleton height={200} borderRadius="var(--radius-lg)" />
              ) : (
                <CertificatesWidget 
                  certificates={certificates}
                  onViewCertificates={() => {}}
                />
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              {loading ? (
                <Skeleton height={200} borderRadius="var(--radius-lg)" />
              ) : (
                <InvoicePaymentWidget />
              )}
            </motion.div>
          </Grid>
          
          <motion.div variants={itemVariants}>
            {loading ? (
              <Skeleton height={200} borderRadius="var(--radius-lg)" />
            ) : enrollment ? (
              <MyCoursesWidget 
                courses={allCourses.filter(c => enrollment.enrolledIds.includes(c.id))}
                onCourseSelect={(id) => onNavigate(`courses/${id}/learn`)}
                onBrowseCourses={() => onNavigate('courses')}
              />
            ) : null}
          </motion.div>
        </div>

        {/* Right Rail (Spans 1 column) */}
        <div className="dash-col-side" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          <motion.div variants={itemVariants}>
            {loading ? (
              <Skeleton height={180} borderRadius="var(--radius-lg)" />
            ) : (
              <DeadlinesWidget deadlines={activeDeadlines} />
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            {loading ? (
              <Skeleton height={250} borderRadius="var(--radius-lg)" />
            ) : (
              <UpcomingClassesWidget 
                classes={liveClasses}
                onViewAll={() => onNavigate('live-classes')}
              />
            )}
          </motion.div>

          <motion.div variants={itemVariants}>
            {loading ? (
              <Skeleton height={150} borderRadius="var(--radius-lg)" />
            ) : (
              <AITutorWidget />
            )}
          </motion.div>

        </div>
      </Grid>
      
      {/* Mobile Padding for BottomNav */}
      <div className="visible-mobile" style={{ height: '60px' }} />
    </motion.div>
  );
};
