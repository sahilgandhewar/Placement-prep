'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Topbar from '@/components/ui/Topbar'
import {
  Mic, MicOff, Video, VideoOff, Send, Bot, RotateCcw,
  CheckCircle, PhoneOff, Volume2, VolumeX, Zap, Clock,
  AlertCircle, Trophy, ChevronRight, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

// ── Question Bank ─────────────────────────────────────────────────────────────
const questionBank: Record<string, string[]> = {
  technical: [
    'Tell me about yourself and your technical background.',
    'Explain the difference between Stack and Queue with real-world examples.',
    'What is the time complexity of QuickSort in average and worst case? Why?',
    'How does a HashMap work internally? What happens during a hash collision?',
    'Explain RESTful API design principles and the HTTP methods you would use.',
  ],
  behavioral: [
    'Tell me about yourself — your background and why you chose this field.',
    'Describe a challenging technical problem you solved. Walk me through it.',
    'Tell me about a time you had a disagreement with a team member. How did you handle it?',
    'What is your greatest professional achievement so far?',
    'Where do you see yourself in 5 years?',
  ],
  hr: [
    'Why do you want to join our company specifically?',
    'What are your greatest strengths and one area you want to improve?',
    'How do you handle pressure and tight deadlines?',
    'Tell me about a time you showed leadership.',
    'Do you have any questions for us?',
  ],
  mixed: [
    'Introduce yourself briefly — name, college, and what you have built.',
    'What is the difference between a process and a thread?',
    'A train travels 360 km in 4 hours. What is its speed in m/s?',
    'Describe a project you are proud of and the tech stack you used.',
    'Why should we hire you over other candidates?',
  ],
}

const interviewTypes = [
  { id: 'technical', label: 'Technical', desc: 'DSA, System Design, CS Fundamentals', icon: '💻', color: '#3b82f6' },
  { id: 'behavioral', label: 'Behavioral', desc: 'STAR method, Situational, Leadership', icon: '🧠', color: '#8b5cf6' },
  { id: 'hr', label: 'HR Round', desc: 'Company fit, Goals, Culture', icon: '🤝', color: '#10b981' },
  { id: 'mixed', label: 'Full Round', desc: 'Mix of all types', icon: '🎯', color: '#f59e0b' },
]

type Msg = { role: 'ai' | 'user'; text: string; time: string; score?: number }

// ── AI Feedback generator (calls OpenAI if key exists, else local) ─────────────
async function getAIFeedback(question: string, answer: string): Promise<{ feedback: string; score: number }> {
  try {
    const res = await fetch('/api/interview/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
    })
    if (res.ok) {
      const data = await res.json()
      return { feedback: data.feedback, score: data.score }
    }
  } catch { /* fallthrough */ }

  // Local fallback feedback
  const score = Math.min(95, Math.max(50,
    60 +
    Math.min(20, answer.split(' ').length / 3) +
    (answer.toLowerCase().includes('example') ? 8 : 0) +
    (answer.toLowerCase().includes('because') ? 5 : 0) +
    (answer.length > 200 ? 7 : 0)
  ))

  const feedbacks = [
    `Good answer! Score: ${Math.round(score)}/100\n\n💡 **Tip:** Add a concrete example from your own experience to make it more memorable. Use the STAR method: Situation → Task → Action → Result.`,
    `Solid response! Score: ${Math.round(score)}/100\n\n💡 **Tip:** Quantify your achievements where possible — numbers make your answer stand out. Example: "improved performance by 40%".`,
    `Nice work! Score: ${Math.round(score)}/100\n\n💡 **Tip:** Structure your answer better — start with the key point, then elaborate. Interviewers appreciate concise, well-organized responses.`,
  ]
  return { feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)], score: Math.round(score) }
}

// ── Text-to-Speech helper ─────────────────────────────────────────────────────
function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const clean = text.replace(/\*\*/g, '').replace(/💡/g, '').replace(/\n/g, ' ')
  const utt = new SpeechSynthesisUtterance(clean)
  utt.rate = 0.95
  utt.pitch = 1.05
  utt.volume = 1
  const voices = window.speechSynthesis.getVoices()
  const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
    || voices.find(v => v.lang.startsWith('en-'))
  if (preferred) utt.voice = preferred
  if (onEnd) utt.onend = onEnd
  window.speechSynthesis.speak(utt)
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function InterviewPage() {
  const [mode, setMode] = useState<'home' | 'setup' | 'interview' | 'result'>('home')
  const [type, setType] = useState('technical')
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [currentQ, setCurrentQ] = useState(0)
  const [aiLoading, setAiLoading] = useState(false)
  const [scores, setScores] = useState<number[]>([])

  // Media states
  const [micOn, setMicOn] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [speakerOn, setSpeakerOn] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [cameraError, setCameraError] = useState(false)
  const [aiSpeakingText, setAiSpeakingText] = useState('')

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<any>(null)

  const questions = questionBank[type] || questionBank.technical
  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // ── Scroll chat to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, aiLoading])

  // ── Load voices ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') window.speechSynthesis.getVoices()
  }, [])

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode === 'interview') {
      timerRef.current = setInterval(() => setElapsed(t => t + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [mode])

  // ── Camera ───────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraError(false)
    } catch {
      setCameraError(true)
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    if (mode === 'interview' && videoOn) startCamera()
    if (mode !== 'interview') { stopCamera(); window.speechSynthesis?.cancel() }
    return () => { if (mode === 'interview') stopCamera() }
  }, [mode])

  const toggleVideo = () => {
    if (!videoOn) { startCamera(); setVideoOn(true) }
    else {
      stopCamera()
      if (videoRef.current) videoRef.current.srcObject = null
      setVideoOn(false)
    }
  }

  // ── Speech Recognition ───────────────────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { toast.error('Speech recognition not supported in this browser. Use Chrome.'); return }
    if (!micOn) { toast.error('Microphone is muted'); return }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => { setIsListening(false); toast.error('Mic error — check browser permissions') }

    recognition.onresult = (e: any) => {
      let final = '', interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript
        else interim += e.results[i][0].transcript
      }
      setTranscript(prev => prev + final)
      setInput(prev => (prev + final + interim).trim())
    }

    recognition.start()
    toast('🎤 Listening... speak your answer', { duration: 2000 })
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setTranscript('')
  }

  const toggleMic = () => {
    if (isListening) stopListening()
    setMicOn(m => !m)
  }

  // ── AI speaks question ───────────────────────────────────────────────────────
  const aiSpeak = (text: string, onEnd?: () => void) => {
    if (!speakerOn) { onEnd?.(); return }
    setIsSpeaking(true)
    setAiSpeakingText(text)
    speak(text, () => { setIsSpeaking(false); setAiSpeakingText(''); onEnd?.() })
  }

  // ── Start interview ──────────────────────────────────────────────────────────
  const startInterview = () => {
    setMode('interview')
    setMessages([])
    setCurrentQ(0)
    setScores([])
    setElapsed(0)
    setInput('')

    const firstQ = questions[0]
    const greeting = `Hello! Welcome to your ${type} interview. I'm your AI interviewer today.\n\nLet's begin!\n\n**Question 1 of ${questions.length}:**\n${firstQ}`
    setTimeout(() => {
      setMessages([{ role: 'ai', text: greeting, time: now() }])
      aiSpeak(`Hello! Welcome to your ${type} interview. I'm your AI interviewer. Let's begin! Question 1: ${firstQ}`)
    }, 800)
  }

  // ── Submit answer ─────────────────────────────────────────────────────────────
  const submitAnswer = async () => {
    const answer = input.trim()
    if (!answer) { toast.error('Please say or type your answer'); return }
    if (isListening) stopListening()
    window.speechSynthesis.cancel()

    const userMsg: Msg = { role: 'user', text: answer, time: now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAiLoading(true)

    const { feedback, score } = await getAIFeedback(questions[currentQ], answer)
    setScores(prev => [...prev, score])

    const nextIdx = currentQ + 1
    const isLast = nextIdx >= questions.length

    let aiText = feedback
    if (!isLast) {
      aiText += `\n\n**Question ${nextIdx + 1} of ${questions.length}:**\n${questions[nextIdx]}`
    } else {
      aiText += `\n\n🎉 **Interview Complete!** You answered all ${questions.length} questions. Great job! Click "View Results" to see your full analysis.`
    }

    const aiMsg: Msg = { role: 'ai', text: aiText, time: now(), score }
    setMessages(prev => [...prev, aiMsg])
    setAiLoading(false)

    if (!isLast) {
      setCurrentQ(nextIdx)
      aiSpeak(`${feedback.split('\n')[0]} Now question ${nextIdx + 1}: ${questions[nextIdx]}`)
    } else {
      clearInterval(timerRef.current)
      aiSpeak('Interview complete! Great job today.')
      setTimeout(() => toast('🎯 Interview done! View your results.', { duration: 4000 }), 1000)
    }
  }

  const endInterview = () => {
    clearInterval(timerRef.current)
    stopCamera()
    stopListening()
    window.speechSynthesis.cancel()
    setMode('result')
  }

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  // ── Result Screen ─────────────────────────────────────────────────────────────
  if (mode === 'result') return (
    <div>
      <Topbar title="Interview Results" />
      <div style={{ padding: '28px', maxWidth: '760px', margin: '0 auto' }}>

        {/* Score card */}
        <div className="card animate-fade-in-up" style={{ opacity: 0, padding: '40px', textAlign: 'center', marginBottom: '20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.06))' }}>
          <div style={{ fontSize: '56px', marginBottom: '8px' }}>
            {avgScore >= 80 ? '🏆' : avgScore >= 60 ? '🎯' : '💪'}
          </div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '26px', color: 'white', marginBottom: '8px' }}>
            Interview Complete!
          </h2>
          <div style={{ fontSize: '52px', fontWeight: 900, fontFamily: 'Plus Jakarta Sans', color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444', margin: '12px 0' }}>
            {avgScore}%
          </div>
          <p style={{ color: avgScore >= 80 ? '#34d399' : avgScore >= 60 ? '#fbbf24' : '#f87171', fontWeight: 700, fontSize: '16px', marginBottom: '24px' }}>
            {avgScore >= 80 ? 'Excellent Performance! 🌟' : avgScore >= 60 ? 'Good Job! Keep it up 👍' : 'Keep Practicing! 💪'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '28px' }}>
            {[
              { v: scores.length, l: 'Questions', c: '#60a5fa' },
              { v: `${mins}:${String(secs).padStart(2,'0')}`, l: 'Duration', c: '#a78bfa' },
              { v: `${Math.max(...scores, 0)}%`, l: 'Best Score', c: '#34d399' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: s.c, fontFamily: 'Plus Jakarta Sans' }}>{s.v}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => { setMode('home'); setMessages([]); setScores([]) }}
              className="btn btn-secondary">
              <RotateCcw size={16} /> New Interview
            </button>
            <button onClick={() => { startInterview() }}
              className="btn btn-primary">
              <Zap size={16} /> Retry Same Type
            </button>
          </div>
        </div>

        {/* Per-question breakdown */}
        {scores.map((score, i) => (
          <div key={i} className="card" style={{ padding: '18px 22px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: score >= 80 ? 'rgba(16,185,129,0.15)' : score >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444' }}>Q{i + 1}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{questions[i]}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${score}%`, background: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444', transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171', flexShrink: 0 }}>{score}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── Home Screen ───────────────────────────────────────────────────────────────
  if (mode === 'home') return (
    <div>
      <Topbar title="AI Mock Interview" subtitle="Real-time AI interviewer with voice & video" />
      <div style={{ padding: '28px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          {/* Hero */}
          <div className="card animate-fade-in-up" style={{ opacity: 0, padding: '28px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.08))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={28} color="white" />
              </div>
              <div>
                <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 800, fontSize: '20px', color: 'white' }}>Real-Time AI Interviewer</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Speaks questions aloud · Listens to your voice · Gives instant feedback</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { icon: '🎤', label: 'Voice Input', desc: 'Answer by speaking' },
                { icon: '📹', label: 'Live Video', desc: 'Webcam preview' },
                { icon: '🤖', label: 'AI Feedback', desc: 'Instant scoring' },
              ].map((f, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: '12px', background: 'rgba(148,163,184,0.06)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{f.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>{f.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Type selection */}
          <h3 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '17px', color: 'white', marginBottom: '14px' }}>Choose Interview Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
            {interviewTypes.map((t) => (
              <div key={t.id} onClick={() => setType(t.id)} className="card"
                style={{ padding: '20px', cursor: 'pointer', border: `2px solid ${type === t.id ? t.color : 'var(--border)'}`, background: type === t.id ? `${t.color}10` : 'var(--bg-card)', transition: 'all 0.2s' }}
                onMouseEnter={e => { if (type !== t.id) (e.currentTarget as HTMLElement).style.borderColor = `${t.color}60` }}
                onMouseLeave={e => { if (type !== t.id) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>{t.icon}</div>
                <h4 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '16px', color: 'white', marginBottom: '4px' }}>{t.label}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</p>
                {type === t.id && <CheckCircle size={18} style={{ color: t.color, marginTop: '10px' }} />}
              </div>
            ))}
          </div>

          {/* Permissions note */}
          <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px' }}>
            <AlertCircle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '1px' }} />
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This interview uses your <strong style={{ color: 'white' }}>microphone</strong> for voice answers and <strong style={{ color: 'white' }}>camera</strong> for video preview. Your browser will ask for permission when you start. Use <strong style={{ color: 'white' }}>Chrome</strong> for best voice recognition.
            </p>
          </div>

          <button onClick={startInterview} className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', borderRadius: '14px' }}>
            <Zap size={20} fill="white" /> Start Interview Now
          </button>
        </div>
      </div>
    </div>
  )

  // ── Interview Screen ──────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Topbar title="AI Mock Interview" subtitle={`${type.charAt(0).toUpperCase() + type.slice(1)} — Question ${Math.min(currentQ + 1, questions.length)} of ${questions.length}`} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '16px', gap: '16px' }}>

        {/* ── LEFT: Video + Controls ───────────────────────────────────────── */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>

          {/* Camera */}
          <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#0a0f1e', aspectRatio: '4/3', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
            <video ref={videoRef} autoPlay muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: videoOn && !cameraError ? 'block' : 'none', transform: 'scaleX(-1)' }} />

            {(!videoOn || cameraError) && (
              <div style={{ textAlign: 'center' }}>
                <VideoOff size={36} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '8px' }} />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{cameraError ? 'Camera unavailable' : 'Camera off'}</p>
              </div>
            )}

            {/* Timer */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', borderRadius: '8px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '13px', color: 'white', fontWeight: 600 }}>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>

            {/* Mic wave when listening */}
            {isListening && (
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '99px' }}>
                {[4, 8, 12, 9, 6, 10, 7].map((h, i) => (
                  <div key={i} style={{ width: '3px', borderRadius: '99px', background: '#10b981', height: `${h}px`, animation: `pulse ${0.3 + i * 0.1}s ease-in-out infinite alternate` }} />
                ))}
                <span style={{ fontSize: '11px', color: '#34d399', marginLeft: '6px', fontWeight: 600 }}>Listening</span>
              </div>
            )}

            {/* AI speaking indicator */}
            {isSpeaking && (
              <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(99,102,241,0.8)', padding: '6px 14px', borderRadius: '99px' }}>
                <Volume2 size={13} color="white" />
                <span style={{ fontSize: '11px', color: 'white', fontWeight: 600 }}>AI Speaking...</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {[
              { icon: micOn ? Mic : MicOff, active: micOn, onClick: toggleMic, danger: !micOn, tip: micOn ? 'Mute' : 'Unmute' },
              { icon: videoOn ? Video : VideoOff, active: videoOn, onClick: toggleVideo, danger: !videoOn, tip: videoOn ? 'Camera off' : 'Camera on' },
              { icon: speakerOn ? Volume2 : VolumeX, active: speakerOn, onClick: () => { setSpeakerOn(s => !s); window.speechSynthesis.cancel() }, danger: !speakerOn, tip: speakerOn ? 'Mute AI' : 'Unmute AI' },
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} title={btn.tip}
                style={{ width: '46px', height: '46px', borderRadius: '50%', border: 'none', background: btn.danger ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: btn.danger ? '#f87171' : 'var(--text-secondary)' }}>
                <btn.icon size={19} />
              </button>
            ))}
            <button onClick={endInterview} title="End interview"
              style={{ width: '46px', height: '46px', borderRadius: '50%', border: 'none', background: 'rgba(239,68,68,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <PhoneOff size={19} style={{ color: '#f87171' }} />
            </button>
          </div>

          {/* Progress */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Progress</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa' }}>{Math.min(currentQ + 1, questions.length)}/{questions.length}</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: '12px' }}>
              <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', transition: 'width 0.5s ease' }} />
            </div>
            {scores.length > 0 && (
              <>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>Scores:</p>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {questions.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: '8px', borderRadius: '99px', background: scores[i] !== undefined ? (scores[i] >= 80 ? '#10b981' : scores[i] >= 60 ? '#f59e0b' : '#ef4444') : 'rgba(148,163,184,0.1)', transition: 'background 0.3s' }} title={scores[i] ? `Q${i + 1}: ${scores[i]}%` : `Q${i + 1}: Not answered`} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Voice mic button */}
          <button onClick={isListening ? stopListening : startListening}
            style={{ padding: '14px', borderRadius: '14px', border: 'none', background: isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #14b8a6)', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'Sora', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: isListening ? '0 0 20px rgba(239,68,68,0.4)' : '0 0 20px rgba(16,185,129,0.3)' }}>
            {isListening ? <><MicOff size={18} /> Stop Recording</> : <><Mic size={18} /> 🎤 Speak Answer</>}
          </button>
        </div>

        {/* ── RIGHT: Chat ──────────────────────────────────────────────────── */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Chat header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>AI Interviewer</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSpeaking ? '#6366f1' : '#10b981', animation: isSpeaking ? 'pulse 1s ease-in-out infinite' : 'none' }} />
                <p style={{ fontSize: '12px', color: isSpeaking ? '#a78bfa' : '#34d399' }}>
                  {isSpeaking ? 'Speaking...' : aiLoading ? 'Thinking...' : 'Listening'}
                </p>
              </div>
            </div>
            {isSpeaking && (
              <button onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false) }}
                style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora' }}>
                Skip ⏭
              </button>
            )}
          </div>

          {/* Messages */}
          <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: msg.role === 'ai' ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : 'linear-gradient(135deg, #10b981, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {msg.role === 'ai' ? <Bot size={15} color="white" /> : <span style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>You</span>}
                </div>
                <div style={{ maxWidth: '75%' }}>
                  <div style={{ padding: '12px 16px', borderRadius: msg.role === 'ai' ? '4px 14px 14px 14px' : '14px 4px 14px 14px', background: msg.role === 'ai' ? 'rgba(99,102,241,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${msg.role === 'ai' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`, fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                    {msg.text.replace(/\*\*/g, '')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{msg.time}</span>
                    {msg.score && <span style={{ fontSize: '11px', fontWeight: 700, color: msg.score >= 80 ? '#34d399' : msg.score >= 60 ? '#fbbf24' : '#f87171' }}>Score: {msg.score}%</span>}
                  </div>
                </div>
              </div>
            ))}

            {aiLoading && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={15} color="white" />
                </div>
                <div style={{ padding: '14px 18px', borderRadius: '4px 14px 14px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <Loader2 size={14} style={{ color: '#a78bfa', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '13px', color: '#a78bfa' }}>Evaluating your answer...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
            {/* Live transcript preview */}
            {isListening && input && (
              <div style={{ marginBottom: '10px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '13px', color: '#34d399', fontStyle: 'italic' }}>
                🎤 "{input}"
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer() } }}
                placeholder="Type your answer or click 🎤 Speak Answer above... (Enter to send)"
                rows={2}
                style={{ flex: 1, padding: '12px 14px', background: 'rgba(148,163,184,0.05)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '13.5px', fontFamily: 'Sora, sans-serif', resize: 'none', outline: 'none', minHeight: '48px', maxHeight: '100px', lineHeight: 1.5 }}
                onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button onClick={submitAnswer} disabled={aiLoading || !input.trim()}
                style={{ width: '48px', height: '48px', borderRadius: '12px', border: 'none', background: aiLoading || !input.trim() ? 'rgba(148,163,184,0.1)' : 'linear-gradient(135deg, #6366f1, #3b82f6)', cursor: aiLoading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                <Send size={18} color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
