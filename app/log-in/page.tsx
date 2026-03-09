'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/api';
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const role = searchParams.get('role') || 'doctor';

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const isAdmin = role === 'admin';
    const accentColor  = isAdmin ? '#3B82F6' : '#0D9488';
    const accentLight  = isAdmin ? '#EFF6FF' : '#F0FDFA';
    const accentBorder = isAdmin ? '#BFDBFE' : '#99F6E4';
    const gradient     = isAdmin
        ? 'linear-gradient(135deg, #1E3A8A, #3B82F6)'
        : 'linear-gradient(135deg, #0D9488, #0891B2)';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await auth.login({ email, password });
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.doctor));
            router.push(isAdmin ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #F0F4F8;
          --surface: #FFFFFF;
          --text: #0F172A;
          --text2: #334155;
          --muted: #64748B;
          --border: #E2E8F0;
          --body: 'Plus Jakarta Sans', sans-serif;
          --display: 'DM Serif Display', serif;
        }

        body { background: var(--bg); font-family: var(--body); -webkit-font-smoothing: antialiased; }

        .lp-wrap {
          min-height: 100vh;
          position: relative;
          display: flex; flex-direction: column;
        }

        .lp-wrap::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.45;
          pointer-events: none; z-index: 0;
        }

        .lp-blob1 {
          position: fixed; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 65%);
          top: -250px; right: -200px; pointer-events: none; z-index: 0;
        }
        .lp-blob2 {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%);
          bottom: -150px; left: -100px; pointer-events: none; z-index: 0;
        }

        /* NAV */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .lp-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--body); font-weight: 800; font-size: 17px;
          text-decoration: none; color: var(--text); letter-spacing: -0.2px;
        }

        .lp-logo-mark {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(13,148,136,0.3);
        }

        .lp-back {
          display: inline-flex; align-items: center; gap: 7px;
          background: white; border: 1.5px solid var(--border);
          color: var(--muted); font-family: var(--body); font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 10px; cursor: pointer;
          text-decoration: none; transition: all 0.2s;
        }
        .lp-back:hover { color: #0D9488; border-color: #99F6E4; background: #F0FDFA; }

        /* MAIN — split layout */
        .lp-main {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding-top: 68px;
        }

        /* LEFT PANEL */
        .lp-left {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 64px;
          background: white;
          border-right: 1px solid var(--border);
        }

        .lp-left-inner { max-width: 360px; width: 100%; }

        .lp-role-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 6px 14px; border-radius: 100px; margin-bottom: 28px;
        }

        .lp-role-dot { width: 6px; height: 6px; border-radius: 50%; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .lp-h1 {
          font-family: var(--display); font-size: 38px; font-weight: 400;
          letter-spacing: -0.5px; color: var(--text); line-height: 1.15;
          margin-bottom: 12px;
        }

        .lp-sub {
          font-size: 14px; color: var(--muted); line-height: 1.65; margin-bottom: 40px;
        }

        /* Features list on left */
        .lp-features { display: flex; flex-direction: column; gap: 12px; }

        .lp-feature {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px 16px;
          border-radius: 12px; background: #F8FAFC;
          border: 1px solid var(--border);
          min-height: 70px;
        }

        .lp-feature-ic {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .lp-feature-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .lp-feature-sub   { font-size: 12px; color: var(--muted); line-height: 1.4; }

        /* RIGHT PANEL — form */
        .lp-right {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 64px;
          background: var(--bg);
        }

        .lp-form-box { max-width: 400px; width: 100%; }

        .lp-form-title {
          font-family: var(--display); font-size: 26px; font-weight: 400;
          color: var(--text); margin-bottom: 6px; letter-spacing: -0.3px;
        }

        .lp-form-sub { font-size: 13.5px; color: var(--muted); margin-bottom: 32px; }

        .lp-error {
          background: #FFF1F2; border: 1px solid #FECDD3; color: #E11D48;
          padding: 12px 16px; border-radius: 10px; font-size: 13px;
          margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
        }

        /* Input group */
        .lp-input-group { margin-bottom: 18px; }

        .lp-label {
          display: block; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase; color: var(--text2); margin-bottom: 7px;
        }

        .lp-input-wrap { position: relative; }

        .lp-input {
          width: 100%; height: 48px;
          background: white; border: 1.5px solid var(--border);
          border-radius: 12px; padding: 0 44px 0 44px;
          font-family: var(--body); font-size: 14px; color: var(--text);
          outline: none; transition: all 0.2s;
        }

        .lp-input::placeholder { color: #94A3B8; }

        .lp-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
        }

        .lp-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: #94A3B8; transition: color 0.2s;
        }

        .lp-input:focus ~ .lp-input-icon { color: var(--accent); }

        .lp-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94A3B8;
          padding: 0; display: flex; align-items: center;
          transition: color 0.2s;
        }
        .lp-eye:hover { color: var(--text2); }

        .lp-forgot {
          display: block; text-align: right; font-size: 12px; font-weight: 600;
          margin-top: 6px; text-decoration: none; transition: opacity 0.2s;
        }
        .lp-forgot:hover { opacity: 0.7; }

        .lp-submit {
          width: 100%; height: 50px; margin-top: 8px;
          border: none; border-radius: 12px; cursor: pointer;
          font-family: var(--body); font-size: 15px; font-weight: 700;
          color: white; letter-spacing: 0.2px;
          transition: all 0.22s; position: relative; overflow: hidden;
        }

        .lp-submit::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0.12); opacity: 0; transition: opacity 0.2s;
        }
        .lp-submit:hover::after { opacity: 1; }
        .lp-submit:hover { transform: translateY(-2px); }

        .lp-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .lp-signup-row {
          margin-top: 24px; text-align: center;
          font-size: 13.5px; color: var(--muted);
        }
        .lp-signup-row a { font-weight: 700; text-decoration: none; transition: opacity 0.2s; }
        .lp-signup-row a:hover { opacity: 0.75; }

        .lp-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0; color: var(--border);
          font-size: 12px; color: var(--muted);
        }
        .lp-divider::before, .lp-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .lp-animate { animation: fadeUp 0.5s ease both; }
        .lp-animate-2 { animation: fadeUp 0.5s 0.1s ease both; }

        @media (max-width: 900px) {
          .lp-main { grid-template-columns: 1fr; }
          .lp-left { display: none; }
          .lp-right { padding: 40px 24px; }
          .lp-nav { padding: 0 20px; }
        }
      `}</style>

            <div className="lp-wrap" style={{'--accent': accentColor}}>
                <div className="lp-blob1"/><div className="lp-blob2"/>

                {/* NAV */}
                <nav className="lp-nav">
                    <a href="/" className="lp-logo">
                        <div className="lp-logo-mark" style={{background: gradient}}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
                            </svg>
                        </div>
                        {'DIAGNO'}<span style={{color: accentColor}}>{'VATE'}</span>
                    </a>
                    <a href="/role" className="lp-back">
                        <ChevronLeft size={15}/> Back
                    </a>
                </nav>

                {/* SPLIT */}
                <div className="lp-main">

                    {/* LEFT — branding side */}
                    <div className="lp-left">
                        <div className="lp-left-inner lp-animate">
                            <div
                                className="lp-role-badge"
                                style={{background: accentLight, border:`1px solid ${accentBorder}`, color: accentColor}}
                            >
                                <span className="lp-role-dot" style={{background: accentColor}}/>
                                {isAdmin ? 'Administrator Access' : 'Doctor Access'}
                            </div>

                            <h1 className="lp-h1">
                                {isAdmin ? 'Manage the\nplatform.' : 'Diagnose\nsmarter.'}
                            </h1>
                            <p className="lp-sub">
                                {isAdmin
                                    ? 'Full control over doctor registrations, system activity, and platform settings.'
                                    : 'AI-powered thyroid diagnostics, patient management, and real-time image analysis.'}
                            </p>

                            <div className="lp-features">
                                {(isAdmin ? [
                                    {title:'Doctor Management', sub:'Approve and manage doctor accounts', emoji:'👤'},
                                    {title:'System Monitoring', sub:'Track activity and platform health', emoji:'📊'},
                                    {title:'Secure Access', sub:'Role-based permission system', emoji:'🔒'},
                                ] : [
                                    {title:'AI Diagnostics', sub:'Real-time thyroid nodule analysis', emoji:'🧠'},
                                    {title:'Image Enhancement', sub:'Crystal-clear ultrasound quality', emoji:'🔬'},
                                    {title:'Smart Reports', sub:'AI-assisted clinical documentation', emoji:'📋'},
                                ]).map((f, i) => (
                                    <div className="lp-feature" key={i}>
                                        <div
                                            className="lp-feature-ic"
                                            style={{background: accentLight, border:`1px solid ${accentBorder}`}}
                                        >
                                            <span style={{fontSize:16}}>{f.emoji}</span>
                                        </div>
                                        <div>
                                            <div className="lp-feature-title">{f.title}</div>
                                            <div className="lp-feature-sub">{f.sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — form */}
                    <div className="lp-right">
                        <div className="lp-form-box lp-animate-2">
                            <div className="lp-form-title">Sign in</div>
                            <div className="lp-form-sub">
                                {isAdmin ? 'Administrator portal' : 'Welcome back, Doctor'}
                            </div>

                            {error && (
                                <div className="lp-error">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E11D48" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#E11D48" strokeWidth="2" strokeLinecap="round"/></svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="lp-input-group">
                                    <label className="lp-label">Email Address</label>
                                    <div className="lp-input-wrap">
                                        <input
                                            type="email"
                                            className="lp-input"
                                            value={email}
                                            onChange={e => { setEmail(e.target.value); setError(''); }}
                                            placeholder="doctor@hospital.com"
                                            required
                                        />
                                        <span className="lp-input-icon"><Mail size={16}/></span>
                                    </div>
                                </div>

                                <div className="lp-input-group">
                                    <label className="lp-label">Password</label>
                                    <div className="lp-input-wrap">
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            className="lp-input"
                                            value={password}
                                            onChange={e => { setPassword(e.target.value); setError(''); }}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <span className="lp-input-icon"><Lock size={16}/></span>
                                        <button
                                            type="button"
                                            className="lp-eye"
                                            onClick={() => setShowPass(v => !v)}
                                        >
                                            {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                                        </button>
                                    </div>
                                    <a href="#" className="lp-forgot" style={{color: accentColor}}>
                                        Forgot password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    className="lp-submit"
                                    disabled={loading}
                                    style={{
                                        background: gradient,
                                        boxShadow: `0 6px 20px ${accentColor}35`,
                                    }}
                                >
                                    {loading ? 'Signing in…' : 'Sign In'}
                                </button>
                            </form>

                            {!isAdmin && (
                                <>
                                    <div className="lp-divider">or</div>
                                    <p className="lp-signup-row">
                                        Don't have an account?{' '}
                                        <a href="/sign-up" style={{color: accentColor}}>Create account</a>
                                    </p>
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
    return (
        <Suspense fallback={
            <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F0F4F8',fontFamily:'Plus Jakarta Sans,sans-serif',color:'#64748B',fontSize:14}}>
                Loading…
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}