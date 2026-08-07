import { Routes, Route } from 'react-router-dom';
import { AuthGuard } from './AuthGuard';
import { RoleGuard } from './RoleGuard';

// Placeholder imports for views we haven't migrated yet but need in the route tree
// We will lazy load them in App.tsx or directly here. For now we use the ones from App.tsx
import { lazy, Suspense } from 'react';
import { LoadingLayout } from '../components/layout/LoadingLayout';
import { ErrorLayout } from '../components/layout/ErrorLayout';
import { AppShell } from '../components/layout/AppShell';

const LandingView = lazy(() => import('../views/LandingView').then(m => ({ default: m.LandingView })));
const AuthScreen = lazy(() => import('../views/AuthScreen').then(m => ({ default: m.AuthScreen })));
const Onboarding = lazy(() => import('../views/Onboarding').then(m => ({ default: m.Onboarding })));
const Dashboard = lazy(() => import('../views/Dashboard').then(m => ({ default: m.Dashboard })));
const StudentAnalyticsDashboard = lazy(() => import('../views/analytics/StudentAnalyticsDashboard').then(m => ({ default: m.StudentAnalyticsDashboard })));
const TeacherAnalyticsDashboard = lazy(() => import('../views/analytics/TeacherAnalyticsDashboard').then(m => ({ default: m.TeacherAnalyticsDashboard })));
const AdminAnalyticsDashboard = lazy(() => import('../views/analytics/AdminAnalyticsDashboard').then(m => ({ default: m.AdminAnalyticsDashboard })));
const CourseCatalogView = lazy(() => import('../views/CourseCatalogView').then(m => ({ default: m.CourseCatalogView })));
const CourseDetailView = lazy(() => import('../views/CourseDetailView').then(m => ({ default: m.CourseDetailView })));
const CourseView = lazy(() => import('../views/CourseView').then(m => ({ default: m.CourseView })));
const LessonView = lazy(() => import('../views/LessonView').then(m => ({ default: m.LessonView })));
const QuizView = lazy(() => import('../views/QuizView').then(m => ({ default: m.QuizView })));
const AssignmentView = lazy(() => import('../views/AssignmentView').then(m => ({ default: m.AssignmentView })));
const AcademicRecordView = lazy(() => import('../views/AcademicRecordView').then(m => ({ default: m.AcademicRecordView })));
const TranscriptView = lazy(() => import('../views/TranscriptView').then(m => ({ default: m.TranscriptView })));
const CertificateView = lazy(() => import('../views/CertificateView').then(m => ({ default: m.CertificateView })));
const VerifyCertificateView = lazy(() => import('../views/VerifyCertificateView').then(m => ({ default: m.VerifyCertificateView })));
const CommunicationInboxView = lazy(() => import('../views/CommunicationInboxView').then(m => ({ default: m.CommunicationInboxView })));
const AcademicCalendarView = lazy(() => import('../views/AcademicCalendarView').then(m => ({ default: m.AcademicCalendarView })));
const SupportTicketView = lazy(() => import('../views/SupportTicketView').then(m => ({ default: m.SupportTicketView })));
const ForumView = lazy(() => import('../views/ForumView').then(m => ({ default: m.ForumView })));
const AdminPortal = lazy(() => import('../views/AdminPortal').then(m => ({ default: m.AdminPortal })));
const TeacherDashboard = lazy(() => import('../views/TeacherDashboard').then(m => ({ default: m.TeacherDashboard })));
const TeacherGradingView = lazy(() => import('../views/TeacherGradingView').then(m => ({ default: m.TeacherGradingView })));
const DesignSystemView = lazy(() => import('../views/DesignSystemView').then(m => ({ default: m.DesignSystemView })));
const LayoutPreviewView = lazy(() => import('../views/LayoutPreviewView').then(m => ({ default: m.LayoutPreviewView })));
const ResetPasswordView = lazy(() => import('../views/ResetPasswordView').then(m => ({ default: m.ResetPasswordView })));
const MyBookmarks = lazy(() => import('../views/MyBookmarks').then(m => ({ default: m.MyBookmarks })));

// Layout Wrapper to inject AppShell for authenticated routes
import { useAuth } from '../contexts/AuthContext';
const AuthLayout = () => {
  const { profile } = useAuth();
  
  // Provide sensible defaults for the layout wrapper
  const streakCount = profile?.streak_count || 1;
  const unreadNotifications = 0; // Realtime integration will be handled in a later volume

  return (
    <AppShell 
      userRole={profile?.role || 'student'} 
      userName={profile?.full_name || 'User'}
      streakCount={streakCount}
      unreadNotifications={unreadNotifications}
    >
      <Suspense fallback={<LoadingLayout message="Loading page..." />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
};
import { Outlet, useNavigate, useParams } from 'react-router-dom';

export const AppRouter = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  // Mock handlers to satisfy legacy view props
  const handleNavigate = (view: string) => navigate(`/${view}`);
  const handleSignOut = () => {};

  // Wrapper components to extract params
  const CourseDetailWrapper = () => {
    const { courseId } = useParams();
    return <CourseDetailView session={session} courseId={courseId || 'wd101'} onNavigate={handleNavigate} />;
  };

  const CourseLearnWrapper = () => {
    const { courseId } = useParams();
    return <CourseView session={session} selectedCourseId={courseId || 'wd101'} onNavigate={handleNavigate} />;
  };

  const LessonWrapper = () => {
    const { lessonId } = useParams();
    return <LessonView session={session} lessonId={lessonId || ''} onNavigate={handleNavigate} />;
  };

  const QuizWrapper = () => {
    const { quizId } = useParams();
    return <QuizView session={session} quizId={quizId || ''} onNavigate={handleNavigate} />;
  };

  const AssignmentWrapper = () => {
    const { assignmentId } = useParams();
    return <AssignmentView session={session} assignmentId={assignmentId || ''} onNavigate={handleNavigate} />;
  };
  return (
    <Suspense fallback={<LoadingLayout message="Starting CodeMe Academy..." />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingView onNavigateToAuth={() => handleNavigate('auth')} />} />
        <Route path="/auth" element={<AuthScreen onAuthSuccess={() => {}} />} />
        <Route path="/reset-password" element={<ResetPasswordView />} />
        <Route path="/verify-certificate" element={<VerifyCertificateView />} />
        <Route path="/design-system" element={<DesignSystemView />} />
        <Route path="/layout-preview" element={<LayoutPreviewView />} />

        {/* Semi-protected / Auth related */}
        <Route path="/onboarding" element={<Onboarding session={session} onComplete={() => handleNavigate('dashboard')} />} />
        <Route path="/unverified" element={
          <ErrorLayout title="Email Not Verified" message="Please check your inbox to verify your email address before continuing." />
        } />

        {/* Authenticated Workspace Routes */}
        <Route element={<AuthGuard />}>
          <Route element={<AuthLayout />}>
            
            {/* Student Routes */}
            <Route element={<RoleGuard allowedRoles={['student']} />}>
              <Route path="/dashboard" element={<Dashboard session={session} onNavigate={handleNavigate} onSignOut={handleSignOut} />} />
              <Route path="/analytics/student" element={<StudentAnalyticsDashboard />} />
              <Route path="/courses" element={<CourseCatalogView session={session} onNavigate={handleNavigate} />} />
              <Route path="/courses/:courseId" element={<CourseDetailWrapper />} />
              <Route path="/courses/:courseId/learn" element={<CourseLearnWrapper />} />
              <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonWrapper />} />
              <Route path="/courses/:courseId/quizzes/:quizId" element={<QuizWrapper />} />
              <Route path="/courses/:courseId/assignments/:assignmentId" element={<AssignmentWrapper />} />
              <Route path="/academic-record" element={<AcademicRecordView session={session} onNavigate={handleNavigate} />} />
              <Route path="/transcript" element={<TranscriptView session={session} />} />
              <Route path="/inbox" element={<CommunicationInboxView session={session} />} />
              <Route path="/bookmarks" element={<MyBookmarks />} />
              <Route path="/calendar" element={<AcademicCalendarView session={session} />} />
              <Route path="/support" element={<SupportTicketView session={session} />} />
              <Route path="/courses/:courseId/certificate" element={<CertificateView session={session} onNavigate={handleNavigate} />} />
              <Route path="/forums" element={<ForumView session={session} onNavigate={handleNavigate} />} />
            </Route>

            {/* Teacher Routes */}
            <Route element={<RoleGuard allowedRoles={['teacher']} />}>
              <Route path="/teacher-panel" element={<TeacherDashboard session={session} onNavigate={handleNavigate} />} />
              <Route path="/analytics/teacher" element={<TeacherAnalyticsDashboard />} />
              <Route path="/teacher-panel/grading" element={<TeacherGradingView session={session} onNavigate={handleNavigate} />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminPortal session={session} onSignOut={handleSignOut} />} />
              <Route path="/analytics/admin" element={<AdminAnalyticsDashboard />} />
              {/* Other admin routes would go here */}
            </Route>
            
          </Route>
        </Route>

        {/* Error Routes */}
        <Route path="/403" element={
          <ErrorLayout 
            title="403 Forbidden" 
            message="You don't have permission to access this page." 
            onRetry={() => window.history.back()} 
          />
        } />
        <Route path="*" element={
          <ErrorLayout 
            title="404 Not Found" 
            message="We couldn't find the page you're looking for." 
            onRetry={() => window.history.back()} 
          />
        } />
      </Routes>
    </Suspense>
  );
};
