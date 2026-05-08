'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
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

    const btnGrad    = isAdmin ? 'linear-gradient(135deg,#1E40AF,#3B82F6)' : 'linear-gradient(135deg,#1D9E75,#0D9488)';
    const btnShadow  = isAdmin ? '0 6px 20px rgba(30,64,175,0.4)'         : '0 6px 20px rgba(29,158,117,0.4)';
    const badgeColor = isAdmin ? '#93C5FD'                                 : '#5DCAA5';
    const badgeBg    = isAdmin ? 'rgba(59,130,246,0.15)'                   : 'rgba(29,158,117,0.15)';
    const badgeBord  = isAdmin ? 'rgba(59,130,246,0.3)'                    : 'rgba(29,158,117,0.3)';
    const badgeDot   = isAdmin ? '#3B82F6'                                 : '#1D9E75';

    return (
        <>
            <style>{`
                .dgl-page{position:relative;z-index:1;min-height:100vh;background:#0D1B17;display:flex;flex-direction:column;overflow:hidden}
                .dgl-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.05;pointer-events:none;z-index:0}
                .dgl-blob{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
                .dgl-blob-1{width:640px;height:640px;background:radial-gradient(circle,rgba(29,158,117,.15) 0%,transparent 65%);top:-220px;right:-160px;animation:dglDrift 16s ease-in-out infinite alternate}
                .dgl-blob-2{width:500px;height:500px;background:radial-gradient(circle,rgba(8,80,65,.22) 0%,transparent 65%);bottom:-160px;left:-130px;animation:dglDrift 20s ease-in-out infinite alternate-reverse}
                .dgl-dots{position:fixed;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px);background-size:28px 28px;pointer-events:none;z-index:0}

                .dgl-topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:28px 48px}
                .dgl-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
                .dgl-logo-mark{width:44px;height:44px;border-radius:13px;background:linear-gradient(145deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(29,158,117,0.4);flex-shrink:0;position:relative}
                .dgl-logo-mark::after{content:'';position:absolute;inset:-3px;border-radius:16px;border:1.5px solid rgba(29,158,117,.3);animation:dglRingPulse 3.5s ease-in-out infinite}
                .dgl-logo-word{font-family:'DM Serif Display',serif;font-size:22px;color:white;letter-spacing:-.3px}
                .dgl-logo-word em{font-style:italic;color:#5DCAA5}
                .dgl-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:rgba(255,255,255,.45);text-decoration:none;padding:8px 16px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.05);transition:all .18s}
                .dgl-back:hover{color:rgba(255,255,255,.85);border-color:rgba(255,255,255,.25);background:rgba(255,255,255,.09)}

                .dgl-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 24px 32px}

                /* Card wrap — holds glow + floating hexes + card */
                .dgl-card-wrap{position:relative;width:100%;max-width:560px;display:flex;align-items:center;justify-content:center}
                .dgl-card-glow{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(29,158,117,.08) 0%,transparent 65%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:0}

                /* Floating decorative hexes */
                .dgl-hex-float{position:absolute;pointer-events:none;opacity:.15;z-index:0}
                .dgl-hex-float-1{top:-44px;left:4px;animation:dglFloat 7s ease-in-out infinite}
                .dgl-hex-float-2{top:-20px;right:0px;animation:dglFloat 9s ease-in-out infinite;animation-delay:-3s}
                .dgl-hex-float-3{bottom:-30px;left:8px;animation:dglFloat 8.5s ease-in-out infinite;animation-delay:-1.5s}
                .dgl-hex-float-4{bottom:20px;right:4px;animation:dglFloat 11s ease-in-out infinite;animation-delay:-5s}

                /* Card */
                .dgl-card{position:relative;z-index:1;width:100%;max-width:480px;background:rgba(255,255,255,.04);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:52px 48px;box-shadow:0 32px 80px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08);animation:dglFadeUp .5s ease both;overflow:hidden}

                /* Top gradient bar */
                .dgl-top-line{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#1D9E75,#0D9488,#1D9E75,transparent);pointer-events:none;z-index:2}

                /* Scan line */
                .dgl-scan-line{position:absolute;left:0;right:0;height:40%;background:linear-gradient(to bottom,transparent,rgba(29,158,117,.03),transparent);pointer-events:none;z-index:0;animation:dglScanMove 12s ease-in-out infinite}

                /* Card content above scan */
                .dgl-card-body{position:relative;z-index:1}

                .dgl-role-badge{display:inline-flex;align-items:center;gap:7px;font-size:10.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:5px 13px;border-radius:100px;margin-bottom:20px;border:1px solid}
                .dgl-role-dot{width:5px;height:5px;border-radius:50%;animation:dglBlink 2s ease-in-out infinite}
                .dgl-h2{font-family:'DM Serif Display',serif;font-size:40px;letter-spacing:-.8px;color:white;margin-bottom:8px;line-height:1.05}
                .dgl-sub{font-size:14px;color:rgba(255,255,255,.5);margin-bottom:32px;line-height:1.6}
                .dgl-sub a{color:#5DCAA5;font-weight:700;text-decoration:none}
                .dgl-sub a:hover{text-decoration:underline}

                .dgl-fields{display:flex;flex-direction:column;gap:14px}
                .dgl-field{display:flex;flex-direction:column}
                .dgl-label{display:block;font-size:11px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:7px}
                .dgl-iw{position:relative}
                .dgl-iw-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.35);pointer-events:none;display:flex;z-index:1}
                .dgl-input{width:100%;height:50px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:13px;padding:0 44px 0 42px;font-family:'DM Sans',sans-serif;font-size:14.5px;color:white;outline:none;transition:all .2s;appearance:none}
                .dgl-input:focus{border-color:rgba(29,158,117,.6);background:rgba(255,255,255,.09);box-shadow:0 0 0 3px rgba(29,158,117,.2)}
                .dgl-input::placeholder{color:rgba(255,255,255,.3)}
                .dgl-eye{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);display:flex;padding:4px;transition:color .15s;z-index:2}
                .dgl-eye:hover{color:rgba(255,255,255,.75)}

                .dgl-forgot-row{display:flex;justify-content:flex-end;margin-top:6px}
                .dgl-forgot{font-size:12.5px;font-weight:600;color:rgba(255,255,255,.4);text-decoration:none;transition:color .15s}
                .dgl-forgot:hover{color:rgba(255,255,255,.75)}

                .dgl-alert{display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#FCA5A5;font-size:13px;font-weight:600;margin-top:4px}

                .dgl-btn{width:100%;height:52px;border:none;border-radius:14px;color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;transition:all .22s;margin-top:8px;position:relative;overflow:hidden}
                .dgl-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:skewX(-15deg);pointer-events:none}
                .dgl-btn:not(:disabled):hover::after{left:160%;transition:left .55s ease}
                .dgl-btn:hover{transform:translateY(-2px)}
                .dgl-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

                .dgl-divider{display:flex;align-items:center;gap:10px;font-size:12px;color:rgba(255,255,255,.2);margin:16px 0}
                .dgl-divider::before,.dgl-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.1)}

                .dgl-ghost{width:100%;height:48px;border-radius:13px;background:rgba(255,255,255,.04);color:rgba(255,255,255,.7);border:1.5px solid rgba(255,255,255,.12);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all .2s;text-decoration:none}
                .dgl-ghost:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.22);color:white}

                .dgl-switch-row{display:flex;justify-content:center;margin-top:20px}
                .dgl-switch{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:rgba(255,255,255,.4);text-decoration:none;padding:8px 16px;border:1px solid rgba(255,255,255,.1);border-radius:100px;background:rgba(255,255,255,.06);transition:all .22s}
                .dgl-switch:hover{color:rgba(255,255,255,.8);border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.1);transform:translateY(-1px)}

                .dgl-otp-input{width:100%;height:56px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:0 20px;font-family:'DM Serif Display',serif;font-size:26px;color:white;outline:none;transition:all .2s;letter-spacing:8px;text-align:center}
                .dgl-otp-input:focus{border-color:rgba(29,158,117,.6);background:rgba(255,255,255,.09);box-shadow:0 0 0 3px rgba(29,158,117,.2)}
                .dgl-otp-input::placeholder{color:rgba(255,255,255,.18);letter-spacing:6px}
                .dgl-back-btn{width:100%;height:44px;border-radius:12px;background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.1);font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:all .18s;margin-top:10px}
                .dgl-back-btn:hover{color:rgba(255,255,255,.8);border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.08)}

                .dgl-footer{position:relative;z-index:1;text-align:center;padding:20px 24px 36px;display:flex;flex-direction:column;align-items:center;gap:10px}
                .dgl-footer-text{font-size:11px;color:rgba(255,255,255,.2);letter-spacing:.3px}
                .dgl-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
                .dgl-badge-comp{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.1);padding:3px 10px;border-radius:100px}

                @keyframes dglDrift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(24px,16px) scale(1.06)}}
                @keyframes dglRingPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.85;transform:scale(1.04)}}
                @keyframes dglFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
                @keyframes dglBlink{0%,100%{opacity:1}50%{opacity:.4}}
                @keyframes dglSpin{to{transform:rotate(360deg)}}
                @keyframes dglFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(10deg)}}
                @keyframes dglScanMove{0%{top:-40%;opacity:0}15%{opacity:1}85%{opacity:1}100%{top:120%;opacity:0}}

                @media(max-width:640px){
                    .dgl-topbar{padding:20px 20px}
                    .dgl-card{padding:36px 24px;border-radius:22px}
                    .dgl-h2{font-size:32px}
                    .dgl-hex-float{display:none}
                }
            `}</style>

            <div className="dgl-page">

                {/* Hex grid */}
                <svg className="dgl-hex" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dglHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dglHex)"/>
                </svg>
                <span className="dgl-blob dgl-blob-1"/>
                <span className="dgl-blob dgl-blob-2"/>
                <div className="dgl-dots"/>

                {/* Top bar */}
                <div className="dgl-topbar">
                    <Link href="/" className="dgl-logo">
                        <div className="dgl-logo-mark">
                            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="dgl-logo-word">Diagno<em>vate</em></span>
                    </Link>
                    <Link href="/role" className="dgl-back">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to Role Selection
                    </Link>
                </div>

                {/* Main — card wrap with floating decoration */}
                <div className="dgl-main">
                    <div className="dgl-card-wrap">

                        {/* Teal glow ring behind card */}
                        <div className="dgl-card-glow"/>

                        {/* Floating hex marks */}
                        <svg className="dgl-hex-float dgl-hex-float-1" width="46" height="52" viewBox="0 0 46 52" fill="none">
                            <polygon points="23,2 44,13 44,39 23,50 2,39 2,13" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
                        </svg>
                        <svg className="dgl-hex-float dgl-hex-float-2" width="34" height="38" viewBox="0 0 34 38" fill="none">
                            <polygon points="17,2 32,9.5 32,28.5 17,36 2,28.5 2,9.5" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
                        </svg>
                        <svg className="dgl-hex-float dgl-hex-float-3" width="38" height="44" viewBox="0 0 38 44" fill="none">
                            <polygon points="19,2 36,10.5 36,33.5 19,42 2,33.5 2,10.5" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
                        </svg>
                        <svg className="dgl-hex-float dgl-hex-float-4" width="28" height="32" viewBox="0 0 28 32" fill="none">
                            <polygon points="14,2 26,8.5 26,23.5 14,30 2,23.5 2,8.5" stroke="#1D9E75" strokeWidth="1.5" fill="none"/>
                        </svg>

                        {/* Glass card */}
                        <div className="dgl-card">
                            <div className="dgl-top-line"/>
                            <div className="dgl-scan-line"/>

                            <div className="dgl-card-body">
                                <div className="dgl-role-badge" style={{ background: badgeBg, borderColor: badgeBord, color: badgeColor }}>
                                    <span className="dgl-role-dot" style={{ background: badgeDot }}/>
                                    {isAdmin ? '• ADMIN CONSOLE' : '• DOCTOR PORTAL'}
                                </div>

                                {otpStep ? (
                                    <>
                                        <h2 className="dgl-h2">Check your email.</h2>
                                        <p className="dgl-sub">Code sent to <strong style={{color:'rgba(255,255,255,0.85)'}}>{identifier}</strong></p>
                                        <form onSubmit={handleVerifyOtp}>
                                            <div className="dgl-fields">
                                                <div className="dgl-field">
                                                    <label className="dgl-label">Verification Code</label>
                                                    <input
                                                        className="dgl-otp-input"
                                                        type="text"
                                                        placeholder="• • • • • •"
                                                        value={otp}
                                                        onChange={e => setOtp(e.target.value)}
                                                        maxLength={6}
                                                        required
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            {error && (
                                                <div className="dgl-alert" style={{marginTop:14}}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                    {error}
                                                </div>
                                            )}
                                            <button type="submit" className="dgl-btn" disabled={loading} style={{ background: btnGrad, boxShadow: btnShadow }}>
                                                {loading
                                                    ? <><Loader2 size={17} style={{animation:'dglSpin .75s linear infinite'}}/>Verifying...</>
                                                    : <>Verify &amp; Sign In <ArrowRight size={16}/></>
                                                }
                                            </button>
                                        </form>
                                        <button type="button" className="dgl-back-btn" onClick={() => { setOtpStep(false); setOtp(''); setError(''); }}>
                                            ← Back to login
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="dgl-h2">Welcome back.</h2>
                                        <p className="dgl-sub">
                                            Sign in to your {isAdmin ? 'admin' : 'clinical'} workspace.
                                            {!isAdmin && <>{' '}<Link href="/sign-up">New doctor?</Link></>}
                                        </p>
                                        <form onSubmit={handleSubmit}>
                                            <div className="dgl-fields">
                                                <div className="dgl-field">
                                                    <label className="dgl-label">Email Address</label>
                                                    <div className="dgl-iw">
                                                        <span className="dgl-iw-icon">
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                                                        </span>
                                                        <input
                                                            className="dgl-input"
                                                            type="email"
                                                            placeholder={isAdmin ? 'admin@diagnovate.com' : 'doctor@hospital.com'}
                                                            value={email}
                                                            onChange={e => setEmail(e.target.value)}
                                                            required
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="dgl-field">
                                                    <label className="dgl-label">Password</label>
                                                    <div className="dgl-iw">
                                                        <span className="dgl-iw-icon">
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                                        </span>
                                                        <input
                                                            className="dgl-input"
                                                            type={show ? 'text' : 'password'}
                                                            placeholder="••••••••"
                                                            value={password}
                                                            onChange={e => {
                                                                setPassword(e.target.value);
                                                                setPwError(e.target.value.length > 0 && e.target.value.length < 8 ? 'Password must be at least 8 characters.' : '');
                                                            }}
                                                            required
                                                            minLength={8}
                                                        />
                                                        <button type="button" className="dgl-eye" onClick={() => setShow(v => !v)}>
                                                            {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {pwError && <p style={{color:'#FCA5A5',fontSize:12,marginTop:5}}>{pwError}</p>}
                                            <div className="dgl-forgot-row">
                                                <Link href="/forgot-password" className="dgl-forgot">Forgot password?</Link>
                                            </div>
                                            {error && (
                                                <div className="dgl-alert" style={{marginTop:14}}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                    {error}
                                                </div>
                                            )}
                                            <button
                                                type="submit"
                                                className="dgl-btn"
                                                disabled={loading}
                                                style={{ background: btnGrad, boxShadow: btnShadow }}
                                            >
                                                {loading
                                                    ? <><Loader2 size={17} style={{animation:'dglSpin .75s linear infinite'}}/>Signing in...</>
                                                    : <>Sign In <ArrowRight size={16}/></>
                                                }
                                            </button>
                                        </form>

                                        {!isAdmin && (
                                            <>
                                                <div className="dgl-divider">or</div>
                                                <Link href="/sign-up" className="dgl-ghost">
                                                    Create a new account <ArrowRight size={15}/>
                                                </Link>
                                            </>
                                        )}

                                        <div className="dgl-switch-row">
                                            <Link href="/role" className="dgl-switch">
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

                {/* Footer */}
                <div className="dgl-footer">
                    <p className="dgl-footer-text">Protected by JWT authentication · Role-based access control</p>
                    <div className="dgl-badges">
                        {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t => (
                            <span key={t} className="dgl-badge-comp">{t}</span>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}

export default function LoginPage() {
    return <Suspense><LoginForm /></Suspense>;
}
