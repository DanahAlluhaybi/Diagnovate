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

    const btnGrad    = isAdmin ? 'linear-gradient(135deg,#1E40AF,#3B82F6)' : 'linear-gradient(135deg,#0D9488,#0D9488)';
    const btnShadow  = isAdmin ? '0 6px 20px rgba(30,64,175,0.28)'         : '0 6px 20px rgba(13,148,136,0.28)';
    const badgeColor = isAdmin ? '#1E40AF'                                  : '#0F6E56';
    const badgeBg    = isAdmin ? 'rgba(30,64,175,0.07)'                     : 'rgba(13,148,136,0.07)';
    const badgeBord  = isAdmin ? 'rgba(30,64,175,0.18)'                     : 'rgba(13,148,136,0.18)';
    const badgeDot   = isAdmin ? '#3B82F6'                                  : '#0D9488';

    return (
        <>
            <style>{`
                .dgl-page{position:relative;z-index:1;min-height:100vh;background:#F0F4F8;display:flex;flex-direction:column;overflow:hidden}
                .dgl-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.035;pointer-events:none;z-index:0}
                .dgl-blob{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
                .dgl-blob-1{width:600px;height:600px;background:radial-gradient(circle,rgba(13,148,136,.06) 0%,transparent 65%);top:-200px;right:-150px}
                .dgl-blob-2{width:400px;height:400px;background:radial-gradient(circle,rgba(8,80,65,.04) 0%,transparent 65%);bottom:-120px;left:-100px}

                .dgl-topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:68px;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(13,148,136,.08);flex-shrink:0}
                .dgl-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
                .dgl-logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#0D9488,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(13,148,136,.3);flex-shrink:0}
                .dgl-logo-word{font-family:'DM Serif Display',serif;font-size:20px;color:#0F172A;letter-spacing:-.3px}
                .dgl-logo-word em{font-style:italic;color:#0D9488}
                .dgl-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#334155;text-decoration:none;padding:8px 16px;border:1.5px solid #E2E8F0;border-radius:10px;background:white;transition:all .18s}
                .dgl-back:hover{border-color:#0D9488;color:#0D9488;background:#F0F4F8}

                .dgl-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px 40px}

                .dgl-card{width:100%;max-width:440px;background:#fff;border:1px solid rgba(13,148,136,.12);border-radius:24px;padding:48px;box-shadow:0 20px 60px rgba(13,27,23,.08),0 4px 16px rgba(13,27,23,.04);animation:dglFadeUp .45s ease both;position:relative;overflow:hidden}
                .dgl-top-line{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#0D9488,#0D9488,#0D9488,transparent);pointer-events:none}

                .dgl-role-badge{display:inline-flex;align-items:center;gap:7px;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:20px;border:1px solid}
                .dgl-role-dot{width:5px;height:5px;border-radius:50%;animation:dglBlink 2s ease-in-out infinite}
                .dgl-h2{font-family:'DM Serif Display',serif;font-size:36px;letter-spacing:-.7px;color:#0F172A;margin-bottom:8px;line-height:1.05}
                .dgl-sub{font-size:14px;color:#64748B;margin-bottom:28px;line-height:1.6}
                .dgl-sub a{color:#0D9488;font-weight:700;text-decoration:none}
                .dgl-sub a:hover{text-decoration:underline}

                .dgl-fields{display:flex;flex-direction:column;gap:14px}
                .dgl-field{display:flex;flex-direction:column}
                .dgl-label{display:block;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#334155;margin-bottom:7px}
                .dgl-iw{position:relative}
                .dgl-iw-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#64748B;pointer-events:none;display:flex;z-index:1}
                .dgl-input{width:100%;height:50px;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:12px;padding:0 44px 0 42px;font-family:'DM Sans',sans-serif;font-size:14.5px;color:#0F172A;outline:none;transition:all .2s;appearance:none}
                .dgl-input:focus{border-color:#0D9488;background:#fff;box-shadow:0 0 0 4px rgba(13,148,136,.1)}
                .dgl-input::placeholder{color:#64748B}
                .dgl-eye{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#64748B;display:flex;padding:4px;transition:color .15s;z-index:2}
                .dgl-eye:hover{color:#334155}

                .dgl-forgot-row{display:flex;justify-content:flex-end;margin-top:6px}
                .dgl-forgot{font-size:12.5px;font-weight:600;color:#64748B;text-decoration:none;transition:color .15s}
                .dgl-forgot:hover{color:#0D9488}

                .dgl-alert{display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:12px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.18);color:#DC2626;font-size:13px;font-weight:600;margin-top:4px}

                .dgl-btn{width:100%;height:52px;border:none;border-radius:13px;color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;transition:all .22s;margin-top:8px;position:relative;overflow:hidden}
                .dgl-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:skewX(-15deg);pointer-events:none}
                .dgl-btn:not(:disabled):hover::after{left:160%;transition:left .55s ease}
                .dgl-btn:hover{transform:translateY(-2px)}
                .dgl-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

                .dgl-divider{display:flex;align-items:center;gap:10px;font-size:12px;color:#C4D4CE;margin:16px 0}
                .dgl-divider::before,.dgl-divider::after{content:'';flex:1;height:1px;background:#E8F0ED}

                .dgl-ghost{width:100%;height:48px;border-radius:12px;background:#fff;color:#334155;border:1.5px solid #E2E8F0;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all .2s;text-decoration:none}
                .dgl-ghost:hover{border-color:#0D9488;color:#0D9488;background:#F0F4F8}

                .dgl-switch-row{display:flex;justify-content:center;margin-top:20px}
                .dgl-switch{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:#64748B;text-decoration:none;padding:8px 16px;border:1.5px solid #E2E8F0;border-radius:100px;background:white;transition:all .22s}
                .dgl-switch:hover{color:#0D9488;border-color:#0D9488;background:#F0F4F8;transform:translateY(-1px)}

                .dgl-otp-input{width:100%;height:56px;background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:13px;padding:0 20px;font-family:'DM Serif Display',serif;font-size:26px;color:#0F172A;outline:none;transition:all .2s;letter-spacing:8px;text-align:center}
                .dgl-otp-input:focus{border-color:#0D9488;background:#fff;box-shadow:0 0 0 4px rgba(13,148,136,.1)}
                .dgl-otp-input::placeholder{color:#C4D4CE;letter-spacing:6px}
                .dgl-back-btn{width:100%;height:44px;border-radius:12px;background:#F8FAFC;color:#64748B;border:1.5px solid #E2E8F0;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:all .18s;margin-top:10px}
                .dgl-back-btn:hover{color:#334155;border-color:#64748B;background:#E8F0ED}

                .dgl-footer{position:relative;z-index:1;text-align:center;padding:20px 24px 36px;display:flex;flex-direction:column;align-items:center;gap:10px}
                .dgl-footer-text{font-size:11px;color:#64748B;letter-spacing:.3px}
                .dgl-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
                .dgl-badge-comp{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748B;border:1px solid #E2E8F0;padding:3px 10px;border-radius:100px}

                @keyframes dglFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes dglBlink{0%,100%{opacity:1}50%{opacity:.4}}
                @keyframes dglSpin{to{transform:rotate(360deg)}}

                @media(max-width:640px){
                    .dgl-topbar{padding:0 20px}
                    .dgl-card{padding:36px 24px;border-radius:20px}
                    .dgl-h2{font-size:30px}
                }
            `}</style>

            <div className="dgl-page">

                {/* Hex grid */}
                <svg className="dgl-hex" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dglHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#0D9488" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dglHex)"/>
                </svg>
                <span className="dgl-blob dgl-blob-1"/>
                <span className="dgl-blob dgl-blob-2"/>

                {/* Top bar */}
                <div className="dgl-topbar">
                    <Link href="/" className="dgl-logo">
                        <div className="dgl-logo-mark">
                            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
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

                {/* Main */}
                <div className="dgl-main">
                    <div className="dgl-card">
                        <div className="dgl-top-line"/>

                        <div className="dgl-role-badge" style={{ background: badgeBg, borderColor: badgeBord, color: badgeColor }}>
                            <span className="dgl-role-dot" style={{ background: badgeDot }}/>
                            {isAdmin ? 'ADMIN CONSOLE' : 'DOCTOR PORTAL'}
                        </div>

                        {otpStep ? (
                            <>
                                <h2 className="dgl-h2">Check your email.</h2>
                                <p className="dgl-sub">Code sent to <strong style={{color:'#0F172A'}}>{identifier}</strong></p>
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
                                    {pwError && <p style={{color:'#DC2626',fontSize:12,marginTop:5}}>{pwError}</p>}
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
