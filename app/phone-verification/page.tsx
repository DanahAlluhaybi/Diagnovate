// Phone OTP verification page — user enters the 6-digit SMS code, with resend and fallback to email verification.
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { auth } from '@/lib/api';

export default function PhoneVerificationPage() {
    const router = useRouter();
    const [code, setCode]     = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [done,    setDone]    = useState(false);
    const [error,   setError]   = useState('');
    const [resent,     setResent]     = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [countdown,  setCountdown]  = useState(60);

    useEffect(() => {
        setIdentifier(new URLSearchParams(window.location.search).get('identifier') ?? '');
    }, []);

    useEffect(() => {
        const id = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
        return () => clearInterval(id);
    }, []);

    const r0 = useRef<HTMLInputElement>(null);
    const r1 = useRef<HTMLInputElement>(null);
    const r2 = useRef<HTMLInputElement>(null);
    const r3 = useRef<HTMLInputElement>(null);
    const r4 = useRef<HTMLInputElement>(null);
    const r5 = useRef<HTMLInputElement>(null);
    const refs = [r0, r1, r2, r3, r4, r5];

    const handleChange = (i: number, val: string) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...code]; next[i] = val.slice(-1); setCode(next);
        if (val && i < 5) refs[i + 1].current?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[i] && i > 0) refs[i - 1].current?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
        const next = Array(6).fill('');
        digits.forEach((d, i) => { next[i] = d; });
        setCode(next);
        refs[Math.min(digits.length, 5)].current?.focus();
    };
    const handleVerify = async () => {
        setError(''); setLoading(true);
        try {
            const identifier = new URLSearchParams(window.location.search).get('identifier') ?? '';
            const data = await auth.verifyOtp(identifier, code.join(''));
            if (data.next_step === 'verify_email') {
                router.push(`/email-verification?identifier=${encodeURIComponent(data.email || identifier)}`);
                return;
            }
            if (data.token) localStorage.setItem('token', data.token);
            if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
            setDone(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        try {
            await auth.resendOtp(identifier);
            setCode(['', '', '', '', '', '']);
            setError('');
            setResent(true);
            setCountdown(60);
            r0.current?.focus();
            setTimeout(() => setResent(false), 4000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to resend code.');
        }
    };

    const filled = code.filter(Boolean).length;

    return (
        <div className="acard-page">
            <span className="acard-page__glow acard-page__glow--teal" />
            <span className="acard-page__glow acard-page__glow--purple" />

            <nav className="acard-nav">
                <Link href="/" className="acard-nav__logo">
                    <div className="acard-nav__mark">
                        <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                            <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5"/>
                            <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                            <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                            <circle cx="20" cy="20" r="3.5" fill="white"/>
                        </svg>
                        <span className="acard-nav__mark-ring" />
                    </div>
                    <span className="acard-nav__word">Diagno<span>vate</span></span>
                </Link>
                <div className="acard-nav__links">
                    <Link href="/"        className="acard-nav__link">Home</Link>
                    <Link href="/about"   className="acard-nav__link">About</Link>
                    <Link href="/contact" className="acard-nav__link">Contact</Link>
                    <Link href="/log-in"  className="acard-nav__cta">Sign In <ArrowRight size={14} /></Link>
                </div>
            </nav>

            <div className="acard-wrap">
                <div className="acard">
                    {/* Animated hex mark */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                        <div style={{ position: 'relative' }}>
                            <svg width="56" height="64" viewBox="0 0 96 108" fill="none"
                                 style={{ animation: 'hexPulse 2.5s ease-in-out infinite' }}>
                                <polygon points="48,4 90,26 90,80 48,104 6,80 6,26" fill="rgba(13,148,136,0.08)" stroke="#0D9488" strokeWidth="1.5"/>
                                <polygon points="48,16 78,32 78,72 48,88 18,72 18,32" fill="rgba(13,148,136,0.05)" stroke="#0D9488" strokeWidth="1" strokeDasharray="4 3" opacity="0.6"/>
                            </svg>
                            <svg width="56" height="64" viewBox="0 0 96 108" fill="none"
                                 style={{ position: 'absolute', top: 0, left: 0, animation: 'hexRotate 3s linear infinite', transformOrigin: '28px 32px' }}>
                                <circle cx="48" cy="4" r="3.5" fill="#0D9488" opacity="0.7"/>
                                <circle cx="90" cy="26" r="3.5" fill="#0D9488" opacity="0.5"/>
                                <circle cx="90" cy="80" r="3.5" fill="#0D9488" opacity="0.3"/>
                            </svg>
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #0D9488, #0F6E56)', boxShadow: '0 4px 12px rgba(13,148,136,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {!done ? (
                        <>
                            <div className="acard-icon acard-icon--teal">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round">
                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                    <line x1="12" y1="18" x2="12.01" y2="18" />
                                </svg>
                            </div>

                            <div className="acard-status acard-status--teal">
                                <span className="acard-status__dot" />
                                Phone Verification
                            </div>

                            <h2 className="acard-h2">Verify your account.</h2>
                            <p className="acard-p" style={{ marginBottom: 20 }}>
                                We sent a 6-digit code to your phone number.<br />Enter it below to verify your account.
                            </p>


                            <div className="verify-code-row" onPaste={handlePaste}>
                                {code.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={refs[i]}
                                        className={`verify-box${d ? ' verify-box--filled' : ''}`}
                                        type="text" inputMode="numeric"
                                        maxLength={1} value={d}
                                        onChange={e => handleChange(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        autoFocus={i === 0}
                                    />
                                ))}
                            </div>

                            <p className="verify-hint">
                                {filled === 6 ? 'Ready to verify' : `${6 - filled} digit${6 - filled !== 1 ? 's' : ''} remaining`}
                            </p>

                            {error && (
                                <div className="dv-alert dv-alert-error">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {error}
                                </div>
                            )}

                            {resent && (
                                <div className="dv-alert dv-alert-success" style={{ marginBottom: 16 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    New code sent to your phone.
                                </div>
                            )}

                            <button
                                className="acard-btn acard-btn--full"
                                style={{ marginBottom: 16 }}
                                disabled={filled < 6 || loading}
                                onClick={handleVerify}
                            >
                                {loading
                                    ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Verifying...</>
                                    : <>Verify & Continue <ArrowRight size={16} /></>
                                }
                            </button>

                            <div className="auth-divider" style={{ margin: '0 0 16px' }}>didn't receive it?</div>

                            <button
                                className="verify-resend"
                                onClick={handleResend}
                                disabled={countdown > 0}
                            >
                                <RotateCcw size={14} />
                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                            </button>

                            <Link href="/sign-up" className="verify-back">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                                Back to sign up
                            </Link>
                            <Link href={`/email-verification?identifier=${encodeURIComponent(identifier)}`} className="verify-back" style={{ marginTop: 8 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/></svg>
                                Verify with email instead
                            </Link>
                        </>
                    ) : (
                        /* ─── Success state ─── */
                        <div className="verify-success">
                            <div className="verify-success__ring">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline className="verify-check" points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h2 className="acard-h2">Phone verified!</h2>
                            <p className="acard-p">
                                Your phone number has been confirmed.<br />
                                Your account is now pending admin approval.
                            </p>
                            <Link href="/pending-approval" className="acard-btn" style={{ marginTop: 8 }}>
                                View Account Status <ArrowRight size={16} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}