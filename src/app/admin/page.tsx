'use client'
import { useState } from 'react'
import Topbar from '@/components/ui/Topbar'
import { Users, BookOpen, BarChart3, Plus, Search, MoreVertical, Shield, Trash2, Edit, CheckCircle, XCircle, TrendingUp, Activity, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const mockUsers = [
  { id: 1, name: 'Yashwanth M', email: 'yash@psgtech.ac.in', college: 'PSG College of Technology', role: 'student', score: 82, joined: '2024-01-15', active: true },
  { id: 2, name: 'Priya S', email: 'priya@vit.ac.in', college: 'VIT University', role: 'student', score: 91, joined: '2024-01-18', active: true },
  { id: 3, name: 'Rahul K', email: 'rahul@nit.ac.in', college: 'NIT Trichy', role: 'student', score: 76, joined: '2024-02-01', active: false },
  { id: 4, name: 'Ananya R', email: 'ananya@anna.ac.in', college: 'Anna University', role: 'student', score: 88, joined: '2024-02-10', active: true },
  { id: 5, name: 'Karthik V', email: 'karthik@bit.ac.in', college: 'Bharathidasan Institute of Tech', role: 'student', score: 65, joined: '2024-02-15', active: true },
]

const mockQuestions = [
  { id: 1, question: 'What is the time complexity of QuickSort?', category: 'Aptitude', difficulty: 'Medium', section: 'Quant', attempts: 234 },
  { id: 2, question: 'Reverse a linked list', category: 'Coding', difficulty: 'Easy', section: 'DSA', attempts: 456 },
  { id: 3, question: 'Tell me about yourself', category: 'Interview', difficulty: 'Easy', section: 'Behavioral', attempts: 189 },
  { id: 4, question: 'Find the 2nd largest element in array', category: 'Coding', difficulty: 'Easy', section: 'DSA', attempts: 312 },
]

const activityData = [
  { day: 'Mon', users: 42, tests: 156 },
  { day: 'Tue', users: 58, tests: 198 },
  { day: 'Wed', users: 51, tests: 172 },
  { day: 'Thu', users: 67, tests: 234 },
  { day: 'Fri', users: 74, tests: 267 },
  { day: 'Sat', users: 89, tests: 312 },
  { day: 'Sun', users: 63, tests: 228 },
]

export default function AdminPage() {
  const [tab, setTab] = useState<'overview' | 'users' | 'questions' | 'add'>('overview')
  const [search, setSearch] = useState('')
  const [addForm, setAddForm] = useState({ question: '', category: 'Aptitude', section: 'Quant', difficulty: 'Medium', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A', explanation: '' })

  const filteredUsers = mockUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))

  const addQuestion = () => {
    if (!addForm.question.trim()) { toast.error('Please enter a question'); return }
    toast.success('Question added successfully!')
    setAddForm({ question: '', category: 'Aptitude', section: 'Quant', difficulty: 'Medium', optionA: '', optionB: '', optionC: '', optionD: '', correct: 'A', explanation: '' })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
        {payload.map((p: any, i: number) => <p key={i} style={{ fontSize: '13px', color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
      </div>
    )
    return null
  }

  return (
    <div>
      <Topbar title="Admin Panel" subtitle="Manage users, questions, and platform analytics" />
      <div style={{ padding: '28px' }}>

        {/* Tab Nav */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(148,163,184,0.05)', borderRadius: '12px', padding: '4px', width: 'fit-content' }}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'questions', label: 'Questions', icon: BookOpen },
            { id: 'add', label: 'Add Question', icon: Plus },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none', background: tab === t.id ? 'var(--bg-card)' : 'transparent', color: tab === t.id ? 'white' : 'var(--text-muted)', fontFamily: 'Sora', transition: 'all 0.15s', boxShadow: tab === t.id ? '0 2px 8px rgba(0,0,0,0.2)' : 'none' }}>
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'Total Users', value: '1,209', change: '+24 this week', icon: Users, color: '#3b82f6' },
                { label: 'Active Courses', value: '340', change: '12 new added', icon: BookOpen, color: '#10b981' },
                { label: 'Tests Today', value: '267', change: '+18% vs yesterday', icon: Activity, color: '#f59e0b' },
                { label: 'Avg Session', value: '42 min', change: 'Per user today', icon: Clock, color: '#8b5cf6' },
              ].map((s, i) => (
                <div key={i} className="card animate-fade-in-up" style={{ opacity: 0, animationDelay: `${i*0.1}s`, padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <s.icon size={20} style={{ color: s.color }} />
                    </div>
                    <TrendingUp size={16} style={{ color: s.color, opacity: 0.7 }} />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'white', marginBottom: '4px' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>{s.label}</div>
                  <div style={{ fontSize: '12px', color: s.color }}>{s.change}</div>
                </div>
              ))}
            </div>

            <div className="card animate-fade-in-up delay-300" style={{ opacity: 0, padding: '24px' }}>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '20px' }}>Platform Activity (This Week)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={activityData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="users" name="Active Users" fill="#6366f1" radius={[4,4,0,0]} />
                  <Bar dataKey="tests" name="Tests Taken" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="card animate-fade-in-up" style={{ opacity: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white' }}>All Users ({mockUsers.length})</h3>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: '36px', width: '240px', paddingTop: '8px', paddingBottom: '8px', fontSize: '13px' }}
                  placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Name', 'Email', 'College', 'Score', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.college}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: user.score >= 80 ? '#34d399' : user.score >= 60 ? '#fbbf24' : '#f87171' }}>{user.score}%</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{user.joined}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${user.active ? 'badge-green' : 'badge-red'}`}>{user.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => toast('Edit user functionality')} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(59,130,246,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit size={14} style={{ color: '#60a5fa' }} />
                        </button>
                        <button onClick={() => toast.error('Delete user')} style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={14} style={{ color: '#f87171' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Questions */}
        {tab === 'questions' && (
          <div className="card animate-fade-in-up" style={{ opacity: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white' }}>Question Bank ({mockQuestions.length})</h3>
              <button onClick={() => setTab('add')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Plus size={16} /> Add Question
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Question', 'Category', 'Section', 'Difficulty', 'Attempts', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockQuestions.map((q) => (
                  <tr key={q.id} className="table-row" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px', maxWidth: '300px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{q.question}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${q.category === 'Coding' ? 'badge-green' : q.category === 'Interview' ? 'badge-purple' : 'badge-blue'}`}>{q.category}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{q.section}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: q.difficulty === 'Easy' ? '#10b981' : q.difficulty === 'Medium' ? '#f59e0b' : '#ef4444' }}>{q.difficulty}</span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{q.attempts}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(59,130,246,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Edit size={14} style={{ color: '#60a5fa' }} />
                        </button>
                        <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={14} style={{ color: '#f87171' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Question Form */}
        {tab === 'add' && (
          <div className="card animate-fade-in-up" style={{ opacity: 0, padding: '32px', maxWidth: '700px' }}>
            <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '20px', color: 'white', marginBottom: '24px' }}>Add New Question</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Question *</label>
                <textarea className="input" rows={3} style={{ resize: 'none' }} placeholder="Enter the question text..."
                  value={addForm.question} onChange={e => setAddForm({ ...addForm, question: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Category', key: 'category', opts: ['Aptitude', 'Coding', 'Interview'] },
                  { label: 'Section', key: 'section', opts: ['Quant', 'Verbal', 'Logical', 'DSA', 'Behavioral'] },
                  { label: 'Difficulty', key: 'difficulty', opts: ['Easy', 'Medium', 'Hard'] },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>{f.label}</label>
                    <select className="input" value={(addForm as any)[f.key]} onChange={e => setAddForm({ ...addForm, [f.key]: e.target.value })} style={{ cursor: 'pointer' }}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div key={opt}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Option {opt}</label>
                    <input type="text" className="input" placeholder={`Option ${opt}`}
                      value={(addForm as any)[`option${opt}`]} onChange={e => setAddForm({ ...addForm, [`option${opt}`]: e.target.value })} />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Correct Answer</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <button key={opt} type="button" onClick={() => setAddForm({ ...addForm, correct: opt })}
                      style={{ width: '40px', height: '40px', borderRadius: '10px', border: `2px solid ${addForm.correct === opt ? '#10b981' : 'var(--border)'}`, background: addForm.correct === opt ? 'rgba(16,185,129,0.15)' : 'transparent', color: addForm.correct === opt ? '#34d399' : 'var(--text-muted)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Sora' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Explanation</label>
                <textarea className="input" rows={2} style={{ resize: 'none' }} placeholder="Explain why the answer is correct..."
                  value={addForm.explanation} onChange={e => setAddForm({ ...addForm, explanation: e.target.value })} />
              </div>

              <button onClick={addQuestion} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 28px', fontSize: '15px', borderRadius: '12px' }}>
                <Plus size={18} /> Add Question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
