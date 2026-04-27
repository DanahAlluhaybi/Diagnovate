// Login page — handles both doctor and admin login, with an OTP step when the backend requires it.
'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, Activity, Shield, Zap } from 'lucide-react';
import { auth } from '@/lib/api';

function LoginForm() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const role         = (searchParams.get('role') as 'admin' | 'doctor') ?? 'doctor';
    const isAdmin      = role === 'admin';

    const [email,      setEmail]      = useState('');
    const [password,   setPassword]   = useState('');
    const [show,       setShow]       = useState(false);
    const [loading,    setLoading]    = useState(false);
    const [error,    setError]    = useState('');
    const [pwError,  setPwError]  = useState('');
    const [otpStep,    setOtpStep]    = useState(false);
    const [otp,        setOtp]        = useState('');
    const [identifier, setIdentifier] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = isAdmin ? await auth.adminLogin(email, password) : await auth.login(email, password);

            if ((result as any)?.otpRequired) {
                setIdentifier((result as any).identifier);
                setOtpStep(true);
                return;
            }

            const { token, user } = result as { token: string; user: unknown };
            localStorage.setItem(isAdmin ? 'admin_token' : 'token', token);
            if (user) localStorage.setItem(isAdmin ? 'admin_user' : 'user', JSON.stringify(user));
            console.log('isAdmin:', isAdmin, 'role:', role);
            router.push(isAdmin ? '/admin' : '/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { token, user } = await auth.verifyOtp(identifier, otp);
            localStorage.setItem(isAdmin ? 'admin_token' : 'token', token);
            if (user) localStorage.setItem(isAdmin ? 'admin_user' : 'user', JSON.stringify(user));
            router.push(isAdmin ? '/admin' : '/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const roleVars = isAdmin
        ? { '--role-color': '#1E40AF', '--role-bg': '#EFF6FF', '--role-ring': '#BFDBFE' }
        : { '--role-color': 'var(--teal)', '--role-bg': 'var(--teal-light)', '--role-ring': 'var(--teal-ring)' };

    return (
        <div className="auth-page" style={roleVars as React.CSSProperties}>

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
                    <div className="auth-left__badge">
                        <span className="auth-left__badge-dot" />
                        AI Thyroid Diagnostics
                    </div>
                    <h1 className="auth-left__h1">
                        The future of<br />
                        <em>thyroid</em><br />
                        diagnostics.
                    </h1>
                    <p className="auth-left__sub">
                        AI-powered platform combining image enhancement, diagnostic intelligence, and clinical workflows.
                    </p>
                    <div className="auth-stats">
                        {[
                            { icon: <Activity size={17} />, val: '98.7%', lbl: 'Diagnostic Accuracy' },
                            { icon: <Zap size={17} />,      val: '< 2s',  lbl: 'Real-Time Analysis' },
                            { icon: <Shield size={17} />,   val: 'HIPAA', lbl: 'Compliant & Secure' },
                        ].map((s, i) => (
                            <div className="auth-stat" key={i}>
                                <div className="auth-stat__icon">{s.icon}</div>
                                <div>
                                    <div className="auth-stat__val">{s.val}</div>
                                    <div className="auth-stat__lbl">{s.lbl}</div>
                                </div>
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

            <div className="auth-right">
                <nav className="auth-right__nav">
                    <Link href="/"        className="auth-right__nav-link">Home</Link>
                    <Link href="/about"   className="auth-right__nav-link">About</Link>
                    <Link href="/contact" className="auth-right__nav-link">Contact</Link>
                </nav>

                <div className="auth-form-area">
                    <div className="auth-form-inner">

                        <div
                            className="auth-role-badge"
                            style={{ background: 'var(--role-bg)', border: '1px solid var(--role-ring)', color: 'var(--role-color)' }}
                        >
                            <span className="auth-role-badge__dot" style={{ background: 'var(--role-color)' }} />
                            {isAdmin ? 'Admin Portal' : 'Doctor Portal'}
                        </div>

                        {otpStep ? (
                            <>
                                <h2 className="auth-form-h2">Check your email.</h2>
                                <p className="auth-form-sub">
                                    We sent a verification code to <strong>{identifier}</strong>.
                                </p>

                                <form onSubmit={handleVerifyOtp}>
                                    <div className="auth-fields">
                                        <div className="auth-field">
                                            <label className="dv-label">Verification Code</label>
                                            <div className="auth-iw">
                                                <span className="auth-iw__icon">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                                </span>
                                                <input
                                                    className="dv-input"
                                                    type="text"
                                                    placeholder="Enter 6-digit code"
                                                    value={otp}
                                                    onChange={e => setOtp(e.target.value)}
                                                    maxLength={6}
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="dv-alert dv-alert-error" style={{ marginTop: 14 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit" className="auth-btn-primary" disabled={loading}
                                        style={{ marginTop: 20 }}
                                    >
                                        {loading
                                            ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Verifying...</>
                                            : <>Verify & Sign In <ArrowRight size={16} /></>
                                        }
                                    </button>
                                </form>

                                <div className="auth-switch-row" style={{ marginTop: 16 }}>
                                    <button
                                        type="button"
                                        className="auth-switch-btn"
                                        onClick={() => { setOtpStep(false); setOtp(''); setError(''); }}
                                    >
                                        ← Back to login
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="auth-form-h2">Welcome back.</h2>
                                <p className="auth-form-sub">
                                    Sign in to your clinical workspace.{' '}
                                    {!isAdmin && <Link href="/sign-up">New doctor?</Link>}
                                </p>

                                <form onSubmit={handleSubmit}>
                                    <div className="auth-fields">

                                        <div className="auth-field">
                                            <label className="dv-label">Email Address</label>
                                            <div className="auth-iw">
                                                <span className="auth-iw__icon">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg>
                                                </span>
                                                <input
                                                    className="dv-input"
                                                    type="email"
                                                    placeholder="doctor@hospital.com"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        <div className="auth-field">
                                            <label className="dv-label">Password</label>
                                            <div className="auth-iw">
                                                <span className="auth-iw__icon">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                                </span>
                                                <input
                                                    className="dv-input auth-iw__input--pw"
                                                    type={show ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={e => {
                                                        setPassword(e.target.value);
                                                        if (e.target.value.length > 0 && e.target.value.length < 8) {
                                                            setPwError('Password must be at least 8 characters.');
                                                        } else {
                                                            setPwError('');
                                                        }
                                                    }}
                                                    required
                                                    minLength={8}
                                                />
                                                <button type="button" className="auth-eye" onClick={() => setShow(v => !v)}>
                                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                    </div>

                                    {pwError && (
                                        <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>
                                            {pwError}
                                        </p>
                                    )}

                                    <div className="auth-forgot-row">
                                        <Link href="/forgot-password" className="auth-forgot">Forgot password?</Link>
                                    </div>

                                    {error && (
                                        <div className="dv-alert dv-alert-error" style={{ marginTop: 14 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit" className="auth-btn-primary" disabled={loading}
                                        style={{ marginTop: 20 }}
                                    >
                                        {loading
                                            ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Signing in...</>
                                            : <>Sign In <ArrowRight size={16} /></>
                                        }
                                    </button>
                                </form>

                                {!isAdmin && (
                                    <>
                                        <div className="auth-divider">or</div>
                                        <Link href="/sign-up" className="auth-btn-ghost">
                                            Create a new doctor account <ArrowRight size={15} />
                                        </Link>
                                    </>
                                )}

                                <div className="auth-switch-row">
                                    <Link
                                        href={isAdmin ? '/log-in?role=doctor' : '/log-in?role=admin'}
                                        className="auth-switch-btn"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                                        Switch to {isAdmin ? 'Doctor' : 'Admin'} Login
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

export default function LoginPage() {
    return <Suspense><LoginForm /></Suspense>;
}