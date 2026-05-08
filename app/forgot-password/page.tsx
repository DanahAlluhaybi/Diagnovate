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
                .dgf-page{position:relative;z-index:1;min-height:100vh;background:#0D1B17;display:flex;flex-direction:column;overflow:hidden}
                .dgf-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.05;pointer-events:none;z-index:0}
                .dgf-blob{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
                .dgf-blob-1{width:640px;height:640px;background:radial-gradient(circle,rgba(29,158,117,.15) 0%,transparent 65%);top:-220px;right:-160px;animation:dgfDrift 16s ease-in-out infinite alternate}
                .dgf-blob-2{width:500px;height:500px;background:radial-gradient(circle,rgba(8,80,65,.22) 0%,transparent 65%);bottom:-160px;left:-130px;animation:dgfDrift 20s ease-in-out infinite alternate-reverse}
                .dgf-dots{position:fixed;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px);background-size:28px 28px;pointer-events:none;z-index:0}

                .dgf-topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:28px 48px}
                .dgf-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
                .dgf-logo-mark{width:44px;height:44px;border-radius:13px;background:linear-gradient(145deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(29,158,117,0.4);flex-shrink:0;position:relative}
                .dgf-logo-mark::after{content:'';position:absolute;inset:-3px;border-radius:16px;border:1.5px solid rgba(29,158,117,.3);animation:dgfRingPulse 3.5s ease-in-out infinite}
                .dgf-logo-word{font-family:'DM Serif Display',serif;font-size:22px;color:white;letter-spacing:-.3px}
                .dgf-logo-word em{font-style:italic;color:#5DCAA5}
                .dgf-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:rgba(255,255,255,.45);text-decoration:none;padding:8px 16px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.05);transition:all .18s}
                .dgf-back:hover{color:rgba(255,255,255,.85);border-color:rgba(255,255,255,.25);background:rgba(255,255,255,.09)}

                .dgf-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 24px 32px}

                .dgf-card{width:100%;max-width:440px;background:rgba(255,255,255,.04);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:52px 44px;box-shadow:0 32px 80px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08);animation:dgfFadeUp .5s ease both;text-align:center}

                .dgf-icon-ring{width:68px;height:68px;border-radius:50%;background:rgba(29,158,117,.12);border:1.5px solid rgba(29,158,117,.25);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;position:relative;animation:dgfIconPulse 3s ease-in-out infinite}
                .dgf-icon-ring::before{content:'';position:absolute;inset:-9px;border-radius:50%;border:1px dashed rgba(29,158,117,.18);animation:dgfOrbit 14s linear infinite}

                .dgf-label-sm{display:block;font-size:10px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:#5DCAA5;margin-bottom:12px}
                .dgf-h2{font-family:'DM Serif Display',serif;font-size:36px;letter-spacing:-.6px;color:white;margin-bottom:10px;line-height:1.08}
                .dgf-sub{font-size:14px;color:rgba(255,255,255,.5);margin-bottom:28px;line-height:1.6;max-width:320px;margin-left:auto;margin-right:auto}
                .dgf-sub strong{color:rgba(255,255,255,.82);font-weight:700}

                .dgf-iw{position:relative;text-align:left}
                .dgf-iw-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.35);pointer-events:none;display:flex;z-index:1}
                .dgf-input{width:100%;height:50px;background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);border-radius:13px;padding:0 16px 0 42px;font-family:'DM Sans',sans-serif;font-size:14.5px;color:white;outline:none;transition:all .2s;appearance:none}
                .dgf-input:focus{border-color:rgba(29,158,117,.6);background:rgba(255,255,255,.09);box-shadow:0 0 0 3px rgba(29,158,117,.18)}
                .dgf-input::placeholder{color:rgba(255,255,255,.22)}

                .dgf-btn{width:100%;height:52px;border:none;border-radius:14px;background:linear-gradient(135deg,#1D9E75,#0D9488);color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;transition:all .22s;margin-top:16px;box-shadow:0 6px 20px rgba(29,158,117,0.4);position:relative;overflow:hidden}
                .dgf-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:skewX(-15deg);pointer-events:none}
                .dgf-btn:not(:disabled):hover::after{left:160%;transition:left .55s ease}
                .dgf-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(29,158,117,.5)}
                .dgf-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}

                .dgf-back-link{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:rgba(255,255,255,.38);text-decoration:none;padding:10px 18px;border:1px solid rgba(255,255,255,.1);border-radius:100px;background:rgba(255,255,255,.05);transition:all .18s;margin-top:16px}
                .dgf-back-link:hover{color:rgba(255,255,255,.75);border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.09)}

                .dgf-success-ring{width:80px;height:80px;border-radius:50%;background:rgba(29,158,117,.12);border:2px solid rgba(29,158,117,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;position:relative;animation:dgfSuccessPop .5s cubic-bezier(.16,1,.3,1) both}
                .dgf-success-ring::before{content:'';position:absolute;inset:-10px;border-radius:50%;border:1.5px dashed rgba(29,158,117,.2);animation:dgfOrbit 12s linear infinite}

                .dgf-footer{position:relative;z-index:1;text-align:center;padding:20px 24px 36px;display:flex;flex-direction:column;align-items:center;gap:10px}
                .dgf-footer-text{font-size:11px;color:rgba(255,255,255,.2);letter-spacing:.3px}
                .dgf-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
                .dgf-badge-comp{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.1);padding:3px 10px;border-radius:100px}

                @keyframes dgfDrift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(24px,16px) scale(1.06)}}
                @keyframes dgfRingPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.85;transform:scale(1.04)}}
                @keyframes dgfFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
                @keyframes dgfOrbit{to{transform:rotate(360deg)}}
                @keyframes dgfIconPulse{0%,100%{box-shadow:0 0 0 0 rgba(29,158,117,.2)}50%{box-shadow:0 0 0 10px rgba(29,158,117,.06)}}
                @keyframes dgfSuccessPop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
                @keyframes dgfSpin{to{transform:rotate(360deg)}}

                @media(max-width:640px){
                    .dgf-topbar{padding:20px 20px}
                    .dgf-card{padding:36px 24px;border-radius:22px}
                    .dgf-h2{font-size:30px}
                }
            `}</style>

            <div className="dgf-page">

                {/* Hex grid */}
                <svg className="dgf-hex" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dgfHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dgfHex)"/>
                </svg>
                <span className="dgf-blob dgf-blob-1"/>
                <span className="dgf-blob dgf-blob-2"/>
                <div className="dgf-dots"/>

                {/* Top bar */}
                <div className="dgf-topbar">
                    <Link href="/" className="dgf-logo">
                        <div className="dgf-logo-mark">
                            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="dgf-logo-word">Diagno<em>vate</em></span>
                    </Link>
                    <Link href="/log-in" className="dgf-back">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to Sign In
                    </Link>
                </div>

                {/* Card */}
                <div className="dgf-main">
                    <div className="dgf-card">

                        {!sent ? (
                            <>
                                <div className="dgf-icon-ring">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="1.8" strokeLinecap="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        <circle cx="12" cy="16" r="1.2" fill="#5DCAA5" stroke="none"/>
                                    </svg>
                                </div>
                                <span className="dgf-label-sm">Account Recovery</span>
                                <h2 className="dgf-h2">Forgot your password?</h2>
                                <p className="dgf-sub">Enter your email and we'll send a secure reset link.</p>

                                <div className="dgf-iw">
                                    <span className="dgf-iw-icon">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                                            <polyline points="2,4 12,13 22,4"/>
                                        </svg>
                                    </span>
                                    <input
                                        className="dgf-input"
                                        type="email"
                                        placeholder="you@hospital.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && email && !loading && handleSend()}
                                        autoFocus
                                    />
                                </div>

                                <button className="dgf-btn" disabled={!email || loading} onClick={handleSend}>
                                    {loading
                                        ? <><Loader2 size={17} style={{animation:'dgfSpin .75s linear infinite'}}/>Sending...</>
                                        : <>Send Reset Link <ArrowRight size={16}/></>
                                    }
                                </button>

                                <div style={{display:'flex',justifyContent:'center',marginTop:20}}>
                                    <Link href="/log-in" className="dgf-back-link">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                                        Back to Sign In
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="dgf-success-ring">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <span className="dgf-label-sm">Email Sent</span>
                                <h2 className="dgf-h2">Check your inbox.</h2>
                                <p className="dgf-sub">
                                    Reset link sent to <strong>{email}</strong>.<br/>
                                    Follow the link to create a new password.
                                </p>
                                <div style={{display:'flex',justifyContent:'center'}}>
                                    <Link href="/log-in" className="dgf-back-link">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                                        Back to Sign In
                                    </Link>
                                </div>
                            </>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <div className="dgf-footer">
                    <p className="dgf-footer-text">Protected by JWT authentication · Role-based access control</p>
                    <div className="dgf-badges">
                        {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t => (
                            <span key={t} className="dgf-badge-comp">{t}</span>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}
