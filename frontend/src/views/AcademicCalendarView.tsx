import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, Video, Clock, ArrowRight } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import apiClient from '../apiClient';

interface AcademicCalendarViewProps {
  session: any;
}

export const AcademicCalendarView: React.FC<AcademicCalendarViewProps> = ({ session }) => {
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.courses.getUpcomingClasses(30).catch(() => []);
        setLiveClasses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session?.user?.id]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDay = (day: number) => {
    return liveClasses.filter(c => {
      const d = new Date(c.start_time);
      return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  };

  if (loading) return (
    <div style={{ padding: '24px' }}>
      <Skeleton height={60} borderRadius="8px" style={{ marginBottom: '24px' }} />
      <Skeleton height={400} borderRadius="12px" />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ height: '60px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', padding: '0 var(--space-4)', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={20} /> Back
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CalendarIcon size={28} style={{ color: 'var(--color-blue)' }} /> Academic Calendar
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Track live classes, deadlines, and events.</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
              <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}><ChevronLeft size={20} /></button>
              <span style={{ fontWeight: 'var(--weight-bold)', width: '120px', textAlign: 'center' }}>
                {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}><ArrowRight size={20} /></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border-default)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {/* Weekdays */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ background: 'var(--bg-secondary)', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {day}
              </div>
            ))}
            
            {/* Blank spaces before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: 'var(--bg-primary)', minHeight: '120px' }} />
            ))}
            
            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const events = getEventsForDay(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
              
              return (
                <div key={day} style={{ background: isToday ? 'rgba(41,214,232,0.05)' : 'var(--bg-primary)', minHeight: '120px', padding: '8px', borderTop: isToday ? '2px solid var(--color-cyan)' : 'none' }}>
                  <div style={{ fontWeight: 'bold', color: isToday ? 'var(--color-cyan)' : 'var(--text-secondary)', marginBottom: '8px' }}>{day}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {events.map((evt, idx) => (
                      <div key={idx} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 6px', borderRadius: '4px', fontSize: '11px', color: '#10B981', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Video size={10} /> Live Class</div>
                        <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', opacity: 0.8 }}><Clock size={10} /> {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Upcoming Action Items</h3>
            {liveClasses.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)' }}>
                No upcoming events found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {liveClasses.slice(0, 5).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                        <Video size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>{c.title}</h4>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{new Date(c.start_time).toLocaleString()}</p>
                      </div>
                    </div>
                    <button style={{ padding: '8px 16px', backgroundColor: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                      Join Class
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
