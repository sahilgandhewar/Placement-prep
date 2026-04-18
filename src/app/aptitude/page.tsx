'use client'
import { useState, useEffect, useRef } from 'react'
import Topbar from '@/components/ui/Topbar'
import { BookOpen, Clock, ChevronRight, ChevronLeft, Flag, CheckCircle, XCircle, RotateCcw, Trophy, Zap, Brain } from 'lucide-react'
import toast from 'react-hot-toast'

const sampleQuestions = [
  {
    id: 1, section: 'Quant',
    question: 'The arithmetic mean of the 5 consecutive integers starting with "s" is "a". What is the arithmetic mean of 9 consecutive integers that start with s + 2?',
    options: ['A. a + 4', 'B. a + 6', 'C. a + 5', 'D. a + 2'], correct: 1,
    explanation: 'If 5 consecutive integers start with s, their mean is s+2=a. For 9 integers starting at s+2, mean = (s+2)+4 = a+4.'
  },
  {
    id: 2, section: 'Quant',
    question: 'A train travels at 60 km/h for the first half of the journey and 40 km/h for the second half. What is the average speed?',
    options: ['A. 48 km/h', 'B. 50 km/h', 'C. 52 km/h', 'D. 45 km/h'], correct: 0,
    explanation: 'Harmonic mean: 2 × (60 × 40)/(60 + 40) = 4800/100 = 48 km/h'
  },
  {
    id: 3, section: 'Verbal',
    question: 'Choose the word most similar in meaning to "EPHEMERAL":',
    options: ['A. Permanent', 'B. Transient', 'C. Substantial', 'D. Eternal'], correct: 1,
    explanation: 'Ephemeral means lasting for a very short time, similar to transient.'
  },
  {
    id: 4, section: 'Verbal',
    question: 'Find the odd one out: Manager, Director, Supervisor, Employee, Leader',
    options: ['A. Manager', 'B. Director', 'C. Employee', 'D. Leader'], correct: 2,
    explanation: 'All others are leadership roles; Employee is a subordinate role.'
  },
  {
    id: 5, section: 'Logical',
    question: 'If all Bloops are Razzles, and all Razzles are Lazzles, then all Bloops are definitely:',
    options: ['A. Not Lazzles', 'B. Lazzles', 'C. Not Razzles', 'D. None of above'], correct: 1,
    explanation: 'Transitive property: Bloops→Razzles→Lazzles, therefore Bloops are Lazzles.'
  },
  {
    id: 6, section: 'Logical',
    question: 'In a row, Ravi is 7th from the left and 14th from the right. How many people are in the row?',
    options: ['A. 20', 'B. 21', 'C. 22', 'D. 19'], correct: 0,
    explanation: 'Total = 7 + 14 - 1 = 20'
  },
  {
    id: 7, section: 'Quant',
    question: 'What is the compound interest on ₹8000 at 10% per annum for 2 years, compounded annually?',
    options: ['A. ₹1680', 'B. ₹1600', 'C. ₹1760', 'D. ₹1640'], correct: 0,
    explanation: 'CI = 8000 × (1.1)² - 8000 = 8000 × 1.21 - 8000 = 9680 - 8000 = ₹1680'
  },
  {
    id: 8, section: 'Verbal',
    question: 'Select the correctly spelled word:',
    options: ['A. Accomodation', 'B. Accommodation', 'C. Accomadation', 'D. Acomodation'], correct: 1,
    explanation: 'The correct spelling is "Accommodation" with double c and double m.'
  },
]

const sections = ['Quant', 'Verbal', 'Logical']
const difficultyLevels = ['Easy', 'Medium', 'Hard']

const statusColors: Record<string, string> = {
  answered: '#10b981',
  not_answered: '#f59e0b',
  not_attempted: 'transparent',
  review: '#374151',
  current: '#3b82f6',
}

export default function AptitudePage() {
  const [mode, setMode] = useState<'home' | 'test' | 'result'>('home')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [marked, setMarked] = useState<Set<number>>(new Set())
  const [timeLeft, setTimeLeft] = useState(42 * 60 + 39)
  const [section, setSection] = useState('All')
  const [difficulty, setDifficulty] = useState('Mixed')
  const timerRef = useRef<any>(null)

  const filteredQuestions = section === 'All' ? sampleQuestions : sampleQuestions.filter(q => q.section === section)

  useEffect(() => {
    if (mode === 'test') {
      timerRef.current = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [mode])

  const hrs = Math.floor(timeLeft / 3600)
  const mins = Math.floor((timeLeft % 3600) / 60)
  const secs = timeLeft % 60
  const pad = (n: number) => String(n).padStart(2, '0')

  const selectAnswer = (optIdx: number) => {
    setAnswers({ ...answers, [filteredQuestions[currentQ].id]: optIdx })
  }

  const getQuestionStatus = (idx: number) => {
    const q = filteredQuestions[idx]
    if (idx === currentQ) return 'current'
    if (marked.has(q.id)) return 'review'
    if (answers[q.id] !== undefined) return 'answered'
    if (idx < currentQ) return 'not_answered'
    return 'not_attempted'
  }

  const submitTest = () => {
    clearInterval(timerRef.current)
    setMode('result')
  }

  const correctCount = filteredQuestions.filter(q => answers[q.id] === q.correct).length
  const score = Math.round((correctCount / filteredQuestions.length) * 100)

  if (mode === 'home') return (
    <div>
      <Topbar title="Aptitude Practice" subtitle="Quantitative, Verbal & Logical Reasoning" />
      <div style={{ padding: '28px' }}>
        
        {/* Categories */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
          {[
            { name: 'Quantitative', icon: Brain, color: '#3b82f6', qs: 150, done: 47, desc: 'Numbers, Algebra, Geometry' },
            { name: 'Verbal Ability', icon: BookOpen, color: '#8b5cf6', qs: 120, done: 38, desc: 'Grammar, Vocabulary, Comprehension' },
            { name: 'Logical Reasoning', icon: Zap, color: '#10b981', qs: 100, done: 25, desc: 'Patterns, Sequences, Puzzles' },
          ].map((cat, i) => (
            <div key={i} className="card animate-fade-in-up" style={{ opacity: 0, animationDelay: `${i*0.1}s`, padding: '24px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <cat.icon size={24} style={{ color: cat.color }} />
                </div>
                <span style={{ fontSize: '12px', color: cat.color, fontWeight: 600, background: `${cat.color}15`, padding: '3px 10px', borderRadius: '99px' }}>{cat.done}/{cat.qs} done</span>
              </div>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white', marginBottom: '6px' }}>{cat.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{cat.desc}</p>
              <div className="progress-bar" style={{ marginBottom: '6px' }}>
                <div className="progress-fill" style={{ width: `${(cat.done/cat.qs)*100}%`, background: cat.color }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{Math.round((cat.done/cat.qs)*100)}% complete</p>
            </div>
          ))}
        </div>

        {/* Test Config */}
        <div className="card animate-fade-in-up delay-300" style={{ opacity: 0, padding: '28px', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '20px', color: 'white', marginBottom: '24px', textAlign: 'center' }}>Start a Practice Test</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Section</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', ...sections].map(s => (
                <button key={s} onClick={() => setSection(s)}
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: section === s ? 'none' : '1px solid var(--border)', background: section === s ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : 'transparent', color: section === s ? 'white' : 'var(--text-secondary)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Difficulty</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Mixed', ...difficultyLevels].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', border: difficulty === d ? 'none' : '1px solid var(--border)', background: difficulty === d ? 'linear-gradient(135deg, #10b981, #14b8a6)' : 'transparent', color: difficulty === d ? 'white' : 'var(--text-secondary)' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => { setMode('test'); setCurrentQ(0); setAnswers({}); setMarked(new Set()); setTimeLeft(42*60+39) }}
            className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', borderRadius: '12px' }}>
            <Zap size={18} /> Start Test Now
          </button>
        </div>
      </div>
    </div>
  )

  if (mode === 'result') return (
    <div>
      <Topbar title="Test Results" />
      <div style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="card animate-fade-in-up" style={{ opacity: 0, padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: score >= 60 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {score >= 60 ? <Trophy size={36} style={{ color: '#10b981' }} /> : <XCircle size={36} style={{ color: '#ef4444' }} />}
          </div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '32px', color: 'white', marginBottom: '8px' }}>{score}%</h2>
          <p style={{ fontSize: '16px', color: score >= 60 ? '#34d399' : '#f87171', fontWeight: 600, marginBottom: '24px' }}>{score >= 80 ? 'Excellent!' : score >= 60 ? 'Good job!' : 'Keep practicing!'}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '32px' }}>
            <div><div style={{ fontSize: '24px', fontWeight: 700, color: '#34d399' }}>{correctCount}</div><div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Correct</div></div>
            <div><div style={{ fontSize: '24px', fontWeight: 700, color: '#f87171' }}>{filteredQuestions.length - correctCount}</div><div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Wrong</div></div>
            <div><div style={{ fontSize: '24px', fontWeight: 700, color: '#fbbf24' }}>{filteredQuestions.length}</div><div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total</div></div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => { setMode('test'); setCurrentQ(0); setAnswers({}); setMarked(new Set()); setTimeLeft(42*60+39) }}
              className="btn btn-primary">
              <RotateCcw size={16} /> Retry Test
            </button>
            <button onClick={() => setMode('home')} className="btn btn-secondary">Back to Home</button>
          </div>
        </div>

        {/* Question Review */}
        <div style={{ marginTop: '24px' }}>
          {filteredQuestions.map((q, i) => {
            const userAns = answers[q.id]
            const isCorrect = userAns === q.correct
            return (
              <div key={q.id} className="card" style={{ padding: '20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isCorrect ? <CheckCircle size={14} style={{ color: '#10b981' }} /> : <XCircle size={14} style={{ color: '#ef4444' }} />}
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Q{i+1}. {q.question}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                  {q.options.map((opt, oi) => (
                    <div key={oi} style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '13px', background: oi === q.correct ? 'rgba(16,185,129,0.1)' : oi === userAns && !isCorrect ? 'rgba(239,68,68,0.1)' : 'transparent', border: `1px solid ${oi === q.correct ? 'rgba(16,185,129,0.3)' : oi === userAns && !isCorrect ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`, color: oi === q.correct ? '#34d399' : oi === userAns && !isCorrect ? '#f87171' : 'var(--text-secondary)' }}>
                      {opt}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '8px 12px', background: 'rgba(148,163,184,0.05)', borderRadius: '8px' }}>
                  💡 {q.explanation}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const q = filteredQuestions[currentQ]
  const selectedAnswer = answers[q.id]

  return (
    <div>
      <Topbar title={`Online Test — ${section} Preparation`} />
      <div style={{ display: 'flex', gap: 0, padding: '24px', gap: '20px', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
        
        {/* Main Question */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'auto' }}>
          <div className="card" style={{ padding: '24px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '8px', display: 'inline-block' }}>{q.section}</span>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white' }}>Question {currentQ + 1}</h2>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '13px', color: '#60a5fa', fontFamily: 'JetBrains Mono' }}>
                  {currentQ + 1} / {filteredQuestions.length}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', marginBottom: '20px' }} />

            <p style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '28px' }}>{q.question}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {q.options.map((opt, i) => (
                <button key={i} onClick={() => selectAnswer(i)}
                  style={{ padding: '14px 18px', borderRadius: '10px', border: `2px solid ${selectedAnswer === i ? '#3b82f6' : 'var(--border)'}`, background: selectedAnswer === i ? 'rgba(59,130,246,0.12)' : 'rgba(148,163,184,0.03)', color: selectedAnswer === i ? '#60a5fa' : 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontSize: '14px', fontWeight: selectedAnswer === i ? 600 : 400, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Sora, sans-serif' }}
                  onMouseEnter={e => { if (selectedAnswer !== i) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(148,163,184,0.25)' }}
                  onMouseLeave={e => { if (selectedAnswer !== i) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${selectedAnswer === i ? '#3b82f6' : 'var(--border-hover)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: selectedAnswer === i ? '#3b82f6' : 'transparent' }}>
                    {selectedAnswer === i && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setMode('result')}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Sora' }}>
              <Flag size={14} /> Mark for Review
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)} className="btn btn-secondary" style={{ padding: '8px 16px', opacity: currentQ === 0 ? 0.4 : 1 }}>
                <ChevronLeft size={16} /> Prev
              </button>
              {currentQ < filteredQuestions.length - 1 ? (
                <button onClick={() => setCurrentQ(currentQ + 1)} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={submitTest} style={{ padding: '8px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'Sora', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> Submit Test
                </button>
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', padding: '0 4px' }}>
            {[{ c: '#3b82f6', l: 'Current' }, { c: 'transparent', l: 'Not Attempted', border: 'var(--border-hover)' }, { c: '#10b981', l: 'Answered' }, { c: '#f59e0b', l: 'Not Answered' }, { c: '#374151', l: 'Review' }].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: item.c, border: item.border ? `2px solid ${item.border}` : 'none' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Panel */}
        <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'auto' }}>
          
          {/* Timer */}
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time Left</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              {[{v: hrs, l: 'hrs'}, {v: mins, l: 'min'}, {v: secs, l: 'sec'}].map((t, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: timeLeft < 300 ? '#ef4444' : 'white', fontFamily: 'JetBrains Mono', lineHeight: 1 }}>{pad(t.v)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{t.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Grid */}
          {sections.map(sec => {
            const secQs = filteredQuestions.filter(q => q.section === sec)
            if (secQs.length === 0) return null
            return (
              <div key={sec} className="card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>{sec}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                  {secQs.map((sq) => {
                    const qIdx = filteredQuestions.indexOf(sq)
                    const status = getQuestionStatus(qIdx)
                    return (
                      <button key={sq.id} onClick={() => setCurrentQ(qIdx)}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: `2px solid ${status === 'current' ? '#3b82f6' : status === 'answered' ? '#10b981' : status === 'not_answered' ? '#f59e0b' : status === 'review' ? '#4b5563' : 'var(--border)'}`, background: status === 'current' ? '#3b82f6' : status === 'answered' ? 'rgba(16,185,129,0.2)' : status === 'not_answered' ? 'rgba(245,158,11,0.2)' : status === 'review' ? 'rgba(75,85,99,0.4)' : 'transparent', color: status === 'current' ? 'white' : status === 'answered' ? '#34d399' : status === 'not_answered' ? '#fbbf24' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', transition: 'all 0.1s' }}>
                        {qIdx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <button onClick={submitTest}
            style={{ padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white', fontSize: '14px', fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Sora', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CheckCircle size={18} /> Submit Test
          </button>
        </div>
      </div>
    </div>
  )
}
