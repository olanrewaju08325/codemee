// API Client for FastAPI Backend
// This replaces direct Supabase data calls with backend API calls
import { supabase } from './supabaseClient';

// In production (Vercel), prepend the Render backend URL.
// In development, Vite's proxy handles /api → localhost:8000, so we use '' (empty).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Get the current Supabase session token
async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Generic authenticated fetch wrapper
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (options.headers) {
    const mergedHeaders = new Headers(options.headers);
    mergedHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Prepend the backend base URL so production calls go to Render, not Vercel
  const fullUrl = `${API_BASE_URL}${url}`;
  return fetch(fullUrl, {
    ...options,
    headers,
  });

}

// Auth & Profile API
export const authAPI = {
  getProfile: async () => {
    const response = await authenticatedFetch('/api/profile/me');
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend Profile Error:', response.status, errorText);
      throw new Error(`Failed to fetch profile: ${errorText}`);
    }
    return response.json();
  },
  
  updateProfile: async (data: { full_name?: string; avatar_url?: string }) => {
    const response = await authenticatedFetch('/api/profile/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },
  
  updateStreak: async () => {
    const response = await authenticatedFetch('/api/profile/update-streak', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to update streak');
    return response.json();
  },
  
  getUnreadCount: async () => {
    const response = await authenticatedFetch('/api/notifications/unread-count');
    if (!response.ok) throw new Error('Failed to fetch unread count');
    return response.json();
  },
  
  getNotifications: async (limit = 50) => {
    const response = await authenticatedFetch(`/api/notifications?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return response.json();
  },
  
  markNotificationsRead: async () => {
    const response = await authenticatedFetch('/api/notifications/mark-read', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark notifications as read');
    return response.json();
  },
  
  getCertificateStatus: async (courseId = 'wd101') => {
    const response = await authenticatedFetch(`/api/profile/certificate-status?course_id=${courseId}`);
    if (!response.ok) throw new Error('Failed to fetch certificate status');
    return response.json();
  },
};

// Enrollment API
export const enrollmentAPI = {
  autoEnroll: async (courseId = 'wd101') => {
    const response = await authenticatedFetch('/api/enrollment/auto-enroll', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
    if (!response.ok) throw new Error('Failed to auto-enroll');
    return response.json();
  },
};

// Courses API
export const coursesAPI = {
  getCourses: async () => {
    const response = await authenticatedFetch('/api/courses');
    if (!response.ok) throw new Error('Failed to fetch courses');
    return response.json();
  },
  
  getCourseModules: async (courseId: string) => {
    const response = await authenticatedFetch(`/api/courses/${courseId}/modules`);
    if (!response.ok) throw new Error('Failed to fetch modules');
    return response.json();
  },
  
  getModuleLessons: async (moduleId: string) => {
    const response = await authenticatedFetch(`/api/modules/${moduleId}/lessons`);
    if (!response.ok) throw new Error('Failed to fetch lessons');
    return response.json();
  },

  getModule: async (moduleId: string) => {
    const response = await authenticatedFetch(`/api/modules/${moduleId}`);
    if (!response.ok) throw new Error('Failed to fetch module');
    return response.json();
  },

  getModuleQuizzes: async (moduleId: string) => {
    const response = await authenticatedFetch(`/api/modules/${moduleId}/quizzes`);
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  },

  getModuleAssignments: async (moduleId: string) => {
    const response = await authenticatedFetch(`/api/modules/${moduleId}/assignments`);
    if (!response.ok) throw new Error('Failed to fetch assignments');
    return response.json();
  },

  getAssignmentSubmissions: async () => {
    const response = await authenticatedFetch('/api/assignments/submissions');
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },

  getQuizAttempts: async (quizId?: string) => {
    const url = quizId ? `/api/quizzes/${quizId}/attempts` : '/api/quizzes/my-attempts';
    const response = await authenticatedFetch(url);
    if (!response.ok) throw new Error('Failed to fetch quiz attempts');
    return response.json();
  },

  getQuiz: async (quizId: string) => {
    const response = await authenticatedFetch(`/api/quizzes/${quizId}`);
    if (!response.ok) throw new Error('Failed to fetch quiz');
    return response.json();
  },

  startQuiz: async (quizId: string) => {
    const response = await authenticatedFetch(`/api/quizzes/${quizId}/start`, { method: 'POST' });
    if (!response.ok) throw new Error('Unable to start assessment');
    return response.json();
  },

  submitQuiz: async (quizId: string, data: { answers: Record<string, string> }) => {
    const response = await authenticatedFetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to submit quiz');
    return response.json();
  },
  
  getLesson: async (lessonId: string) => {
    const response = await authenticatedFetch(`/api/lessons/${lessonId}`);
    if (!response.ok) throw new Error('Failed to fetch lesson');
    return response.json();
  },
  
  getProgress: async () => {
    const response = await authenticatedFetch('/api/progress');
    if (!response.ok) throw new Error('Failed to fetch progress');
    return response.json();
  },
  
  markLessonComplete: async (lessonId: string) => {
    const response = await authenticatedFetch(`/api/progress/${lessonId}/complete`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to mark lesson complete');
    return response.json();
  },
  
  getSubmissions: async () => {
    const response = await authenticatedFetch('/api/assignments/submissions');
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return response.json();
  },
  
  getAssignmentForSubmit: async (assignmentId: string) => {
    const response = await authenticatedFetch(`/api/assignments/${assignmentId}/submit`);
    if (!response.ok) throw new Error('Failed to fetch assignment');
    return response.json();
  },
  
  submitAssignment: async (assignmentId: string, data: { submission_text?: string | null; submission_file?: string | null }) => {
    const response = await authenticatedFetch(`/api/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to submit assignment');
    return response.json();
  },
  
  getLiveClasses: async (activeOnly = true) => {
    const response = await authenticatedFetch(`/api/live-classes?active_only=${activeOnly}`);
    if (!response.ok) throw new Error('Failed to fetch live classes');
    return response.json();
  },
  
  getUpcomingClasses: async (limit = 10) => {
    const response = await authenticatedFetch(`/api/live-classes/upcoming?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch upcoming classes');
    return response.json();
  },
  
  getGamificationStats: async () => {
    const response = await authenticatedFetch('/api/gamification/stats');
    if (!response.ok) throw new Error('Failed to fetch gamification stats');
    return response.json();
  },
  
  getUserAchievements: async () => {
    const response = await authenticatedFetch('/api/gamification/achievements');
    if (!response.ok) throw new Error('Failed to fetch achievements');
    return response.json();
  },
  
  getBadges: async () => {
    const response = await authenticatedFetch('/api/gamification/badges');
    if (!response.ok) throw new Error('Failed to fetch badges');
    return response.json();
  },
};

export const adminCourseAPI = {
  list: async () => {
    const response = await authenticatedFetch('/api/admin/courses/');
    if (!response.ok) throw new Error('Unable to load courses');
    return response.json();
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await authenticatedFetch(`/api/courses/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    if (!response.ok) throw new Error(await response.text() || 'Unable to save course');
    return response.json();
  },
};

// Quizzes API
export const quizzesAPI = {
  getModuleQuizzes: async (moduleId: string) => {
    const response = await authenticatedFetch(`/api/modules/${moduleId}/quizzes`);
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  },
  
  getQuiz: async (quizId: string) => {
    const response = await authenticatedFetch(`/api/quizzes/${quizId}`);
    if (!response.ok) throw new Error('Failed to fetch quiz');
    return response.json();
  },
  
  getQuizAttempts: async (quizId: string) => {
    const response = await authenticatedFetch(`/api/quizzes/${quizId}/attempts`);
    if (!response.ok) throw new Error('Failed to fetch quiz attempts');
    return response.json();
  },

  startQuiz: async (quizId: string) => {
    const response = await authenticatedFetch(`/api/quizzes/${quizId}/start`, { method: 'POST' });
    if (!response.ok) throw new Error('Unable to start assessment');
    return response.json();
  },
  
  submitQuiz: async (quizId: string, answers: Record<string, string>) => {
    const response = await authenticatedFetch(`/api/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
    if (!response.ok) throw new Error('Failed to submit quiz');
    return response.json();
  },
};

// Certificates API
export const certificatesAPI = {
  getCertificates: async () => {
    const response = await authenticatedFetch('/api/certificates');
    if (!response.ok) throw new Error('Failed to fetch certificates');
    return response.json();
  },

  getUserCertificates: async () => {
    const response = await authenticatedFetch('/api/certificates');
    if (!response.ok) throw new Error('Failed to fetch certificates');
    return response.json();
  },
  
  checkEligibility: async (courseId = 'wd101') => {
    const response = await authenticatedFetch(`/api/certificates/check-eligibility?course_id=${courseId}`);
    if (!response.ok) throw new Error('Failed to check eligibility');
    return response.json();
  },
  
  issueCertificate: async (courseId: string) => {
    const response = await authenticatedFetch('/api/certificates/issue', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    });
    if (!response.ok) throw new Error('Failed to issue certificate');
    return response.json();
  },
};

// Forum API
export const forumAPI = {
  getPosts: async (courseId?: string) => {
    const url = courseId ? `/api/forum/posts?course_id=${courseId}` : '/api/forum/posts';
    const response = await authenticatedFetch(url);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },
  
  getPost: async (postId: string) => {
    const response = await authenticatedFetch(`/api/forum/posts/${postId}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },
  
  createPost: async (data: { course_id: string; content: string }) => {
    const response = await authenticatedFetch('/api/forum/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },
  
  updatePost: async (postId: string, data: { content?: string; is_pinned?: boolean }) => {
    const response = await authenticatedFetch(`/api/forum/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update post');
    return response.json();
  },
  
  deletePost: async (postId: string) => {
    const response = await authenticatedFetch(`/api/forum/posts/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return response.json();
  },
  
  getReplies: async (postId: string) => {
    const response = await authenticatedFetch(`/api/forum/posts/${postId}/replies`);
    if (!response.ok) throw new Error('Failed to fetch replies');
    return response.json();
  },

  getPostReplies: async (postId: string) => {
    return forumAPI.getReplies(postId);
  },
  
  createReply: async (postId: string, data: { content: string }) => {
    const response = await authenticatedFetch(`/api/forum/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create reply');
    return response.json();
  },
  
  updateReply: async (replyId: string, data: { content: string }) => {
    const response = await authenticatedFetch(`/api/forum/replies/${replyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update reply');
    return response.json();
  },
  
  deleteReply: async (replyId: string) => {
    const response = await authenticatedFetch(`/api/forum/replies/${replyId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete reply');
    return response.json();
  },
};

// Admin API
export const adminAPI = {
  getEnrollmentApplications: async () => {
    const response = await authenticatedFetch('/api/admin/enrollment-applications');
    if (!response.ok) throw new Error('Failed to fetch enrollment applications');
    return response.json();
  },
  
  updateApplicationStatus: async (applicationId: string, data: { status: string; feedback?: string }) => {
    const response = await authenticatedFetch(`/api/admin/enrollment-applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update application status');
    return response.json();
  },

  updateEnrollmentApplication: async (applicationId: string, data: { status: string; feedback?: string }) => {
    return adminAPI.updateApplicationStatus(applicationId, data);
  },
  
  getWaitlist: async () => {
    const response = await authenticatedFetch('/api/admin/waitlist');
    if (!response.ok) throw new Error('Failed to fetch waitlist');
    return response.json();
  },

  getCourseCapacities: async () => {
    const response = await authenticatedFetch('/api/admin/course-capacities');
    if (!response.ok) throw new Error('Failed to fetch course capacities');
    return response.json();
  },
  
  promoteStudent: async (enrollmentId: string, targetBatch: number) => {
    const response = await authenticatedFetch(`/api/admin/waitlist/${enrollmentId}/promote`, {
      method: 'POST',
      body: JSON.stringify({ target_batch: targetBatch }),
    });
    if (!response.ok) throw new Error('Failed to promote student');
    return response.json();
  },
  
  updateBatchCapacity: async (maxBatchSize: number) => {
    const response = await authenticatedFetch('/api/admin/settings/batch-capacity', {
      method: 'PATCH',
      body: JSON.stringify({ max_batch_size: maxBatchSize }),
    });
    if (!response.ok) throw new Error('Failed to update batch capacity');
    return response.json();
  },
  
  createStudentAccount: async (data: { email: string; password: string; full_name: string; course_id?: string; user_id?: string }) => {
    const response = await authenticatedFetch('/api/admin/create-student-account', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create student account');
    return response.json();
  },
  
  createNotification: async (data: { user_id: string; title: string; message: string }) => {
    const response = await authenticatedFetch('/api/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create notification');
    return response.json();
  },
  
  getAllNotifications: async () => {
    const response = await authenticatedFetch('/api/admin/notifications');
    if (!response.ok) throw new Error('Failed to fetch all notifications');
    return response.json();
  },

  getPendingPayments: async () => {
    const response = await authenticatedFetch('/api/admin/payments/pending');
    if (!response.ok) throw new Error('Failed to fetch pending payments');
    return response.json();
  },

  getDashboardMetrics: async () => {
    const response = await authenticatedFetch('/api/admin/dashboard/');
    if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
    return response.json();
  },

  getAllSettings: async () => {
    const response = await authenticatedFetch('/api/admin/settings/');
    if (!response.ok) throw new Error('Failed to fetch admin settings');
    return response.json();
  },

  updateSetting: async (settingKey: string, data: { setting_value?: string; description?: string }) => {
    const response = await authenticatedFetch(`/api/admin/settings/${settingKey}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update setting');
    return response.json();
  },

  updatePayment: async (paymentId: string, data: { status: string; rejection_reason?: string }) => {
    const response = await authenticatedFetch(`/api/admin/payments/${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update payment');
    return response.json();
  },

  getAnalytics: async () => {
    const response = await authenticatedFetch('/api/admin/analytics');
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  },

  getPendingGrading: async () => {
    const response = await authenticatedFetch('/api/admin/grading-queue');
    if (!response.ok) throw new Error('Failed to fetch grading queue');
    return response.json();
  },

  gradeAssignment: async (submissionId: string, data: { status: string; feedback?: string }) => {
    const response = await authenticatedFetch(`/api/admin/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to grade assignment');
    return response.json();
  },

  updateAssignmentSubmission: async (submissionId: string, data: { status: string; feedback?: string }) => {
    return adminAPI.gradeAssignment(submissionId, data);
  },

  flagAssignment: async (submissionId: string, data: { is_ai_flagged: boolean }) => {
    const response = await authenticatedFetch(`/api/admin/submissions/${submissionId}/flag`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to flag assignment');
    return response.json();
  },

  searchStudents: async (query: string) => {
    const response = await authenticatedFetch(`/api/admin/students?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search students');
    return response.json();
  },

  getStudents: async (query: string) => {
    return adminAPI.searchStudents(query);
  },

  resetPassword: async (data: { email: string; new_password: string }) => {
    const response = await authenticatedFetch('/api/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to reset password');
    return response.json();
  },

  updateUserRole: async (profileId: string, data: { role: string }) => {
    const response = await authenticatedFetch(`/api/admin/profiles/${profileId}/role`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user role');
    return response.json();
  },

  getCertificateTemplates: async () => {
    const response = await authenticatedFetch('/api/admin/certificate-templates');
    if (!response.ok) throw new Error('Failed to fetch certificate templates');
    return response.json();
  },

  upsertCertificateTemplate: async (data: Record<string, unknown>) => {
    const response = await authenticatedFetch('/api/admin/certificate-templates', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save certificate template');
    return response.json();
  },

  getHeldForumPosts: async () => {
    const response = await authenticatedFetch('/api/admin/forum/held');
    if (!response.ok) throw new Error('Failed to fetch held forum posts');
    return response.json();
  },

  moderateForumPost: async (postId: string, data: { status: string }) => {
    const response = await authenticatedFetch(`/api/admin/forum/posts/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to moderate forum post');
    return response.json();
  },

  adminDeleteForumPost: async (postId: string) => {
    const response = await authenticatedFetch(`/api/admin/forum/posts/${postId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete forum post');
    return response.json();
  },

  deleteForumPost: async (postId: string) => {
    return adminAPI.adminDeleteForumPost(postId);
  },

  createLesson: async (data: Record<string, unknown>) => {
    const response = await authenticatedFetch('/api/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create lesson');
    return response.json();
  },

  getSystemSettings: async () => {
    const response = await authenticatedFetch('/api/admin/settings');
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  updateSystemSettings: async (data: Record<string, unknown>) => {
    const response = await authenticatedFetch('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  getAuditLogs: async () => {
    const response = await authenticatedFetch('/api/admin/audit-logs');
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },

  getFinancialReports: async () => {
    const response = await authenticatedFetch('/api/admin/financial-reports');
    if (!response.ok) throw new Error('Failed to fetch financial reports');
    return response.json();
  },

  getUsers: async () => {
    const response = await authenticatedFetch('/api/admin/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
};

// Payments API
export const paymentsAPI = {
  submitPayment: async (data: { quiz_id: string; receipt_file_path: string; amount?: number }) => {
    const response = await authenticatedFetch('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to submit payment');
    return response.json();
  },

  getMyPayments: async (quizId: string) => {
    const response = await authenticatedFetch(`/api/payments/my?quiz_id=${quizId}`);
    if (!response.ok) throw new Error('Failed to fetch payments');
    return response.json();
  },

  getApprovedCount: async (quizId: string) => {
    const response = await authenticatedFetch(`/api/payments/approved-count?quiz_id=${quizId}`);
    if (!response.ok) throw new Error('Failed to fetch approved payment count');
    return response.json();
  },
};

// Announcements API
export const announcementsAPI = {
  create: async (data: { title?: string; body?: string; content?: string }) => {
    const response = await authenticatedFetch('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create announcement');
    return response.json();
  },

  getAll: async () => {
    const response = await authenticatedFetch('/api/announcements');
    if (!response.ok) throw new Error('Failed to fetch announcements');
    return response.json();
  },

  getLatest: async () => {
    const response = await authenticatedFetch('/api/announcements/latest');
    if (!response.ok) return null;
    return response.json();
  },
};

// ==========================================
// AI Module
// ==========================================
export const aiAPI = {
  ask: async (message: string, contextCode?: string) => {
    const response = await authenticatedFetch('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ message, context_code: contextCode })
    });
    if (!response.ok) throw new Error('Failed to ask AI tutor');
    return response.json();
  },
  
  getHistory: async () => {
    const response = await authenticatedFetch('/api/ai/chat/history', {
      method: 'GET'
    });
    if (!response.ok) throw new Error('Failed to fetch chat history');
    return response.json();
  },
  
  generate: async (prompt: string, contextType: string, contextData?: string) => {
    const response = await authenticatedFetch('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, context_type: contextType, context_data: contextData })
    });
    if (!response.ok) throw new Error('Failed to generate AI content');
    return response.json();
  },

  getPendingReviews: async () => {
    const response = await authenticatedFetch('/api/ai/reviews/pending');
    if (!response.ok) throw new Error('Failed to fetch pending reviews');
    return response.json();
  },

  reviewSubmission: async (submissionId: string) => {
    const response = await authenticatedFetch(`/api/ai/review-submission/${submissionId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.detail || 'Failed to generate AI review');
    }
    return response.json();
  },

  confirmReview: async (submissionId: string, data: { review_id: string; feedback: string; status: 'approved' | 'rejected'; is_ai_flagged?: boolean }) => {
    const response = await authenticatedFetch(`/api/ai/confirm-review/${submissionId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to release grade');
    return response.json();
  },

  getSettings: async () => {
    const response = await authenticatedFetch('/api/ai/settings');
    if (!response.ok) throw new Error('Failed to fetch AI settings');
    return response.json();
  },

  updateSettings: async (data: { daily_limit: number; review_daily_limit: number }) => {
    const response = await authenticatedFetch('/api/ai/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update AI settings');
    return response.json();
  }
};

// ==========================================
// Notifications & CommsAPI (Web Push, Part 3)
export const pushAPI = {
  subscribe: async (subscription: PushSubscription) => {
    const json = subscription.toJSON()
    const response = await authenticatedFetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys?.p256dh || '',
          auth: json.keys?.auth || '',
        },
      }),
    });
    if (!response.ok) throw new Error('Failed to register push subscription');
    return response.json();
  },

  unsubscribe: async (subscription: PushSubscription) => {
    const json = subscription.toJSON()
    const response = await authenticatedFetch('/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: {
          p256dh: json.keys?.p256dh || '',
          auth: json.keys?.auth || '',
        },
      }),
    });
    if (!response.ok) throw new Error('Failed to remove push subscription');
    return response.json();
  },

  getPreferences: async () => {
    const response = await authenticatedFetch('/api/notifications/preferences');
    if (!response.ok) throw new Error('Failed to fetch notification preferences');
    return response.json();
  },

  updatePreferences: async (data: Record<string, boolean>) => {
    const response = await authenticatedFetch('/api/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update notification preferences');
    return response.json();
  },
};

// Support / Tickets API
export const supportAPI = {
  getTickets: async () => {
    const response = await authenticatedFetch('/api/support/tickets/me');
    if (!response.ok) throw new Error('Failed to fetch support tickets');
    return response.json();
  },
  createTicket: async (data: { title: string; description: string; category: string; priority: string }) => {
    const response = await authenticatedFetch('/api/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create ticket');
    return response.json();
  },
  getTicketMessages: async (ticketId: string) => {
    const response = await authenticatedFetch(`/api/support/tickets/${ticketId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch ticket messages');
    return response.json();
  },
  getStaffTickets: async () => {
    const response = await authenticatedFetch('/api/support/staff/tickets');
    if (!response.ok) throw new Error('Failed to fetch support queue');
    return response.json();
  },
};

// Course-fee invoices. This is intentionally separate from quiz-retake payments.
export const commerceAPI = {
  getPaymentMethods: async () => {
    const response = await authenticatedFetch('/api/commerce/payment-methods');
    if (!response.ok) throw new Error('Failed to fetch payment methods');
    return response.json();
  },
  getMyInvoices: async () => {
    const response = await authenticatedFetch('/api/commerce/invoices/me');
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  },
  submitInvoicePayment: async (invoiceId: string, data: { payment_method_id: string; payer_name: string; amount_claimed: number; transfer_reference: string; receipt_storage_path: string }) => {
    const response = await authenticatedFetch(`/api/commerce/invoices/${invoiceId}/submissions`, { method: 'POST', body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to submit payment proof');
    return response.json();
  },
  uploadReceipt: async (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Upload a JPG, PNG, or PDF receipt no larger than 5 MB.');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sign in again before uploading a receipt.');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('payment-receipts').upload(path, file, { contentType: file.type, upsert: false });
    if (error) throw new Error('Receipt upload failed. Please try again.');
    return `payment-receipts/${path}`;
  },
  getPendingSubmissions: async () => {
    const response = await authenticatedFetch('/api/commerce/admin/submissions');
    if (!response.ok) throw new Error('Failed to fetch payment queue');
    return response.json();
  },
  getReceiptUrl: async (id: string) => {
    const response = await authenticatedFetch(`/api/commerce/admin/submissions/${id}/receipt-url`);
    if (!response.ok) throw new Error('Failed to prepare receipt for viewing');
    return response.json();
  },
  approveSubmission: async (id: string, reason?: string) => {
    const response = await authenticatedFetch(`/api/commerce/admin/submissions/${id}/approve`, { method: 'POST', body: JSON.stringify({ reason }) });
    if (!response.ok) throw new Error('Failed to approve payment');
    return response.json();
  },
  rejectSubmission: async (id: string, reason: string) => {
    const response = await authenticatedFetch(`/api/commerce/admin/submissions/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
    if (!response.ok) throw new Error('Failed to reject payment');
    return response.json();
  },
};

// ==========================================
// Analytics API
// ==========================================
export const analyticsAPI = {
  getStudentAnalytics: async () => {
    const response = await authenticatedFetch('/api/analytics/student/me');
    if (!response.ok) throw new Error('Failed to fetch student analytics');
    return response.json();
  },
  getTeacherAnalytics: async () => {
    const response = await authenticatedFetch('/api/analytics/teacher/me');
    if (!response.ok) throw new Error('Failed to fetch teacher analytics');
    return response.json();
  },
  getAdminAnalytics: async () => {
    const response = await authenticatedFetch('/api/analytics/admin/overview');
    if (!response.ok) throw new Error('Failed to fetch admin analytics');
    return response.json();
  }
};

export const systemAPI = {
  getHealth: async () => {
    const response = await authenticatedFetch('/api/health');
    if (!response.ok) throw new Error('Failed to fetch system health');
    return response.json();
  },
  getMonitoringHealth: async () => {
    const response = await authenticatedFetch('/api/admin/monitoring/health');
    if (!response.ok) throw new Error('Failed to fetch monitoring health');
    return response.json();
  },
  getIncidents: async () => {
    const response = await authenticatedFetch('/api/admin/monitoring/incidents');
    if (!response.ok) throw new Error('Failed to fetch incidents');
    return response.json();
  },
  getErrors: async () => {
    const response = await authenticatedFetch('/api/admin/monitoring/errors');
    if (!response.ok) throw new Error('Failed to fetch errors');
    return response.json();
  },
  getDatabaseHealth: async () => {
    const response = await authenticatedFetch('/api/admin/database/health');
    if (!response.ok) throw new Error('Failed to fetch database health');
    return response.json();
  },
  getSystemAudit: async () => {
    const response = await authenticatedFetch('/api/admin/system/audit');
    if (!response.ok) throw new Error('Failed to fetch system audit');
    return response.json();
  },
};

export const studentAPI = {
  getDashboard: async () => {
    const response = await authenticatedFetch('/api/student/dashboard');
    if (!response.ok) throw new Error('Failed to fetch student dashboard');
    return response.json();
  },
  completeOnboarding: async () => {
    const response = await authenticatedFetch('/api/student/dashboard/onboarding/complete', {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to complete onboarding');
    return response.json();
  },
};

export const teacherAPI = {
  getAIDraft: async (prompt: string, context: string) => {
    const response = await authenticatedFetch('/api/teacher/ai/draft', {
      method: 'POST',
      body: JSON.stringify({ prompt, context })
    });
    if (!response.ok) throw new Error('Failed to fetch AI draft');
    return response.json();
  },
  getAcademicTickets: async () => {
    const response = await authenticatedFetch('/api/support/teacher/tickets');
    if (!response.ok) throw new Error('Failed to fetch academic tickets');
    return response.json();
  },
  replyToAcademicTicket: async (ticketId: string, body: string) => {
    const response = await authenticatedFetch(`/api/support/teacher/tickets/${ticketId}/reply`, { method: 'POST', body: JSON.stringify({ body }) });
    if (!response.ok) throw new Error('Failed to reply to academic ticket');
    return response.json();
  },
};

export const instructorQuizAPI = {
  create: async (data: Record<string, unknown>) => {
    const response = await authenticatedFetch('/api/admin/quizzes', { method: 'POST', body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to create assessment');
    return response.json();
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const response = await authenticatedFetch(`/api/admin/quizzes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
    if (!response.ok) throw new Error('Failed to update assessment');
    return response.json();
  },
  remove: async (id: string) => {
    const response = await authenticatedFetch(`/api/admin/quizzes/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete assessment');
    return response.json();
  },
};

export default {
  auth: authAPI,
  enrollment: enrollmentAPI,
  courses: coursesAPI,
  quizzes: quizzesAPI,
  certificates: certificatesAPI,
  forum: forumAPI,
  admin: adminAPI,
  payments: paymentsAPI,
  announcements: announcementsAPI,
  push: pushAPI,
  support: supportAPI,
  commerce: commerceAPI,
  ai: aiAPI,
  analytics: analyticsAPI,
  system: systemAPI,
  student: studentAPI,
  teacher: teacherAPI,
  instructorQuizzes: instructorQuizAPI,
};
