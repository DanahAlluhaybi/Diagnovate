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
                .dgf-page{position:relative;z-index:1;min-height:100vh;background:#F0F7F4;display:flex;flex-direction:column;overflow:hidden}
                .dgf-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.035;pointer-events:none;z-index:0}
                .dgf-blob{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
                .dgf-blob-1{width:600px;height:600px;background:radial-gradient(circle,rgba(29,158,117,.06) 0%,transparent 65%);top:-200px;right:-150px}
                .dgf-blob-2{width:400px;height:400px;background:radial-gradient(circle,rgba(8,80,65,.04) 0%,transparent 65%);bottom:-120px;left:-100px}

                .dgf-topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:68px;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(29,158,117,.08);flex-shrink:0}
                .dgf-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
                .dgf-logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(29,158,117,.3);flex-shrink:0}
                .dgf-logo-word{font-family:'DM Serif Display',serif;font-size:20px;color:#0D1B17;letter-spacing:-.3px}
                .dgf-logo-word em{font-style:italic;color:#1D9E75}
                .dgf-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#2F4A40;text-decoration:none;padding:8px 16px;border:1.5px solid #D1E5DC;border-radius:10px;background:white;transition:all .18s}
                .dgf-back:hover{border-color:#1D9E75;color:#1D9E75;background:#F0F7F4}

                .dgf-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px 40px}

                .dgf-card{width:100%;max-width:420px;background:#fff;border:1px solid rgba(29,158,117,.12);border-radius:24px;padding:48px;box-shadow:0 20px 60px rgba(13,27,23,.08),0 4px 16px rgba(13,27,23,.04);animation:dgfFadeUp .45s ease both;text-align:center;position:relative;overflow:hidden}
                .dgf-top-line{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#1D9E75,#0D9488,#1D9E75,transparent);pointer-events:none}

                .dgf-icon-ring{width:68px;height:68px;border-radius:50%;background:#E1F5EE;border:1.5px solid rgba(29,158,117,.25);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;animation:dgfIconPulse 3s ease-in-out infinite}

                .dgf-label-sm{display:block;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;margin-bottom:12px}
                .dgf-h2{font-family:'DM Serif Display',serif;font-size:32px;letter-spacing:-.5px;color:#0D1B17;margin-bottom:10px;line-height:1.1}
                .dgf-sub{font-size:14px;color:#8A9E97;margin-bottom:28px;line-height:1.6;max-width:300px;margin-left:auto;margin-right:auto}
                .dgf-sub strong{color:#0D1B17;font-weight:700}

                .dgf-iw{position:relative;text-align:left}
                .dgf-iw-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8A9E97;pointer-events:none;display:flex;z-index:1}
                .dgf-input{width:100%;height:50px;background:#F4F9F7;border:1.5px solid #D1E5DC;border-radius:12px;padding:0 16px 0 42px;font-family:'DM Sans',sans-serif;font-size:14.5px;color:#0D1B17;outline:none;transition:all .2s;appearance:none}
                .dgf-input:focus{border-color:#1D9E75;background:#fff;box-shadow:0 0 0 4px rgba(29,158,117,.1)}
                .dgf-input::placeholder{color:#8A9E97}

                .dgf-btn{width:100%;height:52px;border:none;border-radius:13px;background:linear-gradient(135deg,#1D9E75,#0D9488);color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;transition:all .22s;margin-top:16px;box-shadow:0 6px 20px rgba(29,158,117,.28);position:relative;overflow:hidden}
                .dgf-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:skewX(-15deg);pointer-events:none}
                .dgf-btn:not(:disabled):hover::after{left:160%;transition:left .55s ease}
                .dgf-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(29,158,117,.35)}
                .dgf-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}

                .dgf-back-link{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#8A9E97;text-decoration:none;padding:10px 18px;border:1.5px solid #D1E5DC;border-radius:100px;background:white;transition:all .18s;margin-top:16px}
                .dgf-back-link:hover{color:#1D9E75;border-color:#1D9E75;background:#F0F7F4}

                .dgf-success-ring{width:80px;height:80px;border-radius:50%;background:#E1F5EE;border:2px solid rgba(29,158,117,.25);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;animation:dgfSuccessPop .5s cubic-bezier(.16,1,.3,1) both}

                .dgf-footer{position:relative;z-index:1;text-align:center;padding:20px 24px 36px;display:flex;flex-direction:column;align-items:center;gap:10px}
                .dgf-footer-text{font-size:11px;color:#8A9E97;letter-spacing:.3px}
                .dgf-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
                .dgf-badge-comp{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8A9E97;border:1px solid #D1E5DC;padding:3px 10px;border-radius:100px}

                @keyframes dgfFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes dgfIconPulse{0%,100%{box-shadow:0 0 0 0 rgba(29,158,117,.15)}50%{box-shadow:0 0 0 10px rgba(29,158,117,.04)}}
                @keyframes dgfSuccessPop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
                @keyframes dgfSpin{to{transform:rotate(360deg)}}

                @media(max-width:640px){
                    .dgf-topbar{padding:0 20px}
                    .dgf-card{padding:36px 24px;border-radius:20px}
                    .dgf-h2{font-size:27px}
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

                {/* Top bar */}
                <div className="dgf-topbar">
                    <Link href="/" className="dgf-logo">
                        <div className="dgf-logo-mark">
                            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
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
                        <div className="dgf-top-line"/>

                        {!sent ? (
                            <>
                                <div className="dgf-icon-ring">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        <circle cx="12" cy="16" r="1.2" fill="#1D9E75" stroke="none"/>
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

                                <div style={{display:'flex',justifyContent:'center'}}>
                                    <Link href="/log-in" className="dgf-back-link">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                                        Back to Sign In
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="dgf-success-ring">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
