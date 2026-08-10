import { useState, useEffect } from 'react';
import { adminCourseAPI } from '../../apiClient';
import { useToast } from '../../contexts/ToastContext';
import { BookOpen, Edit, Plus, Eye, EyeOff, UploadCloud, X, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';


export const AdminCourseManagement = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create course state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ id: '', title: '', description: '', price: 0, level: 'Beginner', delivery_mode: 'hybrid' });
  const [createLoading, setCreateLoading] = useState(false);

  // Upload video state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<any | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setCourses(await adminCourseAPI.list());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await adminCourseAPI.update(id, { status: newStatus, is_active: newStatus === 'published' });
      fetchCourses();
      showToast(`Course ${newStatus === 'published' ? 'published' : 'unpublished'}.`, 'success');
    } catch (e) {
      console.error('Toggle failed', e);
      showToast('Could not update course status.', 'error');
    }
  };

  const handleEdit = async (course: any) => {
    const price = window.prompt('Course price in Naira. Enter 0 for a free course.', String(course.price ?? 0));
    if (price === null) return;
    const duration = window.prompt('Course duration in weeks. Leave empty if it is not set.', course.duration_weeks?.toString() || '');
    if (duration === null) return;
    const level = window.prompt('Level (Beginner, Intermediate, or Advanced).', course.level || 'Beginner');
    if (level === null) return;
    const mode = window.prompt('Delivery mode: live, self_paced, or hybrid.', course.delivery_mode || 'hybrid');
    if (mode === null) return;
    try {
      const parsedPrice = Number(price);
      const parsedWeeks = duration.trim() ? Number(duration) : null;
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || (parsedWeeks !== null && (!Number.isInteger(parsedWeeks) || parsedWeeks < 1))) throw new Error('Enter a valid price and whole number of weeks.');
      await adminCourseAPI.update(course.id, { price: parsedPrice, duration_weeks: parsedWeeks, level: level.trim() || 'Beginner', delivery_mode: mode.trim().toLowerCase() });
      fetchCourses();
      showToast('Course settings saved.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not save course settings.', 'error');
    }
  };

  const handleDelete = async (courseId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) return;
    try {
      await adminCourseAPI.delete(courseId);
      showToast('Course deleted successfully.', 'success');
      fetchCourses();
    } catch (e: any) {
      showToast(e.message || 'Failed to delete course.', 'error');
    }
  };

  const submitCreate = async () => {
    if (!createForm.id || !createForm.title) {
      showToast('Course ID and Title are required.', 'error');
      return;
    }
    setCreateLoading(true);
    try {
      await adminCourseAPI.create(createForm);
      showToast('Course created successfully.', 'success');
      setShowCreate(false);
      setCreateForm({ id: '', title: '', description: '', price: 0, level: 'Beginner', delivery_mode: 'hybrid' });
      fetchCourses();
    } catch (e: any) {
      showToast(e.message || 'Failed to create course.', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const submitUpload = async () => {
    if (!uploadFile || !uploadTarget) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${uploadTarget.id}/${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error } = await supabase.storage
        .from('course-videos')
        .upload(filePath, uploadFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      setUploadProgress(100);

      if (error) throw error;
      
      showToast('Video uploaded successfully!', 'success');
      setShowUpload(false);
      setUploadFile(null);
      setUploadTarget(null);
    } catch (e: any) {
      showToast(e.message || 'Failed to upload video.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Course Management</h2>
          <p className="text-[var(--muted)]">Create, edit, and publish academy courses.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90">
          <Plus size={18} /> New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[var(--surface-dark)] border border-[var(--border)] rounded-2xl text-[var(--muted)]">
            No courses found. Click "New Course" to get started.
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="group relative bg-[var(--surface-dark)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              {/* Course Thumbnail Placeholder */}
              <div className="h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center relative">
                <BookOpen size={48} className="text-[var(--primary)] opacity-50" />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-sm backdrop-blur-md ${course.status === 'published' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                    {course.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>
              </div>
              
              {/* Course Details */}
              <div className="p-5">
                <div className="text-xs text-[var(--primary)] font-bold mb-1 uppercase tracking-wider">{course.id}</div>
                <h3 className="text-xl font-bold mb-2 line-clamp-1" title={course.title}>{course.title}</h3>
                
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-[var(--muted)] mb-5">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider">Level</span>
                    <span className="font-semibold text-[var(--text-primary)] capitalize">{course.level || 'All'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider">Price</span>
                    <span className="font-semibold text-blue-400">
                      {course.price ? `${course.currency || '₦'}${course.price.toLocaleString()}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider">Mode</span>
                    <span className="font-semibold text-[var(--text-primary)] capitalize">{course.delivery_mode || 'Hybrid'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider">Duration</span>
                    <span className="font-semibold text-[var(--text-primary)]">{course.duration_weeks ? `${course.duration_weeks} weeks` : 'N/A'}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 justify-between pt-4 border-t border-[var(--border)]">
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(course)} className="p-2 rounded-lg bg-[var(--surface)] hover:bg-blue-500/20 text-[var(--text-primary)] hover:text-blue-400 transition-colors tooltip" title="Edit course details">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => { setUploadTarget(course); setShowUpload(true); }} className="p-2 rounded-lg bg-[var(--surface)] hover:bg-green-500/20 text-[var(--text-primary)] hover:text-green-400 transition-colors tooltip" title="Upload Video">
                      <UploadCloud size={16} />
                    </button>
                    <button onClick={() => handleTogglePublish(course.id, course.status)} className="p-2 rounded-lg bg-[var(--surface)] hover:bg-purple-500/20 text-[var(--text-primary)] hover:text-purple-400 transition-colors tooltip" title={course.status === 'published' ? 'Unpublish' : 'Publish'}>
                      {course.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  <button onClick={() => handleDelete(course.id, course.title)} className="p-2 rounded-lg bg-[var(--surface)] hover:bg-red-500/20 text-[var(--muted)] hover:text-red-400 transition-colors tooltip" title="Delete Course">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div
          onClick={() => setShowCreate(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>Create New Course</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Course ID (e.g. wd101)</label>
                  <input
                    type="text"
                    value={createForm.id}
                    onChange={(e) => setCreateForm({...createForm, id: e.target.value})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[var(--color-blue)]"
                    placeholder="wd101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Title</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[var(--color-blue)]"
                    placeholder="Web Development 101"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[var(--color-blue)]"
                  placeholder="Learn the basics..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Price (₦)</label>
                  <input
                    type="number"
                    value={createForm.price}
                    onChange={(e) => setCreateForm({...createForm, price: Number(e.target.value)})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[var(--color-blue)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Level</label>
                  <select
                    value={createForm.level}
                    onChange={(e) => setCreateForm({...createForm, level: e.target.value})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[var(--color-blue)]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Mode</label>
                  <select
                    value={createForm.delivery_mode}
                    onChange={(e) => setCreateForm({...createForm, delivery_mode: e.target.value})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[var(--color-blue)]"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="self_paced">Self Paced</option>
                    <option value="live">Live Classes</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              <button onClick={() => setShowCreate(false)} className="btn" style={{ flex: 1, border: '1px solid var(--border-default)', background: 'none', color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={submitCreate} className="btn btn-primary bg-[var(--color-blue)] text-white" style={{ flex: 1 }} disabled={createLoading}>
                {createLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div
          onClick={() => setShowUpload(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>Upload Course Video</h3>
              <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-[var(--muted)] mb-2">Target Course: <span className="text-[var(--text-primary)] font-bold">{uploadTarget?.title}</span></div>
              <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Select Video File (.mp4, .mkv)</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-[var(--text-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-blue)] file:text-white hover:file:bg-blue-600"
              />
            </div>
            
            {uploading && (
              <div className="w-full bg-[var(--bg-main)] rounded-full h-2.5 mb-4">
                <div className="bg-[var(--color-blue)] h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              <button onClick={() => setShowUpload(false)} className="btn" style={{ flex: 1, border: '1px solid var(--border-default)', background: 'none', color: 'var(--text-primary)' }} disabled={uploading}>Cancel</button>
              <button onClick={submitUpload} className="btn btn-primary bg-green-500 text-white" style={{ flex: 1 }} disabled={uploading || !uploadFile}>
                {uploading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Upload Video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
