'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { BASE } from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email,   setEmail]   = useState('');
    const [loading, setLoading] = useState(false);
    const [sent,    setSent]    = useState(false);

    const handleSend = async () => {
        setLoading(true);
        try {
            await fetch(`${BASE}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
        } catch {}
        setLoading(false);
        setSent(true);
    };

    return (
        <div className="auth-page">

            {/* ══ LEFT PANEL ══ */}
            <div className="auth-left">
                <div className="auth-left__dots" />
                {/* Hex grid overlay */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07, pointerEvents: 'none', zIndex: 1 }} xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="hexFP" x="0" y="0" width="52" height="45" patternUnits="userSpaceOnUse">
                            <polygon points="26,2 48,13 48,35 26,46 4,35 4,13" fill="none" stroke="#5EEAD4" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hexFP)" />
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
                        Account Recovery
                    </div>

                    {/* Animated lock icon */}
                    <div style={{ marginBottom: 28, position: 'relative', zIndex: 2 }}>
                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ animation: 'hexPulse 3s ease-in-out infinite' }}>
                            <circle cx="32" cy="32" r="30" stroke="rgba(94,234,212,0.2)" strokeWidth="1.5"/>
                            <circle cx="32" cy="32" r="22" fill="rgba(13,148,136,0.12)"/>
                            <rect x="21" y="31" width="22" height="17" rx="3.5" stroke="#5EEAD4" strokeWidth="1.8" strokeLinecap="round"/>
                            <path d="M25 31V25a7 7 0 0 1 14 0v6" stroke="#5EEAD4" strokeWidth="1.8" strokeLinecap="round"/>
                            <circle cx="32" cy="39.5" r="2.5" fill="#5EEAD4"/>
                        </svg>
                    </div>

                    <h1 className="auth-left__h1">
                        Account recovery<br />
                        made <em>simple.</em>
                    </h1>
                    <p className="auth-left__sub">
                        We'll send a secure reset link to your registered email address. Your account stays protected throughout the process.
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

                        {!sent ? (
                            <>
                                <span className="auth-portal-label">Account Recovery</span>
                                <h2 className="auth-form-h2">Forgot your password?</h2>
                                <p className="auth-form-sub">Enter your email and we'll send you a reset link.</p>

                                <div className="auth-fields">
                                    <div className="auth-field">
                                        <label className="dv-label">Email Address</label>
                                        <div className="auth-iw">
                                            <span className="auth-iw__icon">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                                                    <polyline points="2,4 12,13 22,4"/>
                                                </svg>
                                            </span>
                                            <input
                                                className="dv-input"
                                                type="email"
                                                placeholder="you@hospital.com"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && email && !loading && handleSend()}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="auth-btn-primary"
                                        disabled={!email || loading}
                                        onClick={handleSend}
                                    >
                                        {loading
                                            ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Sending...</>
                                            : <>Send Reset Link <ArrowRight size={16} /></>
                                        }
                                    </button>
                                </div>

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
                                            <path d="M22 2L11 13"/>
                                            <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                                        </svg>
                                    </div>
                                    <span className="auth-portal-label" style={{ textAlign: 'center' }}>Email Sent</span>
                                    <h2 className="auth-form-h2">Check your inbox.</h2>
                                    <p className="auth-form-sub">
                                        We sent a reset link to{' '}
                                        <strong style={{ color: '#0D1B17' }}>{email}</strong>.{' '}
                                        Follow the link to create a new password.
                                    </p>
                                </div>
                                <div className="auth-switch-row" style={{ marginTop: 0 }}>
                                    <Link href="/log-in?role=doctor" className="auth-switch-btn">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <polyline points="15 18 9 12 15 6"/>
                                        </svg>
                                        Back to Sign In
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
