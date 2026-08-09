import { useState, useEffect } from 'react';
import { adminCourseAPI } from '../../apiClient';
import { useToast } from '../../contexts/ToastContext';
import { BookOpen, Edit, Plus, Eye, EyeOff } from 'lucide-react';


export const AdminCourseManagement = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-center">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Course Management</h2>
          <p className="text-[var(--muted)]">Create, edit, and publish academy courses.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90">
          <Plus size={18} /> New Course
        </button>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--surface-dark)] border-b border-[var(--border)]">
            <tr>
              <th className="p-4 font-semibold text-[var(--muted)]">Course</th>
              <th className="p-4 font-semibold text-[var(--muted)]">Level</th>
              <th className="p-4 font-semibold text-[var(--muted)]">Price / duration</th>
              <th className="p-4 font-semibold text-[var(--muted)]">Status</th>
              <th className="p-4 font-semibold text-[var(--muted)] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--muted)]">No courses found.</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-dark)] transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">{course.title}</div>
                      <div className="text-sm text-[var(--muted)]">{course.id}</div>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-primary)] capitalize">{course.level || 'All Levels'}</td>
                  <td className="p-4 font-mono text-[var(--text-primary)]">
                    {course.price ? `${course.currency || '₦'} ${course.price.toLocaleString()}` : 'Free'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${course.status === 'published' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                      {course.status || 'draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleTogglePublish(course.id, course.status)}
                        className="p-2 rounded hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text-primary)] transition-colors"
                        title={course.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {course.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button onClick={() => handleEdit(course)} className="p-2 rounded hover:bg-[var(--surface)] text-[var(--muted)] hover:text-blue-500 transition-colors" title="Edit price, duration, level and delivery mode">
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
