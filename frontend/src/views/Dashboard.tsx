import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OnboardingFlow } from '../components/student/OnboardingFlow';
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
import { PaymentStatusWidget } from '../components/dashboard/widgets/PaymentStatusWidget';
import { QuickActionsWidget } from '../components/dashboard/widgets/QuickActionsWidget';
import { RecentActivityWidget } from '../components/dashboard/widgets/RecentActivityWidget';
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
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [
          profileData,
          progressData,
          coursesData,
          liveClassesData,
          statsData,
          submissionsData,
          quizzesData,
          certsData,
          paymentsData
        ] = await Promise.all([
          apiClient.auth.getProfile().catch(() => null),
          apiClient.courses.getProgress().catch(() => []),
          apiClient.courses.getCourses().catch(() => []),
          apiClient.courses.getUpcomingClasses(5).catch(() => []),
          apiClient.courses.getGamificationStats().catch(() => null),
          apiClient.courses.getSubmissions().catch(() => []),
          apiClient.courses.getQuizAttempts().catch(() => []), // my-attempts
          apiClient.certificates.getUserCertificates().catch(() => []),
          apiClient.payments.getMyPayments('wd101').catch(() => []) // Defaulting to wd101 for now
        ]);
        
        let latestAnn = null;
        try {
          latestAnn = await apiClient.announcements.getLatest();
        } catch { }

        if (profileData && statsData) {
          profileData.streak_count = statsData.streak_count;
        }

        setProfile(profileData);
        setCompletedCount(progressData.length);
        setAllCourses(coursesData);
        // Check if student dashboard has completed onboarding
        try {
          const dashRes = await fetch(`${import.meta.env.VITE_API_URL}/api/student/dashboard`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          if (dashRes.ok) {
            const dashData = await dashRes.json();
            if (dashData.has_completed_onboarding === false) {
              setShowOnboarding(true);
            }
          }
        } catch (e) {
          console.error("Dashboard api error", e);
        }

        setLiveClasses(liveClassesData);
        setStats(statsData);
        setAssignments(submissionsData);
        setQuizAttempts(quizzesData);
        setCertificates(certsData);
        setPayments(paymentsData);
        setAnnouncement(latestAnn);
        
        setEnrollment({ status: 'active', batch: 1 });

      } catch (err: any) {
        console.error('Dashboard fetch error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

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
  
  const mockDeadlines = [
    { label: 'Module 1 Quiz', course: 'WD101', due: 'Friday', icon: '📝', color: '#F59E0B' }
  ];

  const recommendation = {
    title: 'Keep up the momentum!',
    description: 'You are 2 lessons away from completing Module 1.',
    actionLabel: 'Resume WD101',
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
        <motion.div variants={itemVariants} style={{ gridColumn: 'span 2' }}>
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
        
        <motion.div variants={itemVariants} style={{ gridColumn: 'span 1' }}>
          {loading ? (
             <Skeleton height={140} borderRadius="var(--radius-lg)" />
          ) : (
             <QuickActionsWidget onAction={(action) => onNavigate(action === 'courses' ? 'courses' : 'dashboard')} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', gridColumn: 'span 3' }}>
          
          <Grid columns={{ sm: 1, md: 2, lg: 2 }} gap="lg">
            <motion.div variants={itemVariants}>
              {loading ? (
                <Skeleton height={200} borderRadius="var(--radius-lg)" />
              ) : (
                <ContinueLearningWidget 
                  courseName="WD101: Web Development Basics"
                  lessonName="Introduction to HTML"
                  progressPercent={progressPercent}
                  completedLessons={completedCount}
                  totalLessons={totalLessons}
                  onResume={() => onNavigate('courses/wd101/learn')}
                  isWaitlisted={enrollment?.status === 'waitlisted'}
                />
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
                <PaymentStatusWidget 
                  payments={payments}
                  onUploadReceipt={() => {}}
                />
              )}
            </motion.div>
          </Grid>
          
          <motion.div variants={itemVariants}>
            {loading ? (
              <Skeleton height={200} borderRadius="var(--radius-lg)" />
            ) : (
              <MyCoursesWidget 
                courses={allCourses.filter(c => c.id !== 'wd101')}
                onCourseSelect={(id) => onNavigate(`courses/${id}/learn`)}
                onBrowseCourses={() => onNavigate('courses')}
              />
            )}
          </motion.div>
        </div>

        {/* Right Rail (Spans 1 column) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', gridColumn: 'span 1' }}>
          
          <motion.div variants={itemVariants}>
            {loading ? (
              <Skeleton height={180} borderRadius="var(--radius-lg)" />
            ) : (
              <DeadlinesWidget deadlines={mockDeadlines} />
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
              <Skeleton height={200} borderRadius="var(--radius-lg)" />
            ) : (
              <RecentActivityWidget activities={[]} />
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
