import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import apiClient from '../apiClient'
import {
  BookOpen, Users, Bell, CheckSquare, PenTool, Loader2,
  Video, Send, BarChart2, GraduationCap, Plus, Eye, Clock, Upload, Trash2, Zap, XCircle, Paperclip, Flame
  Video, Send, BarChart2, GraduationCap, Plus, Eye, Clock, Upload, Trash2, Zap, XCircle, Paperclip, Flame, MessageSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ContentManager } from './ContentManager'
import { AIChatInterface } from '../components/ui/AIChatInterface'

interface TeacherDashboardProps {
  session: any
  onNavigate: (view: string) => void
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ session }) => {
  const [profile, setProfile] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'gradebook' | 'content' | 'announcements' | 'recordings' | 'roster'>('overview')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  // Gradebook state
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [gradeVal, setGradeVal] = useState('')
  const [feedbackVal, setFeedbackVal] = useState('')
  const [gradeLoading, setGradeLoading] = useState(false)

  // AI review state
  const [aiDraft, setAiDraft] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFlagVal, setAiFlagVal] = useState(false)

  // Announcement state
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementTitle, setAnnouncementTitle] = useState('')
  const [annLoading, setAnnLoading] = useState(false)

  // Live class link state
  const [liveLink, setLiveLink] = useState('')
  const [liveLinkTitle, setLiveLinkTitle] = useState('')
  const [liveLoading, setLiveLoading] = useState(false)

  // Recordings state
  const [recordings, setRecordings] = useState<any[]>([])
  const [newRecTitle, setNewRecTitle] = useState('')
  const [newRecUrl, setNewRecUrl] = useState('')
  const [newRecDuration, setNewRecDuration] = useState('')
  const [recLoading, setRecLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [session?.user?.id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(profileData)

      // Fetch all courses (teacher manages all assigned courses)
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*, modules(count)')
        .eq('is_active', true)
      setCourses(coursesData || [])

      // Fetch enrolled students
      const { data: enrollData } = await supabase
        .from('student_enrollments')
        .select('*, profiles(id, full_name, student_id, email, avatar_url, streak_count)')
        .eq('status', 'enrolled')
      setStudents(enrollData || [])

      // Fetch pending assignment submissions (ungraded) via backend grading queue
      const subData = await apiClient.admin.getPendingGrading()
      setPendingSubmissions(subData || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubmission || !gradeVal) return
    setGradeLoading(true)
    try {
      await apiClient.admin.gradeAssignment(selectedSubmission.id, {
        status: gradeVal as 'approved' | 'rejected',
        feedback: feedbackVal,
      })
      setMessage({ type: 'success', text: `Submission ${gradeVal} successfully!` })
      setSelectedSubmission(null)
      setAiDraft(null)
      setGradeVal('')
      setFeedbackVal('')
      setAiFlagVal(false)
      fetchData()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setGradeLoading(false)
    }
  }

  const handleGenerateAiReview = async () => {
    if (!selectedSubmission) return
    setAiLoading(true)
    try {
      const draft = await apiClient.ai.reviewSubmission(selectedSubmission.id)
      setAiDraft(draft)
      setFeedbackVal(draft.feedback || '')
      setGradeVal(draft.passed ? 'approved' : 'rejected')
      setAiFlagVal(draft.is_ai_flagged || false)
      setMessage({ type: 'success', text: 'AI review draft generated. Review and edit it, then release the grade.' })
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setAiLoading(false)
    }
  }

  const handleReleaseAiGrade = async () => {
    if (!selectedSubmission || !aiDraft || !gradeVal) return
    setGradeLoading(true)
    try {
      await apiClient.ai.confirmReview(selectedSubmission.id, {
        review_id: aiDraft.id,
        feedback: feedbackVal,
        status: gradeVal as 'approved' | 'rejected',
        is_ai_flagged: aiFlagVal,
      })
      setMessage({ type: 'success', text: 'AI-assisted grade released to the student.' })
      setSelectedSubmission(null)
      setAiDraft(null)
      setGradeVal('')
      setFeedbackVal('')
      setAiFlagVal(false)
      fetchData()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setGradeLoading(false)
    }
  }

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announcementText.trim() || !announcementTitle.trim()) return
    setAnnLoading(true)
    try {
      await apiClient.announcements.create({
        title: announcementTitle,
        body: announcementText,
      })
      setMessage({ type: 'success', text: 'Announcement sent to all students!' })
      setAnnouncementTitle('')
      setAnnouncementText('')
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setAnnLoading(false)
    }
  }

  const handleSaveLiveLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!liveLink.trim()) return
    setLiveLoading(true)
    try {
      await apiClient.announcements.create({
        title: liveLinkTitle || 'Live Class Today!',
        body: `Join our live session here: ${liveLink}`,
      })
      setMessage({ type: 'success', text: 'Live class link posted to students!' })
      setLiveLink('')
      setLiveLinkTitle('')
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setLiveLoading(false)
    }
  }

  const handleUploadRecording = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRecTitle.trim() || !newRecUrl.trim()) return
    setRecLoading(true)
    try {
      const { error } = await supabase.from('recording_library').insert({
        title: newRecTitle,
        recording_url: newRecUrl,
        duration_mins: newRecDuration ? parseInt(newRecDuration) : null,
        uploaded_by: session.user.id,
        course_id: 'wd101' // default for now
      })
      if (error) throw error
      setMessage({ type: 'success', text: 'Recording added to library!' })
      setNewRecTitle('')
      setNewRecUrl('')
      setNewRecDuration('')
      // refresh recordings
      const { data } = await supabase.from('recording_library').select('*').order('created_at', { ascending: false })
      setRecordings(data || [])
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setRecLoading(false)
    }
  }

  const handleDeleteRecording = async (id: string) => {
    if (!confirm('Delete this recording?')) return
    try {
      await supabase.from('recording_library').delete().eq('id', id)
      setRecordings(prev => prev.filter(r => r.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-purple)' }} />
    </div>
  )

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart2 },
    { key: 'gradebook', label: 'Gradebook', icon: CheckSquare },
    { key: 'content', label: 'Content', icon: BookOpen },
    { key: 'announcements', label: 'Announce', icon: Bell },
    { key: 'recordings', label: 'Recordings', icon: Video },
    { key: 'roster', label: 'Roster', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-4 sm:p-8 overflow-y-auto" style={{ paddingBottom: '80px' }}>
      <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 shadow-2xl"
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <GraduationCap size={32} className="text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Teacher Console</h2>
              <p className="text-blue-100 font-medium mt-1 flex items-center gap-2">
                {profile?.full_name} <span className="opacity-50">•</span> {profile?.student_id || 'Instructor'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowAIAssistant(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <Zap size={18} className="fill-purple-600" />
            AI Assistant
          </button>
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
              background: '#1b1030',
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
                  color: '#fff',
                  cursor: 'pointer',
                  zIndex: 10
                }}
              >
                <XCircle size={20} />
              </button>
              <AIChatInterface mode="generate" contextType="Teacher Assistant" height="600px" />
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Assigned Courses', value: courses.length, icon: BookOpen },
            { label: 'Total Students', value: students.length, icon: Users },
            { label: 'To Grade', value: pendingSubmissions.length, icon: PenTool },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
              <Icon size={24} className="text-purple-200 mb-2" />
              <div className="text-2xl sm:text-3xl font-black text-white">{value}</div>
              <div className="text-xs sm:text-sm font-medium text-purple-200 mt-1 text-center">{label}</div>
            </div>
          ))}
        </div>
        
        {/* Decor */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </motion.div>

      {/* Notifications / message */}
      {message && (
        <div style={{ padding: '12px', borderRadius: '10px', marginBottom: '12px', backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: message.type === 'success' ? '#065F46' : '#991B1B', border: message.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FCA5A5' }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${activeTab === key ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-[var(--surface-dark)] text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] border border-[var(--border)]'}`}
          >
            <Icon size={18} /> {label}
            {key === 'gradebook' && pendingSubmissions.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {pendingSubmissions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Ungraded Submissions</h3>
          {pendingSubmissions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <CheckSquare size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
              <p>All caught up! No pending submissions.</p>
            </div>
          ) : (
            pendingSubmissions.slice(0, 5).map(sub => (
              <div key={sub.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sub.profiles?.full_name}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{sub.assignments?.title}</p>
                </div>
                <button
                  onClick={() => { setSelectedSubmission(sub); setAiDraft(null); setActiveTab('gradebook') }}
                  className="btn"
                  style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'var(--color-purple)', color: '#fff' }}
                >
                  Grade
                </button>
              </div>
            ))
          )}

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Post Announcement', icon: Bell, action: () => setActiveTab('announcements') },
              { label: 'Add Live Class Link', icon: Video, action: () => setActiveTab('announcements') },
              { label: 'Build Content', icon: Plus, action: () => setActiveTab('content') },
              { label: 'View Roster', icon: Eye, action: () => setActiveTab('roster') },
            ].map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', cursor: 'pointer', background: 'none', border: '1px solid var(--border-color)', borderRadius: '12px', textAlign: 'center' }}
              >
                <Icon size={22} style={{ color: 'var(--color-purple)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── GRADEBOOK TAB ── */}
      {activeTab === 'gradebook' && (
        <div className="flex flex-col lg:flex-row gap-6 mt-6 min-h-[600px]">
          
          {/* Left Pane: Pending Queue */}
          <div className="lg:w-1/3 flex flex-col gap-4 bg-[var(--surface-dark)] border border-[var(--border)] rounded-2xl p-4 h-[600px] overflow-y-auto">
            <h3 className="font-bold text-lg sticky top-0 bg-[var(--surface-dark)] pb-2 z-10 border-b border-[var(--border)] flex items-center justify-between">
              Pending Queue
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">{pendingSubmissions.length} left</span>
            </h3>
            
            {pendingSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--muted)] opacity-60">
                <CheckSquare size={48} className="mb-4" />
                <p>All submissions graded!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingSubmissions.map(sub => (
                  <div 
                    key={sub.id} 
                    onClick={() => { setSelectedSubmission(sub); setAiDraft(null); }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedSubmission?.id === sub.id ? 'bg-purple-600/20 border-purple-500 shadow-md' : 'bg-[var(--surface)] border-[var(--border)] hover:border-purple-500/50'}`}
                  >
                    <div className="font-bold text-[var(--text-primary)] text-sm truncate mb-1">
                      {sub.profiles?.full_name || 'Unknown Student'}
                    </div>
                    <div className="text-xs text-[var(--muted)] truncate">
                      {sub.assignments?.title || 'Unknown Assignment'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Pane: Grading Interface */}
          <div className="lg:w-2/3 bg-[var(--surface-dark)] border border-[var(--border)] rounded-2xl flex flex-col overflow-hidden h-[600px]">
            {selectedSubmission ? (
              <form onSubmit={handleGradeSubmission} className="flex flex-col h-full">
                
                {/* Grading Header */}
                <div className="p-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--surface)] to-[var(--surface-dark)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-xl text-white">Review Submission</h3>
                    <button type="button" onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XCircle size={20} /></button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm bg-black/20 p-4 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[var(--muted)] block text-xs uppercase tracking-wider mb-1">Student</span>
                      <strong className="text-white">{selectedSubmission.profiles?.full_name}</strong> <span className="opacity-60">({selectedSubmission.profiles?.student_id})</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted)] block text-xs uppercase tracking-wider mb-1">Assignment</span>
                      <strong className="text-purple-300">{selectedSubmission.assignments?.title}</strong>
                    </div>
                  </div>
                </div>

                {/* Grading Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Submission Content */}
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)] mb-3 flex items-center gap-2"><Paperclip size={16}/> Student Work</h4>
                    
                    {selectedSubmission.submission_file && (
                      <a href={selectedSubmission.submission_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-3 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-colors mb-4">
                        <Upload size={16} /> Download Submitted File
                      </a>
                    )}
                    
                    {selectedSubmission.submission_text && (
                      <div className="bg-[#0A0A14] p-4 rounded-xl border border-[#1f1f38] shadow-inner font-mono text-sm text-cyan-100/90 max-h-[250px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {selectedSubmission.submission_text}
                      </div>
                    )}
                  </div>
                  
                  <div className="h-px w-full bg-[var(--border)]"></div>

                  {/* AI Assistant Section */}
                  <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100} /></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <label className="font-bold text-purple-300 flex items-center gap-2 uppercase text-sm tracking-wide">
                          <Zap size={16} className="fill-purple-400" /> AI Auto-Review
                        </label>
                        {aiDraft ? (
                          <span className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/50 shadow-sm">Score: {aiDraft.score ?? '—'}/100</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleGenerateAiReview}
                            disabled={aiLoading}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md hover:shadow-purple-500/25"
                          >
                            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : 'Generate Analysis'}
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {aiDraft && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                            <p className="text-sm text-purple-200/80 leading-relaxed">
                              The AI has drafted a review. You can edit the feedback below before releasing the grade. You retain complete control.
                            </p>
                            <label className="flex items-center gap-3 p-3 bg-black/20 rounded-lg cursor-pointer border border-white/5 hover:bg-black/30 transition-colors w-max">
                              <input type="checkbox" checked={aiFlagVal} onChange={e => setAiFlagVal(e.target.checked)} className="w-4 h-4 rounded border-purple-500 bg-black text-purple-500 focus:ring-purple-500 focus:ring-offset-black" />
                              <span className="text-sm font-medium text-red-300 flex items-center gap-2"><Flame size={16}/> Flag as suspected AI-generated</span>
                            </label>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Manual Grading Inputs */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-[var(--muted)]">Final Status</label>
                      <select 
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors appearance-none" 
                        value={gradeVal} 
                        onChange={e => setGradeVal(e.target.value)} 
                        required
                      >
                        <option value="">Select final verdict...</option>
                        <option value="approved">✅ Approved (Pass)</option>
                        <option value="rejected">❌ Rejected (Needs Revision)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-[var(--muted)]">Feedback to Student</label>
                      <textarea 
                        className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors min-h-[120px] resize-y leading-relaxed placeholder-[var(--muted)]" 
                        placeholder="Great job on the structure! Consider improving..." 
                        value={feedbackVal} 
                        onChange={e => setFeedbackVal(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Grading Footer (Sticky) */}
                <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-end gap-3 shrink-0">
                  <button type="button" className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors" onClick={() => setSelectedSubmission(null)}>Cancel</button>
                  {aiDraft && (
                    <button type="button" disabled={gradeLoading} onClick={handleReleaseAiGrade} className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                      {gradeLoading ? <Loader2 size={18} className="animate-spin" /> : 'Release AI Grade'}
                    </button>
                  )}
                  <button type="submit" disabled={gradeLoading} className="px-5 py-2.5 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                    {gradeLoading ? <Loader2 size={18} className="animate-spin" /> : <><CheckSquare size={18}/> Submit Grade</>}
                  </button>
                </div>

              </form>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-12">
                <div className="w-24 h-24 rounded-full bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                  <PenTool size={40} className="text-purple-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Select a Submission</h3>
                <p className="text-[var(--muted)] max-w-md">Click on any pending student submission from the queue on the left to review their work, run AI analysis, and assign a final grade.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONTENT TAB ── */}
      {activeTab === 'content' && <ContentManager />}

      {/* ── ANNOUNCEMENTS TAB ── */}
      {activeTab === 'announcements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Post Announcement */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} style={{ color: 'var(--color-yellow)' }} /> Post Announcement
            </h3>
            <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input className="input-field" placeholder="Title (e.g. Quiz due tomorrow!)" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} required />
              <textarea className="input-field" placeholder="Write your announcement..." value={announcementText} onChange={e => setAnnouncementText(e.target.value)} required style={{ minHeight: '80px' }} />
              <button type="submit" className="btn btn-primary" disabled={annLoading}>
                {annLoading ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> Send to All Students</>}
              </button>
            </form>
          </div>

          {/* Post Live Class Link */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={18} style={{ color: 'var(--color-blue)' }} /> Add Live Class Link
            </h3>
            <form onSubmit={handleSaveLiveLink} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input className="input-field" placeholder="Title (e.g. Tuesday CSS Session)" value={liveLinkTitle} onChange={e => setLiveLinkTitle(e.target.value)} />
              <input className="input-field" placeholder="https://meet.google.com/... or Zoom link" value={liveLink} onChange={e => setLiveLink(e.target.value)} required type="url" />
              <button type="submit" className="btn" disabled={liveLoading} style={{ background: 'var(--color-blue)', color: '#fff' }}>
                {liveLoading ? <Loader2 size={14} className="animate-spin" /> : <><Video size={14} /> Post Live Link</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── ROSTER TAB ── */}
      {activeTab === 'roster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h3 style={{ fontWeight: 700 }}>Student Roster</h3>
            <span className="badge badge-blue">{students.length} students</span>
          </div>
          {students.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No enrolled students yet.</div>
          ) : (
            students.map((enroll) => {
              const st = enroll.profiles
              if (!st) return null
              return (
                <div key={enroll.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                    {st.full_name?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.full_name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{st.student_id} · <Flame size={12} style={{ color: 'var(--color-warning)' }} /> {st.streak_count || 0} day streak</p>
                  </div>
                  <span className="badge" style={{ fontSize: '0.65rem', background: enroll.status === 'enrolled' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: enroll.status === 'enrolled' ? '#10B981' : '#EF4444' }}>
                    {enroll.status}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* ── RECORDINGS TAB ── */}
      {activeTab === 'recordings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Video size={18} style={{ color: 'var(--color-cyan)' }} /> Class Recordings
          </h3>
          
          <form className="card" onSubmit={handleUploadRecording} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Upload New Session</h4>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Session Title (e.g. Intro to HTML Forms)" 
              value={newRecTitle} 
              onChange={e => setNewRecTitle(e.target.value)} 
              required 
            />
            <input 
              type="url" 
              className="input-field" 
              placeholder="Recording URL (Google Drive, Zoom link, YouTube)" 
              value={newRecUrl} 
              onChange={e => setNewRecUrl(e.target.value)} 
              required 
            />
            <input 
              type="number" 
              className="input-field" 
              placeholder="Duration in mins (e.g. 90)" 
              value={newRecDuration} 
              onChange={e => setNewRecDuration(e.target.value)} 
            />
            <button type="submit" className="btn btn-primary" disabled={recLoading} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {recLoading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
              Save Recording
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
            {recordings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No recordings uploaded yet.</div>
            ) : (
              recordings.map(rec => (
                <div key={rec.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(41,214,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Video size={20} style={{ color: 'var(--color-cyan)' }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rec.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(rec.created_at).toLocaleDateString()} • {rec.duration_mins ? `${rec.duration_mins} mins` : 'Length unspecified'}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a href={rec.recording_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      Watch
                    </a>
                    <button onClick={() => handleDeleteRecording(rec.id)} className="btn btn-secondary" style={{ padding: '6px', color: 'var(--color-danger)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
