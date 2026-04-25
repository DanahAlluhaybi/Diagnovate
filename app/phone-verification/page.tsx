'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { auth } from '@/lib/api';

type Phase = 'phone' | 'phone-exit' | 'email-enter' | 'email' | 'phone-success';

export default function PhoneVerificationPage() {
    const router = useRouter();

    /* ── phase machine ── */
    const [phase,       setPhase]       = useState<Phase>('phone');
    const [verifyEmail, setVerifyEmail] = useState('');

    /* ── phone OTP ── */
    const [phoneCode,    setPhoneCode]    = useState(['', '', '', '', '', '']);
    const [phoneLoading, setPhoneLoading] = useState(false);
    const [phoneError,   setPhoneError]   = useState('');
    const [phoneResent,  setPhoneResent]  = useState(false);

    /* ── email OTP ── */
    const [emailCode,    setEmailCode]    = useState(['', '', '', '', '', '']);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailError,   setEmailError]   = useState('');
    const [emailResent,  setEmailResent]  = useState(false);
    const [emailDone,    setEmailDone]    = useState(false);
    const [phoneToken,   setPhoneToken]   = useState<string | null>(null); // token returned alongside next_step

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

    /* ── derived ── */
    const isPhonePhase = phase === 'phone' || phase === 'phone-exit';
    const isEmailPhase = phase === 'email-enter' || phase === 'email';
    const currentStep  = isEmailPhase || emailDone ? 3 : 2;   // 1-indexed out of 4
    const phoneFilled  = phoneCode.filter(Boolean).length;
    const emailFilled  = emailCode.filter(Boolean).length;

    /* ── icon layer classes ── */
    const phoneIconCls =
        phase === 'phone-exit' ? 'pv-icon-out'
        : isPhonePhase         ? 'pv-icon-show'
        :                        'pv-icon-hidden';

    const emailIconCls =
        phase === 'email-enter' ? 'pv-icon-in'
        : isEmailPhase          ? 'pv-icon-show'
        :                         'pv-icon-hidden';

    /* ════════════════════════════════
       PHONE OTP HANDLERS
    ════════════════════════════════ */
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
        setPhoneError(''); setPhoneLoading(true);
        try {
            const identifier = new URLSearchParams(window.location.search).get('identifier') ?? '';
            const data = await auth.verifyOtp(identifier, phoneCode.join(''));

            if (data.next_step === 'verify_email') {
                /* ── cinematic transition ── */
                setVerifyEmail(data.email ?? '');
                setPhoneToken(data.token ?? null);         // store for use on skip
                setPhase('phone-exit');                    // exit animation begins
                setTimeout(() => {
                    setPhase('email-enter');               // email card springs in
                    setTimeout(() => setPhase('email'), 540);
                }, 380);
            } else {
                setPhase('phone-success');
            }
        } catch (err: unknown) {
            setPhoneError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
        } finally { setPhoneLoading(false); }
    };
    const handlePhoneResend = async () => {
        setPhoneCode(['', '', '', '', '', '']);
        setPhoneError('');
        try {
            const identifier = new URLSearchParams(window.location.search).get('identifier') ?? '';
            await auth.resendOtp(identifier);
            setPhoneResent(true);
            p0.current?.focus();
            setTimeout(() => setPhoneResent(false), 4000);
        } catch { setPhoneError('Failed to resend code.'); }
    };

    /* ════════════════════════════════
       EMAIL OTP HANDLERS
    ════════════════════════════════ */
    const handleSkipEmail = async () => {
        if (phoneToken) {
            // Backend already issued a token with the phone OTP response — just commit and redirect
            localStorage.setItem('token', phoneToken);
            router.push('/pending-approval');
            return;
        }
        // No token yet — ask backend to skip email verification
        setEmailLoading(true);
        try {
            await auth.verifyEmailOtp(verifyEmail, '', true);
        } catch { /* email is optional — redirect regardless */ }
        finally { setEmailLoading(false); }
        router.push('/pending-approval');
    };

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
        setEmailError(''); setEmailLoading(true);
        try {
            await auth.verifyEmailOtp(verifyEmail, emailCode.join(''));
            setEmailDone(true);
        } catch (err: unknown) {
            setEmailError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
        } finally { setEmailLoading(false); }
    };
    const handleEmailResend = async () => {
        setEmailCode(['', '', '', '', '', '']);
        setEmailError('');
        try {
            await auth.resendEmailOtp(verifyEmail);
            setEmailResent(true);
            e0.current?.focus();
            setTimeout(() => setEmailResent(false), 4000);
        } catch { setEmailError('Failed to resend code.'); }
    };

    /* ════════════════════════════════
       RENDER
    ════════════════════════════════ */
    const showHeader = phase !== 'phone-success' && !emailDone;

    return (
        <div className="acard-page">
            <style>{`
                /* ── card body exit: slides left + shrinks ── */
                @keyframes pvExitLeft {
                    0%   { opacity:1; transform:translateX(0)    scale(1);    filter:blur(0px);   }
                    100% { opacity:0; transform:translateX(-56px) scale(0.93); filter:blur(2px);   }
                }
                /* ── card body enter: springs in from right ── */
                @keyframes pvEnterRight {
                    0%   { opacity:0; transform:translateX(64px)  scale(0.93); filter:blur(2px);   }
                    55%  { opacity:1; transform:translateX(-8px)   scale(1.02); filter:blur(0px);   }
                    75%  { transform:translateX(4px)  scale(0.993); }
                    90%  { transform:translateX(-2px) scale(1.002); }
                    100% { opacity:1; transform:translateX(0)     scale(1);                        }
                }
                /* ── icon flip out (rotates to edge) ── */
                @keyframes pvIconOut {
                    0%   { transform:perspective(420px) rotateY(0deg);   opacity:1; }
                    100% { transform:perspective(420px) rotateY(-90deg);  opacity:0; }
                }
                /* ── icon flip in (completes the coin-flip) ── */
                @keyframes pvIconIn {
                    0%   { transform:perspective(420px) rotateY(90deg);  opacity:0; }
                    100% { transform:perspective(420px) rotateY(0deg);   opacity:1; }
                }

                .pv-exit          { animation: pvExitLeft   .38s cubic-bezier(.4,0,1,1) both; }
                .pv-enter         { animation: pvEnterRight .54s cubic-bezier(.34,1.56,.64,1) .04s both; }

                /* icon layers */
                .pv-icon-wrap     { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
                .pv-icon-hidden   { opacity:0; pointer-events:none; }
                .pv-icon-show     { opacity:1; }
                .pv-icon-out      { animation: pvIconOut .22s ease-in both; }
                .pv-icon-in       { animation: pvIconIn  .28s ease-out both; }

                /* status-badge fade when text changes */
                .pv-badge-enter   { animation: pvBadgeFade .3s ease both; }
                @keyframes pvBadgeFade {
                    from { opacity:0; transform:translateY(5px); }
                    to   { opacity:1; transform:translateY(0);   }
                }
            `}</style>

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

                    {/* ════ FIXED HEADER — progress bar + morphing icon ════ */}
                    {showHeader && (
                        <>
                            {/* Segmented progress bar */}
                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7, fontSize: 11, letterSpacing: '.05em', color: 'var(--muted)' }}>
                                    <span style={{ transition: 'opacity .3s', opacity: isEmailPhase ? 1 : 0.6 }}>
                                        {isEmailPhase ? 'EMAIL VERIFICATION' : 'PHONE VERIFICATION'}
                                    </span>
                                    <span style={{ color: '#0D9488', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                                        {currentStep} / 4
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    {[0, 1, 2, 3].map(i => (
                                        <div key={i} style={{
                                            flex: 1, height: 3, borderRadius: 99,
                                            background: i < currentStep ? '#0D9488' : 'var(--border)',
                                            transition: 'background 480ms cubic-bezier(.4,0,.2,1)',
                                        }} />
                                    ))}
                                </div>
                            </div>

                            {/* Morphing icon — two layers, one flips out while the other flips in */}
                            <div className="acard-icon acard-icon--teal" style={{ position: 'relative', overflow: 'visible' }}>
                                {/* Phone icon layer */}
                                <span className={`pv-icon-wrap ${phoneIconCls}`}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round">
                                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                                        <line x1="12" y1="18" x2="12.01" y2="18" />
                                    </svg>
                                </span>
                                {/* Email icon layer */}
                                <span className={`pv-icon-wrap ${emailIconCls}`}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.8" strokeLinecap="round">
                                        <rect x="2" y="4" width="20" height="16" rx="3" />
                                        <polyline points="2,4 12,13 22,4" />
                                    </svg>
                                </span>
                            </div>
                        </>
                    )}

                    {/* ════ PHONE OTP BODY ════ */}
                    {isPhonePhase && (
                        <div className={phase === 'phone-exit' ? 'pv-exit' : ''}>
                            <div key="phone-badge" className={`acard-status acard-status--teal ${phase === 'phone' ? 'pv-badge-enter' : ''}`}>
                                <span className="acard-status__dot" />
                                Phone Verification
                            </div>

                            <h2 className="acard-h2">Check your phone.</h2>
                            <p className="acard-p" style={{ marginBottom: 20 }}>
                                We sent a 6-digit code to your phone number.<br />Enter it below to continue.
                            </p>

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

                            {phoneError && (
                                <div className="dv-alert dv-alert-error">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {phoneError}
                                </div>
                            )}
                            {phoneResent && (
                                <div className="dv-alert dv-alert-success" style={{ marginBottom: 16 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    New code sent to your phone.
                                </div>
                            )}

                            <button className="acard-btn acard-btn--full" style={{ marginBottom: 16 }}
                                disabled={phoneFilled < 6 || phoneLoading}
                                onClick={handlePhoneVerify}>
                                {phoneLoading
                                    ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Verifying...</>
                                    : <>Verify & Continue <ArrowRight size={16} /></>}
                            </button>

                            <div className="auth-divider" style={{ margin: '0 0 16px' }}>didn't receive it?</div>

                            <button className="verify-resend" onClick={handlePhoneResend} disabled={phoneResent}>
                                <RotateCcw size={14} /> {phoneResent ? 'Code sent!' : 'Resend code'}
                            </button>

                            <Link href="/sign-up" className="verify-back">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                                Back to sign up
                            </Link>
                        </div>
                    )}

                    {/* ════ EMAIL OTP BODY ════ */}
                    {isEmailPhase && (
                        <div className={phase === 'email-enter' ? 'pv-enter' : ''}>
                            <div className="acard-status acard-status--teal pv-badge-enter">
                                <span className="acard-status__dot" />
                                Email Verification
                            </div>

                            <h2 className="acard-h2">Check your email.</h2>
                            <p className="acard-p" style={{ marginBottom: 20 }}>
                                We sent a 6-digit code to <strong>{verifyEmail}</strong>.<br />Enter it below to continue.
                            </p>

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

                            {emailError && (
                                <div className="dv-alert dv-alert-error">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                    {emailError}
                                </div>
                            )}
                            {emailResent && (
                                <div className="dv-alert dv-alert-success" style={{ marginBottom: 16 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    New code sent to your email.
                                </div>
                            )}

                            <button className="acard-btn acard-btn--full" style={{ marginBottom: 16 }}
                                disabled={emailFilled < 6 || emailLoading}
                                onClick={handleEmailVerify}>
                                {emailLoading
                                    ? <><Loader2 size={17} style={{ animation: 'spinIcon .75s linear infinite' }} />Verifying...</>
                                    : <>Verify & Continue <ArrowRight size={16} /></>}
                            </button>

                            <div className="auth-divider" style={{ margin: '0 0 16px' }}>didn't receive it?</div>

                            <button className="verify-resend" onClick={handleEmailResend} disabled={emailResent}>
                                <RotateCcw size={14} /> {emailResent ? 'Code sent!' : 'Resend code'}
                            </button>

                            <button
                                onClick={handleSkipEmail}
                                disabled={emailLoading}
                                style={{
                                    marginTop: 12, width: '100%', background: 'none', border: 'none',
                                    fontSize: 13, color: 'var(--muted)', cursor: 'pointer',
                                    padding: '6px 0', textDecoration: 'underline', textUnderlineOffset: 3,
                                    opacity: emailLoading ? 0.5 : 1,
                                }}
                            >
                                Skip — verify email later
                            </button>

                            <Link href="/sign-up" className="verify-back">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                                Back to sign up
                            </Link>
                        </div>
                    )}

                    {/* ════ PHONE-ONLY SUCCESS ════ */}
                    {phase === 'phone-success' && (
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

                    {/* ════ EMAIL SUCCESS ════ */}
                    {emailDone && (
                        <div className="verify-success">
                            <div className="verify-success__ring">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline className="verify-check" points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h2 className="acard-h2">All verified!</h2>
                            <p className="acard-p">
                                Your phone and email have been confirmed.<br />
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
