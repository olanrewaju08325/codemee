import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, CheckCircle, Circle, LayoutPanelLeft, 
  PanelRight, Bookmark, StickyNote, Sparkles, Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import apiClient from '../apiClient';
import { Button } from '../components/ui/Button';

interface CourseViewProps {
  session: any;
  selectedCourseId: string;
  onNavigate: (view: string) => void;
}

export const CourseView: React.FC<CourseViewProps> = ({ 
  session, selectedCourseId, onNavigate
}) => {
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  
  // Layout states
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<'ai' | 'notes' | 'bookmarks'>('notes');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Local storage states
  const [notes, setNotes] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    // Load local storage data
    const savedNotes = localStorage.getItem(`codeme_notes_${selectedCourseId}`);
    if (savedNotes) setNotes(savedNotes);
    
    const savedBookmarks = localStorage.getItem(`codeme_bookmarks_${selectedCourseId}`);
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const fetchData = async () => {
      try {
        setLoading(true);
        const [modulesList, progressData] = await Promise.all([
          apiClient.courses.getCourseModules(selectedCourseId),
          apiClient.courses.getProgress()
        ]);
        setModules(modulesList);
        setProgress(progressData);

        if (modulesList.length > 0) {
          const moduleIds = modulesList.map((m: any) => m.id);
          const lessonsData = await Promise.all(
            moduleIds.map((id: string) => apiClient.courses.getModuleLessons(id))
          );
          const allLessons = lessonsData.flat();
          setLessons(allLessons);

          // Determine starting lesson (from local storage or first uncompleted)
          const lastViewed = localStorage.getItem(`codeme_last_lesson_${selectedCourseId}`);
          if (lastViewed && allLessons.some(l => l.id === lastViewed)) {
            setActiveLessonId(lastViewed);
          } else {
            const firstUncompleted = allLessons.find(l => !progressData.some((p: any) => p.lesson_id === l.id));
            setActiveLessonId(firstUncompleted?.id || allLessons[0]?.id);
          }

          // Expand the module of the active lesson
          const initialExpanded: Record<string, boolean> = {};
          modulesList.forEach((m: any) => {
            initialExpanded[m.id] = true;
          });
          setExpandedModules(initialExpanded);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCourseId, session]);

  useEffect(() => {
    const fetchLessonDetail = async () => {
      if (!activeLessonId) return;
      try {
        setLessonLoading(true);
        const detail = await apiClient.courses.getLesson(activeLessonId);
        setActiveLesson(detail);
        localStorage.setItem(`codeme_last_lesson_${selectedCourseId}`, activeLessonId);
      } catch (e) {
        console.error(e);
      } finally {
        setLessonLoading(false);
      }
    };
    fetchLessonDetail();
  }, [activeLessonId, selectedCourseId]);

  const saveNotes = (val: string) => {
    setNotes(val);
    localStorage.setItem(`codeme_notes_${selectedCourseId}`, val);
  };

  const toggleBookmark = () => {
    if (!activeLessonId) return;
    let newBookmarks = [...bookmarks];
    if (newBookmarks.includes(activeLessonId)) {
      newBookmarks = newBookmarks.filter(id => id !== activeLessonId);
    } else {
      newBookmarks.push(activeLessonId);
    }
    setBookmarks(newBookmarks);
    localStorage.setItem(`codeme_bookmarks_${selectedCourseId}`, JSON.stringify(newBookmarks));
  };

  const markComplete = async () => {
    if (!activeLessonId) return;
    try {
      await apiClient.courses.markLessonComplete(activeLessonId);
      setProgress([...progress, { lesson_id: activeLessonId }]);
      // Go to next lesson
      const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
      if (currentIndex < lessons.length - 1) {
        setActiveLessonId(lessons[currentIndex + 1].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isCompleted = (id: string) => progress.some(p => p.lesson_id === id);

  if (loading) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Left Sidebar (Navigation) */}
      <AnimatePresence>
        {leftOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            style={{ 
              borderRight: '1px solid var(--border-default)', 
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex', flexDirection: 'column',
              flexShrink: 0, overflow: 'hidden'
            }}
          >
            <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <button onClick={() => onNavigate(`courses/${selectedCourseId}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                <ChevronLeft size={20} />
              </button>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Course Curriculum</h3>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
              {modules.map((m, idx) => {
                const modLessons = lessons.filter(l => l.module_id === m.id);
                const isExpanded = expandedModules[m.id];
                
                return (
                  <div key={m.id} style={{ marginBottom: 'var(--space-4)' }}>
                    <div 
                      onClick={() => setExpandedModules({...expandedModules, [m.id]: !isExpanded})}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: 'var(--space-2)' }}
                    >
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)' }}>Module {idx + 1}: {m.title}</h4>
                    </div>
                    
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {modLessons.map((l: any) => {
                          const isActive = activeLessonId === l.id;
                          const completed = isCompleted(l.id);
                          return (
                            <div 
                              key={l.id}
                              onClick={() => setActiveLessonId(l.id)}
                              style={{ 
                                display: 'flex', alignItems: 'center', gap: 'var(--space-3)', 
                                padding: 'var(--space-2) var(--space-3)',
                                borderRadius: 'var(--radius-md)',
                                backgroundColor: isActive ? 'var(--color-blue)' : 'transparent',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {completed ? <CheckCircle size={16} color={isActive ? 'white' : '#10B981'} /> : <Circle size={16} />}
                              <span style={{ fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Top bar */}
        <div style={{ 
          height: '60px', borderBottom: '1px solid var(--border-default)', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 var(--space-4)', backgroundColor: 'var(--bg-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button onClick={() => setLeftOpen(!leftOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <LayoutPanelLeft size={20} />
            </button>
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>
              {activeLesson?.title || 'Loading...'}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Button variant="outline" size="sm" onClick={toggleBookmark} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: bookmarks.includes(activeLessonId || '') ? 'var(--color-blue)' : 'var(--text-secondary)' }}>
              <Bookmark size={16} /> <span className="hidden-mobile">Bookmark</span>
            </Button>
            <button onClick={() => setRightOpen(!rightOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px' }}>
              <PanelRight size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '800px', paddingBottom: '100px' }}>
            {lessonLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}><Loader2 className="animate-spin" size={32} color="var(--color-blue)" /></div>
            ) : activeLesson ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                
                {/* Embedded Video (if any) */}
                {activeLesson.video_url && (
                  <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'black', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', overflow: 'hidden' }}>
                    <iframe 
                      src={activeLesson.video_url} 
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}

                <div className="markdown-body" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  <ReactMarkdown>{activeLesson.content || 'No content provided for this lesson.'}</ReactMarkdown>
                </div>
                
                {/* Actions at bottom */}
                <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button variant="outline" onClick={() => {
                    const currentIndex = lessons.findIndex(l => l.id === activeLessonId);
                    if (currentIndex > 0) setActiveLessonId(lessons[currentIndex - 1].id);
                  }} disabled={lessons.findIndex(l => l.id === activeLessonId) <= 0}>
                    Previous
                  </Button>

                  <Button 
                    onClick={markComplete}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: isCompleted(activeLessonId!) ? 'var(--bg-secondary)' : 'var(--color-blue)', color: isCompleted(activeLessonId!) ? 'var(--text-primary)' : 'white' }}
                  >
                    {isCompleted(activeLessonId!) ? <><CheckCircle size={18} color="#10B981" /> Completed</> : 'Mark Complete'}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '100px' }}>Select a lesson to begin.</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar (Context Panel) */}
      <AnimatePresence>
        {rightOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            style={{ 
              borderLeft: '1px solid var(--border-default)', 
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex', flexDirection: 'column',
              flexShrink: 0, overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)' }}>
              {[
                { id: 'notes', icon: <StickyNote size={16} />, label: 'Notes' },
                { id: 'bookmarks', icon: <Bookmark size={16} />, label: 'Saved' },
                { id: 'ai', icon: <Sparkles size={16} />, label: 'AI Tutor' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveRightTab(tab.id as any)}
                  style={{
                    flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                    color: activeRightTab === tab.id ? 'var(--color-blue)' : 'var(--text-secondary)',
                    borderBottom: activeRightTab === tab.id ? '2px solid var(--color-blue)' : '2px solid transparent'
                  }}
                >
                  {tab.icon}
                  <span style={{ fontSize: '10px', fontWeight: 'var(--weight-bold)', textTransform: 'uppercase' }}>{tab.label}</span>
                </button>
              ))}
            </div>

            <div style={{ flex: 1, padding: 'var(--space-4)', overflowY: 'auto' }}>
              {activeRightTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-2)' }}>Personal Notes</h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>These notes are saved automatically to your device.</p>
                  <textarea 
                    value={notes}
                    onChange={(e) => saveNotes(e.target.value)}
                    placeholder="Type your notes here..."
                    style={{ flex: 1, width: '100%', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', resize: 'none', outline: 'none', fontSize: 'var(--text-sm)', fontFamily: 'inherit' }}
                  />
                </div>
              )}

              {activeRightTab === 'bookmarks' && (
                <div>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Bookmarked Lessons</h4>
                  {bookmarks.length === 0 ? (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>No bookmarks yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {bookmarks.map(id => {
                        const l = lessons.find(lx => lx.id === id);
                        if (!l) return null;
                        return (
                          <div key={id} onClick={() => setActiveLessonId(id)} style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: '1px solid var(--border-default)' }}>
                            <h5 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', marginBottom: '4px' }}>{l.title}</h5>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeRightTab === 'ai' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Sparkles size={32} style={{ marginBottom: '16px' }} />
                  <p style={{ fontSize: 'var(--text-sm)' }}>AI Tutor integration is active in the main dashboard.<br/>(Lesson context AI coming in Phase 5)</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
