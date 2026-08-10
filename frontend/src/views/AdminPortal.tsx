import React, { useState } from 'react';
import { Users, BookOpen, CreditCard, Settings, FileText, Activity, ShieldCheck, LogOut, ChevronLeft, Zap, XCircle, Shield, Database, Gauge } from 'lucide-react';
import { InfrastructureHealth } from './InfrastructureHealth';
import { DatabaseHealth } from '../components/admin/DatabaseHealth';
import { ContentVersionHistory } from '../components/admin/ContentVersionHistory';
import { AdminAnalyticsDashboard } from './analytics/AdminAnalyticsDashboard';
import { UserManagementTable } from '../components/admin/UserManagementTable';
import { PaymentVerificationQueue } from '../components/admin/PaymentVerificationQueue';
import { AuditLogViewer } from '../components/admin/AuditLogViewer';
import { Grid } from '../components/ui/Grid';
import { CourseAnalytics } from '../components/admin/CourseAnalytics';
import { AIChatInterface } from '../components/ui/AIChatInterface';
import { SystemHealthDashboard } from '../components/admin/SystemHealthDashboard';
import { ErrorTracker } from '../components/admin/ErrorTracker';
import { IncidentRegister } from '../components/admin/IncidentRegister';
import { PerformanceMetrics } from '../components/admin/PerformanceMetrics';
import { AdminCourseManagement } from '../components/admin/AdminCourseManagement';
import { AdminEmailSettings } from '../components/admin/AdminEmailSettings';
import { AdminPlatformSettings } from '../components/admin/AdminPlatformSettings';
import { AdminUsagePanel } from '../components/admin/AdminUsagePanel';
import apiClient from '../apiClient';

const StatCard = ({ title, value, change, icon: Icon, color }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  
  return (
    <div className="relative p-6 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface-dark)] to-[var(--bg-main)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
          <Icon size={22} />
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-full text-[var(--muted)]">{change}</span>
      </div>
      <h3 className="relative z-10 text-[var(--muted)] text-sm font-medium mb-1">{title}</h3>
      <div className="relative z-10 text-3xl font-black text-[var(--text-primary)]">{value}</div>
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-3xl opacity-20 ${color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'}`}></div>
    </div>
  );
};

interface AdminPortalProps {
  session: any;
  onSignOut: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onSignOut }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  React.useEffect(() => {
    Promise.all([
      apiClient.admin.getDashboardMetrics().catch(() => ({})),
      apiClient.admin.getPendingPayments().catch(() => []),
      apiClient.support.getStaffTickets().catch(() => [])
    ]).then(([data, payments, tickets]) => setMetrics({ 
      ...data, 
      pending_course_payments: payments.length, 
      open_support_tickets: tickets.length,
      database_health: 'Healthy'
    }));
  }, []);

  const navItems = [
    { id: 'home', label: 'Dashboard Home', icon: Activity },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: ShieldCheck },
    { id: 'courses', label: 'Courses & Batches', icon: BookOpen },
    { id: 'finance', label: 'Financials', icon: CreditCard },
    { id: 'usage', label: 'AI & Email Usage', icon: Gauge },
    { id: 'logs', label: 'Audit Logs', icon: FileText },
    { id: 'health', label: 'System Health', icon: Activity },
    { id: 'infrastructure', label: 'Infrastructure', icon: Shield },
    { id: 'database', label: 'Database Health', icon: Database },
    { id: 'analytics', label: 'Course Analytics', icon: Activity },
    { id: 'versions', label: 'Version History', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/codeme.jpg" alt="CodeMe Logo" style={{ width: 40, height: 40, borderRadius: '8px', border: '2px solid var(--color-blue)', objectFit: 'contain' }} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>ERP Admin Console</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>CodeMe Academy</p>
          </div>
        </div>
        
        <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', marginBottom: '4px',
                borderRadius: '8px', border: 'none', background: activeTab === item.id ? 'var(--color-blue)' : 'transparent',
                color: activeTab === item.id ? 'white' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left',
                fontWeight: activeTab === item.id ? 'bold' : 'normal', transition: 'all 0.2s'
              }}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border-default)' }}>
          <button onClick={() => { window.location.hash = ''; }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '8px' }}>
            <ChevronLeft size={16} /> Exit to Platform
          </button>
          <button onClick={onSignOut} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(239,68,68,0.1)', color: 'var(--color-red)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Navbar */}
        <div style={{ height: '64px', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setShowAIAssistant(true)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--color-blue)', color: '#fff', 
                border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              <Zap size={16} />
              AI Assistant
            </button>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              AD
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {['settings'].includes(activeTab) && (
              <div className="flex flex-col gap-6">
                <AdminPlatformSettings />
                <AdminEmailSettings />
              </div>
            )}
            
            {activeTab === 'health' && (
              <div className="flex flex-col gap-6">
                <SystemHealthDashboard />
                <ErrorTracker />
                <IncidentRegister />
                <PerformanceMetrics />
              </div>
            )}
            
            {activeTab === 'infrastructure' && <InfrastructureHealth />}
            {activeTab === 'database' && <DatabaseHealth />}
            {activeTab === 'analytics' && <CourseAnalytics />}
            {activeTab === 'versions' && <ContentVersionHistory />}
            
            {activeTab === 'home' && (
              <div className="space-y-8 animate-fade-in">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-10 text-white shadow-2xl">
                  <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">Welcome to the Command Center</h2>
                    <p className="opacity-90 max-w-2xl text-lg leading-relaxed">
                      Here is what is happening in the academy today. You have <strong className="text-white">{metrics?.open_support_tickets || 0} open support tickets</strong> and <strong className="text-white">{metrics?.pending_course_payments || 0} pending payments</strong> requiring your attention.
                    </p>
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                  <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl translate-y-1/2"></div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2"><Activity size={20} className="text-blue-500"/> Academy Overview</h3>
                  <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
                    <StatCard title="Total Students" value={metrics?.total_students ?? '-'} change="Active Platform Users" icon={Users} color="blue" />
                    <StatCard title="Active Courses" value={metrics?.courses ?? '-'} change="Published Courses" icon={BookOpen} color="green" />
                    <StatCard title="Course Payments" value={metrics?.pending_course_payments ?? '-'} change="Awaiting Verification" icon={CreditCard} color="purple" />
                    <StatCard title="Open Support" value={metrics?.open_support_tickets ?? '-'} change="Needs Response" icon={Users} color="blue" />
                    <StatCard title="System Health" value={metrics?.database_health ?? '-'} change="Database Status" icon={Activity} color="emerald" />
                  </Grid>
                </div>

                {/* Activity Feed Placeholder */}
                <div>
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2">Recent Activity</h3>
                  <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-2xl p-6">
                    <div className="space-y-6">
                      {[
                        { time: '10 mins ago', user: 'Sarah Johnson', action: 'enrolled in', target: 'Advanced Python Masterclass', color: 'blue' },
                        { time: '1 hour ago', user: 'Michael Chen', action: 'completed', target: 'React Fundamentals Quiz 1', color: 'green' },
                        { time: '2 hours ago', user: 'Admin', action: 'published', target: 'New UI/UX Course', color: 'purple' },
                        { time: '5 hours ago', user: 'Emily Davis', action: 'submitted', target: 'Capstone Project', color: 'yellow' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className={`mt-1 w-2.5 h-2.5 rounded-full bg-${item.color}-500 shrink-0`}></div>
                          <div>
                            <p className="text-sm">
                              <span className="font-semibold text-[var(--text-primary)]">{item.user}</span>{' '}
                              <span className="text-[var(--muted)]">{item.action}</span>{' '}
                              <span className="font-semibold text-[var(--text-primary)]">{item.target}</span>
                            </p>
                            <span className="text-xs text-[var(--muted)]">{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && <UserManagementTable roleFilter="student" />}
            {activeTab === 'teachers' && <UserManagementTable roleFilter="teacher" />}
            
            {activeTab === 'finance' && <PaymentVerificationQueue />}

            {activeTab === 'usage' && <AdminUsagePanel />}

            {activeTab === 'logs' && <AuditLogViewer />}
            
            {activeTab === 'analytics' && (
              <AdminAnalyticsDashboard />
            )}

            {['courses'].includes(activeTab) && (
              <AdminCourseManagement />
            )}
          </div>
        </div>
      </div>
    </div>
    {showAIAssistant && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          width: '100%',
          maxWidth: '600px',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <button
            onClick={() => setShowAIAssistant(false)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <XCircle size={20} />
          </button>
          <AIChatInterface mode="generate" contextType="Admin Assistant" height="600px" />
        </div>
      </div>
    )}
    </>
  );
};
