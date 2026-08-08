import React, { useState } from 'react'
import apiClient from '../../../apiClient'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import type { Module, Quiz } from '../../../types/models'

const toDateTimeLocalValue = (value?: string | null): string => {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const toIsoOrNull = (value: string): string | null => {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d.toISOString()
}

interface QuizBuilderProps {
  modules: Module[]
  selectedModuleId: string
  setSelectedModuleId: (id: string) => void
  fetchData: () => void
  setMessage: (msg: { type: 'success' | 'error', text: string }) => void
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  modules,
  selectedModuleId,
  setSelectedModuleId,
  fetchData,
  setMessage
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Quiz | null>(null)
  const [quizTitle, setQuizTitle] = useState('')
  const [quizScheduledAt, setQuizScheduledAt] = useState('')
  const [assessmentType, setAssessmentType] = useState('module_quiz')
  const [opensAt, setOpensAt] = useState('')
  const [closesAt, setClosesAt] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [passingScore, setPassingScore] = useState('70')
  const [maxAttempts, setMaxAttempts] = useState('')
  const [resultsReleased, setResultsReleased] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const resetForms = () => {
    setEditTarget(null)
    setQuizTitle('')
    setQuizScheduledAt('')
    setAssessmentType('module_quiz'); setOpensAt(''); setClosesAt(''); setDurationMinutes(''); setPassingScore('70'); setMaxAttempts(''); setResultsReleased(true)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this quiz? This cannot be undone.`)) return
    setActionLoading(true)
    try {
      await apiClient.instructorQuizzes.remove(id)
      setMessage({ type: 'success', text: 'Quiz deleted.' })
      fetchData()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const payload = { 
        module_id: selectedModuleId, 
        title: quizTitle, 
        scheduled_at: toIsoOrNull(quizScheduledAt)
        , assessment_type: assessmentType, opens_at: toIsoOrNull(opensAt), closes_at: toIsoOrNull(closesAt), duration_minutes: durationMinutes ? Number(durationMinutes) : null, passing_score: Number(passingScore), max_attempts: maxAttempts ? Number(maxAttempts) : null, results_released: resultsReleased
      }
      if (editTarget) {
        await apiClient.instructorQuizzes.update(editTarget.id, payload)
      } else {
        await apiClient.instructorQuizzes.create(payload)
      }
      setMessage({ type: 'success', text: 'Quiz saved.' })
      fetchData()
      resetForms()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <select className="input-field" value={selectedModuleId} onChange={e => setSelectedModuleId(e.target.value)}>
        {modules.map(mod => <option key={mod.id} value={mod.id}>M{mod.order_index}: {mod.title}</option>)}
      </select>
      
      <button className="btn btn-primary" onClick={() => { resetForms(); setShowForm(true); }} style={{ width: 'fit-content', display: 'flex', gap: '6px', padding: '6px 12px', fontSize: '0.8rem' }}>
        <Plus size={16} /> New Quiz
      </button>

      {showForm && (
        <form onSubmit={handleSaveQuiz} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4>{editTarget ? 'Edit Quiz' : 'Create Quiz'}</h4>
          <input className="input-field" placeholder="Quiz Title" value={quizTitle} onChange={e => setQuizTitle(e.target.value)} required />
          <input type="datetime-local" className="input-field" value={quizScheduledAt} onChange={e => setQuizScheduledAt(e.target.value)} aria-label="Schedule exam date/time (optional)" />
          <select className="input-field" value={assessmentType} onChange={e => setAssessmentType(e.target.value)}><option value="module_quiz">Module Quiz</option><option value="course_assessment">Course Assessment</option><option value="final_exam">Final Exam</option></select>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}><input type="datetime-local" className="input-field" value={opensAt} onChange={e => setOpensAt(e.target.value)} aria-label="Assessment opens" /><input type="datetime-local" className="input-field" value={closesAt} onChange={e => setClosesAt(e.target.value)} aria-label="Assessment closes" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}><input type="number" min="1" max="360" className="input-field" placeholder="Minutes" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} /><input type="number" min="0" max="100" className="input-field" placeholder="Pass mark" value={passingScore} onChange={e => setPassingScore(e.target.value)} /><input type="number" min="1" className="input-field" placeholder="Attempts" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)} /></div>
          <label style={{ fontSize: '.8rem' }}><input type="checkbox" checked={resultsReleased} onChange={e => setResultsReleased(e.target.checked)} /> Release results to students immediately</label>
          <small style={{ fontSize: '0.7rem', opacity: 0.7 }}>Use a final exam only for graduation/certificate assessment. A time window and duration are recommended for all formal exams.</small>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForms}>Cancel</button>
          </div>
        </form>
      )}

      {modules.find(m => m.id === selectedModuleId)?.quizzes?.map((qz: Quiz) => (
        <div key={qz.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.9rem' }}>{qz.title}</h4>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => { 
              setEditTarget(qz); 
              setQuizTitle(qz.title); 
              setQuizScheduledAt(toDateTimeLocalValue(qz.scheduled_at)); 
              const exam = qz as any; setAssessmentType(exam.assessment_type || 'module_quiz'); setOpensAt(toDateTimeLocalValue(exam.opens_at)); setClosesAt(toDateTimeLocalValue(exam.closes_at)); setDurationMinutes(exam.duration_minutes?.toString() || ''); setPassingScore(exam.passing_score?.toString() || '70'); setMaxAttempts(exam.max_attempts?.toString() || ''); setResultsReleased(exam.results_released ?? true);
              setShowForm(true); 
            }} className="badge badge-blue" style={{ cursor: 'pointer' }}>
              <Edit2 size={12} />
            </button>
            <button onClick={() => handleDelete(qz.id)} className="badge badge-danger" style={{ cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
