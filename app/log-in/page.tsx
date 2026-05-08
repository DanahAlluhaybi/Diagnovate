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
    const [error,      setError]      = useState('');
    const [pwError,    setPwError]    = useState('');
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

    const roleColor = isAdmin ? '#1E40AF' : '#1D9E75';
    const roleBg    = isAdmin ? '#EFF6FF' : '#E1F5EE';
    const roleRing  = isAdmin ? '#BFDBFE' : '#6EE7C7';

    const accentLight = isAdmin ? 'rgba(59,130,246,.13)' : 'rgba(29,158,117,.13)';
    const accentBord  = isAdmin ? 'rgba(59,130,246,.3)'  : 'rgba(29,158,117,.3)';
    const accentText  = isAdmin ? '#93C5FD'              : '#5DCAA5';
    const accentDot   = isAdmin ? '#3B82F6'              : '#1D9E75';
    const accentDotSh = isAdmin ? 'rgba(59,130,246,.2)'  : 'rgba(29,158,117,.2)';
    const iconBg      = isAdmin ? 'rgba(59,130,246,.18)' : 'rgba(29,158,117,.18)';
    const iconBord    = isAdmin ? 'rgba(59,130,246,.28)' : 'rgba(29,158,117,.28)';
    const statHover   = isAdmin ? 'rgba(59,130,246,.09)' : 'rgba(29,158,117,.09)';
    const statHoverB  = isAdmin ? 'rgba(59,130,246,.25)' : 'rgba(29,158,117,.25)';
    const hexStroke   = isAdmin ? '#93C5FD'              : '#5EEAD4';
    const hexPatId    = isAdmin ? 'hexLIAdmin'           : 'hexLIDoc';
    const leftBg      = isAdmin
        ? 'linear-gradient(160deg,#060D1F 0%,#0B1535 50%,#0A1628 100%)'
        : 'linear-gradient(160deg,#061410 0%,#0D1B17 50%,#082018 100%)';
    const blob1Bg     = isAdmin
        ? 'radial-gradient(circle,rgba(59,130,246,.2) 0%,transparent 65%)'
        : 'radial-gradient(circle,rgba(29,158,117,.22) 0%,transparent 65%)';
    const blob2Bg     = isAdmin
        ? 'radial-gradient(circle,rgba(30,64,175,.25) 0%,transparent 65%)'
        : 'radial-gradient(circle,rgba(8,80,65,.3) 0%,transparent 65%)';

    const badgeText = isAdmin ? '• ADMIN CONSOLE'  : '• DOCTOR PORTAL';
    const h1Text    = isAdmin ? 'Platform control center.' : 'Your clinical AI workspace.';
    const subText   = isAdmin
        ? 'Manage clinicians, review submissions, and monitor system performance.'
        : 'Diagnose smarter. Work faster. Deliver better outcomes.';

    const stats = isAdmin ? [
        { icon: <Shield size={17}/>,   val: 'Verify', lbl: 'Doctor account management' },
        { icon: <Activity size={17}/>, val: 'Review', lbl: 'Diagnostic submission review' },
        { icon: <Zap size={17}/>,      val: 'Monitor',lbl: 'Platform analytics & control' },
    ] : [
        { icon: <Activity size={17}/>, val: '98.7%', lbl: 'Diagnostic Accuracy' },
        { icon: <Zap size={17}/>,      val: '< 2s',  lbl: 'Real-Time Analysis'  },
        { icon: <Shield size={17}/>,   val: 'HIPAA', lbl: 'Compliant & Secure'  },
    ];

    const btnGrad = isAdmin
        ? 'linear-gradient(135deg,#1E40AF,#3B82F6)'
        : 'linear-gradient(135deg,#1D9E75,#0D9488)';
    const btnShadow = isAdmin
        ? '0 6px 20px rgba(30,64,175,.3)'
        : '0 6px 20px rgba(29,158,117,.3)';
    const btnHoverShadow = isAdmin
        ? '0 10px 28px rgba(30,64,175,.4)'
        : '0 10px 28px rgba(29,158,117,.4)';

    return (
        <>
            <style>{`
                .lp-page { display:grid; grid-template-columns:45% 55%; min-height:100vh; overflow:hidden; }

                /* LEFT */
                .lp-left {
                    position:relative; overflow:hidden;
                    display:flex; flex-direction:column; padding:44px 48px;
                }
                .lp-hex {
                    position:absolute; inset:0; width:100%; height:100%;
                    opacity:0.06; pointer-events:none;
                }
                .lp-blob { position:absolute; border-radius:50%; pointer-events:none; }
                .lp-blob-1 { width:500px;height:500px; top:-160px;right:-120px; animation:lpBlobDrift 14s ease-in-out infinite alternate; }
                .lp-blob-2 { width:380px;height:380px; bottom:-100px;left:-80px; animation:lpBlobDrift 18s ease-in-out infinite alternate-reverse; }

                .lp-logo { position:relative;z-index:2; display:flex;align-items:center;gap:13px; text-decoration:none; margin-bottom:56px; }
                .lp-logo-mark { width:46px;height:46px;border-radius:14px; background:linear-gradient(145deg,#1D9E75,#0D9488); display:flex;align-items:center;justify-content:center; box-shadow:0 6px 22px rgba(29,158,117,.45); position:relative; }
                .lp-logo-mark::after { content:''; position:absolute;inset:-3px;border-radius:17px; border:1.5px solid rgba(29,158,117,.35); animation:lpRingPulse 3.5s ease-in-out infinite; }
                .lp-logo-word { font-family:'DM Serif Display',serif; font-size:23px; color:#fff; letter-spacing:-.3px; }
                .lp-logo-word span { color:#5DCAA5; font-style:italic; }

                .lp-body { position:relative;z-index:2; flex:1; display:flex;flex-direction:column;justify-content:center; }
                .lp-badge { display:inline-flex;align-items:center;gap:8px; border:1px solid; color:#5DCAA5;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase; padding:6px 15px;border-radius:100px;margin-bottom:26px;width:fit-content; }
                .lp-badge-dot { width:6px;height:6px;border-radius:50%;animation:lpBlink 2s ease-in-out infinite;box-shadow:0 0 0 3px; }
                .lp-h1 { font-family:'DM Serif Display',serif; font-size:clamp(34px,3.2vw,46px); color:#fff;line-height:1.07;letter-spacing:-1px;margin-bottom:18px; }
                .lp-sub { font-size:14.5px;color:rgba(255,255,255,.45);line-height:1.7;margin-bottom:36px;max-width:320px; }

                .lp-stats { display:flex;flex-direction:column;gap:10px; }
                .lp-stat { display:flex;align-items:center;gap:14px; background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07); border-radius:14px;padding:13px 16px;transition:all .25s;cursor:default; }
                .lp-stat-icon { width:36px;height:36px;border-radius:10px; display:flex;align-items:center;justify-content:center;flex-shrink:0; }
                .lp-stat-val { font-family:'DM Serif Display',serif;font-size:20px;color:#fff;letter-spacing:-.5px;line-height:1; }
                .lp-stat-lbl { font-size:11.5px;color:rgba(255,255,255,.38);margin-top:2px; }

                .lp-foot { position:relative;z-index:2;display:flex;flex-wrap:wrap;gap:7px;margin-top:40px; }
                .lp-badge-comp { font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase; color:rgba(255,255,255,.32);border:1px solid rgba(255,255,255,.12); padding:4px 12px;border-radius:100px; }

                /* RIGHT */
                .lp-right { background:#FAFAFA;display:flex;flex-direction:column;position:relative;overflow-y:auto; }
                .lp-right::before { content:'';position:fixed;top:0;right:0;bottom:0;width:55%; background-image:radial-gradient(circle,#C5D6D0 1px,transparent 1px);background-size:28px 28px;opacity:.3;pointer-events:none;z-index:0; }
                .lp-nav { position:relative;z-index:10;display:flex;align-items:center;justify-content:flex-end;gap:4px;padding:20px 44px; border-bottom:1px solid rgba(29,158,117,.08); }
                .lp-nav a { font-size:13px;font-weight:500;color:#8A9E97;text-decoration:none;padding:7px 13px;border-radius:9px;transition:all .15s; }
                .lp-nav a:hover { color:#0D1B17;background:rgba(255,255,255,.85); }

                .lp-form-area { flex:1;display:flex;align-items:center;justify-content:center;padding:24px 52px 48px;position:relative;z-index:1; }
                .lp-card { background:#fff;border-radius:22px;padding:48px;border:1px solid rgba(29,158,117,.1); box-shadow:0 8px 48px rgba(13,27,23,.08),0 2px 8px rgba(13,27,23,.04); width:100%;max-width:420px; animation:lpFadeUp .5s ease both; }

                .lp-role-badge { display:inline-flex;align-items:center;gap:7px;font-size:10.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:5px 13px;border-radius:100px;margin-bottom:18px; }
                .lp-role-dot { width:5px;height:5px;border-radius:50%;animation:lpBlink 2s ease-in-out infinite; }
                .lp-portal-lbl { display:block;font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#1D9E75;margin-bottom:10px; }
                .lp-card-h2 { font-family:'DM Serif Display',serif;font-size:36px;letter-spacing:-.5px;color:#0D1B17;margin-bottom:6px;line-height:1.05; }
                .lp-card-sub { font-size:14px;color:#8A9E97;margin-bottom:28px;line-height:1.55; }
                .lp-card-sub a { color:#1D9E75;font-weight:700;text-decoration:none; }
                .lp-card-sub a:hover { text-decoration:underline; }

                .lp-fields { display:flex;flex-direction:column;gap:16px; }
                .lp-field { display:flex;flex-direction:column; }
                .lp-label { display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#2F4A40;margin-bottom:7px; }
                .lp-iw { position:relative; }
                .lp-iw-icon { position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8A9E97;pointer-events:none;display:flex;z-index:1; }
                .lp-input { width:100%;height:50px;background:white;border:1.5px solid #D1E5DC;border-radius:13px;padding:0 44px 0 42px; font-family:'DM Sans',sans-serif;font-size:14.5px;color:#0D1B17;outline:none;transition:all .2s; box-shadow:0 1px 4px rgba(13,27,23,.04);appearance:none; }
                .lp-input:focus { border-color:#1D9E75;box-shadow:0 0 0 4px rgba(29,158,117,.12),0 1px 4px rgba(13,27,23,.04); }
                .lp-input::placeholder { color:#C5D6D0; }
                .lp-eye { position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#8A9E97;display:flex;padding:4px;transition:color .15s;z-index:2; }
                .lp-eye:hover { color:#1D9E75; }

                .lp-forgot-row { display:flex;justify-content:flex-end;margin-top:6px; }
                .lp-forgot { font-size:12.5px;font-weight:600;color:#8A9E97;text-decoration:none;transition:color .15s; }
                .lp-forgot:hover { color:#1D9E75; }

                .lp-alert { display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:12px;background:#FFF1F2;border:1px solid #FECDD3;color:#C92A2A;font-size:13px;font-weight:600;margin-top:4px; }

                .lp-btn { width:100%;height:52px;border:none;border-radius:14px;color:#fff; font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700; display:flex;align-items:center;justify-content:center;gap:9px; cursor:pointer;transition:all .22s; margin-top:8px; position:relative;overflow:hidden; }
                .lp-btn::after { content:'';position:absolute;top:0;left:-100%;width:55%;height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent); transform:skewX(-15deg);pointer-events:none; }
                .lp-btn:not(:disabled):hover::after { left:160%;transition:left .55s ease; }
                .lp-btn:hover { transform:translateY(-2px); }
                .lp-btn:disabled { opacity:.55;cursor:not-allowed;transform:none; }

                .lp-divider { display:flex;align-items:center;gap:10px;font-size:12px;color:#8A9E97;margin:16px 0; }
                .lp-divider::before,.lp-divider::after { content:'';flex:1;height:1px;background:#D1E5DC; }

                .lp-ghost { width:100%;height:48px;border-radius:13px;background:#fff;color:#0D1B17; border:1.5px solid #D1E5DC;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600; display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all .2s;text-decoration:none; }
                .lp-ghost:hover { border-color:rgba(29,158,117,.4);color:#1D9E75;background:#E1F5EE; }

                .lp-switch-row { display:flex;justify-content:center;margin-top:18px; }
                .lp-switch { display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:#8A9E97; text-decoration:none;padding:8px 16px;border:1.5px solid #D1E5DC;border-radius:100px; transition:all .22s;background:#fff; }
                .lp-switch:hover { border-color:rgba(29,158,117,.35);background:#E1F5EE;color:#1D9E75;transform:translateY(-1px); }

                .lp-security { text-align:center;font-size:11px;color:rgba(255,255,255,.22);margin-top:28px;position:relative;z-index:2;letter-spacing:.3px; }

                @keyframes lpBlobDrift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(20px,14px) scale(1.05)} }
                @keyframes lpRingPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.85;transform:scale(1.04)} }
                @keyframes lpFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
                @keyframes lpBlink { 0%,100%{opacity:1} 50%{opacity:.4} }
                @keyframes lpSpin { to{transform:rotate(360deg)} }

                @media(max-width:960px){.lp-page{grid-template-columns:1fr}.lp-left{min-height:auto;padding:36px}.lp-form-area{padding:24px 28px 44px}.lp-right::before{width:100%}}
                @media(max-width:540px){.lp-card{padding:32px 24px}.lp-form-area{padding:16px 16px 40px}.lp-nav{padding:14px 20px}}
            `}</style>

            <div className="lp-page">

                {/* ══ LEFT PANEL ══ */}
                <div className="lp-left" style={{ background: leftBg }}>
                    <svg className="lp-hex" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id={hexPatId} x="0" y="0" width="52" height="45" patternUnits="userSpaceOnUse">
                                <polygon points="26,2 48,13 48,35 26,46 4,35 4,13" fill="none" stroke={hexStroke} strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#${hexPatId})`}/>
                    </svg>
                    <span className="lp-blob lp-blob-1" style={{ background: blob1Bg }}/>
                    <span className="lp-blob lp-blob-2" style={{ background: blob2Bg }}/>

                    <Link href="/" className="lp-logo">
                        <div className="lp-logo-mark">
                            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3" fill="white"/>
                            </svg>
                        </div>
                        <span className="lp-logo-word">Diagno<span>vate</span></span>
                    </Link>

                    <div className="lp-body">
                        <div className="lp-badge" style={{ background: accentLight, borderColor: accentBord, color: accentText }}>
                            <span className="lp-badge-dot" style={{ background: accentDot, boxShadow: `0 0 0 3px ${accentDotSh}` }}/>
                            {badgeText}
                        </div>
                        <h1 className="lp-h1">{h1Text}</h1>
                        <p className="lp-sub">{subText}</p>
                        <div className="lp-stats">
                            {stats.map((s, i) => (
                                <div className="lp-stat" key={i}
                                    style={{ ['--sh' as any]: statHover, ['--sb' as any]: statHoverB }}
                                    onMouseEnter={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.background = statHover;
                                        el.style.borderColor = statHoverB;
                                        el.style.transform = 'translateX(4px)';
                                    }}
                                    onMouseLeave={e => {
                                        const el = e.currentTarget as HTMLElement;
                                        el.style.background = 'rgba(255,255,255,.05)';
                                        el.style.borderColor = 'rgba(255,255,255,.07)';
                                        el.style.transform = '';
                                    }}
                                >
                                    <div className="lp-stat-icon" style={{ background: iconBg, border: `1px solid ${iconBord}`, color: accentText }}>{s.icon}</div>
                                    <div>
                                        <div className="lp-stat-val">{s.val}</div>
                                        <div className="lp-stat-lbl">{s.lbl}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lp-foot">
                        {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t => (
                            <span key={t} className="lp-badge-comp">{t}</span>
                        ))}
                    </div>
                    <p className="lp-security">Protected by JWT authentication · Role-based access control</p>
                </div>

                {/* ══ RIGHT PANEL ══ */}
                <div className="lp-right">
                    <nav className="lp-nav">
                        <Link href="/">Home</Link>
                        <Link href="/about">About</Link>
                        <Link href="/contact">Contact</Link>
                    </nav>

                    <div className="lp-form-area">
                        <div className="lp-card">

                            <div className="lp-role-badge" style={{ background: roleBg, border: `1px solid ${roleRing}`, color: roleColor }}>
                                <span className="lp-role-dot" style={{ background: roleColor }}/>
                                {isAdmin ? 'Admin Portal' : 'Doctor Portal'}
                            </div>

                            {otpStep ? (
                                <>
                                    <span className="lp-portal-lbl" style={{ color: roleColor }}>Diagnovate Portal</span>
                                    <h2 className="lp-card-h2">Check your email.</h2>
                                    <p className="lp-card-sub">Code sent to <strong style={{color:'#0D1B17'}}>{identifier}</strong></p>
                                    <form onSubmit={handleVerifyOtp}>
                                        <div className="lp-fields">
                                            <div className="lp-field">
                                                <label className="lp-label">Verification Code</label>
                                                <div className="lp-iw">
                                                    <span className="lp-iw-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                                                    <input className="lp-input" type="text" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required autoFocus/>
                                                </div>
                                            </div>
                                        </div>
                                        {error && <div className="lp-alert" style={{marginTop:14}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                                        <button type="submit" className="lp-btn" disabled={loading} style={{ background: btnGrad, boxShadow: btnShadow }}>
                                            {loading ? <><Loader2 size={17} style={{animation:'lpSpin .75s linear infinite'}}/>Verifying...</> : <>Verify & Sign In <ArrowRight size={16}/></>}
                                        </button>
                                    </form>
                                    <div className="lp-switch-row" style={{marginTop:16}}>
                                        <button type="button" className="lp-switch" onClick={() => { setOtpStep(false); setOtp(''); setError(''); }}>← Back</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="lp-portal-lbl" style={{ color: roleColor }}>Diagnovate Portal</span>
                                    <h2 className="lp-card-h2">Welcome back.</h2>
                                    <p className="lp-card-sub">
                                        Sign in to your {isAdmin ? 'admin' : 'clinical'} workspace.
                                        {!isAdmin && <>{' '}<Link href="/sign-up">New doctor?</Link></>}
                                    </p>
                                    <form onSubmit={handleSubmit}>
                                        <div className="lp-fields">
                                            <div className="lp-field">
                                                <label className="lp-label">Email Address</label>
                                                <div className="lp-iw">
                                                    <span className="lp-iw-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg></span>
                                                    <input className="lp-input" type="email" placeholder={isAdmin ? 'admin@diagnovate.com' : 'doctor@hospital.com'} value={email} onChange={e => setEmail(e.target.value)} required autoFocus/>
                                                </div>
                                            </div>
                                            <div className="lp-field">
                                                <label className="lp-label">Password</label>
                                                <div className="lp-iw">
                                                    <span className="lp-iw-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                                                    <input className="lp-input" type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setPwError(e.target.value.length > 0 && e.target.value.length < 8 ? 'Password must be at least 8 characters.' : ''); }} required minLength={8}/>
                                                    <button type="button" className="lp-eye" onClick={() => setShow(v => !v)}>{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                                </div>
                                            </div>
                                        </div>
                                        {pwError && <p style={{color:'#dc2626',fontSize:12,marginTop:4}}>{pwError}</p>}
                                        <div className="lp-forgot-row"><Link href="/forgot-password" className="lp-forgot">Forgot password?</Link></div>
                                        {error && <div className="lp-alert" style={{marginTop:14}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                                        <button type="submit" className="lp-btn" disabled={loading} style={{ background: btnGrad, boxShadow: btnShadow }}
                                            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = btnHoverShadow; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = btnShadow; }}
                                        >
                                            {loading ? <><Loader2 size={17} style={{animation:'lpSpin .75s linear infinite'}}/>Signing in...</> : <>Sign In <ArrowRight size={16}/></>}
                                        </button>
                                    </form>
                                    {!isAdmin && (
                                        <><div className="lp-divider">or</div>
                                        <Link href="/sign-up" className="lp-ghost">Create a new account <ArrowRight size={15}/></Link></>
                                    )}
                                    <div className="lp-switch-row">
                                        <Link href="/role" className="lp-switch">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                                            Switch to {isAdmin ? 'Doctor' : 'Admin'} Login
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function LoginPage() {
    return <Suspense><LoginForm /></Suspense>;
}
