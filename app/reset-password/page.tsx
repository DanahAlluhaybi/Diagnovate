'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

function ResetForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [pw,      setPw]      = useState('');
    const [confirm, setConfirm] = useState('');
    const [show,    setShow]    = useState(false);
    const [loading, setLoading] = useState(false);
    const [done,    setDone]    = useState(false);
    const [error,   setError]   = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pw !== confirm)  { setError('Passwords do not match.');              return; }
        if (pw.length < 8)   { setError('Password must be at least 8 characters.'); return; }
        setError(''); setLoading(true);
        // TODO: replace with real API call
        // await fetch('http://localhost:5000/api/auth/reset-password', { method:'POST', body: JSON.stringify({ token, password: pw }) })
        setTimeout(() => { setLoading(false); setDone(true); }, 1200);
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

        .card { position: relative; z-index: 1; background: white; border: 1px solid var(--border); border-radius: 28px; padding: 52px 48px; width: 100%; max-width: 440px; box-shadow: 0 24px 72px rgba(15,23,42,.12); overflow: hidden; }
        .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--grad); }

        .icon { width: 64px; height: 64px; border-radius: 18px; background: var(--teal-light); border: 1.5px solid var(--teal-ring); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .h2 { font-family: var(--display); font-size: 30px; letter-spacing: -.3px; margin-bottom: 8px; text-align: center; }
        .sub { font-size: 14px; color: var(--muted); line-height: 1.65; margin-bottom: 32px; text-align: center; }

        .field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px; }
        .label { font-size: 11px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--text2); }
        .pw-wrap { position: relative; }
        .input { width: 100%; height: 48px; background: var(--surface2); border: 1.5px solid var(--border); border-radius: 12px; padding: 0 14px; font-family: var(--body); font-size: 14.5px; color: var(--text); outline: none; transition: all .2s; }
        .input::placeholder { color: var(--subtle); }
        .input:focus { border-color: var(--teal); background: white; box-shadow: 0 0 0 3px rgba(13,148,136,.12); }
        .pw-wrap .input { padding-right: 44px; }
        .eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--subtle); display: flex; transition: color .15s; }
        .eye:hover { color: var(--text); }

        .err { display: flex; align-items: center; gap: 8px; padding: 11px 14px; background: #FFF1F2; border: 1px solid #FECDD3; border-radius: 10px; font-size: 13px; font-weight: 600; color: #EF4444; margin-bottom: 16px; }

        .submit { width: 100%; height: 50px; border: none; border-radius: 12px; background: var(--grad); color: white; font-family: var(--body); font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px; transition: all .22s; box-shadow: 0 6px 20px rgba(13,148,136,.3); }
        .submit:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(13,148,136,.4); }
        .submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        .success-wrap { text-align: center; }
        .success-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--teal-light); border: 2px solid var(--teal-ring); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        .btn-signin { display: inline-flex; align-items: center; gap: 8px; background: var(--grad); color: white; font-family: var(--body); font-weight: 700; font-size: 14.5px; padding: 12px 26px; border-radius: 12px; text-decoration: none; box-shadow: 0 6px 20px rgba(13,148,136,.3); transition: all .22s; }
        .btn-signin:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(13,148,136,.4); }

        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) { .card { padding: 36px 20px; } }
      `}</style>

            <div className="blob1" /><div className="blob2" />

            <div className="card">
                {!done ? (
                    <>
                        <div className="icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round">
                                <rect x="3" y="11" width="18" height="11" rx="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <h2 className="h2">Reset your password.</h2>
                        <p className="sub">Create a new secure password for your Diagnovate account.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="field">
                                <label className="label">New Password</label>
                                <div className="pw-wrap">
                                    <input
                                        type={show ? 'text' : 'password'}
                                        className="input"
                                        placeholder="Min. 8 characters"
                                        value={pw}
                                        onChange={e => setPw(e.target.value)}
                                        required
                                    />
                                    <button type="button" className="eye" onClick={() => setShow(s => !s)}>
                                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Confirm New Password</label>
                                <input
                                    type="password" className="input"
                                    placeholder="Repeat your new password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="err">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <button type="submit" className="submit" disabled={!pw || !confirm || loading}>
                                {loading
                                    ? <><Loader2 size={17} style={{ animation: 'spin .75s linear infinite' }} />Resetting...</>
                                    : <>Set New Password <ArrowRight size={16} /></>
                                }
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="success-wrap">
                        <div className="success-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 8 }}>Password updated!</p>
                        <p style={{ fontSize: 14, color: '#64748B', marginBottom: 28, lineHeight: 1.65 }}>
                            Your password has been changed. You can now sign in with your new credentials.
                        </p>
                        <Link href="/log-in?role=doctor" className="btn-signin">
                            Sign In Now <ArrowRight size={15} />
                        </Link>
                    </div>
                )}
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