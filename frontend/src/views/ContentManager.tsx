import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Loader2, Plus, Layout, BookOpen, PenTool, CheckSquare, Settings } from 'lucide-react'
import { CourseBuilder } from '../components/admin/content/CourseBuilder'
import { ModuleBuilder } from '../components/admin/content/ModuleBuilder'
import { LessonBuilder } from '../components/admin/content/LessonBuilder'
import { AssignmentBuilder } from '../components/admin/content/AssignmentBuilder'
import { QuizBuilder } from '../components/admin/content/QuizBuilder'
import type { Course, Module } from '../types/models'

export const ContentManager: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>('wd101')
  const [modules, setModules] = useState<Module[]>([])
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Sub-views: 'course-settings', 'modules', 'lessons', 'projects', 'quizzes', 'new-course'
  const [activeView, setActiveView] = useState<string>('modules')
  
  // Shared state for lessons, assignments, quizzes
  const [selectedModuleId, setSelectedModuleId] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: coursesData } = await supabase.from('courses').select('*').order('id')
      setCourses(coursesData || [])

      if (selectedCourseId) {
        const { data: modsData } = await supabase
          .from('modules')
          .select('*, lessons(*), assignments(*), quizzes(*)')
          .eq('course_id', selectedCourseId)
          .order('order_index')
        setModules(modsData || [])
        
        // Auto-select first module if none selected and modules exist
        if (modsData && modsData.length > 0 && !modsData.find(m => m.id === selectedModuleId)) {
          setSelectedModuleId(modsData[0].id)
        }
      } else {
        setModules([])
        setSelectedModuleId('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedCourseId])

  // Clear sub-states on view change
  useEffect(() => {
    setMessage(null)
  }, [activeView])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {message && (
        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: message.type === 'success' ? '#065F46' : '#991B1B', border: message.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FCA5A5' }}>
          {message.text}
        </div>
      )}

      {/* Course Selector + Create New Button */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
          <label style={{ fontSize: '0.65rem' }}>SELECT COURSE</label>
          <select className="input-field" value={selectedCourseId} onChange={e => { setSelectedCourseId(e.target.value); setActiveView('modules'); }}>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setActiveView('new-course')
          }}
          style={{ flexShrink: 0, height: '40px', minHeight: '40px', padding: '0 12px', fontSize: '0.8rem', marginTop: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} /> New Course
        </button>
      </div>

      {/* Pricing Info Strip */}
      {activeView !== 'new-course' && (() => {
        const c = courses.find(x => x.id === selectedCourseId)
        return c ? (
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>💰 Price: <strong>{c.currency || 'NGN'} {Number(c.price || 0).toLocaleString()}</strong></span>
            <span>🌐 Language: <strong>{c.language || 'English'}</strong></span>
            <span>📊 Level: <strong>{c.level || 'Beginner'}</strong></span>
            <span>🕐 Duration: <strong>{c.duration_weeks || '?'} weeks</strong></span>
            <span>✅ Status: <strong style={{ color: c.is_active ? 'var(--color-success)' : 'var(--color-danger)' }}>{c.is_active ? 'Active' : 'Inactive'}</strong></span>
          </div>
        ) : null
      })()}

      {/* Tab Navigation */}
      {activeView !== 'new-course' && (
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', overflowX: 'auto' }}>
          <button className={`badge ${activeView === 'modules' ? 'badge-blue' : ''}`} onClick={() => setActiveView('modules')} style={{ cursor: 'pointer', padding: '6px 12px' }}>
            <Layout size={14} style={{ marginRight: '4px' }} /> Modules
          </button>
          <button className={`badge ${activeView === 'lessons' ? 'badge-blue' : ''}`} onClick={() => setActiveView('lessons')} style={{ cursor: 'pointer', padding: '6px 12px' }}>
            <BookOpen size={14} style={{ marginRight: '4px' }} /> Lessons
          </button>
          <button className={`badge ${activeView === 'projects' ? 'badge-blue' : ''}`} onClick={() => setActiveView('projects')} style={{ cursor: 'pointer', padding: '6px 12px' }}>
            <PenTool size={14} style={{ marginRight: '4px' }} /> Assignments
          </button>
          <button className={`badge ${activeView === 'quizzes' ? 'badge-blue' : ''}`} onClick={() => setActiveView('quizzes')} style={{ cursor: 'pointer', padding: '6px 12px' }}>
            <CheckSquare size={14} style={{ marginRight: '4px' }} /> Quizzes
          </button>
          <button
            className={`badge ${activeView === 'course-settings' ? 'badge-blue' : ''}`}
            onClick={() => setActiveView('course-settings')}
            style={{ cursor: 'pointer', padding: '6px 12px' }}
          >
            <Settings size={14} style={{ marginRight: '4px' }} /> Settings & Pricing
          </button>
        </div>
      )}

      {/* Content Panels */}
      <div style={{ marginTop: '4px' }}>
        {activeView === 'modules' && (
          <ModuleBuilder 
            modules={modules}
            selectedCourseId={selectedCourseId}
            fetchData={fetchData}
            setMessage={setMessage}
          />
        )}
        {activeView === 'lessons' && (
          <LessonBuilder 
            modules={modules}
            selectedModuleId={selectedModuleId}
            setSelectedModuleId={setSelectedModuleId}
            fetchData={fetchData}
            setMessage={setMessage}
          />
        )}
        {activeView === 'projects' && (
          <AssignmentBuilder 
            modules={modules}
            selectedModuleId={selectedModuleId}
            setSelectedModuleId={setSelectedModuleId}
            fetchData={fetchData}
            setMessage={setMessage}
          />
        )}
        {activeView === 'quizzes' && (
          <QuizBuilder 
            modules={modules}
            selectedModuleId={selectedModuleId}
            setSelectedModuleId={setSelectedModuleId}
            fetchData={fetchData}
            setMessage={setMessage}
          />
        )}
        {(activeView === 'course-settings' || activeView === 'new-course') && (
          <CourseBuilder 
            courses={courses}
            selectedCourseId={selectedCourseId}
            activeView={activeView}
            setActiveView={setActiveView}
            setSelectedCourseId={setSelectedCourseId}
            fetchData={fetchData}
            setMessage={setMessage}
          />
        )}
      </div>
    </div>
  )
}
