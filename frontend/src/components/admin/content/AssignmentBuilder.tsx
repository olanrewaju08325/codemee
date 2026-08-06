import React, { useState } from 'react'
import { supabase } from '../../../supabaseClient'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'

interface AssignmentBuilderProps {
  modules: any[]
  selectedModuleId: string
  setSelectedModuleId: (id: string) => void
  fetchData: () => void
  setMessage: (msg: { type: 'success' | 'error', text: string }) => void
}

export const AssignmentBuilder: React.FC<AssignmentBuilderProps> = ({
  modules,
  selectedModuleId,
  setSelectedModuleId,
  fetchData,
  setMessage
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const resetForms = () => {
    setEditTarget(null)
    setProjectTitle('')
    setProjectDesc('')
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this assignment? This cannot be undone.`)) return
    setActionLoading(true)
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id)
      if (error) throw error
      setMessage({ type: 'success', text: 'Assignment deleted.' })
      fetchData()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      const payload = { module_id: selectedModuleId, title: projectTitle, description: projectDesc }
      if (editTarget) {
        const { error } = await supabase.from('assignments').update(payload).eq('id', editTarget.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('assignments').insert(payload)
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Assignment saved.' })
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
        <Plus size={16} /> New Assignment
      </button>

      {showForm && (
        <form onSubmit={handleSaveAssignment} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4>{editTarget ? 'Edit Assignment' : 'Create Assignment'}</h4>
          <input className="input-field" placeholder="Assignment Title" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} required />
          <textarea className="input-field" placeholder="Description/Scenario..." value={projectDesc} onChange={e => setProjectDesc(e.target.value)} required style={{ minHeight: '100px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'Save'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForms}>Cancel</button>
          </div>
        </form>
      )}

      {modules.find(m => m.id === selectedModuleId)?.assignments?.map((asg: any) => (
        <div key={asg.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '0.9rem' }}>{asg.title}</h4>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => { 
              setEditTarget(asg); 
              setProjectTitle(asg.title); 
              setProjectDesc(asg.description); 
              setShowForm(true); 
            }} className="badge badge-blue" style={{ cursor: 'pointer' }}>
              <Edit2 size={12} />
            </button>
            <button onClick={() => handleDelete(asg.id)} className="badge badge-danger" style={{ cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
