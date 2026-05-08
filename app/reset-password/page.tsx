'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { BASE } from '@/lib/api';

function getStrength(pw: string): number {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

const strengthMeta = [
    { label: '',       color: '#E5E7EB' },
    { label: 'Weak',   color: '#ef4444' },
    { label: 'Fair',   color: '#f97316' },
    { label: 'Good',   color: '#eab308' },
    { label: 'Strong', color: '#1D9E75' },
] as const;

function ResetForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [pw,      setPw]      = useState('');
    const [confirm, setConfirm] = useState('');
    const [show,    setShow]    = useState(false);
    const [showC,   setShowC]   = useState(false);
    const [loading, setLoading] = useState(false);
    const [done,    setDone]    = useState(false);
    const [error,   setError]   = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pw !== confirm)  { setError('Passwords do not match.');                  return; }
        if (pw.length < 8)   { setError('Password must be at least 8 characters.'); return; }
        setError(''); setLoading(true);
        try {
            await fetch(`${BASE}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: pw }),
            });
        } catch {}
        setLoading(false);
        setDone(true);
    };

    const strength  = getStrength(pw);
    const { label: strengthLabel, color: strengthColor } = strengthMeta[strength];
    const matches   = confirm.length > 0 && pw === confirm;
    const mismatch  = confirm.length > 0 && pw !== confirm;

    return (
        <div className="auth-page">

            {/* ══ LEFT PANEL ══ */}
            <div className="auth-left">
                <div className="auth-left__dots" />
                {/* Hex grid overlay */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none', zIndex: 1 }} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="hexRP" x="0" y="0" width="52" height="45" patternUnits="userSpaceOnUse">
                            <polygon points="26,2 48,13 48,35 26,46 4,35 4,13" fill="none" stroke="#5EEAD4" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hexRP)" />
                </svg>
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
                    <div className="auth-left__badge">
                        <span className="auth-left__badge-dot" />
                        Password Reset
                    </div>

                    {/* Animated shield icon */}
                    <div style={{ marginBottom: 28, position: 'relative', zIndex: 2 }}>
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ animation: 'hexPulse 3s ease-in-out infinite' }}>
                            <circle cx="32" cy="32" r="30" stroke="rgba(94,234,212,0.2)" strokeWidth="1.5"/>
                            <circle cx="32" cy="32" r="22" fill="rgba(13,148,136,0.12)"/>
                            <path d="M32 16 L44 21 L44 32 C44 39 38.5 45.5 32 47.5 C25.5 45.5 20 39 20 32 L20 21 Z"
                                  stroke="#5EEAD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            <polyline points="27,32 30.5,35.5 37,29" stroke="#5EEAD4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    <h1 className="auth-left__h1">
                        Secure password<br />
                        reset made <em>safe.</em>
                    </h1>
                    <p className="auth-left__sub">
                        Create a strong new password to protect your Diagnovate account. Your security is our priority throughout this process.
                    </p>
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
                    <div className="auth-form-inner">

                        {!done ? (
                            <>
                                <span className="auth-portal-label">Reset Password</span>
                                <h2 className="auth-form-h2">Create a new password.</h2>
                                <p className="auth-form-sub">Choose a strong password for your Diagnovate account.</p>

                                <form onSubmit={handleSubmit}>
                                    <div className="auth-fields">

                                        {/* New Password */}
                                        <div className="auth-field">
                                            <label className="dv-label">New Password</label>
                                            <div className="auth-iw">
                                                <span className="auth-iw__icon">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                    </svg>
                                                </span>
                                                <input
                                                    className="dv-input auth-iw__input--pw"
                                                    type={show ? 'text' : 'password'}
                                                    placeholder="Min. 8 characters"
                                                    value={pw}
                                                    onChange={e => setPw(e.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                                <button type="button" className="auth-eye" onClick={() => setShow(s => !s)}>
                                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>

                                            {/* Strength bar */}
                                            {pw.length > 0 && (
                                                <div style={{ marginTop: 8 }}>
                                                    <div style={{ display: 'flex', gap: 4 }}>
                                                        {[1, 2, 3, 4].map(seg => (
                                                            <div key={seg} style={{
                                                                flex: 1, height: 4, borderRadius: 2,
                                                                background: seg <= strength ? strengthColor : '#E5E7EB',
                                                                transition: 'background .25s',
                                                            }} />
                                                        ))}
                                                    </div>
                                                    {strengthLabel && (
                                                        <p style={{ fontSize: 11, fontWeight: 700, color: strengthColor, marginTop: 4, letterSpacing: '0.5px' }}>
                                                            {strengthLabel}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="auth-field">
                                            <label className="dv-label">Confirm New Password</label>
                                            <div className="auth-iw" style={
                                                mismatch ? { borderColor: '#ef4444' } :
                                                matches  ? { borderColor: '#1D9E75' } : {}
                                            }>
                                                <span className="auth-iw__icon">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                    </svg>
                                                </span>
                                                <input
                                                    className="dv-input auth-iw__input--pw"
                                                    type={showC ? 'text' : 'password'}
                                                    placeholder="Repeat your new password"
                                                    value={confirm}
                                                    onChange={e => setConfirm(e.target.value)}
                                                    required
                                                />
                                                <button type="button" className="auth-eye" onClick={() => setShowC(s => !s)}>
                                                    {showC ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {matches  && <p style={{ fontSize: 11, fontWeight: 700, color: '#1D9E75', marginTop: 4 }}>Passwords match</p>}
                                            {mismatch && <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>Passwords do not match</p>}
                                        </div>

                                    </div>

                                    {error && (
                                        <div className="dv-alert dv-alert-error" style={{ marginTop: 14 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit" className="auth-btn-primary"
                                        disabled={!pw || !confirm || loading}
                                        style={{ marginTop: 20 }}
                                    >
                                        {loading
                                            ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Updating...</>
                                            : <>Update Password <ArrowRight size={16} /></>
                                        }
                                    </button>
                                </form>

                                <div className="auth-switch-row">
                                    <Link href="/log-in?role=doctor" className="auth-switch-btn">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <polyline points="15 18 9 12 15 6"/>
                                        </svg>
                                        Back to Sign In
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
                                    <div style={{
                                        width: 76, height: 76, borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #E1F5EE, #C6F6D5)',
                                        border: '2px solid rgba(29,158,117,0.25)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 20px',
                                        boxShadow: '0 0 0 10px rgba(29,158,117,0.06)',
                                        animation: 'hexPulse 2.5s ease-in-out infinite',
                                    }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span className="auth-portal-label" style={{ textAlign: 'center' }}>Success</span>
                                    <h2 className="auth-form-h2">Password updated!</h2>
                                    <p className="auth-form-sub">
                                        Your password has been changed. You can now sign in with your new credentials.
                                    </p>
                                </div>
                                <Link
                                    href="/log-in?role=doctor"
                                    className="auth-btn-primary"
                                    style={{ marginTop: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    Sign In Now <ArrowRight size={16} />
                                </Link>
                                <div className="auth-switch-row" style={{ marginTop: 12 }}>
                                    <Link href="/" className="auth-switch-btn">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <polyline points="15 18 9 12 15 6"/>
                                        </svg>
                                        Back to Home
                                    </Link>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetForm />
        </Suspense>
    );
}
