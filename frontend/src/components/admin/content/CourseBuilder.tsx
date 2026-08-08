import React, { useState, useEffect } from 'react'
import { supabase } from '../../../supabaseClient'
import { Loader2 } from 'lucide-react'
import type { Course } from '../../../types/models'

const LANGUAGES = ['English', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin English']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const CURRENCIES = ['NGN', 'USD', 'GBP']

interface CourseBuilderProps {
  courses: Course[]
  selectedCourseId: string
  activeView: string
  setActiveView: (view: string) => void
  setSelectedCourseId: (id: string) => void
  fetchData: () => void
  setMessage: (msg: { type: 'success' | 'error', text: string }) => void
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({
  courses,
  selectedCourseId,
  activeView,
  setActiveView,
  setSelectedCourseId,
  fetchData,
  setMessage
}) => {
  const isNew = activeView === 'new-course'
  
  const [actionLoading, setActionLoading] = useState(false)
  const [courseId, setCourseId] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDesc, setCourseDesc] = useState('')
  const [coursePrice, setCoursePrice] = useState('0')
  const [courseCurrency, setCourseCurrency] = useState('NGN')
  const [courseLanguage, setCourseLanguage] = useState('English')
  const [courseLevel, setCourseLevel] = useState('Beginner')
  const [courseDuration, setCourseDuration] = useState('4')
  const [courseStatus, setCourseStatus] = useState('draft')

  useEffect(() => {
    if (!isNew) {
      const course = courses.find(c => c.id === selectedCourseId)
      if (course) {
        setCourseTitle(course.title || '')
        setCourseDesc(course.description || '')
        setCoursePrice(course.price?.toString() || '0')
        setCourseCurrency(course.currency || 'NGN')
        setCourseLanguage(course.language || 'English')
        setCourseLevel(course.level || 'Beginner')
        setCourseDuration(course.duration_weeks?.toString() || '4')
        setCourseStatus(course.status || 'draft')
      }
    } else {
      setCourseId('')
      setCourseTitle('')
      setCourseDesc('')
      setCoursePrice('0')
      setCourseCurrency('NGN')
      setCourseLanguage('English')
      setCourseLevel('Beginner')
      setCourseDuration('4')
      setCourseStatus('draft')
    }
  }, [selectedCourseId, isNew, courses])

  const handleSaveCourseSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const payload = {
        title: courseTitle,
        description: courseDesc,
        price: parseFloat(coursePrice),
        currency: courseCurrency,
        language: courseLanguage,
        level: courseLevel,
        duration_weeks: parseInt(courseDuration),
        status: courseStatus,
        is_active: courseStatus === 'active' || courseStatus === 'published'
      }

      if (isNew) {
        const id = courseId.trim().toLowerCase().replace(/\s+/g, '-')
        if (!id) throw new Error('Course ID is required.')
        const { error } = await supabase.from('courses').insert({ id, ...payload })
        if (error) throw error
        setMessage({ type: 'success', text: `Course "${courseTitle}" created!` })
        setSelectedCourseId(id)
        setActiveView('modules')
      } else {
        const { error } = await supabase.from('courses').update(payload).eq('id', selectedCourseId)
        if (error) throw error
        setMessage({ type: 'success', text: 'Course settings saved!' })
      }
      fetchData()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <form onSubmit={handleSaveCourseSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{isNew ? '➕ Create New Course' : `⚙️ Settings: ${courses.find(c => c.id === selectedCourseId)?.title}`}</h3>

      {isNew && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>COURSE ID (short, no spaces e.g. "css3" or "python-basics")</label>
          <input className="input-field" placeholder="e.g. css3" value={courseId} onChange={e => setCourseId(e.target.value)} required />
        </div>
      )}

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>COURSE TITLE</label>
        <input className="input-field" placeholder="e.g. CSS3: Responsive Layouts" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} required />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>DESCRIPTION</label>
        <textarea className="input-field" placeholder="What will students learn?" value={courseDesc} onChange={e => setCourseDesc(e.target.value)} style={{ minHeight: '80px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>LANGUAGE</label>
          <select className="input-field" value={courseLanguage} onChange={e => setCourseLanguage(e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>LEVEL</label>
          <select className="input-field" value={courseLevel} onChange={e => setCourseLevel(e.target.value)}>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>PRICE</label>
          <input type="number" className="input-field" placeholder="25000" value={coursePrice} onChange={e => setCoursePrice(e.target.value)} required min="0" />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>CURRENCY</label>
          <select className="input-field" value={courseCurrency} onChange={e => setCourseCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>DURATION (weeks)</label>
          <input type="number" className="input-field" placeholder="4" value={courseDuration} onChange={e => setCourseDuration(e.target.value)} required min="1" />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label>Course Status</label>
        <select className="input-field" value={courseStatus} onChange={e => setCourseStatus(e.target.value)} required>
          <option value="draft">Draft (Work in Progress)</option>
          <option value="under_review">Submit for Review</option>
          <option value="active">Active (Published)</option>
        </select>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          When you are done editing, change to "Submit for Review". Admins will publish it to Active.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn btn-primary" disabled={actionLoading} style={{ flex: 1 }}>
          {actionLoading ? <Loader2 className="animate-spin" size={16} /> : isNew ? 'Create Course' : 'Save Settings'}
        </button>
        {isNew && <button type="button" className="btn btn-secondary" onClick={() => setActiveView('modules')}>Cancel</button>}
      </div>
    </form>
  )
}
