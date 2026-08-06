import React, { useState } from 'react'
import { supabase } from '../../../supabaseClient'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface ModuleBuilderProps {
  modules: any[]
  selectedCourseId: string
  fetchData: () => void
  setMessage: (msg: { type: 'success' | 'error', text: string }) => void
}

export const ModuleBuilder: React.FC<ModuleBuilderProps> = ({
  modules,
  selectedCourseId,
  fetchData,
  setMessage
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleOrder, setModuleOrder] = useState('1')
  const [actionLoading, setActionLoading] = useState(false)

  const resetForms = () => {
    setEditTarget(null)
    setModuleTitle('')
    setModuleOrder('1')
    setShowForm(false)
  }

  const handlePublishToggle = async (moduleId: string, currentStatus: boolean) => {
    setActionLoading(true)
    try {
      const { error } = await supabase.from('modules').update({ is_published: !currentStatus }).eq('id', moduleId)
      if (error) throw error
      fetchData()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this module? This cannot be undone.`)) return
    setActionLoading(true)
    try {
      const { error } = await supabase.from('modules').delete().eq('id', id)
      if (error) throw error
      setMessage({ type: 'success', text: 'Module deleted.' })
      fetchData()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      if (editTarget) {
        const { error } = await supabase.from('modules').update({ title: moduleTitle, order_index: parseInt(moduleOrder) }).eq('id', editTarget.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('modules').insert({ course_id: selectedCourseId, title: moduleTitle, order_index: parseInt(moduleOrder) })
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Module saved.' })
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
      <button className="btn btn-primary" onClick={() => { resetForms(); setShowForm(true); }} style={{ width: 'fit-content', display: 'flex', gap: '6px', padding: '6px 12px', fontSize: '0.8rem' }}>
        <Plus size={16} /> New Module
      </button>

      {showForm && (
        <form onSubmit={handleSaveModule} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4>{editTarget ? 'Edit Module' : 'Create Module'}</h4>
          <input className="input-field" placeholder="Module Title" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} required />
          <input type="number" className="input-field" placeholder="Order Index (1, 2, 3...)" value={moduleOrder} onChange={e => setModuleOrder(e.target.value)} required />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForms}>Cancel</button>
          </div>
        </form>
      )}

      {modules.map(mod => (
        <div key={mod.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem' }}>M{mod.order_index}: {mod.title}</h4>
            <span style={{ fontSize: '0.7rem', color: mod.is_published ? 'var(--color-success)' : 'var(--text-secondary)' }}>
              {mod.is_published ? '✓ Published' : 'Draft'} · {mod.lessons?.length || 0} lessons
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => handlePublishToggle(mod.id, mod.is_published)} className="badge" style={{ cursor: 'pointer' }}>
              {mod.is_published ? 'Unpublish' : 'Publish'}
            </button>
            <button onClick={() => { setEditTarget(mod); setModuleTitle(mod.title); setModuleOrder(mod.order_index.toString()); setShowForm(true); }} className="badge badge-blue" style={{ cursor: 'pointer' }}>
              <Edit2 size={12} />
            </button>
            <button onClick={() => handleDelete(mod.id)} className="badge badge-danger" style={{ cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
