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
        <>
            <style>{`
                .fp-page{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;overflow:hidden;
                    background:
                        radial-gradient(ellipse 80% 50% at 50% -5%, rgba(29,158,117,0.07) 0%, transparent 65%),
                        radial-gradient(ellipse 50% 40% at 85% 90%, rgba(13,148,136,0.05) 0%, transparent 55%),
                        #FFFFFF;}
                .fp-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.025;pointer-events:none;z-index:0}

                .fp-topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(255,255,255,.8);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(0,0,0,.06);flex-shrink:0}
                .fp-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
                .fp-logo-mark{width:44px;height:44px;border-radius:13px;background:linear-gradient(145deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(29,158,117,.35);flex-shrink:0}
                .fp-logo-word{font-family:'DM Serif Display',serif;font-size:20px;color:#111827;letter-spacing:-.3px}
                .fp-logo-word em{font-style:italic;color:#1D9E75}
                .fp-nav-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#374151;text-decoration:none;padding:8px 16px;border:1px solid rgba(0,0,0,.12);border-radius:10px;background:white;transition:all .18s}
                .fp-nav-back:hover{border-color:#1D9E75;color:#1D9E75;background:#F0FDF9}

                .fp-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px 40px}

                .fp-card{width:100%;max-width:420px;background:#fff;border:1px solid rgba(0,0,0,.06);border-radius:20px;padding:48px;
                    box-shadow:0 1px 3px rgba(0,0,0,.08),0 8px 24px rgba(0,0,0,.06),0 0 80px rgba(29,158,117,.06);
                    animation:fpFadeUp .45s ease both;text-align:center;position:relative;overflow:hidden}
                .fp-top-line{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(29,158,117,.5),#1D9E75,rgba(29,158,117,.5),transparent);pointer-events:none}

                .fp-icon-ring{width:68px;height:68px;border-radius:50%;background:#F0FDF9;border:1.5px solid rgba(29,158,117,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;animation:fpIconPulse 3s ease-in-out infinite}

                .fp-label-sm{display:block;font-size:11px;font-weight:700;letter-spacing:.5px;color:#1D9E75;margin-bottom:12px}
                .fp-h2{font-family:'DM Serif Display',serif;font-size:32px;letter-spacing:-.5px;color:#111827;margin-bottom:10px;line-height:1.1}
                .fp-sub{font-size:14px;color:#6B7280;margin-bottom:28px;line-height:1.6;max-width:300px;margin-left:auto;margin-right:auto}
                .fp-sub strong{color:#111827;font-weight:700}

                .fp-iw{position:relative;text-align:left}
                .fp-iw-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#9CA3AF;pointer-events:none;display:flex;z-index:1}
                .fp-input{width:100%;height:48px;background:#FAFAFA;border:1px solid rgba(0,0,0,.12);border-radius:10px;padding:0 16px 0 40px;font-family:'DM Sans',sans-serif;font-size:14px;color:#111827;outline:none;transition:all .2s;appearance:none}
                .fp-input:focus{border-color:#1D9E75;background:#fff;box-shadow:0 0 0 3px rgba(29,158,117,.12)}
                .fp-input::placeholder{color:#9CA3AF}

                .fp-btn{width:100%;height:52px;border:none;border-radius:12px;background:linear-gradient(135deg,#1D9E75 0%,#0D9488 50%,#0F6E56 100%);color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;transition:all .22s;margin-top:16px;
                    box-shadow:0 1px 2px rgba(0,0,0,.1),0 4px 16px rgba(29,158,117,.28),inset 0 1px 0 rgba(255,255,255,.15);
                    position:relative;overflow:hidden}
                .fp-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);transform:skewX(-15deg);pointer-events:none}
                .fp-btn:not(:disabled):hover::after{left:160%;transition:left .55s ease}
                .fp-btn:hover{transform:translateY(-2px);box-shadow:0 1px 2px rgba(0,0,0,.1),0 10px 28px rgba(29,158,117,.36),inset 0 1px 0 rgba(255,255,255,.15)}
                .fp-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}

                .fp-back-link{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#6B7280;text-decoration:none;padding:10px 18px;border:1px solid rgba(0,0,0,.1);border-radius:100px;background:white;transition:all .18s;margin-top:16px}
                .fp-back-link:hover{color:#1D9E75;border-color:rgba(29,158,117,.3);background:#F0FDF9}

                .fp-success-ring{width:80px;height:80px;border-radius:50%;background:#F0FDF9;border:2px solid rgba(29,158,117,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;animation:fpSuccessPop .5s cubic-bezier(.16,1,.3,1) both}

                .fp-footer{position:relative;z-index:1;text-align:center;padding:20px 24px 36px;display:flex;flex-direction:column;align-items:center;gap:10px}
                .fp-footer-text{font-size:11px;color:#9CA3AF;letter-spacing:.3px}
                .fp-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
                .fp-badge-comp{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#9CA3AF;border:1px solid rgba(0,0,0,.08);padding:3px 10px;border-radius:100px}

                @keyframes fpFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes fpIconPulse{0%,100%{box-shadow:0 0 0 0 rgba(29,158,117,.12)}50%{box-shadow:0 0 0 10px rgba(29,158,117,.04)}}
                @keyframes fpSuccessPop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
                @keyframes fpSpin{to{transform:rotate(360deg)}}

                @media(max-width:640px){
                    .fp-topbar{padding:0 20px}
                    .fp-card{padding:36px 24px;border-radius:16px}
                    .fp-h2{font-size:27px}
                }
            `}</style>

            <div className="fp-page">

                <svg className="fp-hex" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="fpHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#fpHex)"/>
                </svg>

                <div className="fp-topbar">
                    <Link href="/" className="fp-logo">
                        <div className="fp-logo-mark">
                            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="fp-logo-word">Diagno<em>vate</em></span>
                    </Link>
                    <Link href="/log-in" className="fp-nav-back">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to Sign In
                    </Link>
                </div>

                <div className="fp-main">
                    <div className="fp-card">
                        <div className="fp-top-line"/>

                        {!sent ? (
                            <>
                                <div className="fp-icon-ring">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        <circle cx="12" cy="16" r="1.2" fill="#1D9E75" stroke="none"/>
                                    </svg>
                                </div>
                                <span className="fp-label-sm">Account Recovery</span>
                                <h2 className="fp-h2">Forgot your password?</h2>
                                <p className="fp-sub">Enter your email and we'll send a secure reset link.</p>

                                <div className="fp-iw">
                                    <span className="fp-iw-icon">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                                            <polyline points="2,4 12,13 22,4"/>
                                        </svg>
                                    </span>
                                    <input
                                        className="fp-input"
                                        type="email"
                                        placeholder="you@hospital.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && email && !loading && handleSend()}
                                        autoFocus
                                    />
                                </div>

                                <button className="fp-btn" disabled={!email || loading} onClick={handleSend}>
                                    {loading
                                        ? <><Loader2 size={17} style={{animation:'fpSpin .75s linear infinite'}}/>Sending...</>
                                        : <>Send Reset Link <ArrowRight size={16}/></>
                                    }
                                </button>

                                <div style={{display:'flex',justifyContent:'center'}}>
                                    <Link href="/log-in" className="fp-back-link">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                                        Back to Sign In
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="fp-success-ring">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <span className="fp-label-sm">Email Sent</span>
                                <h2 className="fp-h2">Check your inbox.</h2>
                                <p className="fp-sub">
                                    Reset link sent to <strong>{email}</strong>.<br/>
                                    Follow the link to create a new password.
                                </p>
                                <div style={{display:'flex',justifyContent:'center'}}>
                                    <Link href="/log-in" className="fp-back-link">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                                        Back to Sign In
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="fp-footer">
                    <p className="fp-footer-text">Protected by JWT authentication · Role-based access control</p>
                    <div className="fp-badges">
                        {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t => (
                            <span key={t} className="fp-badge-comp">{t}</span>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}
