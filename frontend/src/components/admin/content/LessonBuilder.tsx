import React, { useState } from 'react'
import { supabase } from '../../../supabaseClient'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface LessonBuilderProps {
  modules: any[]
  selectedModuleId: string
  setSelectedModuleId: (id: string) => void
  fetchData: () => void
  setMessage: (msg: { type: 'success' | 'error', text: string }) => void
}

export const LessonBuilder: React.FC<LessonBuilderProps> = ({
  modules,
  selectedModuleId,
  setSelectedModuleId,
  fetchData,
  setMessage
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonVideo, setLessonVideo] = useState('')
  const [lessonOrder, setLessonOrder] = useState('1')
  const [actionLoading, setActionLoading] = useState(false)

  const resetForms = () => {
    setEditTarget(null)
    setLessonTitle('')
    setLessonContent('')
    setLessonVideo('')
    setLessonOrder('1')
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this lesson? This cannot be undone.`)) return
    setActionLoading(true)
    try {
      const { error } = await supabase.from('lessons').delete().eq('id', id)
      if (error) throw error
      setMessage({ type: 'success', text: 'Lesson deleted.' })
      fetchData()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const payload = { 
        module_id: selectedModuleId, 
        title: lessonTitle, 
        content: lessonContent, 
        video_url: lessonVideo || null, 
        order_index: parseInt(lessonOrder) 
      }
      if (editTarget) {
        const { error } = await supabase.from('lessons').update(payload).eq('id', editTarget.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('lessons').insert(payload)
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Lesson saved.' })
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
        <Plus size={16} /> New Lesson
      </button>

      {showForm && (
        <form onSubmit={handleSaveLesson} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4>{editTarget ? 'Edit Lesson' : 'Create Lesson'}</h4>
          <input className="input-field" placeholder="Lesson Title" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} required />
          <textarea className="input-field" placeholder="Lesson content..." value={lessonContent} onChange={e => setLessonContent(e.target.value)} required style={{ minHeight: '120px' }} />
          <input className="input-field" placeholder="YouTube Embed URL (optional)" value={lessonVideo} onChange={e => setLessonVideo(e.target.value)} />
          <input type="number" className="input-field" placeholder="Order Index" value={lessonOrder} onChange={e => setLessonOrder(e.target.value)} required />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForms}>Cancel</button>
          </div>
        </form>
      )}

      {modules.find(m => m.id === selectedModuleId)?.lessons?.sort((a: any, b: any) => a.order_index - b.order_index).map((ls: any) => (
        <div key={ls.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.9rem' }}>L{ls.order_index}: {ls.title}</h4>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => { 
              setEditTarget(ls); 
              setLessonTitle(ls.title); 
              setLessonContent(ls.content); 
              setLessonVideo(ls.video_url || ''); 
              setLessonOrder(ls.order_index.toString()); 
              setShowForm(true); 
            }} className="badge badge-blue" style={{ cursor: 'pointer' }}>
              <Edit2 size={12} />
            </button>
            <button onClick={() => handleDelete(ls.id)} className="badge badge-danger" style={{ cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
