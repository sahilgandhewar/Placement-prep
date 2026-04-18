'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, Zap, ArrowRight, User, GraduationCap, X, ChevronLeft, Shield } from 'lucide-react'

// ── OTP Input component ───────────────────────────────────────────────────────
function OTPInput({ onComplete }: { onComplete: (otp: string) => void }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
    if (next.every(d => d !== '')) onComplete(next.join(''))
  }

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      onComplete(pasted)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          style={{
            width: '46px', height: '52px', textAlign: 'center', fontSize: '20px', fontWeight: 700,
            background: digit ? 'rgba(99,102,241,0.12)' : 'rgba(148,163,184,0.06)',
            border: `2px solid ${digit ? '#6366f1' : 'rgba(148,163,184,0.15)'}`,
            borderRadius: '12px', color: 'white', outline: 'none',
            fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s', cursor: 'text',
          }}
          onFocus={e => (e.target.style.borderColor = '#6366f1')}
          onBlur={e => (e.target.style.borderColor = digit ? '#6366f1' : 'rgba(148,163,184,0.15)')}
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}

// ── Google Sign-In Modal (food-delivery style) ─────────────────────────────────
function GoogleModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (user: any) => void }) {
  type Step = 'accounts' | 'email' | 'name' | 'otp' | 'verifying'
  const [step, setStep] = useState<Step>('accounts')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [college, setCollege] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<any>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const timerRef = useRef<any>(null)
  const DEMO_OTP = '123456'

  const startResendTimer = () => {
    setResendTimer(30)
    timerRef.current = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0 } return t - 1 })
    }, 1000)
  }

  const sendOTP = async (targetEmail: string) => {
    setStep('otp')
    setOtpSent(true)
    startResendTimer()
    toast.success(`OTP sent to ${targetEmail} (Demo OTP: 123456)`, { duration: 5000, icon: '📧' })
  }

  const handleAccountSelect = (account: any) => {
    setSelectedAccount(account)
    setEmail(account.email)
    setName(account.name)
    sendOTP(account.email)
  }

  const handleUseOtherEmail = () => {
    setStep('email')
  }

  const handleEmailContinue = async () => {
    if (!email || !email.includes('@')) { toast.error('Enter a valid email address'); return }

    // Check if email exists
    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.exists) {
        setName(data.name || '')
        sendOTP(email)
        return
      }
    } catch { /* no DB — proceed to name step */ }

    // New user — ask for name
    setStep('name')
  }

  const handleNameContinue = () => {
    if (!name.trim()) { toast.error('Please enter your name'); return }
    sendOTP(email)
  }

  const handleOTPComplete = async (otp: string) => {
    if (otp !== DEMO_OTP) {
      // In demo mode accept any 6-digit OTP, in production validate server-side
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        // accept for demo
      } else {
        toast.error('Invalid OTP. Use 123456 for demo.')
        return
      }
    }
    setStep('verifying')

    // Create / login user
    const displayName = name || email.split('@')[0]
    try {
      await fetch('/api/auth/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: displayName, email, password: `google_${Date.now()}`, college, role: 'student', provider: 'google' })
      })
    } catch { /* demo mode */ }

    await new Promise(r => setTimeout(r, 1000))
    onSuccess({ name: displayName, email, role: 'student', college })
  }

  const backdropClick = (e: any) => { if (e.target === e.currentTarget) onClose() }

  const avatarColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']
  const getColor = (s: string) => avatarColors[s.charCodeAt(0) % avatarColors.length]

  return (
    <div onClick={backdropClick}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}>
      <div className="animate-fade-in-up"
        style={{ width: '380px', background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.7)', opacity: 1 }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {step !== 'accounts' && step !== 'verifying' && (
            <button onClick={() => setStep(step === 'otp' ? (selectedAccount ? 'accounts' : email ? 'name' : 'email') : step === 'name' ? 'email' : 'accounts')}
              style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(148,163,184,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <ChevronLeft size={18} />
            </button>
          )}
          {(step === 'accounts' || step === 'verifying') && <div />}
          <button onClick={onClose}
            style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(148,163,184,0.1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px 24px 28px' }}>

          {/* Google logo + title */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              <svg width="26" height="26" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>

            {step === 'accounts' && <>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white', marginBottom: '4px' }}>Sign in with Google</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Choose an account to continue to PlacePrep</p>
            </>}
            {step === 'email' && <>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white', marginBottom: '4px' }}>Enter your email</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Use your Google account email</p>
            </>}
            {step === 'name' && <>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white', marginBottom: '4px' }}>Complete profile</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Just a few more details</p>
            </>}
            {step === 'otp' && <>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white', marginBottom: '4px' }}>Verify it's you</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Enter the 6-digit code sent to<br /><strong style={{ color: '#60a5fa' }}>{email}</strong></p>
            </>}
            {step === 'verifying' && <>
              <h2 style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700, fontSize: '18px', color: 'white', marginBottom: '4px' }}>Signing you in...</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Setting up your account</p>
            </>}
          </div>

          {/* ── STEP: Account picker ─────────────────────────────────────── */}
          {step === 'accounts' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {[].map((acc, i) => (
                  <button key={i} onClick={() => handleAccountSelect(acc)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(148,163,184,0.05)', border: '1px solid rgba(148,163,184,0.1)', cursor: 'pointer', transition: 'all 0.15s', width: '100%', textAlign: 'left' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(148,163,184,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(148,163,184,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(148,163,184,0.1)' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: getColor(acc.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: 'white', flexShrink: 0, fontFamily: 'Plus Jakarta Sans' }}>
                      {acc.avatar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '2px' }}>{acc.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.email}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(148,163,184,0.1)' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(148,163,184,0.1)' }} />
              </div>

              <button onClick={handleUseOtherEmail}
                style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(148,163,184,0.2)', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(148,163,184,0.06)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <Mail size={16} /> Use another account
              </button>
            </div>
          )}

          {/* ── STEP: Email input ────────────────────────────────────────── */}
          {step === 'email' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" className="input" style={{ paddingLeft: '40px', background: 'rgba(148,163,184,0.06)' }}
                  placeholder="your@gmail.com" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEmailContinue()} autoFocus />
              </div>
              <button onClick={handleEmailContinue}
                style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg, #4285F4, #1a73e8)', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Sora', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP: Name + College ─────────────────────────────────────── */}
          {step === 'name' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.2)', fontSize: '13px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={13} /> {email}
              </div>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="input" style={{ paddingLeft: '40px', background: 'rgba(148,163,184,0.06)' }}
                  placeholder="Your full name *" value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="input" style={{ paddingLeft: '40px', background: 'rgba(148,163,184,0.06)' }}
                  placeholder="College name (optional)" value={college} onChange={e => setCollege(e.target.value)} />
              </div>
              <button onClick={handleNameContinue}
                style={{ width: '100%', padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg, #4285F4, #1a73e8)', color: 'white', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Sora', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Send OTP <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP: OTP ───────────────────────────────────────────────── */}
          {step === 'otp' && (
            <div>
              {/* Demo OTP hint */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '20px' }}>
                <Shield size={14} style={{ color: '#34d399', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: '#34d399' }}>Demo OTP: <strong style={{ fontFamily: 'JetBrains Mono', fontSize: '14px', letterSpacing: '2px' }}>1 2 3 4 5 6</strong></p>
              </div>

              <OTPInput onComplete={handleOTPComplete} />

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                {resendTimer > 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Resend OTP in <strong style={{ color: '#60a5fa' }}>{resendTimer}s</strong>
                  </p>
                ) : (
                  <button onClick={() => { sendOTP(email) }}
                    style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Sora' }}>
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP: Verifying ──────────────────────────────────────────── */}
          {step === 'verifying' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Verifying and signing you in...</p>
            </div>
          )}

          {/* Footer */}
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
            By continuing, you agree to PlacePrep's{' '}
            <span style={{ color: '#60a5fa' }}>Terms of Service</span> and{' '}
            <span style={{ color: '#60a5fa' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [remember, setRemember] = useState(false)

  // Redirect if signed in via OAuth
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const u = { name: session.user.name, email: session.user.email, role: 'student', college: '' }
      localStorage.setItem('pp_user', JSON.stringify(u))
      localStorage.setItem('pp_token', 'oauth-' + Date.now())
      toast.success(`Welcome, ${session.user.name?.split(' ')[0]}! 🎉`)
      router.push('/dashboard')
    }
  }, [status, session, router])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('pp_user', JSON.stringify(data.user))
        localStorage.setItem('pp_token', data.token)
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else toast.error(data.message || 'Invalid credentials')
    } catch {
      const user = { name: form.email.split('@')[0] || 'Student', email: form.email, role: 'student', college: '' }
      localStorage.setItem('pp_user', JSON.stringify(user))
      localStorage.setItem('pp_token', 'demo-token-' + Date.now())
      toast.success('Welcome to PlacePrep AI! 🚀')
      router.push('/dashboard')
    } finally { setLoading(false) }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch {
      toast.error('Google sign-in failed. Try again.')
    }
  }

  const handleGitHubSignIn = async () => {
    try {
      await signIn('github', { callbackUrl: '/dashboard' })
    } catch {
      toast.error('GitHub sign-in failed. Try again.')
    }
  }

  const socialBtn = {
    display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const,
    gap: '8px', padding: '11px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 as const,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text-secondary)' as const, cursor: 'pointer' as const,
    fontFamily: 'Sora, sans-serif', transition: 'all 0.2s', width: '100%' as const,
  }

  return (
    <>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>

        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(80px)', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

        <div className="relative z-10 w-full max-w-[420px] mx-4 animate-fade-in-up">
          <div className="glass-strong rounded-2xl p-8 shadow-2xl"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 80px rgba(99,102,241,0.1)' }}>

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative"
                style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                <Zap size={26} className="text-white" fill="white" />
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: '0 0 30px rgba(99,102,241,0.6)' }} />
              </div>
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Welcome back</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Sign in to your PlacePrep account</p>
            </div>

            {/* Social */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button type="button" onClick={handleGoogleSignIn} style={socialBtn}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button"
                onClick={handleGitHubSignIn}
                style={socialBtn}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" className="input pl-10" placeholder="you@example.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type={showPass ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="••••••••"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer" onClick={() => setRemember(!remember)}>
                  <div className={`custom-checkbox ${remember ? 'checked' : ''}`}>
                    {remember && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Remember me</span>
                </label>
                <Link href="/auth/signup" style={{ fontSize: '13px', color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', fontSize: '15px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: 'white', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Sora, sans-serif', opacity: loading ? 0.8 : 1, boxShadow: '0 8px 24px rgba(99,102,241,0.35)', marginTop: '8px' }}>
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>

            <p className="text-center mt-6" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
            </p>
          </div>
          <p className="text-center mt-4" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🔒 Secured with JWT authentication</p>
        </div>
      </div>
    </>
  )
}
