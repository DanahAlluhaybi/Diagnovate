'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email,   setEmail]   = useState('');
    const [loading, setLoading] = useState(false);
    const [sent,    setSent]    = useState(false);

    const handleSend = () => {
        setLoading(true);
        // TODO: replace with real API call
        // await fetch('http://localhost:5000/api/auth/forgot-password', { method:'POST', body: JSON.stringify({ email }) })
        setTimeout(() => { setLoading(false); setSent(true); }, 1200);
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --teal: #0D9488; --teal-light: #F0FDFA; --teal-ring: #99F6E4;
          --bg: #F0F4F8; --surface2: #F8FAFC;
          --text: #0F172A; --text2: #334155; --muted: #64748B; --subtle: #94A3B8; --border: #E2E8F0;
          --grad: linear-gradient(135deg, #0D9488, #0891B2);
          --display: 'DM Serif Display', serif; --body: 'Plus Jakarta Sans', sans-serif;
        }
        body { background: var(--bg); color: var(--text); font-family: var(--body); -webkit-font-smoothing: antialiased; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
        body::before { content: ''; position: fixed; inset: 0; background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px); background-size: 28px 28px; opacity: .45; pointer-events: none; z-index: 0; }

        .blob1 { position: fixed; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(13,148,136,.1) 0%, transparent 65%); top: -200px; right: -150px; pointer-events: none; z-index: 0; }
        .blob2 { position: fixed; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(124,58,237,.07) 0%, transparent 65%); bottom: -100px; left: -80px; pointer-events: none; z-index: 0; }

        .card { position: relative; z-index: 1; background: white; border: 1px solid var(--border); border-radius: 28px; padding: 52px 48px; width: 100%; max-width: 440px; box-shadow: 0 24px 72px rgba(15,23,42,.12); text-align: center; overflow: hidden; }
        .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--grad); }

        .icon { width: 64px; height: 64px; border-radius: 18px; background: var(--teal-light); border: 1.5px solid var(--teal-ring); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .h2 { font-family: var(--display); font-size: 30px; letter-spacing: -.3px; margin-bottom: 8px; }
        .sub { font-size: 14px; color: var(--muted); line-height: 1.65; margin-bottom: 32px; }

        .field { text-align: left; margin-bottom: 20px; }
        .label { display: block; font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--text2); margin-bottom: 7px; }
        .input { width: 100%; height: 48px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: 12px; padding: 0 14px; font-family: var(--body); font-size: 14.5px; color: var(--text); outline: none; transition: all .2s; }
        .input::placeholder { color: var(--subtle); }
        .input:focus { border-color: var(--teal); background: white; box-shadow: 0 0 0 3px rgba(13,148,136,.12); }

        .submit { width: 100%; height: 50px; border: none; border-radius: 12px; background: var(--grad); color: white; font-family: var(--body); font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px; transition: all .22s; box-shadow: 0 6px 20px rgba(13,148,136,.3); }
        .submit:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(13,148,136,.4); }
        .submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        .back { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--muted); text-decoration: none; margin-top: 20px; padding: 8px 14px; border: 1px solid var(--border); border-radius: 9px; transition: all .15s; }
        .back:hover { color: var(--teal); border-color: var(--teal-ring); background: var(--teal-light); }

        .sent-icon { width: 64px; height: 64px; border-radius: 18px; background: var(--teal-light); border: 1.5px solid var(--teal-ring); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .back-full { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--muted); text-decoration: none; padding: 10px 16px; border: 1px solid var(--border); border-radius: 9px; transition: all .15s; width: 100%; }
        .back-full:hover { color: var(--teal); border-color: var(--teal-ring); background: var(--teal-light); }

        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) { .card { padding: 36px 20px; } }
      `}</style>

            <div className="blob1" /><div className="blob2" />

            <div className="card">
                {!sent ? (
                    <>
                        <div className="icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <h2 className="h2">Forgot password?</h2>
                        <p className="sub">Enter your email address and we'll send you a secure link to reset your password.</p>

                        <div className="field">
                            <label className="label">Email Address</label>
                            <input
                                type="email" className="input"
                                placeholder="you@hospital.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <button className="submit" disabled={!email || loading} onClick={handleSend}>
                            {loading
                                ? <><Loader2 size={17} style={{ animation: 'spin .75s linear infinite' }} />Sending...</>
                                : <>Send Reset Link <ArrowRight size={16} /></>
                            }
                        </button>

                        <br />
                        <Link href="/log-in?role=doctor" className="back">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                            Back to Sign In
                        </Link>
                    </>
                ) : (
                    <>
                        <div className="sent-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round">
                                <path d="M22 2L11 13"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                            </svg>
                        </div>
                        <h2 className="h2">Check your email.</h2>
                        <p className="sub">
                            We sent a reset link to <strong style={{ color: '#0F172A' }}>{email}</strong>.
                            Follow the link to create a new password.
                        </p>
                        <Link href="/log-in?role=doctor" className="back-full">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                            Back to Sign In
                        </Link>
                    </>
                )}
            </div>
        </>
    );
}