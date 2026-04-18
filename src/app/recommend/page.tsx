'use client'
import { useState } from 'react'
import Topbar from '@/components/ui/Topbar'
import { Brain, Zap, Play, Clock, Star, TrendingUp, AlertCircle, BookOpen, Code2, Mic, ChevronRight, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const recommendations = [
  { id: 1, type: 'aptitude', title: 'Probability & Permutations', reason: 'Your accuracy in this topic is 42% — well below average', difficulty: 'Medium', est: '45 min', priority: 'critical', tags: ['Quant', 'Probability'] },
  { id: 2, type: 'coding', title: 'Graph BFS/DFS', reason: 'Frequently asked in product companies. Not attempted yet.', difficulty: 'Hard', est: '60 min', priority: 'high', tags: ['DSA', 'Graph'] },
  { id: 3, type: 'aptitude', title: 'Time & Work Problems', reason: 'You scored 55% last attempt. Practice will improve this.', difficulty: 'Easy', est: '30 min', priority: 'high', tags: ['Quant', 'Arithmetic'] },
  { id: 4, type: 'coding', title: 'Dynamic Programming Basics', reason: 'DP is tested in 80% of product company interviews.', difficulty: 'Hard', est: '90 min', priority: 'medium', tags: ['DSA', 'DP'] },
  { id: 5, type: 'interview', title: 'Behavioral STAR Method', reason: 'Your last mock interview scored low on structure.', difficulty: 'Easy', est: '30 min', priority: 'medium', tags: ['Soft Skills'] },
  { id: 6, type: 'aptitude', title: 'Data Interpretation', reason: 'Common in campus placements. Your accuracy is 68%.', difficulty: 'Medium', est: '45 min', priority: 'low', tags: ['Verbal', 'DI'] },
]

const companies = [
  { name: 'TCS', logo: '🏢', type: 'Service', topics: ['Aptitude', 'Verbal', 'Coding'], difficulty: 'Easy', match: 88 },
  { name: 'Infosys', logo: '🌐', type: 'Service', topics: ['Aptitude', 'Reasoning', 'English'], difficulty: 'Easy', match: 85 },
  { name: 'Wipro', logo: '💼', type: 'Service', topics: ['Aptitude', 'Coding', 'Essay'], difficulty: 'Medium', match: 80 },
  { name: 'Flipkart', logo: '🛒', type: 'Product', topics: ['DSA', 'System Design', 'CS Fundamentals'], difficulty: 'Hard', match: 62 },
  { name: 'Amazon', logo: '📦', type: 'Product', topics: ['DSA', 'Leadership Principles', 'System Design'], difficulty: 'Hard', match: 55 },
  { name: 'Google', logo: '🔍', type: 'Product', topics: ['Algorithms', 'System Design', 'Behavioral'], difficulty: 'Very Hard', match: 40 },
]

const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'rgba(239,68,68,0.15)', text: '#f87171', label: '🔴 Critical' },
  high: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: '🟠 High' },
  medium: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', label: '🔵 Medium' },
  low: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: '🟢 Low' },
}

const typeIcons: Record<string, any> = { aptitude: BookOpen, coding: Code2, interview: Mic }
const typeColors: Record<string, string> = { aptitude: '#3b82f6', coding: '#10b981', interview: '#8b5cf6' }
const typeHrefs: Record<string, string> = { aptitude: '/aptitude', coding: '/coding', interview: '/interview' }

export default function RecommendPage() {
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  const filtered = filter === 'all' ? recommendations : recommendations.filter(r => r.priority === filter)

  const refresh = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    toast.success('Recommendations refreshed!')
  }

  return (
    <div>
      <Topbar title="AI Recommendations" subtitle="Personalized study plan based on your performance" />
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header card */}
        <div className="card animate-fade-in-up" style={{ opacity: 0, padding: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={28} color="white" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '20px', color: 'white', marginBottom: '4px' }}>AI Study Planner</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Based on your last 7 days of activity · Updated just now</p>
              </div>
            </div>
            <button onClick={refresh} disabled={loading} className="btn btn-secondary" style={{ fontSize: '13px' }}>
              {loading ? <div className="w-4 h-4 border border-blue-400 border-t-transparent rounded-full animate-spin" /> : <RefreshCw size={15} />}
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '24px', marginTop: '20px', flexWrap: 'wrap' }}>
            {[
              { v: '2', l: 'Critical items', c: '#f87171' },
              { v: '2', l: 'High priority', c: '#fbbf24' },
              { v: '2', l: 'Other topics', c: '#60a5fa' },
              { v: '4.5 hrs', l: 'Study time needed', c: '#34d399' },
            ].map((s, i) => (
              <div key={i}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: s.c, fontFamily: 'Plus Jakarta Sans' }}>{s.v}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px' }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter + Recommendations */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white' }}>Recommended Topics</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'critical', 'high', 'medium', 'low'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: filter === f ? 'none' : '1px solid var(--border)', background: filter === f ? 'rgba(99,102,241,0.3)' : 'transparent', color: filter === f ? '#a78bfa' : 'var(--text-muted)', fontFamily: 'Sora', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {filtered.map((rec, i) => {
              const Icon = typeIcons[rec.type]
              const color = typeColors[rec.type]
              const href = typeHrefs[rec.type]
              const p = priorityColors[rec.priority]
              return (
                <div key={rec.id} className="card animate-fade-in-up" style={{ opacity: 0, animationDelay: `${i*0.08}s`, padding: '20px', transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = `${color}40` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={20} style={{ color }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{rec.title}</h4>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: p.bg, color: p.text, fontWeight: 600 }}>{p.label}</span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                    <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px', color: '#f59e0b' }} />
                    {rec.reason}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {rec.tags.map(t => <span key={t} className="tag" style={{ fontSize: '11px' }}>{t}</span>)}
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(148,163,184,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{rec.difficulty}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />{rec.est}
                    </span>
                    <Link href={href} style={{ textDecoration: 'none' }}>
                      <button style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none', background: `${color}20`, color, display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Sora', transition: 'all 0.15s' }}>
                        <Play size={12} fill="currentColor" /> Start
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Company Readiness */}
        <div>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white', marginBottom: '16px' }}>Company Readiness</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {companies.map((c, i) => (
              <div key={i} className="card animate-fade-in-up" style={{ opacity: 0, animationDelay: `${i*0.1}s`, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '28px' }}>{c.logo}</div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.type}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: c.match >= 75 ? '#10b981' : c.match >= 55 ? '#f59e0b' : '#ef4444', fontFamily: 'Plus Jakarta Sans' }}>{c.match}%</div>
                </div>

                <div className="progress-bar" style={{ marginBottom: '12px' }}>
                  <div className="progress-fill" style={{ width: `${c.match}%`, background: c.match >= 75 ? 'linear-gradient(90deg, #10b981, #14b8a6)' : c.match >= 55 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)' }} />
                </div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {c.topics.slice(0, 3).map(t => (
                    <span key={t} className="tag" style={{ fontSize: '10px', padding: '2px 6px' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
