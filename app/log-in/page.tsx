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

    return (
        <>
            <style>{`
                .li-page { display:grid; grid-template-columns:42% 58%; min-height:100vh; overflow:hidden; }

                /* LEFT */
                .li-left {
                    position:relative; overflow:hidden;
                    background:linear-gradient(145deg,#061210 0%,#0D1B17 45%,#071820 100%);
                    display:flex; flex-direction:column; padding:44px 48px;
                }
                .li-hex {
                    position:absolute; inset:0; width:100%; height:100%;
                    opacity:0.07; pointer-events:none;
                }
                .li-blob { position:absolute; border-radius:50%; pointer-events:none; }
                .li-blob-1 { width:500px;height:500px; background:radial-gradient(circle,rgba(29,158,117,.22) 0%,transparent 65%); top:-160px;right:-120px; animation:blobDrift 14s ease-in-out infinite alternate; }
                .li-blob-2 { width:380px;height:380px; background:radial-gradient(circle,rgba(8,80,65,.3) 0%,transparent 65%); bottom:-100px;left:-80px; animation:blobDrift 18s ease-in-out infinite alternate-reverse; }
                .li-blob-3 { width:220px;height:220px; background:radial-gradient(circle,rgba(29,158,117,.1) 0%,transparent 65%); top:45%;left:20%; animation:blobDrift 22s ease-in-out infinite alternate; }

                .li-logo { position:relative;z-index:2; display:flex;align-items:center;gap:13px; text-decoration:none; margin-bottom:56px; }
                .li-logo-mark { width:46px;height:46px;border-radius:14px; background:linear-gradient(145deg,#1D9E75,#0D9488); display:flex;align-items:center;justify-content:center; box-shadow:0 6px 22px rgba(29,158,117,.45); position:relative; }
                .li-logo-mark::after { content:''; position:absolute;inset:-3px;border-radius:17px; border:1.5px solid rgba(29,158,117,.35); animation:ringPulse 3.5s ease-in-out infinite; }
                .li-logo-word { font-family:'DM Serif Display',serif; font-size:23px; color:#fff; letter-spacing:-.3px; }
                .li-logo-word span { color:#5DCAA5; font-style:italic; }

                .li-body { position:relative;z-index:2; flex:1; display:flex;flex-direction:column;justify-content:center; }
                .li-badge { display:inline-flex;align-items:center;gap:8px; background:rgba(29,158,117,.13);border:1px solid rgba(29,158,117,.3); color:#5DCAA5;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase; padding:6px 15px;border-radius:100px;margin-bottom:26px;width:fit-content; }
                .li-badge-dot { width:6px;height:6px;border-radius:50%;background:#1D9E75;animation:dvBlink 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(29,158,117,.2); }
                .li-h1 { font-family:'DM Serif Display',serif; font-size:clamp(34px,3.2vw,50px); color:#fff;line-height:1.07;letter-spacing:-1px;margin-bottom:18px; }
                .li-h1 em { font-style:italic;color:#5DCAA5; }
                .li-sub { font-size:14.5px;color:rgba(255,255,255,.45);line-height:1.7;margin-bottom:36px;max-width:320px; }

                .li-stats { display:flex;flex-direction:column;gap:10px; }
                .li-stat { display:flex;align-items:center;gap:14px; background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07); border-radius:14px;padding:13px 16px;transition:all .25s;cursor:default; }
                .li-stat:hover { background:rgba(29,158,117,.09);border-color:rgba(29,158,117,.25);transform:translateX(4px); }
                .li-stat-icon { width:36px;height:36px;border-radius:10px; background:rgba(29,158,117,.18);border:1px solid rgba(29,158,117,.28); display:flex;align-items:center;justify-content:center;color:#5DCAA5;flex-shrink:0; }
                .li-stat-val { font-family:'DM Serif Display',serif;font-size:20px;color:#fff;letter-spacing:-.5px;line-height:1; }
                .li-stat-lbl { font-size:11.5px;color:rgba(255,255,255,.38);margin-top:2px; }

                .li-foot { position:relative;z-index:2;display:flex;flex-wrap:wrap;gap:7px;margin-top:40px; }
                .li-badge-comp { font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase; color:rgba(255,255,255,.32);border:1px solid rgba(255,255,255,.12); padding:4px 12px;border-radius:100px; }

                /* RIGHT */
                .li-right { background:#F4F9F7;display:flex;flex-direction:column;position:relative;overflow-y:auto; }
                .li-right::before { content:'';position:fixed;top:0;right:0;bottom:0;width:58%; background-image:radial-gradient(circle,#C5D6D0 1px,transparent 1px);background-size:28px 28px;opacity:.3;pointer-events:none;z-index:0; }
                .li-nav { position:relative;z-index:10;display:flex;align-items:center;justify-content:flex-end;gap:4px;padding:20px 44px; border-bottom:1px solid rgba(29,158,117,.08); }
                .li-nav a { font-size:13px;font-weight:500;color:#8A9E97;text-decoration:none;padding:7px 13px;border-radius:9px;transition:all .15s; }
                .li-nav a:hover { color:#0D1B17;background:rgba(255,255,255,.85); }

                .li-form-area { flex:1;display:flex;align-items:center;justify-content:center;padding:24px 52px 48px;position:relative;z-index:1; }
                .li-card { background:#fff;border-radius:22px;padding:48px;border:1px solid rgba(29,158,117,.1); box-shadow:0 8px 48px rgba(13,27,23,.08),0 2px 8px rgba(13,27,23,.04); width:100%;max-width:440px; animation:fadeUp .5s ease both; }

                .li-role-badge { display:inline-flex;align-items:center;gap:7px;font-size:10.5px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:5px 13px;border-radius:100px;margin-bottom:18px; }
                .li-role-dot { width:5px;height:5px;border-radius:50%;animation:dvBlink 2s ease-in-out infinite; }
                .li-portal-lbl { display:block;font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#1D9E75;margin-bottom:10px; }
                .li-card-h2 { font-family:'DM Serif Display',serif;font-size:38px;letter-spacing:-.5px;color:#0D1B17;margin-bottom:6px;line-height:1.05; }
                .li-card-sub { font-size:14px;color:#8A9E97;margin-bottom:28px;line-height:1.55; }
                .li-card-sub a { color:#1D9E75;font-weight:700;text-decoration:none; }
                .li-card-sub a:hover { text-decoration:underline; }

                .li-fields { display:flex;flex-direction:column;gap:16px; }
                .li-field { display:flex;flex-direction:column; }
                .li-label { display:block;font-size:11.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#2F4A40;margin-bottom:7px; }
                .li-iw { position:relative; }
                .li-iw-icon { position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8A9E97;pointer-events:none;display:flex;z-index:1; }
                .li-input { width:100%;height:50px;background:white;border:1.5px solid #D1E5DC;border-radius:13px;padding:0 44px 0 42px; font-family:'DM Sans',sans-serif;font-size:14.5px;color:#0D1B17;outline:none;transition:all .2s; box-shadow:0 1px 4px rgba(13,27,23,.04);appearance:none; }
                .li-input:focus { border-color:#1D9E75;box-shadow:0 0 0 4px rgba(29,158,117,.12),0 1px 4px rgba(13,27,23,.04); }
                .li-input::placeholder { color:#C5D6D0; }
                .li-eye { position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#8A9E97;display:flex;padding:4px;transition:color .15s;z-index:2; }
                .li-eye:hover { color:#1D9E75; }

                .li-forgot-row { display:flex;justify-content:flex-end;margin-top:6px; }
                .li-forgot { font-size:12.5px;font-weight:600;color:#8A9E97;text-decoration:none;transition:color .15s; }
                .li-forgot:hover { color:#1D9E75; }

                .li-alert { display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:12px;background:#FFF1F2;border:1px solid #FECDD3;color:#C92A2A;font-size:13px;font-weight:600;margin-top:4px; }

                .li-btn { width:100%;height:52px;border:none;border-radius:14px; background:linear-gradient(135deg,#1D9E75,#0D9488);color:#fff; font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700; display:flex;align-items:center;justify-content:center;gap:9px; cursor:pointer;transition:all .22s;box-shadow:0 6px 20px rgba(29,158,117,.3); margin-top:8px; position:relative;overflow:hidden; }
                .li-btn::after { content:'';position:absolute;top:0;left:-100%;width:55%;height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent); transform:skewX(-15deg);pointer-events:none; }
                .li-btn:not(:disabled):hover::after { left:160%;transition:left .55s ease; }
                .li-btn:hover { transform:translateY(-2px);box-shadow:0 10px 28px rgba(29,158,117,.4); }
                .li-btn:disabled { opacity:.55;cursor:not-allowed;transform:none; }

                .li-divider { display:flex;align-items:center;gap:10px;font-size:12px;color:#8A9E97;margin:16px 0; }
                .li-divider::before,.li-divider::after { content:'';flex:1;height:1px;background:#D1E5DC; }

                .li-ghost { width:100%;height:48px;border-radius:13px;background:#fff;color:#0D1B17; border:1.5px solid #D1E5DC;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600; display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all .2s;text-decoration:none; }
                .li-ghost:hover { border-color:rgba(29,158,117,.4);color:#1D9E75;background:#E1F5EE; }

                .li-switch-row { display:flex;justify-content:center;margin-top:18px; }
                .li-switch { display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:#8A9E97; text-decoration:none;padding:8px 16px;border:1.5px solid #D1E5DC;border-radius:100px; transition:all .22s;background:#fff; }
                .li-switch:hover { border-color:rgba(29,158,117,.35);background:#E1F5EE;color:#1D9E75;transform:translateY(-1px); }

                @keyframes blobDrift { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(20px,14px) scale(1.05)} }
                @keyframes ringPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.85;transform:scale(1.04)} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

                @media(max-width:960px){.li-page{grid-template-columns:1fr}.li-left{min-height:auto;padding:36px}.li-form-area{padding:24px 28px 44px}.li-right::before{width:100%}}
                @media(max-width:540px){.li-card{padding:32px 24px}.li-form-area{padding:16px 16px 40px}.li-nav{padding:14px 20px}}
            `}</style>

            <div className="li-page">

                {/* ══ LEFT PANEL ══ */}
                <div className="li-left">
                    <svg className="li-hex" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="hexLI" x="0" y="0" width="52" height="45" patternUnits="userSpaceOnUse">
                                <polygon points="26,2 48,13 48,35 26,46 4,35 4,13" fill="none" stroke="#5EEAD4" strokeWidth="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hexLI)"/>
                    </svg>
                    <span className="li-blob li-blob-1"/><span className="li-blob li-blob-2"/><span className="li-blob li-blob-3"/>

                    <Link href="/" className="li-logo">
                        <div className="li-logo-mark">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
                            </svg>
                        </div>
                        <span className="li-logo-word">Diagno<span>vate</span></span>
                    </Link>

                    <div className="li-body">
                        <div className="li-badge"><span className="li-badge-dot"/>AI Thyroid Diagnostics</div>
                        <h1 className="li-h1">The future of<br/><em>thyroid</em><br/>diagnostics.</h1>
                        <p className="li-sub">AI-powered platform combining image enhancement, diagnostic intelligence, and clinical workflows.</p>
                        <div className="li-stats">
                            {[
                                { icon: <Activity size={17}/>, val: '98.7%', lbl: 'Diagnostic Accuracy' },
                                { icon: <Zap size={17}/>,      val: '< 2s',  lbl: 'Real-Time Analysis'  },
                                { icon: <Shield size={17}/>,   val: 'HIPAA', lbl: 'Compliant & Secure'  },
                            ].map((s, i) => (
                                <div className="li-stat" key={i}>
                                    <div className="li-stat-icon">{s.icon}</div>
                                    <div>
                                        <div className="li-stat-val">{s.val}</div>
                                        <div className="li-stat-lbl">{s.lbl}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="li-foot">
                        {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t => (
                            <span key={t} className="li-badge-comp">{t}</span>
                        ))}
                    </div>
                </div>

                {/* ══ RIGHT PANEL ══ */}
                <div className="li-right">
                    <nav className="li-nav">
                        <Link href="/">Home</Link>
                        <Link href="/about">About</Link>
                        <Link href="/contact">Contact</Link>
                    </nav>

                    <div className="li-form-area">
                        <div className="li-card">

                            <div className="li-role-badge" style={{ background: roleBg, border: `1px solid ${roleRing}`, color: roleColor }}>
                                <span className="li-role-dot" style={{ background: roleColor }}/>
                                {isAdmin ? 'Admin Portal' : 'Doctor Portal'}
                            </div>

                            {otpStep ? (
                                <>
                                    <span className="li-portal-lbl">Diagnovate Portal</span>
                                    <h2 className="li-card-h2">Check your email.</h2>
                                    <p className="li-card-sub">We sent a verification code to <strong style={{color:'#0D1B17'}}>{identifier}</strong>.</p>
                                    <form onSubmit={handleVerifyOtp}>
                                        <div className="li-fields">
                                            <div className="li-field">
                                                <label className="li-label">Verification Code</label>
                                                <div className="li-iw">
                                                    <span className="li-iw-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                                                    <input className="li-input" type="text" placeholder="Enter 6-digit code" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required autoFocus/>
                                                </div>
                                            </div>
                                        </div>
                                        {error && <div className="li-alert" style={{marginTop:14}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                                        <button type="submit" className="li-btn" disabled={loading} style={{marginTop:20}}>
                                            {loading ? <><Loader2 size={17} style={{animation:'dvSpin .75s linear infinite'}}/>Verifying...</> : <>Verify & Sign In <ArrowRight size={16}/></>}
                                        </button>
                                    </form>
                                    <div className="li-switch-row" style={{marginTop:16}}>
                                        <button type="button" className="li-switch" onClick={() => { setOtpStep(false); setOtp(''); setError(''); }}>← Back to login</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="li-portal-lbl">Diagnovate Portal</span>
                                    <h2 className="li-card-h2">Welcome back.</h2>
                                    <p className="li-card-sub">Sign in to your clinical workspace.{' '}{!isAdmin && <Link href="/sign-up">New doctor?</Link>}</p>
                                    <form onSubmit={handleSubmit}>
                                        <div className="li-fields">
                                            <div className="li-field">
                                                <label className="li-label">Email Address</label>
                                                <div className="li-iw">
                                                    <span className="li-iw-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg></span>
                                                    <input className="li-input" type="email" placeholder="doctor@hospital.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus/>
                                                </div>
                                            </div>
                                            <div className="li-field">
                                                <label className="li-label">Password</label>
                                                <div className="li-iw">
                                                    <span className="li-iw-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                                                    <input className="li-input" type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setPwError(e.target.value.length > 0 && e.target.value.length < 8 ? 'Password must be at least 8 characters.' : ''); }} required minLength={8}/>
                                                    <button type="button" className="li-eye" onClick={() => setShow(v => !v)}>{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                                </div>
                                            </div>
                                        </div>
                                        {pwError && <p style={{color:'#dc2626',fontSize:12,marginTop:4}}>{pwError}</p>}
                                        <div className="li-forgot-row"><Link href="/forgot-password" className="li-forgot">Forgot password?</Link></div>
                                        {error && <div className="li-alert" style={{marginTop:14}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
                                        <button type="submit" className="li-btn" disabled={loading}>
                                            {loading ? <><Loader2 size={17} style={{animation:'dvSpin .75s linear infinite'}}/>Signing in...</> : <>Sign In <ArrowRight size={16}/></>}
                                        </button>
                                    </form>
                                    {!isAdmin && (<><div className="li-divider">or</div><Link href="/sign-up" className="li-ghost">Create a new doctor account <ArrowRight size={15}/></Link></>)}
                                    <div className="li-switch-row">
                                        <Link href={isAdmin ? '/log-in?role=doctor' : '/log-in?role=admin'} className="li-switch">
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