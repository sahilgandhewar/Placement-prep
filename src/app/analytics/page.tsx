'use client'
import Topbar from '@/components/ui/Topbar'
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, AreaChart, Area } from 'recharts'
import { TrendingUp, Award, Clock, Target, BookOpen, Code2, Brain } from 'lucide-react'

const weeklyData = [
  { day: 'Mon', aptitude: 72, coding: 65, verbal: 80, study: 2.5 },
  { day: 'Tue', aptitude: 78, coding: 70, verbal: 75, study: 3 },
  { day: 'Wed', aptitude: 75, coding: 80, verbal: 82, study: 2 },
  { day: 'Thu', aptitude: 85, coding: 78, verbal: 79, study: 4 },
  { day: 'Fri', aptitude: 82, coding: 85, verbal: 85, study: 3.5 },
  { day: 'Sat', aptitude: 88, coding: 90, verbal: 88, study: 5 },
  { day: 'Sun', aptitude: 91, coding: 88, verbal: 92, study: 4 },
]

const topicData = [
  { topic: 'Quant', correct: 45, wrong: 12, partial: 8 },
  { topic: 'Logical', correct: 38, wrong: 8, partial: 5 },
  { topic: 'Verbal', correct: 52, wrong: 15, partial: 6 },
  { topic: 'DSA', correct: 28, wrong: 18, partial: 10 },
  { topic: 'System', correct: 15, wrong: 22, partial: 8 },
]

const radarData = [
  { subject: 'Aptitude', A: 82, B: 70 },
  { subject: 'Coding', A: 78, B: 65 },
  { subject: 'Verbal', A: 88, B: 75 },
  { subject: 'Logical', A: 75, B: 68 },
  { subject: 'System Design', A: 60, B: 72 },
  { subject: 'DB & SQL', A: 70, B: 60 },
]

const timeData = [
  { name: 'Aptitude', value: 35, color: '#3b82f6' },
  { name: 'Coding', value: 30, color: '#10b981' },
  { name: 'Verbal', value: 20, color: '#8b5cf6' },
  { name: 'Interview Prep', value: 15, color: '#f59e0b' },
]

const langData = [
  { lang: 'Python', rank: 38, students: 674 },
  { lang: 'C++', rank: 447, students: 1332 },
  { lang: 'Java', rank: 289, students: 1089 },
  { lang: 'JavaScript', rank: 156, students: 892 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '13px', color: p.color, fontWeight: 600 }}>{p.name}: {p.value}{typeof p.value === 'number' && p.value <= 100 ? '%' : ''}</p>
      ))}
    </div>
  )
  return null
}

export default function AnalyticsPage() {
  return (
    <div>
      <Topbar title="Performance Analytics" subtitle="Deep insights into your preparation progress" />
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Overall Rank', value: '#142', sub: 'of 5562 students', icon: Award, color: '#f59e0b' },
            { label: 'Questions Done', value: '148', sub: 'out of 161 attempted', icon: Target, color: '#3b82f6' },
            { label: 'Time Invested', value: '21:59', sub: 'total hours spent', icon: Clock, color: '#10b981' },
            { label: 'Avg Score', value: '82%', sub: 'across all modules', icon: TrendingUp, color: '#8b5cf6' },
          ].map((s, i) => (
            <div key={i} className="card animate-fade-in-up" style={{ opacity: 0, animationDelay: `${i*0.1}s`, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans', color: 'white', marginBottom: '4px' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div className="card animate-fade-in-up delay-200" style={{ opacity: 0, padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white' }}>Weekly Score Trends</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Performance across all categories</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyData}>
                <defs>
                  {[['apt', '#3b82f6'], ['cod', '#10b981'], ['ver', '#8b5cf6']].map(([id, color]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={[50, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="aptitude" name="Aptitude" stroke="#3b82f6" strokeWidth={2} fill="url(#apt)" />
                <Area type="monotone" dataKey="coding" name="Coding" stroke="#10b981" strokeWidth={2} fill="url(#cod)" />
                <Area type="monotone" dataKey="verbal" name="Verbal" stroke="#8b5cf6" strokeWidth={2} fill="url(#ver)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card animate-fade-in-up delay-300" style={{ opacity: 0, padding: '24px' }}>
            <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '20px' }}>Time Distribution</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart width={180} height={180}>
                <Pie data={timeData} cx={90} cy={90} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {timeData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {timeData.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: item.color }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Topic-wise Performance */}
          <div className="card animate-fade-in-up delay-300" style={{ opacity: 0, padding: '24px' }}>
            <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '20px' }}>Topic-wise Question Completion</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topicData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" vertical={false} />
                <XAxis dataKey="topic" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="correct" name="Correct" stackId="a" fill="#10b981" radius={[0,0,0,0]} />
                <Bar dataKey="partial" name="Partial" stackId="a" fill="#f59e0b" />
                <Bar dataKey="wrong" name="Wrong" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              {[{ c: '#10b981', l: 'Correct' }, { c: '#f59e0b', l: 'Partial' }, { c: '#ef4444', l: 'Wrong' }].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.c }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar */}
          <div className="card animate-fade-in-up delay-400" style={{ opacity: 0, padding: '24px' }}>
            <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '4px' }}>Skill vs Benchmark</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Your score vs average student score</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148,163,184,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Radar name="You" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Benchmark" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 2" />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              {[{ c: '#6366f1', l: 'Your Score' }, { c: '#f59e0b', l: 'Benchmark' }].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.c }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Language Rankings */}
        <div className="card animate-fade-in-up delay-400" style={{ opacity: 0, padding: '24px' }}>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '20px' }}>Programming Language Performance</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Language', 'Your Rank', 'Total Students', 'Performance', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {langData.map((row, i) => {
                  const pct = Math.round(((row.students - row.rank) / row.students) * 100)
                  return (
                    <tr key={i} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Code2 size={16} style={{ color: '#a78bfa' }} />
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{row.lang}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#60a5fa', fontFamily: 'JetBrains Mono' }}>#{row.rank}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{row.students.toLocaleString()}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="progress-bar" style={{ width: '100px' }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: pct > 70 ? '#10b981' : pct > 40 ? '#f59e0b' : '#ef4444' }} />
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: pct > 70 ? '#34d399' : pct > 40 ? '#fbbf24' : '#f87171' }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={`badge ${pct > 70 ? 'badge-green' : pct > 40 ? 'badge-orange' : 'badge-red'}`}>
                          {pct > 70 ? 'Strong' : pct > 40 ? 'Average' : 'Needs Work'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
