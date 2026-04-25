'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { auth } from '@/lib/api';

const SPECIALTIES = ['Pathology', 'Radiology', 'Endocrinology', 'Surgery', 'Oncology', 'General Practice'];
const STEP_LABELS  = ['Personal Info', 'Account Setup', 'Verify'];

export default function SignUpPage() {
    const router = useRouter();
    const [step,    setStep]    = useState(0);
    const [showPw,  setShowPw]  = useState(false);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState<'sms' | 'email' | null>(null);
    const [error,   setError]   = useState('');
    const [signupIdentifier, setSignupIdentifier] = useState('');

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', idNumber: '',
        specialty: '', password: '', confirm: '',
    });

    const set = (k: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setError('');
            setForm(f => ({ ...f, [k]: e.target.value }));
        };

    /* ── step 0 → 1 validation ── */
    const goNext = () => {
        const nameValid = /^[a-zA-Z؀-ۿ\s]+$/.test(form.firstName) &&
            /^[a-zA-Z؀-ۿ\s]+$/.test(form.lastName);
        if (!nameValid) { setError('First and last name must contain letters only, no numbers allowed.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address.'); return; }
        if (!/^05\d{8}$/.test(form.phone)) { setError('Phone number must start with 05 and be 10 digits.'); return; }
        const idValid = /^[12]\d{9}$/.test(form.idNumber);
        if (!idValid) {
            setError(form.idNumber.length !== 10 ? 'ID number must be 10 digits.' : 'ID number must start with 1 or 2.');
            return;
        }
        setError(''); setStep(1);
    };

    /* ── step 1 submit ── */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.specialty)                { setError('Please select your specialty.'); return; }
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        if (form.password.length < 8)       { setError('Password must be at least 8 characters.'); return; }

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

            if (raw?.next_step === 'choose_verification') {
                setSignupIdentifier(raw?.identifier ?? '');
                setStep(2);
            } else {
                // fallback: backend sends OTP automatically
                localStorage.setItem('userEmail', form.email);
                router.push('/email-verification');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    /* ── step 2: user picks verification method ── */
    const handleChoose = async (method: 'sms' | 'email') => {
        setError(''); setSending(method);
        try {
            await auth.sendOtp(signupIdentifier, method);
            if (method === 'sms') {
                router.push(`/phone-verification?identifier=${encodeURIComponent(signupIdentifier)}`);
            } else {
                router.push(`/email-verification?identifier=${encodeURIComponent(signupIdentifier)}`);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send code. Please try again.');
            setSending(null);
        }
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

    /* ── left panel content per step ── */
    const leftContent = [
        {
            title: <>Join the future<br />of <em>thyroid</em><br />diagnostics.</>,
            sub: 'Create your account and get access to AI-powered tools built for clinical professionals.',
            points: ['AI-enhanced ultrasound imaging', 'Context-aware diagnostic recommendations', 'HIPAA-compliant & secure', 'Trusted by leading pathology labs'],
        },
        {
            title: <>Almost<br /><em>there.</em></>,
            sub: 'Set your specialty and create a secure password to complete your account.',
            points: ['Your data is encrypted end-to-end', 'Accounts reviewed within 24 hours', 'Full access after admin approval', 'Join hundreds of verified clinicians'],
        },
        {
            title: <>Verify your<br /><em>identity.</em></>,
            sub: 'Choose how you want to receive your one-time verification code.',
            points: ['Codes expire in 10 minutes', 'Both options are equally secure', 'You can switch methods if needed', 'Verification protects your account'],
        },
    ];
    const lc = leftContent[step];

    return (
        <div className="auth-page">

            {/* ══ LEFT PANEL ══ */}
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
                    {/* Step progress */}
                    <div className="auth-steps">
                        {STEP_LABELS.map((s, i) => {
                            const state = i < step ? 'done' : i === step ? 'curr' : 'idle';
                            return (
                                <div key={s} className="auth-step">
                                    <div className={`auth-step__dot auth-step__dot--${state}`}>
                                        {state === 'done' ? <Check size={13} /> : i + 1}
                                    </div>
                                    <span className={`auth-step__lbl auth-step__lbl--${state}`}>{s}</span>
                                    {i < STEP_LABELS.length - 1 && (
                                        <div className={`auth-step__line auth-step__line--${step > i ? 'done' : 'idle'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="auth-left__badge">
                        <span className="auth-left__badge-dot" />
                        Create Account
                    </div>
                    <h1 className="auth-left__h1">{lc.title}</h1>
                    <p className="auth-left__sub">{lc.sub}</p>
                    <div className="auth-points">
                        {lc.points.map((p, i) => (
                            <div key={i} className="auth-point">
                                <div className="auth-point__icon">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5EEAD4" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
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

            {/* ══ RIGHT PANEL ══ */}
            <div className="auth-right">
                <nav className="auth-right__nav">
                    <Link href="/"        className="auth-right__nav-link">Home</Link>
                    <Link href="/about"   className="auth-right__nav-link">About</Link>
                    <Link href="/contact" className="auth-right__nav-link">Contact</Link>
                </nav>

                <div className="auth-form-area">

                    {/* ── STEP 0: Personal Info ── */}
                    {step === 0 && (
                        <div className="auth-form-inner auth-slide-in">
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
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                                            </span>
                                            <input className="dv-input" placeholder="Sarah" value={form.firstName} onChange={set('firstName')} />
                                        </div>
                                    </div>
                                    <div className="auth-field">
                                        <label className="dv-label">Last Name</label>
                                        <div className="auth-iw">
                                            <span className="auth-iw__icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                                            </span>
                                            <input className="dv-input" placeholder="Al-Rashid" value={form.lastName} onChange={set('lastName')} />
                                        </div>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label className="dv-label">Email Address</label>
                                    <div className="auth-iw">
                                        <span className="auth-iw__icon">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg>
                                        </span>
                                        <input type="email" className="dv-input" placeholder="doctor@hospital.com" value={form.email} onChange={set('email')} />
                                    </div>
                                </div>

                                <div className="auth-g2">
                                    <div className="auth-field">
                                        <label className="dv-label">Phone Number</label>
                                        <div className="auth-iw">
                                            <span className="auth-iw__icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9z" /></svg>
                                            </span>
                                            <input className="dv-input" placeholder="05xxxxxxxx" value={form.phone} onChange={set('phone')} />
                                        </div>
                                    </div>
                                    <div className="auth-field">
                                        <label className="dv-label">ID Number</label>
                                        <div className="auth-iw">
                                            <span className="auth-iw__icon">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="12" y2="14" /></svg>
                                            </span>
                                            <input className="dv-input" placeholder="National ID" value={form.idNumber} onChange={set('idNumber')} />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="dv-alert dv-alert-error">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        {error}
                                    </div>
                                )}

                                <button type="button" className="auth-btn-primary" onClick={goNext}>
                                    Continue <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1: Account Setup ── */}
                    {step === 1 && (
                        <div className="auth-form-inner auth-slide-in">
                            <h2 className="auth-form-h2">Account setup.</h2>
                            <p className="auth-form-sub">Select your specialty and create a secure password.</p>

                            <form className="auth-fields" onSubmit={handleSubmit}>

                                <div className="auth-field">
                                    <label className="dv-label">Specialty</label>
                                    <div className="auth-iw">
                                        <span className="auth-iw__icon">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                                        </span>
                                        <select className="dv-input" value={form.specialty} onChange={set('specialty')} style={{ cursor: 'pointer' }}>
                                            <option value="">Select your specialty...</option>
                                            {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="auth-field">
                                    <label className="dv-label">Password</label>
                                    <div className="auth-iw">
                                        <span className="auth-iw__icon">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        </span>
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            className="dv-input"
                                            style={{ paddingRight: 46 }}
                                            placeholder="Min. 8 characters"
                                            value={form.password} onChange={set('password')}
                                        />
                                        <button type="button" className="auth-eye" onClick={() => setShowPw(v => !v)}>
                                            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {pw && (
                                        <div className="auth-pw-str">
                                            <div className="auth-pw-str__bars">
                                                {[1, 2, 3, 4].map(i => (
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
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                        </span>
                                        <input
                                            type="password" className="dv-input"
                                            placeholder="Repeat your password"
                                            value={form.confirm} onChange={set('confirm')}
                                            style={form.confirm ? { borderColor: form.confirm === form.password ? 'var(--teal)' : 'var(--red)' } : {}}
                                        />
                                    </div>
                                    {form.confirm && form.confirm === form.password && (
                                        <div className="auth-pw-match">
                                            <Check size={13} /> Passwords match
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="dv-alert dv-alert-error">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        {error}
                                    </div>
                                )}

                                <button type="submit" className="auth-btn-primary" disabled={loading}>
                                    {loading
                                        ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Creating account...</>
                                        : <>Create Account <ArrowRight size={16} /></>
                                    }
                                </button>

                                <button type="button" className="auth-btn-ghost" style={{ marginTop: 8 }}
                                    onClick={() => { setStep(0); setError(''); }}>
                                    <ArrowLeft size={14} /> Back
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ── STEP 2: Choose Verification Method ── */}
                    {step === 2 && (
                        <div className="auth-form-inner auth-slide-in">
                            <h2 className="auth-form-h2">Choose verification.</h2>
                            <p className="auth-form-sub">
                                How would you like to receive your verification code?
                            </p>

                            <div className="auth-fields">
                                {/* Phone option */}
                                <button
                                    type="button"
                                    className="auth-btn-ghost"
                                    disabled={!!sending}
                                    onClick={() => handleChoose('sms')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '16px 18px', height: 'auto', textAlign: 'left',
                                        opacity: sending && sending !== 'sms' ? 0.45 : 1,
                                    }}
                                >
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                                        background: 'rgba(13,148,136,.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {sending === 'sms'
                                            ? <Loader2 size={20} style={{ animation: 'spinIcon .75s linear infinite', color: '#0D9488' }} />
                                            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.8" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                                        }
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Verify with Phone</div>
                                        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400, lineHeight: 1.4 }}>
                                            Send a 6-digit SMS to your registered number
                                        </div>
                                    </div>
                                </button>

                                {/* Email option */}
                                <button
                                    type="button"
                                    className="auth-btn-ghost"
                                    disabled={!!sending}
                                    onClick={() => handleChoose('email')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '16px 18px', height: 'auto', textAlign: 'left',
                                        opacity: sending && sending !== 'email' ? 0.45 : 1,
                                    }}
                                >
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                                        background: 'rgba(13,148,136,.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {sending === 'email'
                                            ? <Loader2 size={20} style={{ animation: 'spinIcon .75s linear infinite', color: '#0D9488' }} />
                                            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/></svg>
                                        }
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>Verify with Email</div>
                                        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400, lineHeight: 1.4 }}>
                                            Send a 6-digit code to your registered email
                                        </div>
                                    </div>
                                </button>

                                {error && (
                                    <div className="dv-alert dv-alert-error">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
