'use client'
import { useState, useRef } from 'react'
import Topbar from '@/components/ui/Topbar'
import { Upload, FileText, CheckCircle, AlertCircle, Zap, Star, Target, TrendingUp, Download, RefreshCw, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

const mockAnalysis = {
  atsScore: 78,
  overallScore: 82,
  sections: {
    contact: { score: 95, status: 'good', feedback: 'Contact info is complete and well-formatted.' },
    summary: { score: 70, status: 'ok', feedback: 'Add quantifiable achievements to your summary.' },
    experience: { score: 85, status: 'good', feedback: 'Good use of action verbs. Add more metrics.' },
    skills: { score: 75, status: 'ok', feedback: 'Missing some key technical skills for your target role.' },
    education: { score: 90, status: 'good', feedback: 'Education section is well-structured.' },
    projects: { score: 65, status: 'warning', feedback: 'Add 2-3 more relevant projects with tech stack details.' },
  },
  skills: {
    found: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs', 'MongoDB'],
    missing: ['TypeScript', 'Docker', 'AWS/Cloud', 'System Design', 'Data Structures', 'Kubernetes'],
  },
  improvements: [
    { priority: 'high', text: 'Add a quantified achievement: e.g. "Improved API response time by 40%"' },
    { priority: 'high', text: 'Include TypeScript and Docker in your skills section' },
    { priority: 'medium', text: 'Add a GitHub profile link with active contributions' },
    { priority: 'medium', text: 'Expand project descriptions with tech stack and impact' },
    { priority: 'low', text: 'Use stronger action verbs: "architected", "optimized", "engineered"' },
    { priority: 'low', text: 'Add relevant certifications (AWS, Google Cloud, etc.)' },
  ],
  keywords: {
    matched: ['software engineer', 'full stack', 'REST API', 'agile', 'python', 'database'],
    recommended: ['microservices', 'CI/CD', 'cloud native', 'scalable', 'distributed systems'],
  }
}

const priorityColor: Record<string, string> = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<typeof mockAnalysis | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { toast.error('Please upload a PDF file'); return }
    if (f.size > 5 * 1024 * 1024) { toast.error('File size must be under 5MB'); return }
    setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const analyzeResume = async () => {
    if (!file) { toast.error('Please upload a resume first'); return }
    setAnalyzing(true)
    toast('Analyzing your resume with AI...', { icon: '🤖' })
    await new Promise(r => setTimeout(r, 3000))
    setAnalysis(mockAnalysis)
    setAnalyzing(false)
    toast.success('Analysis complete!')
  }

  const scoreColor = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div>
      <Topbar title="AI Resume Analyzer" subtitle="Get ATS score and personalized feedback" />
      <div style={{ padding: '28px' }}>

        {!analysis ? (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {/* Upload Area */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#6366f1' : file ? '#10b981' : 'var(--border-hover)'}`,
                borderRadius: '20px', padding: '60px 40px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'rgba(99,102,241,0.05)' : file ? 'rgba(16,185,129,0.05)' : 'rgba(148,163,184,0.03)',
                transition: 'all 0.2s ease', marginBottom: '24px',
              }}>
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {file ? (
                <>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <FileText size={32} style={{ color: '#10b981' }} />
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{file.name}</p>
                  <p style={{ fontSize: '14px', color: '#34d399' }}>✓ Ready to analyze — {(file.size / 1024).toFixed(0)} KB</p>
                </>
              ) : (
                <>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Upload size={32} style={{ color: '#a78bfa' }} />
                  </div>
                  <p style={{ fontSize: '18px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Drop your resume here</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>or click to browse files</p>
                  <span className="badge badge-purple">PDF only · Max 5MB</span>
                </>
              )}
            </div>

            <button onClick={analyzeResume} disabled={!file || analyzing}
              className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', borderRadius: '14px', opacity: !file ? 0.5 : 1 }}>
              {analyzing ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing with AI...</>
              ) : (
                <><Zap size={20} fill="white" />Analyze Resume</>
              )}
            </button>

            {analyzing && (
              <div style={{ marginTop: '24px', padding: '20px', borderRadius: '14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                {['Parsing PDF content...', 'Extracting skills & keywords...', 'Calculating ATS compatibility...', 'Generating personalized feedback...'].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: i < 3 ? '10px' : 0 }}>
                    <div className="w-4 h-4 border border-indigo-400 border-t-transparent rounded-full animate-spin" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Score Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { label: 'ATS Score', value: analysis.atsScore, icon: Target, desc: 'Applicant Tracking System' },
                { label: 'Overall Score', value: analysis.overallScore, icon: Star, desc: 'Human reviewer rating' },
                { label: 'Improvement', value: '+18pts', icon: TrendingUp, desc: 'Potential after fixes', isText: true },
              ].map((s, i) => (
                <div key={i} className="card animate-fade-in-up" style={{ opacity: 0, animationDelay: `${i*0.1}s`, padding: '24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <s.icon size={28} style={{ color: s.isText ? '#10b981' : scoreColor(s.value as number) }} />
                  </div>
                  <div style={{ fontSize: '40px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans', color: s.isText ? '#34d399' : scoreColor(s.value as number), marginBottom: '4px' }}>
                    {s.isText ? s.value : `${s.value}%`}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{s.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Section Scores */}
              <div className="card animate-fade-in-up delay-200" style={{ opacity: 0, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '20px' }}>Section Analysis</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(analysis.sections).map(([key, val]) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{key}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: scoreColor(val.score) }}>{val.score}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${val.score}%`, background: scoreColor(val.score) }} />
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{val.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="card animate-fade-in-up delay-300" style={{ opacity: 0, padding: '24px' }}>
                <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '16px' }}>Skills Analysis</h3>
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#34d399', marginBottom: '8px' }}>✓ Found in Resume</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysis.skills.found.map(s => (
                      <span key={s} style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500, background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#f87171', marginBottom: '8px' }}>✗ Missing Key Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {analysis.skills.missing.map(s => (
                      <span key={s} style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div className="card animate-fade-in-up delay-400" style={{ opacity: 0, padding: '24px' }}>
              <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '20px' }}>
                🤖 AI Improvement Suggestions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {analysis.improvements.map((imp, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: '10px', border: `1px solid ${priorityColor[imp.priority]}30`, background: `${priorityColor[imp.priority]}08`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertCircle size={16} style={{ color: priorityColor[imp.priority], flexShrink: 0, marginTop: '1px' }} />
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: priorityColor[imp.priority], textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>{imp.priority} priority</span>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{imp.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setAnalysis(null); setFile(null) }} className="btn btn-secondary">
                <RefreshCw size={16} /> Analyze Another
              </button>
              <button onClick={() => toast('Download feature available with backend setup')} className="btn btn-primary">
                <Download size={16} /> Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
