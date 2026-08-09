import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { coursesAPI } from '../apiClient'
import {
  Code2, Monitor, Award, ChevronRight, UserPlus,
  Zap, Star, CheckCircle,
  Send, Loader2, X, GraduationCap, Users, Clock, Video, Layout, Palette,
  Braces, Atom, Server, Layers3, BarChart3, BrainCircuit, CalendarDays,
  UsersRound, Timer, KeyRound, PartyPopper
} from 'lucide-react'
import { ThemeSwitcher } from '../components/ThemeSwitcher'

interface LandingViewProps {
  onNavigateToAuth: () => void
}

const COURSES = [
  { id: 'wd101', title: 'HTML Fundamentals', level: 'Beginner', price: 25000, weeks: 6, tag: 'Most Popular' },
  { id: 'css', title: 'CSS & Responsive Design', level: 'Beginner', price: 25000, weeks: 6, tag: '' },
  { id: 'js', title: 'JavaScript Programming', level: 'Intermediate', price: 30000, weeks: 8, tag: '' },
  { id: 'react', title: 'React Framework', level: 'Intermediate', price: 35000, weeks: 10, tag: 'Popular' },
  { id: 'backend', title: 'Backend Development', level: 'Intermediate', price: 40000, weeks: 12, tag: '' },
  { id: 'fullstack', title: 'Full Stack Bootcamp', level: 'Advanced', price: 60000, weeks: 16, tag: 'Best Value' },
  { id: 'analytics', title: 'Data Analytics', level: 'Beginner', price: 35000, weeks: 8, tag: '' },
  { id: 'science', title: 'Data Science & AI', level: 'Advanced', price: 50000, weeks: 12, tag: '' },
]

const COURSE_ICONS: Record<string, React.ElementType> = {
  wd101: Layout, css: Palette, js: Braces, react: Atom, backend: Server,
  fullstack: Layers3, analytics: BarChart3, science: BrainCircuit,
}

const money = (value: unknown) => {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? `₦${amount.toLocaleString('en-NG')}` : 'Price on application'
}

const TESTIMONIALS = [
  { name: 'Course delivery', state: 'Live, self-paced, or hybrid', text: 'The delivery format, schedule, and access period are clearly set for each course.', rating: 5 },
  { name: 'Payment verification', state: 'Manual review', text: 'Submit your receipt or transfer reference and an admin verifies payment before access is activated.', rating: 5 },
  { name: 'Academic support', state: 'Course-specific', text: 'Teachers answer academic questions for the courses assigned to them.', rating: 5 },
  { name: 'Certificate eligibility', state: 'Completion-based', text: 'Certificates are issued when the requirements of the relevant course have been met.', rating: 5 },
]

const FEATURES = [
  { icon: Monitor, color: 'var(--color-blue)', bg: 'rgba(12,74,140,0.2)', title: 'Practical Learning', desc: 'Follow structured lessons, complete course work, and build skills at a steady pace.' },
  { icon: Award, color: 'var(--color-purple)', bg: 'rgba(139,47,166,0.2)', title: 'Course Certificates', desc: 'Eligible learners can receive a verifiable certificate after meeting course requirements.' },
  { icon: Video, color: 'var(--color-cyan)', bg: 'rgba(41,214,232,0.2)', title: 'Flexible Delivery', desc: 'Courses may be live, self-paced, or hybrid. Check each course for its current format.' },
  { icon: Users, color: '#10B981', bg: 'rgba(16,185,129,0.2)', title: 'Learning Support', desc: 'Ask academic questions through your course and contact academy support when needed.' },
  { icon: Zap, color: '#F59E0B', bg: 'rgba(245,158,11,0.2)', title: 'CodeMe AI', desc: 'Where enabled, CodeMe AI provides guided help while you learn.' },
  { icon: GraduationCap, color: '#EC4899', bg: 'rgba(236,72,153,0.2)', title: 'Instructor-Led Courses', desc: 'Learn with course materials and guidance from the instructors assigned to your programme.' },
]

export const LandingView: React.FC<LandingViewProps> = ({ onNavigateToAuth }) => {
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applyForm, setApplyForm] = useState({ full_name: '', email: '', phone: '', course_id: 'wd101' })
  const [applyLoading, setApplyLoading] = useState(false)
  const [applySuccess, setApplySuccess] = useState(false)
  const [courses, setCourses] = useState<any[]>(COURSES)

  useEffect(() => {
    // Fetch live pricing from DB
    coursesAPI.getCourses().then(data => {
      if (data && data.length > 0) {
        setCourses(data.map((course: any) => {
          const fallback = COURSES.find(item => item.id === course.id)
          return {
            ...fallback,
            ...course,
            price: course.price ?? 0,
            weeks: course.duration_weeks ?? course.weeks,
            level: course.level ?? 'All levels',
            tag: course.display_tag ?? '',
          }
        }))
      }
    }).catch(err => {
        console.error("Failed to load courses:", err)
    })
  }, [])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setApplyLoading(true)
    try {
      // In a real scenario, this would use a public endpoint in apiClient
      // Since it's a landing page and user might not be logged in, we use Supabase direct for now
      const { supabase } = await import('../supabaseClient')
      const { error } = await supabase.from('enrollment_applications').insert({
        full_name: applyForm.full_name,
        email: applyForm.email,
        phone: applyForm.phone,
        course_id: applyForm.course_id,
        status: 'pending',
      })
      if (error) throw error
      setApplySuccess(true)
    } catch (e: any) {
      alert(e.message || 'Error submitting. Please try again.')
    } finally {
      setApplyLoading(false)
    }
  }

  return (
    <div className="full-screen-view" style={{ overflowY: 'auto', display: 'block', height: '100%' }}>

      {/* ── Sticky Navbar ── */}
      <nav className="landing-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'var(--bg-app)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/codeme.jpg" alt="CodeMe Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', border: '2px solid var(--primary)' }} />
          <h1 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.2rem', fontWeight: 900, letterSpacing: '0.5px', margin: 0, color: 'var(--text-primary)' }}>CodeMe Academy</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <ThemeSwitcher />
          <button className="btn btn-secondary" onClick={onNavigateToAuth} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Sign In
          </button>
          <button className="btn btn-secondary landing-create-account" onClick={() => { window.location.hash = '#/auth?mode=signup' }} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Create account
          </button>
          <button className="btn btn-primary" onClick={() => setShowApplyModal(true)} style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Apply Now <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '80px 20px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} style={{ position: 'relative', zIndex: 1, maxWidth: '820px', margin: '0 auto' }}>
          <span className="badge badge-purple" style={{ marginBottom: '20px', padding: '8px 18px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Technology learning for ambitious people
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3.8rem)', fontWeight: 900, fontFamily: 'var(--font-headings)', lineHeight: 1.1, marginBottom: '24px' }}>
            Learn <span className="gradient-text">technology skills</span><br />at your own pace or with a cohort
          </h2>
          <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 40px' }}>
            Explore practical technology courses with clear learning paths, instructor-led cohorts, and self-paced options.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setShowApplyModal(true)} style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} /> Apply to Enroll — Free
            </button>
            <button className="btn btn-secondary" onClick={onNavigateToAuth} style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
              Student Login
            </button>
            <button className="btn btn-secondary" onClick={() => { window.location.hash = '#/auth?mode=signup' }} style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px' }}>
              Create account
            </button>
          </div>
          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {[['Live', 'Cohorts'], ['Self-paced', 'Options'], ['Hybrid', 'Learning'], ['Free', 'to Apply']].map(([val, lbl]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)' }}>{val}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{lbl}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '60px 20px', backgroundColor: 'rgba(0,0,0,0.25)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800 }}>Why Choose CodeMe Academy?</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>A focused learning experience built for technology education</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <motion.div key={title} whileHover={{ y: -6 }} className="card" style={{ padding: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color }}>
                  <Icon size={22} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>{title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Course Catalogue ── */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800 }}>Our Courses</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>Browse current programmes, pricing, and delivery options</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {courses.map((course) => {
              const CourseIcon = COURSE_ICONS[course.id] || Code2
              const hasPrice = Number.isFinite(Number(course.price)) && Number(course.price) > 0
              return <motion.div key={course.id} whileHover={{ scale: 1.02 }} className="card landing-course-card" style={{ padding: '22px', position: 'relative', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', cursor: 'pointer' }} onClick={() => { setApplyForm(form => ({ ...form, course_id: course.id })); setShowApplyModal(true) }}>
                {course.tag && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '3px 8px', borderRadius: '20px' }}>
                    {course.tag}
                  </span>
                )}
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', display: 'grid', placeItems: 'center', background: 'rgba(139,92,246,0.14)', color: 'var(--color-purple)', marginBottom: '12px' }}><CourseIcon size={21} /></div>
                <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>{course.title}</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(139,92,246,0.15)', color: 'var(--color-purple)' }}>{course.level}</span>
                  <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.07)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} /> {course.weeks || '?'} weeks
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-cyan)' }}>
                    {hasPrice ? money(course.price) : 'Price on application'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={13} /> Apply for this course
                  </span>
                </div>
              </motion.div>
            })}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '12px' }}>No payment needed to apply. Admin will contact you after approval.</p>
            <button className="btn btn-primary" onClick={() => setShowApplyModal(true)} style={{ padding: '12px 28px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={16} /> Apply for Free
            </button>
          </div>
        </div>
      </section>

      {/* ── Schedule Info ── */}
      <section style={{ padding: '50px 20px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><CalendarDays size={25} /> Class Schedule & Batches</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
            Course schedules, cohort dates, and access duration are set individually for each programme. Apply to receive the current details for the course you choose.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            {[
              { label: 'Cohorts', value: 'Scheduled per course', icon: UsersRound },
              { label: 'Live Sessions', value: 'When included', icon: Video },
              { label: 'Duration', value: 'Set per programme', icon: Timer },
              { label: 'Access', value: 'Course-specific', icon: KeyRound },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ color: 'var(--color-purple)', marginBottom: '8px' }}><Icon size={24} /></div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free HTML Sample Preview ── */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800 }}>Try a Free Lesson</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>No account required. Get a feel for our interactive sandbox.</p>
          </div>
          <div className="card" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-purple)' }}>
                <Code2 size={20} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>WD101 · Lesson 1: What is HTML?</h4>
                <span className="badge badge-purple" style={{ fontSize: '0.6rem' }}>FREE PREVIEW</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '16px' }}>
              HTML (HyperText Markup Language) is the building block of all websites. Every page you see on the internet is made with HTML. In this lesson, you'll write your very first HTML tag.
            </p>
            <div style={{ background: '#0d0d1a', borderRadius: '10px', padding: '16px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#a5f3fc', marginBottom: '16px', overflowX: 'auto' }}>
              <span style={{ color: '#f472b6' }}>&lt;h1&gt;</span><span style={{ color: '#fff' }}>Hello, CodeMe!</span><span style={{ color: '#f472b6' }}>&lt;/h1&gt;</span>
              <br />
              <span style={{ color: '#f472b6' }}>&lt;p&gt;</span><span style={{ color: '#fff' }}>I am learning web development at CodeMe Academy.</span><span style={{ color: '#f472b6' }}>&lt;/p&gt;</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowApplyModal(true)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <UserPlus size={16} /> Enroll to Unlock Full Course
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: '60px 20px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h3 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800 }}>What Our Students Say</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {TESTIMONIALS.map(({ name, state, text, rating }) => (
              <motion.div key={name} whileHover={{ y: -4 }} className="card" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic' }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
                    {name[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{name}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{state} State</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(145deg, rgba(139,92,246,0.1), rgba(99,102,241,0.1))', padding: '50px 30px', borderRadius: '24px', border: '1px solid rgba(139,92,246,0.2)' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, marginBottom: '12px' }}>Ready to start your tech career?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.6 }}>Apply now — it's free. We'll review your application and contact you within 24 hours.</p>
          <button className="btn btn-primary" onClick={() => setShowApplyModal(true)} style={{ padding: '16px 40px', fontSize: '1.05rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} /> Apply to Enroll — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
        <p>© {new Date().getFullYear()} CodeMe Technology Academy Nigeria. All rights reserved.</p>
        <div style={{ marginTop: '12px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#/verify-certificate" style={{ color: 'var(--color-blue)', textDecoration: 'none' }}>Verify a Certificate</a>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToAuth() }} style={{ color: 'var(--color-blue)', textDecoration: 'none' }}>Student Login</a>
          <a href="#" onClick={(e) => { e.preventDefault(); setShowApplyModal(true) }} style={{ color: 'var(--color-blue)', textDecoration: 'none' }}>Apply to Enroll</a>
        </div>
      </footer>

      {/* ── Apply to Enroll Modal ── */}
      {showApplyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '20px', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'linear-gradient(145deg, #1b1030, #0c0a1e)', borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '100%', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', position: 'relative' }}>
            <button onClick={() => { setShowApplyModal(false); setApplySuccess(false) }} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            {applySuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(139,92,246,0.2)', color: 'var(--color-purple)' }}><PartyPopper size={28} /></div>
                <h3 style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '10px' }}>Application Submitted!</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Your application is in review. We will contact you within 24 business hours with the next step. Creating an account does not activate course access; payment and enrolment approval do.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => { setShowApplyModal(false); setApplySuccess(false) }}>Done</button>
                  <button className="btn btn-secondary" onClick={() => { window.location.hash = '#/auth?mode=signup' }}>Create account</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={22} color="#fff" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>Apply to Enroll</h3>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', margin: '2px 0 0' }}>Free application · Admin reviews within 24 business hours</p>
                  </div>
                </div>

                <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>FULL NAME</label>
                    <input className="input-field" placeholder="e.g. Fatima Abdullahi" value={applyForm.full_name} onChange={e => setApplyForm(p => ({ ...p, full_name: e.target.value }))} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>EMAIL ADDRESS</label>
                    <input type="email" className="input-field" placeholder="fatima@gmail.com" value={applyForm.email} onChange={e => setApplyForm(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>WHATSAPP / PHONE NUMBER</label>
                    <input type="tel" className="input-field" placeholder="+234 812 345 6789" value={applyForm.phone} onChange={e => setApplyForm(p => ({ ...p, phone: e.target.value }))} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>COURSE OF INTEREST</label>
                    <select className="input-field" value={applyForm.course_id} onChange={e => setApplyForm(p => ({ ...p, course_id: e.target.value }))}>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={applyLoading} style={{ marginTop: '4px' }}>
                    {applyLoading ? <Loader2 size={16} className="animate-spin" /> : <><Send size={15} /> Submit Application</>}
                  </button>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    Applying requests admission to a course. Create an account separately to sign in; access begins only after payment verification and enrolment approval.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
