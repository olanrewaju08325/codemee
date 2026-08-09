import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Lock, CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';
import apiClient from '../apiClient';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Grid } from '../components/ui/Grid';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface CourseCatalogViewProps {
  session: any;
  onNavigate: (view: string) => void;
}

export const CourseCatalogView: React.FC<CourseCatalogViewProps> = ({ session, onNavigate }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [coursesData, progressData] = await Promise.all([
          apiClient.courses.getCourses().catch(() => []),
          apiClient.courses.getProgress().catch(() => [])
        ]);
        
        setCourses(coursesData);
        setEnrollments(progressData);
      } catch (error) {
        console.error('Failed to load catalog:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [session?.user?.id]);

  const getCourseStatus = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    if (enrollment) {
      if (enrollment.progress_percentage === 100) return 'completed';
      return 'enrolled';
    }
    // Business rules: If it's not wd101 and the user hasn't completed wd101, it's locked (naive check for now)
    if (courseId !== 'wd101') {
      const wd101 = enrollments.find(e => e.course_id === 'wd101');
      if (!wd101 || wd101.progress_percentage < 100) return 'locked';
    }
    return 'available';
  };

  const categories = ['All', 'Frontend', 'Backend', 'Data Science', 'Design'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // In a real app we'd filter by course.category, mocking it for now since schema might vary
    const matchesCategory = activeCategory === 'All' || true; 

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header section */}
      <div style={{ marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)' }}>
          Course Catalog
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
          Discover professional learning paths designed to take you from beginner to job-ready.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--space-4)', 
        marginBottom: 'var(--space-6)',
        '@media (min-width: 768px)': { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' } 
      } as any}>
        
        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search courses..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-primary)',
              fontSize: 'var(--text-sm)',
              outline: 'none'
            }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activeCategory === cat ? 'var(--color-blue)' : 'var(--bg-secondary)',
                color: activeCategory === cat ? 'white' : 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height={350} borderRadius="var(--radius-lg)" />)}
        </Grid>
      ) : filteredCourses.length === 0 ? (
        <EmptyState 
          title="No courses found" 
          description="Try adjusting your search or category filters."
          icon={<Search size={40} />}
        />
      ) : (
        <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="lg">
          {filteredCourses.map((course, index) => {
            const status = getCourseStatus(course.id);
            const isLocked = status === 'locked';
            const isEnrolled = status === 'enrolled' || status === 'completed';

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: 0,
                  overflow: 'hidden',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.75 : 1,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onClick={() => !isLocked && onNavigate(`courses/${course.id}`)}
                onMouseOver={(e) => {
                  if (!isLocked) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLocked) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }
                }}
                >
                  {/* Thumbnail Placeholder / Image */}
                  <div style={{ height: '160px', backgroundColor: 'var(--color-blue)', position: 'relative', overflow: 'hidden' }}>
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                        <BookOpen size={64} color="white" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px', 
                      padding: '4px 10px', 
                      borderRadius: '999px',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--weight-bold)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {isLocked && <><Lock size={12} /> Locked</>}
                      {status === 'available' && <><TrendingUp size={12} /> Available</>}
                      {status === 'enrolled' && <><BookOpen size={12} /> Enrolled</>}
                      {status === 'completed' && <><CheckCircle size={12} color="#10B981" /> Completed</>}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)', color: 'var(--text-primary)' }}>
                        {course.title}
                      </h3>
                      {!isEnrolled && (
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', color: 'var(--color-blue)' }}>
                          {course.price === 0 ? 'FREE' : `₦${course.price?.toLocaleString()}`}
                        </span>
                      )}
                    </div>
                    
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description || 'Comprehensive programming course to level up your skills.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-default)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>
                        <Clock size={14} />
                        <span>12 Weeks</span>
                      </div>
                      
                      <Button 
                        variant={isEnrolled ? "primary" : isLocked ? "outline" : "primary"} 
                        size="sm"
                        disabled={isLocked}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {isEnrolled ? 'Continue' : isLocked ? 'Locked' : 'View Details'}
                        {!isLocked && <ArrowRight size={14} />}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </Grid>
      )}
    </div>
  );
};
