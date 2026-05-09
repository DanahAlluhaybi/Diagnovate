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
            console.log('Storing user:', user);
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
            console.log('Storing user:', user);
            if (user) localStorage.setItem(isAdmin ? 'admin_user' : 'user', JSON.stringify(user));
            router.push(isAdmin ? '/admin' : '/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const adminBtnGrad   = 'linear-gradient(135deg,#2563EB 0%,#1E40AF 50%,#1D4ED8 100%)';
    const doctorBtnGrad  = 'linear-gradient(135deg,#1D9E75 0%,#0D9488 50%,#0F6E56 100%)';
    const btnGrad        = isAdmin ? adminBtnGrad : doctorBtnGrad;
    const btnShadow      = isAdmin
        ? '0 1px 2px rgba(0,0,0,0.1), 0 4px 16px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.15)'
        : '0 1px 2px rgba(0,0,0,0.1), 0 4px 16px rgba(29,158,117,0.28), inset 0 1px 0 rgba(255,255,255,0.15)';
    const badgeColor     = isAdmin ? '#2563EB' : '#1D9E75';
    const badgeBg        = isAdmin ? 'rgba(37,99,235,0.06)'   : 'rgba(29,158,117,0.06)';
    const badgeBord      = isAdmin ? 'rgba(37,99,235,0.16)'   : 'rgba(29,158,117,0.16)';
    const badgeDot       = isAdmin ? '#3B82F6'                : '#1D9E75';

    return (
        <>
            <style>{`
                .li-page{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;overflow:hidden;
                    background:
                        radial-gradient(ellipse 80% 50% at 50% -5%, rgba(29,158,117,0.07) 0%, transparent 65%),
                        radial-gradient(ellipse 50% 40% at 85% 90%, rgba(13,148,136,0.05) 0%, transparent 55%),
                        #FFFFFF;}
                .li-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.025;pointer-events:none;z-index:0}

                .li-topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(255,255,255,.8);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(0,0,0,.06);flex-shrink:0}
                .li-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
                .li-logo-mark{width:44px;height:44px;border-radius:13px;background:linear-gradient(145deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(29,158,117,.35);flex-shrink:0}
                .li-logo-word{font-family:'DM Serif Display',serif;font-size:20px;color:#111827;letter-spacing:-.3px}
                .li-logo-word em{font-style:italic;color:#1D9E75}
                .li-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#374151;text-decoration:none;padding:8px 16px;border:1px solid rgba(0,0,0,.12);border-radius:10px;background:white;transition:all .18s}
                .li-back:hover{border-color:#1D9E75;color:#1D9E75;background:#F0FDF9}

                .li-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px 40px}

                .li-card{width:100%;max-width:460px;background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:20px;padding:48px;
                    box-shadow:0 1px 3px rgba(0,0,0,.08),0 8px 24px rgba(0,0,0,.06),0 0 80px rgba(29,158,117,.06);
                    animation:liFadeUp .45s ease both;position:relative;overflow:hidden}
                .li-top-line{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(29,158,117,.5),#1D9E75,rgba(29,158,117,.5),transparent);pointer-events:none}

                .li-role-badge{display:inline-flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.5px;padding:5px 12px;border-radius:100px;margin-bottom:14px;border:1px solid}
                .li-role-dot{width:5px;height:5px;border-radius:50%;animation:liBlink 2s ease-in-out infinite}
                .li-portal-lbl{display:block;font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#1D9E75;margin-bottom:10px}
                .li-h2{font-family:'DM Serif Display',serif;font-size:38px;letter-spacing:-.7px;color:#111827;margin-bottom:8px;line-height:1.05}
                .li-sub{font-size:14px;color:#6B7280;margin-bottom:28px;line-height:1.6}
                .li-sub a{color:#1D9E75;font-weight:700;text-decoration:none}
                .li-sub a:hover{text-decoration:underline}

                .li-fields{display:flex;flex-direction:column;gap:16px}
                .li-field{display:flex;flex-direction:column}
                .li-label{display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px}
                .li-iw{position:relative}
                .li-iw-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9CA3AF;pointer-events:none;display:flex;z-index:1}
                .li-input{width:100%;height:48px;background:#FAFAFA;border:1px solid rgba(0,0,0,.12);border-radius:10px;padding:0 44px 0 40px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:all .2s;appearance:none}
                .li-input:focus{border-color:#1D9E75;background:#fff;box-shadow:0 0 0 3px rgba(29,158,117,.12)}
                .li-input::placeholder{color:#9CA3AF}
                .li-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#9CA3AF;display:flex;padding:4px;transition:color .15s;z-index:2}
                .li-eye:hover{color:#374151}

                .li-forgot-row{display:flex;justify-content:flex-end;margin-top:6px}
                .li-forgot{font-size:12.5px;font-weight:600;color:#6B7280;text-decoration:none;transition:color .15s}
                .li-forgot:hover{color:#1D9E75}

                .li-alert{display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:0 8px 8px 0;background:#FFF5F5;border-left:3px solid #EF4444;color:#DC2626;font-size:13px;font-weight:500;margin-top:4px}

                .li-btn{width:100%;height:52px;border:none;border-radius:12px;color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;transition:all .22s;margin-top:8px;position:relative;overflow:hidden}
                .li-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);transform:skewX(-15deg);pointer-events:none}
                .li-btn:not(:disabled):hover::after{left:160%;transition:left .55s ease}
                .li-btn:hover{transform:translateY(-2px)}
                .li-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}

                .li-divider{display:flex;align-items:center;gap:10px;font-size:12px;color:#9CA3AF;margin:16px 0}
                .li-divider::before,.li-divider::after{content:'';flex:1;height:1px;background:rgba(0,0,0,.08)}

                .li-ghost{width:100%;height:48px;border-radius:10px;background:#fff;color:#374151;border:1px solid rgba(0,0,0,.12);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all .2s;text-decoration:none}
                .li-ghost:hover{border-color:#1D9E75;color:#1D9E75;background:#F0FDF9}

                .li-switch-row{display:flex;justify-content:center;margin-top:20px}
                .li-switch{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:#9CA3AF;text-decoration:none;padding:8px 16px;border:1px solid rgba(0,0,0,.1);border-radius:100px;background:white;transition:all .22s}
                .li-switch:hover{color:#1D9E75;border-color:rgba(29,158,117,.3);background:#F0FDF9;transform:translateY(-1px)}

                .li-footer{position:relative;z-index:1;text-align:center;padding:20px 24px 36px;display:flex;flex-direction:column;align-items:center;gap:10px}
                .li-footer-text{font-size:11px;color:#9CA3AF;letter-spacing:.3px}
                .li-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
                .li-badge-comp{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9CA3AF;border:1px solid rgba(0,0,0,.08);padding:3px 10px;border-radius:100px}

                @keyframes liFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes liBlink{0%,100%{opacity:1}50%{opacity:.4}}
                @keyframes liSpin{to{transform:rotate(360deg)}}

                @media(max-width:640px){
                    .li-topbar{padding:0 20px}
                    .li-card{padding:36px 24px;border-radius:16px}
                    .li-h2{font-size:30px}
                }
            `}</style>

            <div className="li-page">

                <svg className="li-hex" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="liHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#liHex)"/>
                </svg>

                <div className="li-topbar">
                    <Link href="/" className="li-logo">
                        <div className="li-logo-mark">
                            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="li-logo-word">Diagno<em>vate</em></span>
                    </Link>
                    <Link href="/role" className="li-back">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to Role Selection
                    </Link>
                </div>

                <div className="li-main">
                    <div className="li-card">
                        <div className="li-top-line"/>

                        <div className="li-role-badge" style={{ background: badgeBg, borderColor: badgeBord, color: badgeColor }}>
                            <span className="li-role-dot" style={{ background: badgeDot }}/>
                            {isAdmin ? 'Admin Console' : 'Doctor Portal'}
                        </div>

                        <span className="li-portal-lbl">Diagnovate Portal</span>

                        <h2 className="li-h2">Welcome back.</h2>
                        <p className="li-sub">
                            Sign in to your {isAdmin ? 'admin' : 'clinical'} workspace.
                            {!isAdmin && <>{' '}<Link href="/sign-up">New doctor?</Link></>}
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div className="li-fields">
                                <div className="li-field">
                                    <label className="li-label">Email address</label>
                                    <div className="li-iw">
                                        <span className="li-iw-icon">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                                        </span>
                                        <input
                                            className="li-input"
                                            type="email"
                                            placeholder={isAdmin ? 'admin@diagnovate.com' : 'doctor@hospital.com'}
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="li-field">
                                    <label className="li-label">Password</label>
                                    <div className="li-iw">
                                        <span className="li-iw-icon">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                        </span>
                                        <input
                                            className="li-input"
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
                                        <button type="button" className="li-eye" onClick={() => setShow(v => !v)}>
                                            {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {pwError && <p style={{color:'#DC2626',fontSize:12,marginTop:5}}>{pwError}</p>}
                            <div className="li-forgot-row">
                                <Link href="/forgot-password" className="li-forgot">Forgot password?</Link>
                            </div>
                            {error && (
                                <div className="li-alert" style={{marginTop:14}}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="li-btn"
                                disabled={loading}
                                style={{ background: btnGrad, boxShadow: btnShadow }}
                            >
                                {loading
                                    ? <><Loader2 size={17} style={{animation:'liSpin .75s linear infinite'}}/>Signing in...</>
                                    : <>Sign In <ArrowRight size={16}/></>
                                }
                            </button>
                        </form>

                        {!isAdmin && (
                            <>
                                <div className="li-divider">or</div>
                                <Link href="/sign-up" className="li-ghost">
                                    Create a new account <ArrowRight size={15}/>
                                </Link>
                            </>
                        )}

                        <div className="li-switch-row">
                            <Link href="/role" className="li-switch">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                                Switch workspace
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="li-footer">
                    <p className="li-footer-text">Protected by JWT authentication · Role-based access control</p>
                    <div className="li-badges">
                        {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t => (
                            <span key={t} className="li-badge-comp">{t}</span>
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
