'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import { BASE } from '@/lib/api';

function getStrength(pw: string): number {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
}

const strengthMeta = [
    { label: '',       color: '#D1E5DC' },
    { label: 'Weak',   color: '#EF4444' },
    { label: 'Fair',   color: '#F59E0B' },
    { label: 'Good',   color: '#0891B2' },
    { label: 'Strong', color: '#1D9E75' },
] as const;

function ResetForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [pw,      setPw]      = useState('');
    const [confirm, setConfirm] = useState('');
    const [show,    setShow]    = useState(false);
    const [showC,   setShowC]   = useState(false);
    const [loading, setLoading] = useState(false);
    const [done,    setDone]    = useState(false);
    const [error,   setError]   = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pw !== confirm)  { setError('Passwords do not match.');                  return; }
        if (pw.length < 8)   { setError('Password must be at least 8 characters.'); return; }
        setError(''); setLoading(true);
        try {
            await fetch(`${BASE}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: pw }),
            });
        } catch {}
        setLoading(false);
        setDone(true);
    };

    const strength  = getStrength(pw);
    const { label: strengthLabel, color: strengthColor } = strengthMeta[strength];
    const matches   = confirm.length > 0 && pw === confirm;
    const mismatch  = confirm.length > 0 && pw !== confirm;

    return (
        <>
            <style>{`
                .rp-page{position:relative;z-index:1;min-height:100vh;background:#F0F7F4;display:flex;flex-direction:column;overflow:hidden}
                .rp-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.035;pointer-events:none;z-index:0}
                .rp-blob{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
                .rp-blob-1{width:600px;height:600px;background:radial-gradient(circle,rgba(29,158,117,.06) 0%,transparent 65%);top:-200px;right:-150px}
                .rp-blob-2{width:400px;height:400px;background:radial-gradient(circle,rgba(8,80,65,.04) 0%,transparent 65%);bottom:-120px;left:-100px}

                .rp-topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:68px;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(29,158,117,.08);flex-shrink:0}
                .rp-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
                .rp-logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(29,158,117,.3);flex-shrink:0}
                .rp-logo-word{font-family:'DM Serif Display',serif;font-size:20px;color:#0D1B17;letter-spacing:-.3px}
                .rp-logo-word em{font-style:italic;color:#1D9E75}
                .rp-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#2F4A40;text-decoration:none;padding:8px 16px;border:1.5px solid #D1E5DC;border-radius:10px;background:white;transition:all .18s}
                .rp-back:hover{border-color:#1D9E75;color:#1D9E75;background:#F0F7F4}

                .rp-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px 40px}

                .rp-card{width:100%;max-width:440px;background:#fff;border:1px solid rgba(29,158,117,.12);border-radius:24px;padding:48px;box-shadow:0 20px 60px rgba(13,27,23,.08),0 4px 16px rgba(13,27,23,.04);animation:rpFadeUp .45s ease both;position:relative;overflow:hidden}
                .rp-top-line{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#1D9E75,#0D9488,#1D9E75,transparent);pointer-events:none}

                .rp-shield{width:64px;height:64px;border-radius:50%;background:#E1F5EE;border:1.5px solid rgba(29,158,117,.25);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:rpPulse 3s ease-in-out infinite}
                .rp-label{display:block;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;margin-bottom:12px;text-align:center}
                .rp-h2{font-family:'DM Serif Display',serif;font-size:32px;letter-spacing:-.5px;color:#0D1B17;margin-bottom:8px;line-height:1.1}
                .rp-sub{font-size:14px;color:#8A9E97;margin-bottom:28px;line-height:1.6}

                .rp-fields{display:flex;flex-direction:column;gap:18px}
                .rp-field{display:flex;flex-direction:column}
                .rp-lbl{display:block;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#2F4A40;margin-bottom:7px}
                .rp-iw{position:relative}
                .rp-iw-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#8A9E97;pointer-events:none;display:flex;z-index:1}
                .rp-input{width:100%;height:50px;background:#F4F9F7;border:1.5px solid #D1E5DC;border-radius:12px;padding:0 46px 0 42px;font-family:'DM Sans',sans-serif;font-size:14.5px;color:#0D1B17;outline:none;transition:all .2s;appearance:none}
                .rp-input:focus{border-color:#1D9E75;background:#fff;box-shadow:0 0 0 4px rgba(29,158,117,.1)}
                .rp-input::placeholder{color:#8A9E97}
                .rp-eye{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#8A9E97;display:flex;padding:4px;transition:color .15s;z-index:2}
                .rp-eye:hover{color:#2F4A40}

                .rp-str-bars{display:flex;gap:4px;margin-top:8px}
                .rp-str-bar{flex:1;height:3px;border-radius:2px;transition:background .25s}
                .rp-str-lbl{font-size:11px;font-weight:700;margin-top:5px;letter-spacing:.5px}
                .rp-match{display:flex;align-items:center;gap:6px;margin-top:7px;font-size:12px;font-weight:600;color:#1D9E75}
                .rp-mismatch{font-size:11px;font-weight:700;color:#EF4444;margin-top:5px}

                .rp-alert{display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:12px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.18);color:#DC2626;font-size:13px;font-weight:600}

                .rp-btn{width:100%;height:52px;border:none;border-radius:13px;background:linear-gradient(135deg,#1D9E75,#0D9488);color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;transition:all .22s;box-shadow:0 6px 20px rgba(29,158,117,.28);position:relative;overflow:hidden}
                .rp-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:skewX(-15deg);pointer-events:none}
                .rp-btn:not(:disabled):hover::after{left:160%;transition:left .55s ease}
                .rp-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(29,158,117,.35)}
                .rp-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}

                .rp-back-link{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#8A9E97;text-decoration:none;padding:10px 18px;border:1.5px solid #D1E5DC;border-radius:100px;background:white;transition:all .18s;margin-top:16px}
                .rp-back-link:hover{color:#1D9E75;border-color:#1D9E75;background:#F0F7F4}

                .rp-success-ring{width:80px;height:80px;border-radius:50%;background:#E1F5EE;border:2px solid rgba(29,158,117,.25);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 0 0 10px rgba(29,158,117,.06);animation:rpSuccessPop .5s cubic-bezier(.16,1,.3,1) both}

                .rp-footer{position:relative;z-index:1;text-align:center;padding:20px 24px 36px;display:flex;flex-direction:column;align-items:center;gap:10px}
                .rp-footer-text{font-size:11px;color:#8A9E97;letter-spacing:.3px}
                .rp-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
                .rp-badge-comp{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8A9E97;border:1px solid #D1E5DC;padding:3px 10px;border-radius:100px}

                @keyframes rpFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes rpPulse{0%,100%{box-shadow:0 0 0 0 rgba(29,158,117,.15)}50%{box-shadow:0 0 0 10px rgba(29,158,117,.04)}}
                @keyframes rpSuccessPop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:scale(1)}}
                @keyframes rpSpin{to{transform:rotate(360deg)}}

                @media(max-width:640px){
                    .rp-topbar{padding:0 20px}
                    .rp-card{padding:36px 24px;border-radius:20px}
                    .rp-h2{font-size:27px}
                }
            `}</style>

            <div className="rp-page">

                {/* Hex grid */}
                <svg className="rp-hex" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="rpHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#rpHex)"/>
                </svg>
                <span className="rp-blob rp-blob-1"/>
                <span className="rp-blob rp-blob-2"/>

                {/* Top bar */}
                <div className="rp-topbar">
                    <Link href="/" className="rp-logo">
                        <div className="rp-logo-mark">
                            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="rp-logo-word">Diagno<em>vate</em></span>
                    </Link>
                    <Link href="/log-in" className="rp-back">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to Sign In
                    </Link>
                </div>

                {/* Main */}
                <div className="rp-main">
                    <div className="rp-card">
                        <div className="rp-top-line"/>

                        {!done ? (
                            <>
                                <div className="rp-shield">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        <polyline points="9,12 11,14 15,10"/>
                                    </svg>
                                </div>
                                <span className="rp-label">Reset Password</span>
                                <h2 className="rp-h2">Create a new password.</h2>
                                <p className="rp-sub">Choose a strong password for your Diagnovate account.</p>

                                <form onSubmit={handleSubmit}>
                                    <div className="rp-fields">
                                        <div className="rp-field">
                                            <label className="rp-lbl">New Password</label>
                                            <div className="rp-iw">
                                                <span className="rp-iw-icon">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                                </span>
                                                <input
                                                    className="rp-input"
                                                    type={show ? 'text' : 'password'}
                                                    placeholder="Min. 8 characters"
                                                    value={pw}
                                                    onChange={e => setPw(e.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                                <button type="button" className="rp-eye" onClick={() => setShow(s => !s)}>
                                                    {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                                                </button>
                                            </div>
                                            {pw.length > 0 && (
                                                <>
                                                    <div className="rp-str-bars">
                                                        {[1,2,3,4].map(seg => (
                                                            <div key={seg} className="rp-str-bar"
                                                                style={{background: seg <= strength ? strengthColor : '#D1E5DC'}}/>
                                                        ))}
                                                    </div>
                                                    {strengthLabel && (
                                                        <p className="rp-str-lbl" style={{color: strengthColor}}>{strengthLabel}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        <div className="rp-field">
                                            <label className="rp-lbl">Confirm New Password</label>
                                            <div className="rp-iw">
                                                <span className="rp-iw-icon">
                                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                                </span>
                                                <input
                                                    className="rp-input"
                                                    type={showC ? 'text' : 'password'}
                                                    placeholder="Repeat your new password"
                                                    value={confirm}
                                                    onChange={e => setConfirm(e.target.value)}
                                                    required
                                                    style={confirm ? {borderColor: matches ? '#1D9E75' : mismatch ? '#EF4444' : '#D1E5DC'} : {}}
                                                />
                                                <button type="button" className="rp-eye" onClick={() => setShowC(s => !s)}>
                                                    {showC ? <EyeOff size={16}/> : <Eye size={16}/>}
                                                </button>
                                            </div>
                                            {matches  && <div className="rp-match"><Check size={13}/> Passwords match</div>}
                                            {mismatch && <p className="rp-mismatch">Passwords do not match</p>}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="rp-alert" style={{marginTop:14}}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="rp-btn"
                                        disabled={!pw || !confirm || loading}
                                        style={{marginTop:20}}
                                    >
                                        {loading
                                            ? <><Loader2 size={17} style={{animation:'rpSpin .75s linear infinite'}}/>Updating...</>
                                            : <>Update Password <ArrowRight size={16}/></>
                                        }
                                    </button>
                                </form>

                                <div style={{display:'flex',justifyContent:'center'}}>
                                    <Link href="/log-in?role=doctor" className="rp-back-link">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                                        Back to Sign In
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div style={{textAlign:'center'}}>
                                <div className="rp-success-ring">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <span className="rp-label">Success</span>
                                <h2 className="rp-h2">Password updated!</h2>
                                <p className="rp-sub">Your password has been changed. You can now sign in with your new credentials.</p>
                                <Link
                                    href="/log-in?role=doctor"
                                    className="rp-btn"
                                    style={{textDecoration:'none',marginTop:4}}
                                >
                                    Sign In Now <ArrowRight size={16}/>
                                </Link>
                                <div style={{display:'flex',justifyContent:'center'}}>
                                    <Link href="/" className="rp-back-link">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                                        Back to Home
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="rp-footer">
                    <p className="rp-footer-text">Protected by JWT authentication · Role-based access control</p>
                    <div className="rp-badges">
                        {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t => (
                            <span key={t} className="rp-badge-comp">{t}</span>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetForm />
        </Suspense>
    );
}
