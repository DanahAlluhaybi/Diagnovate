'use client';

import { useState, useRef } from 'react';
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
    const [resent,  setResent]  = useState(false);

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
            const data = await auth.verifyOtp(identifier, code.join('')) as {
                token?: string;
                user?: unknown;
                next_step?: string;
                email?: string;
            };
            if (data.next_step === 'verify_email') {
                router.push(`/email-verification?identifier=${encodeURIComponent(data.email ?? '')}`);
                return;
            }
            if (!data.token) {
                setError('Token is missing. Please try again.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', data.token);

            if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
            setDone(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
        } finally { setLoading(false); }
    };

    const handleResend = () => {
        setCode(['', '', '', '', '', '']);
        setError('');
        setResent(true);
        r0.current?.focus();
        setTimeout(() => setResent(false), 4000);
    };

    const filled = code.filter(Boolean).length;

    return (
        <div className="acard-page">
            {/* Ambient glows */}
            <span className="acard-page__glow acard-page__glow--teal" />
            <span className="acard-page__glow acard-page__glow--purple" />

            {/* ── Navbar ── */}
            <nav className="acard-nav">
                <Link href="/" className="acard-nav__logo">
                    <div className="acard-nav__mark">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white" />
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

            {/* ── Card ── */}
            <div className="acard-wrap">
                <div className="acard">
                    {/* Logo */}
                    <Link href="/" className="acard-logo">
                        <div className="acard-logo__mark">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white" />
                            </svg>
                        </div>
                        <span className="acard-logo__word">Diagno<span>vate</span></span>
                    </Link>

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

                            <h2 className="acard-h2">Check your phone.</h2>
                            <p className="acard-p" style={{ marginBottom: 20 }}>
                                We sent a 6-digit code to your phone number.<br />Enter it below to continue.
                            </p>


                            {/* OTP boxes */}
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
                                {filled === 6 ? '✓ Ready to verify' : `${6 - filled} digit${6 - filled !== 1 ? 's' : ''} remaining`}
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

                            <div className="auth-divider" style={{ margin: '0 0 16px' }}>Don&apos;treceive it?</div>

                            <button
                                className="verify-resend"
                                onClick={handleResend}
                                disabled={resent}
                            >
                                <RotateCcw size={14} />
                                {resent ? 'Code sent!' : 'Resend code'}
                            </button>

                            <Link href="/sign-up" className="verify-back">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                                Back to sign up
                            </Link>
                            <Link href="/email-verification" className="verify-back" style={{ marginTop: 8 }}>
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