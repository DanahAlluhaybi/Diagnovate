'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Check, Loader2, RotateCcw } from 'lucide-react';
import { auth } from '@/lib/api';

const SPECIALTIES = ['Pathology', 'Radiology', 'Endocrinology', 'Surgery', 'Oncology', 'General Practice'];
const STEP_LABELS  = ['Registration', 'Phone OTP', 'Email OTP', 'Review'];

export default function SignUpPage() {
    const router = useRouter();

    /* ── navigation ── */
    const [step,    setStep]    = useState(0);
    const [forward, setForward] = useState(true);

    /* ── registration form ── */
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        idNumber: '', specialty: '', password: '', confirm: '',
    });
    const [showPw,  setShowPw]  = useState(false);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    /* ── phone OTP ── */
    const [phoneCode,   setPhoneCode]   = useState(['', '', '', '', '', '']);
    const [phoneId,     setPhoneId]     = useState('');
    const [phoneResent, setPhoneResent] = useState(false);

    /* ── email OTP ── */
    const [emailCode,    setEmailCode]    = useState(['', '', '', '', '', '']);
    const [verifyEmail,  setVerifyEmail]  = useState('');
    const [emailResent,  setEmailResent]  = useState(false);

    /* ── pending step ── */
    const [nextCheck, setNextCheck] = useState(30);

    /* ── phone OTP refs ── */
    const p0 = useRef<HTMLInputElement>(null);
    const p1 = useRef<HTMLInputElement>(null);
    const p2 = useRef<HTMLInputElement>(null);
    const p3 = useRef<HTMLInputElement>(null);
    const p4 = useRef<HTMLInputElement>(null);
    const p5 = useRef<HTMLInputElement>(null);
    const pRefs = [p0, p1, p2, p3, p4, p5];

    /* ── email OTP refs ── */
    const e0 = useRef<HTMLInputElement>(null);
    const e1 = useRef<HTMLInputElement>(null);
    const e2 = useRef<HTMLInputElement>(null);
    const e3 = useRef<HTMLInputElement>(null);
    const e4 = useRef<HTMLInputElement>(null);
    const e5 = useRef<HTMLInputElement>(null);
    const eRefs = [e0, e1, e2, e3, e4, e5];

    /* ── navigation helper ── */
    const goTo = (next: number) => {
        setForward(next > step);
        setError('');
        setStep(next);
    };

    /* ── step 3: status polling ── */
    useEffect(() => {
        if (step !== 3) return;

        let secs = 30;
        setNextCheck(30);

        const tick = setInterval(() => {
            secs -= 1;
            if (secs <= 0) secs = 30;
            setNextCheck(secs);
        }, 1000);

        const poll = async () => {
            try {
                const data = await auth.checkStatus();
                if (data?.status === 'approved' || data?.approved === true) {
                    router.push('/dashboard');
                }
            } catch { /* keep waiting */ }
        };

        poll();
        const pollId = setInterval(poll, 30_000);

        return () => { clearInterval(tick); clearInterval(pollId); };
    }, [step]);

    /* ═══════════════════════════════
       STEP 0 — Registration
    ═══════════════════════════════ */
    const goNext = () => {
        if (!/^[a-zA-Z؀-ۿ\s]+$/.test(form.firstName) ||
            !/^[a-zA-Z؀-ۿ\s]+$/.test(form.lastName)) {
            setError('First and last name must contain letters only.'); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError('Please enter a valid email address.'); return;
        }
        if (!/^05\d{8}$/.test(form.phone)) {
            setError('Phone number must start with 05 and be 10 digits.'); return;
        }
        if (!/^[12]\d{9}$/.test(form.idNumber)) {
            setError(form.idNumber.length !== 10 ? 'ID number must be 10 digits.' : 'ID number must start with 1 or 2.');
            return;
        }
        if (!form.specialty) { setError('Please select your specialty.'); return; }
        if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        handleSignup();
    };

    const handleSignup = async () => {
        setError(''); setLoading(true);
        try {
            const raw = await auth.signup({
                name:           `${form.firstName} ${form.lastName}`.trim(),
                email:          form.email,
                password:       form.password,
                specialty:      form.specialty,
                phone:          form.phone,
                license_number: form.idNumber,
            });
            setPhoneId(raw?.identifier ?? form.phone);
            setVerifyEmail(form.email);
            goTo(1);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally { setLoading(false); }
    };

    /* ═══════════════════════════════
       STEP 1 — Phone OTP
    ═══════════════════════════════ */
    const handlePhoneChange = (i: number, val: string) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...phoneCode]; next[i] = val.slice(-1); setPhoneCode(next);
        if (val && i < 5) pRefs[i + 1].current?.focus();
    };
    const handlePhoneKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !phoneCode[i] && i > 0) pRefs[i - 1].current?.focus();
    };
    const handlePhonePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
        const next = Array(6).fill('');
        digits.forEach((d, i) => { next[i] = d; });
        setPhoneCode(next);
        pRefs[Math.min(digits.length, 5)].current?.focus();
    };
    const handlePhoneVerify = async () => {
        setError(''); setLoading(true);
        try {
            const data = await auth.verifyOtp(phoneId, phoneCode.join(''));
            if (data.next_step === 'verify_email') {
                setVerifyEmail(data.email || form.email);
                goTo(2);
            } else {
                goTo(3);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
        } finally { setLoading(false); }
    };
    const handlePhoneResend = async () => {
        setPhoneCode(['', '', '', '', '', '']);
        setError('');
        try {
            await auth.resendOtp(phoneId);
            setPhoneResent(true);
            p0.current?.focus();
            setTimeout(() => setPhoneResent(false), 4000);
        } catch { setError('Failed to resend code.'); }
    };

    /* ═══════════════════════════════
       STEP 2 — Email OTP
    ═══════════════════════════════ */
    const handleEmailChange = (i: number, val: string) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...emailCode]; next[i] = val.slice(-1); setEmailCode(next);
        if (val && i < 5) eRefs[i + 1].current?.focus();
    };
    const handleEmailKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !emailCode[i] && i > 0) eRefs[i - 1].current?.focus();
    };
    const handleEmailPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
        const next = Array(6).fill('');
        digits.forEach((d, i) => { next[i] = d; });
        setEmailCode(next);
        eRefs[Math.min(digits.length, 5)].current?.focus();
    };
    const handleEmailVerify = async () => {
        setError(''); setLoading(true);
        try {
            await auth.verifyEmailOtp(verifyEmail, emailCode.join(''));
            goTo(3);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
        } finally { setLoading(false); }
    };
    const handleEmailResend = async () => {
        setEmailCode(['', '', '', '', '', '']);
        setError('');
        try {
            await auth.resendEmailOtp(verifyEmail);
            setEmailResent(true);
            e0.current?.focus();
            setTimeout(() => setEmailResent(false), 4000);
        } catch { setError('Failed to resend code.'); }
    };

    /* ── password strength ── */
    const pw    = form.password;
    const pwStr = !pw ? 0 : pw.length < 6 ? 1 : pw.length < 8 ? 2 : /[^a-zA-Z0-9]/.test(pw) ? 4 : 3;
    const pwMeta = [null,
        { c: '#EF4444', l: 'Weak'   },
        { c: '#F59E0B', l: 'Fair'   },
        { c: '#0891B2', l: 'Good'   },
        { c: '#0D9488', l: 'Strong' },
    ];

    const phoneFilled = phoneCode.filter(Boolean).length;
    const emailFilled = emailCode.filter(Boolean).length;

    /* ── left-panel content per step ── */
    const leftContent = [
        {
            badge: 'Create Account',
            title: <>Join the future<br />of <em>thyroid</em><br />diagnostics.</>,
            sub: 'Create your account and get access to AI-powered tools built for clinical professionals.',
            points: ['AI-enhanced ultrasound imaging', 'Context-aware diagnostic recommendations', 'HIPAA-compliant & secure', 'Trusted by leading pathology labs'],
        },
        {
            badge: 'Phone Verification',
            title: <><em>Verify</em><br />your phone.</>,
            sub: "We sent a 6-digit SMS code to your phone. Enter it to continue.",
            points: ['Codes expire in 10 minutes', 'Use the number you registered with', 'Request a new code if needed', 'Your number stays private'],
        },
        {
            badge: 'Email Verification',
            title: <><em>Verify</em><br />your email.</>,
            sub: `We sent a 6-digit code to ${verifyEmail || 'your email'}. Check your inbox.`,
            points: ['Check your spam folder if needed', 'Codes expire in 10 minutes', 'Request a new code if needed', 'Your email is never shared'],
        },
        {
            badge: 'Under Review',
            title: <>Almost<br /><em>there!</em></>,
            sub: 'Your account is pending admin approval. We review new accounts regularly.',
            points: ['Admin reviews within 24 hours', 'You will receive an approval email', 'Full dashboard access after approval', 'Join hundreds of verified clinicians'],
        },
    ];
    const lc = leftContent[step];

    /* ── shared OTP alert helpers ── */
    const ErrAlert = () => error ? (
        <div className="dv-alert dv-alert-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
        </div>
    ) : null;

    return (
        <div className="auth-page">
            <style>{`
                @keyframes su-right { from { opacity:0; transform:translateX(32px) } to { opacity:1; transform:none } }
                @keyframes su-left  { from { opacity:0; transform:translateX(-32px) } to { opacity:1; transform:none } }
                .su-fwd  { animation: su-right .34s cubic-bezier(.16,1,.3,1) both }
                .su-back { animation: su-left  .34s cubic-bezier(.16,1,.3,1) both }
            `}</style>

            {/* ════ LEFT PANEL ════ */}
            <div className="auth-left">
                <div className="auth-left__dots" />
                <span className="auth-left__blob auth-left__blob--1" />
                <span className="auth-left__blob auth-left__blob--2" />
                <span className="auth-left__blob auth-left__blob--3" />

                <Link href="/" className="auth-logo">
                    <div className="auth-logo__mark">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white" />
                        </svg>
                    </div>
                    <span className="auth-logo__word">Diagno<span>vate</span></span>
                </Link>

                <div className="auth-left__body">
                    {/* 4-step progress */}
                    <div className="auth-steps">
                        {STEP_LABELS.map((s, i) => {
                            const state = i < step ? 'done' : i === step ? 'curr' : 'idle';
                            return (
                                <div key={s} className="auth-step">
                                    <div className={`auth-step__dot auth-step__dot--${state}`}>
                                        {state === 'done' ? <Check size={11} /> : i + 1}
                                    </div>
                                    <span className={`auth-step__lbl auth-step__lbl--${state}`}>{s}</span>
                                    {i < 3 && (
                                        <div className={`auth-step__line auth-step__line--${i < step ? 'done' : 'idle'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="auth-left__badge">
                        <span className="auth-left__badge-dot" />
                        {lc.badge}
                    </div>
                    <h1 className="auth-left__h1">{lc.title}</h1>
                    <p className="auth-left__sub">{lc.sub}</p>
                    <div className="auth-points">
                        {lc.points.map((p, i) => (
                            <div key={i} className="auth-point">
                                <div className="auth-point__icon">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5EEAD4" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                {p}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="auth-left__foot">
                    {['HIPAA', 'ICCR', 'WHO', 'TI-RADS', 'GDPR'].map(t => (
                        <span key={t} className="auth-compliance">{t}</span>
                    ))}
                </div>
            </div>

            {/* ════ RIGHT PANEL ════ */}
            <div className="auth-right">
                <nav className="auth-right__nav">
                    <Link href="/"        className="auth-right__nav-link">Home</Link>
                    <Link href="/about"   className="auth-right__nav-link">About</Link>
                    <Link href="/contact" className="auth-right__nav-link">Contact</Link>
                </nav>

                <div className="auth-form-area">

                    {/* ── progress bar ── */}
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                            {[0,1,2,3].map(i => (
                                <div key={i} style={{
                                    flex: 1, height: 3, borderRadius: 99,
                                    background: i <= step ? '#0D9488' : 'var(--border)',
                                    transition: 'background .4s',
                                }} />
                            ))}
                        </div>
                        <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, letterSpacing: '.04em' }}>
                            STEP {step + 1} OF 4
                        </p>
                    </div>

                    {/* ══ STEP 0: Registration ══ */}
                    {step === 0 && (
                        <div className={`auth-form-inner ${forward ? 'su-fwd' : 'su-back'}`}>
                            <h2 className="auth-form-h2">Create your account.</h2>
                            <p className="auth-form-sub">
                                Already registered? <Link href="/log-in?role=doctor">Sign in</Link>
                            </p>

                            <div className="auth-fields">
                                <div className="auth-g2">
                                    <div className="auth-field">
                                        <label className="dv-label">First Name</label>
                                        <div className="auth-iw">
                                            <span className="auth-iw__icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                                            </span>
                                            <input className="dv-input" placeholder="Sarah" value={form.firstName}
                                                onChange={e => { setError(''); setForm(f => ({...f, firstName: e.target.value})); }} />
                                        </div>
                                    </div>
                                    <div className="auth-field">
                                        <label className="dv-label">Last Name</label>
                                        <div className="auth-iw">
                                            <span className="auth-iw__icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                                            </span>
                                            <input className="dv-input" placeholder="Al-Rashid" value={form.lastName}
                                                onChange={e => { setError(''); setForm(f => ({...f, lastName: e.target.value})); }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label className="dv-label">Email Address</label>
                                    <div className="auth-iw">
                                        <span className="auth-iw__icon">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                                        </span>
                                        <input type="email" className="dv-input" placeholder="doctor@hospital.com" value={form.email}
                                            onChange={e => { setError(''); setForm(f => ({...f, email: e.target.value})); }} />
                                    </div>
                                </div>

                                <div className="auth-g2">
                                    <div className="auth-field">
                                        <label className="dv-label">Phone Number</label>
                                        <div className="auth-iw">
                                            <span className="auth-iw__icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9z"/></svg>
                                            </span>
                                            <input className="dv-input" placeholder="05xxxxxxxx" value={form.phone}
                                                onChange={e => { setError(''); setForm(f => ({...f, phone: e.target.value})); }} />
                                        </div>
                                    </div>
                                    <div className="auth-field">
                                        <label className="dv-label">License Number</label>
                                        <div className="auth-iw">
                                            <span className="auth-iw__icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
                                            </span>
                                            <input className="dv-input" placeholder="National ID / License" value={form.idNumber}
                                                onChange={e => { setError(''); setForm(f => ({...f, idNumber: e.target.value})); }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label className="dv-label">Specialty</label>
                                    <div className="auth-iw">
                                        <span className="auth-iw__icon">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                        </span>
                                        <select className="dv-input" value={form.specialty} style={{ cursor: 'pointer' }}
                                            onChange={e => { setError(''); setForm(f => ({...f, specialty: e.target.value})); }}>
                                            <option value="">Select your specialty...</option>
                                            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label className="dv-label">Password</label>
                                    <div className="auth-iw">
                                        <span className="auth-iw__icon">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                        </span>
                                        <input type={showPw ? 'text' : 'password'} className="dv-input"
                                            style={{ paddingRight: 46 }} placeholder="Min. 8 characters"
                                            value={form.password}
                                            onChange={e => { setError(''); setForm(f => ({...f, password: e.target.value})); }} />
                                        <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)}>
                                            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {pw && (
                                        <div className="auth-pw-str">
                                            <div className="auth-pw-str__bars">
                                                {[1,2,3,4].map(i => (
                                                    <div key={i} className="auth-pw-str__bar"
                                                        style={{ background: i <= pwStr ? pwMeta[pwStr]!.c : 'var(--border)' }} />
                                                ))}
                                            </div>
                                            <span className="auth-pw-str__lbl" style={{ color: pwMeta[pwStr]?.c }}>
                                                {pwMeta[pwStr]?.l}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="auth-field">
                                    <label className="dv-label">Confirm Password</label>
                                    <div className="auth-iw">
                                        <span className="auth-iw__icon">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                        </span>
                                        <input type="password" className="dv-input" placeholder="Repeat your password"
                                            value={form.confirm}
                                            style={form.confirm ? { borderColor: form.confirm === form.password ? 'var(--teal)' : 'var(--red)' } : {}}
                                            onChange={e => { setError(''); setForm(f => ({...f, confirm: e.target.value})); }} />
                                    </div>
                                    {form.confirm && form.confirm === form.password && (
                                        <div className="auth-pw-match"><Check size={13} /> Passwords match</div>
                                    )}
                                </div>

                                <ErrAlert />

                                <button type="button" className="auth-btn-primary" disabled={loading} onClick={goNext}>
                                    {loading
                                        ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Creating account...</>
                                        : <>Create Account <ArrowRight size={16} /></>
                                    }
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 1: Phone OTP ══ */}
                    {step === 1 && (
                        <div className={`auth-form-inner ${forward ? 'su-fwd' : 'su-back'}`}>
                            <h2 className="auth-form-h2">Check your phone.</h2>
                            <p className="auth-form-sub">
                                Enter the 6-digit code sent to your phone number.
                            </p>

                            <div className="auth-fields">
                                <div className="verify-code-row" onPaste={handlePhonePaste}>
                                    {phoneCode.map((d, i) => (
                                        <input key={i} ref={pRefs[i]}
                                            className={`verify-box${d ? ' verify-box--filled' : ''}`}
                                            type="text" inputMode="numeric" maxLength={1} value={d}
                                            autoFocus={i === 0}
                                            onChange={ev => handlePhoneChange(i, ev.target.value)}
                                            onKeyDown={ev => handlePhoneKeyDown(i, ev)} />
                                    ))}
                                </div>

                                <p className="verify-hint">
                                    {phoneFilled === 6
                                        ? '✓ Ready to verify'
                                        : `${6 - phoneFilled} digit${6 - phoneFilled !== 1 ? 's' : ''} remaining`}
                                </p>

                                <ErrAlert />

                                {phoneResent && (
                                    <div className="dv-alert dv-alert-success">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        New code sent to your phone.
                                    </div>
                                )}

                                <button className="auth-btn-primary" disabled={phoneFilled < 6 || loading} onClick={handlePhoneVerify}>
                                    {loading
                                        ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Verifying...</>
                                        : <>Verify Phone <ArrowRight size={16} /></>
                                    }
                                </button>

                                <div className="auth-divider" style={{ margin: '4px 0 12px' }}>didn't receive it?</div>

                                <button className="verify-resend" disabled={phoneResent} onClick={handlePhoneResend}>
                                    <RotateCcw size={14} /> {phoneResent ? 'Code sent!' : 'Resend code'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 2: Email OTP ══ */}
                    {step === 2 && (
                        <div className={`auth-form-inner ${forward ? 'su-fwd' : 'su-back'}`}>
                            <h2 className="auth-form-h2">Check your email.</h2>
                            <p className="auth-form-sub">
                                Enter the 6-digit code sent to <strong>{verifyEmail}</strong>.
                            </p>

                            <div className="auth-fields">
                                <div className="verify-code-row" onPaste={handleEmailPaste}>
                                    {emailCode.map((d, i) => (
                                        <input key={i} ref={eRefs[i]}
                                            className={`verify-box${d ? ' verify-box--filled' : ''}`}
                                            type="text" inputMode="numeric" maxLength={1} value={d}
                                            autoFocus={i === 0}
                                            onChange={ev => handleEmailChange(i, ev.target.value)}
                                            onKeyDown={ev => handleEmailKeyDown(i, ev)} />
                                    ))}
                                </div>

                                <p className="verify-hint">
                                    {emailFilled === 6
                                        ? '✓ Ready to verify'
                                        : `${6 - emailFilled} digit${6 - emailFilled !== 1 ? 's' : ''} remaining`}
                                </p>

                                <ErrAlert />

                                {emailResent && (
                                    <div className="dv-alert dv-alert-success">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        New code sent to your email.
                                    </div>
                                )}

                                <button className="auth-btn-primary" disabled={emailFilled < 6 || loading} onClick={handleEmailVerify}>
                                    {loading
                                        ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Verifying...</>
                                        : <>Verify Email <ArrowRight size={16} /></>
                                    }
                                </button>

                                <div className="auth-divider" style={{ margin: '4px 0 12px' }}>didn't receive it?</div>

                                <button className="verify-resend" disabled={emailResent} onClick={handleEmailResend}>
                                    <RotateCcw size={14} /> {emailResent ? 'Code sent!' : 'Resend code'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ══ STEP 3: Pending Approval ══ */}
                    {step === 3 && (
                        <div className={`auth-form-inner ${forward ? 'su-fwd' : 'su-back'}`}>
                            <div className="verify-success" style={{ marginBottom: 4 }}>
                                <div className="verify-success__ring">
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline className="verify-check" points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            </div>

                            <div className="acard-status acard-status--amber" style={{ margin: '12px auto 16px' }}>
                                <span className="acard-status__dot" />
                                Pending Approval
                            </div>

                            <h2 className="auth-form-h2" style={{ marginBottom: 4 }}>Account submitted.</h2>
                            <p className="auth-form-sub" style={{ marginBottom: 20 }}>
                                Your account is under admin review.{' '}
                                Checking again in <strong style={{ color: '#0D9488' }}>{nextCheck}s</strong>.
                            </p>

                            <div className="acard-info acard-info--amber" style={{ marginBottom: 20 }}>
                                <svg className="acard-info__icon" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                <div className="acard-info__text">
                                    <strong>Awaiting admin approval</strong>
                                    You won't be able to log in until your account is approved. You'll receive an email once confirmed.
                                </div>
                            </div>

                            <div className="acard-steps">
                                {[
                                    'Admin reviews your credentials and specialty',
                                    'You receive an approval email notification',
                                    'Sign in and access your clinical dashboard',
                                ].map((text, i) => (
                                    <div key={i} className="acard-step">
                                        <div className="acard-step__num">{i + 1}</div>
                                        <span className="acard-step__text">{text}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/" className="auth-btn-ghost" style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                Back to Home
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
