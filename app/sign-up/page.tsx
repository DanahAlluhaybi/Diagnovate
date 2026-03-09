'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, User, Lock, Eye, EyeOff, Phone, CreditCard, Briefcase, ChevronLeft } from 'lucide-react';

const SignUpPage = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        phone: '', idNumber: '', specialty: '',
        password: '', confirmPassword: ''
    });

    const [showPass, setShowPass]    = useState(false);
    const [showConf, setShowConf]    = useState(false);
    const [error, setError]          = useState('');
    const [loading, setLoading]      = useState(false);
    const [step, setStep]            = useState(1); // 1 = personal, 2 = credentials

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    password: formData.password,
                    specialty: formData.specialty,
                    phone: formData.phone,
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.doctor));
                router.push('/dashboard');
            } else {
                setError(data.error || 'Sign up failed');
            }
        } catch {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const fields1 = [
        { name:'firstName',  label:'First Name',   type:'text',     icon:<User size={15}/>,      placeholder:'Sara' },
        { name:'lastName',   label:'Last Name',    type:'text',     icon:<User size={15}/>,      placeholder:'Al-Ghamdi' },
        { name:'email',      label:'Email Address',type:'email',    icon:<Mail size={15}/>,      placeholder:'doctor@hospital.com', full:true },
        { name:'phone',      label:'Phone Number', type:'tel',      icon:<Phone size={15}/>,     placeholder:'05XXXXXXXX' },
        { name:'idNumber',   label:'ID Number',    type:'text',     icon:<CreditCard size={15}/>,placeholder:'1XXXXXXXXX' },
        { name:'specialty',  label:'Job Title',    type:'text',     icon:<Briefcase size={15}/>, placeholder:'Endocrinologist', full:true },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #F0F4F8;
          --surface: #FFFFFF;
          --teal: #0D9488;
          --text: #0F172A;
          --text2: #334155;
          --muted: #64748B;
          --border: #E2E8F0;
          --body: 'Plus Jakarta Sans', sans-serif;
          --display: 'DM Serif Display', serif;
        }

        body { background: var(--bg); font-family: var(--body); -webkit-font-smoothing: antialiased; }

        .sp-wrap {
          min-height: 100vh; position: relative;
          background: var(--bg);
        }

        .sp-wrap::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.45; pointer-events: none; z-index: 0;
        }

        .sp-blob1 {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 65%);
          top: -200px; right: -150px; pointer-events: none; z-index: 0;
        }
        .sp-blob2 {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%);
          bottom: -150px; left: -100px; pointer-events: none; z-index: 0;
        }

        /* NAV */
        .sp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .sp-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--body); font-weight: 800; font-size: 17px;
          text-decoration: none; color: var(--text);
        }

        .sp-logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(13,148,136,0.3);
        }

        .sp-back {
          display: inline-flex; align-items: center; gap: 7px;
          background: white; border: 1.5px solid var(--border);
          color: var(--muted); font-family: var(--body); font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 10px; cursor: pointer;
          text-decoration: none; transition: all 0.2s;
        }
        .sp-back:hover { color: #0D9488; border-color: #99F6E4; background: #F0FDFA; }

        /* MAIN */
        .sp-main {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 88px 24px 60px;
        }

        .sp-card {
          background: white;
          border-radius: 28px;
          width: 100%; max-width: 780px;
          border: 1px solid var(--border);
          box-shadow: 0 8px 48px rgba(15,23,42,0.1);
          animation: fadeUp 0.5s ease both;
          overflow: hidden;
          position: relative;
        }

        /* Top accent */
        .sp-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #0D9488, #0891B2, #7C3AED);
        }

        /* Card header */
        .sp-card-head {
          padding: 40px 48px 28px;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 24px;
        }

        .sp-card-title-wrap {}

        .sp-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: #F0FDFA; border: 1px solid #99F6E4; color: #0D9488;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 5px 12px; border-radius: 100px; margin-bottom: 16px;
        }

        .sp-bdot { width:6px;height:6px;border-radius:50%;background:#0D9488; animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .sp-h1 {
          font-family: var(--display); font-size: 30px; font-weight: 400;
          letter-spacing: -0.3px; color: var(--text); line-height: 1.2; margin-bottom: 6px;
        }

        .sp-sub { font-size: 14px; color: var(--muted); line-height: 1.6; }

        /* Steps */
        .sp-steps {
          display: flex; align-items: center; gap: 8px; flex-shrink: 0;
        }

        .sp-step {
          display: flex; align-items: center; gap: 8px;
        }

        .sp-step-num {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; transition: all 0.3s;
        }

        .sp-step-label { font-size: 12px; font-weight: 600; }
        .sp-step-line { width: 32px; height: 1px; background: var(--border); }

        /* Form body */
        .sp-form-body { padding: 36px 48px 40px; }

        .sp-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 18px 24px;
          margin-bottom: 28px;
        }

        .sp-full { grid-column: 1 / -1; }

        .sp-input-group {}

        .sp-label {
          display: block; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase; color: var(--text2); margin-bottom: 7px;
        }

        .sp-input-wrap { position: relative; }

        .sp-input {
          width: 100%; height: 46px;
          background: #F8FAFC; border: 1.5px solid var(--border);
          border-radius: 11px; padding: 0 14px 0 42px;
          font-family: var(--body); font-size: 14px; color: var(--text);
          outline: none; transition: all 0.2s;
        }

        .sp-input::placeholder { color: #94A3B8; }

        .sp-input:focus {
          border-color: #0D9488; background: white;
          box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
        }

        .sp-input-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          pointer-events: none; color: #94A3B8; transition: color 0.2s;
        }

        .sp-input:focus ~ .sp-input-icon { color: #0D9488; }

        .sp-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #94A3B8;
          padding: 0; display: flex; align-items: center; transition: color 0.2s;
        }
        .sp-eye:hover { color: var(--text2); }

        /* Section label */
        .sp-section-label {
          font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
          color: #0D9488; margin-bottom: 18px;
          display: flex; align-items: center; gap: 10px;
        }
        .sp-section-label::after { content: ''; flex: 1; height: 1px; background: #E2F7F5; }

        /* Error */
        .sp-error {
          background: #FFF1F2; border: 1px solid #FECDD3; color: #E11D48;
          padding: 12px 16px; border-radius: 10px; font-size: 13px;
          margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
        }

        /* Footer row */
        .sp-footer-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px 48px;
          border-top: 1px solid var(--border);
          background: #F8FAFC;
        }

        .sp-login-text { font-size: 13.5px; color: var(--muted); }
        .sp-login-text a { font-weight: 700; color: #0D9488; text-decoration: none; }
        .sp-login-text a:hover { opacity: 0.75; }

        .sp-submit {
          display: inline-flex; align-items: center; gap: 8px;
          height: 46px; padding: 0 28px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          color: white; font-family: var(--body); font-size: 14px; font-weight: 700;
          border: none; border-radius: 12px; cursor: pointer;
          transition: all 0.22s;
          box-shadow: 0 6px 20px rgba(13,148,136,0.3);
        }

        .sp-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(13,148,136,0.4); }
        .sp-submit:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 700px) {
          .sp-nav { padding: 0 20px; }
          .sp-card-head { flex-direction: column; padding: 28px 24px 20px; }
          .sp-form-body { padding: 24px; }
          .sp-grid { grid-template-columns: 1fr; }
          .sp-full { grid-column: 1; }
          .sp-footer-row { flex-direction: column-reverse; gap: 16px; padding: 20px 24px; }
          .sp-submit { width: 100%; justify-content: center; }
        }
      `}</style>

            <div className="sp-wrap">
                <div className="sp-blob1"/><div className="sp-blob2"/>

                {/* NAV */}
                <nav className="sp-nav">
                    <a href="/" className="sp-logo">
                        <div className="sp-logo-mark">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
                            </svg>
                        </div>
                        {'DIAGNO'}<span style={{color:'#0D9488'}}>{'VATE'}</span>
                    </a>
                    <a href="/log-in" className="sp-back">
                        <ChevronLeft size={15}/> Back to Login
                    </a>
                </nav>

                <main className="sp-main">
                    <div className="sp-card">

                        {/* Header */}
                        <div className="sp-card-head">
                            <div className="sp-card-title-wrap">
                                <div className="sp-badge"><span className="sp-bdot"/>Doctor Registration</div>
                                <h1 className="sp-h1">Create your <em>account</em></h1>
                                <p className="sp-sub">Fill in your details to request access to the platform.</p>
                            </div>
                            {/* Steps indicator */}
                            <div className="sp-steps">
                                <div className="sp-step">
                                    <div className="sp-step-num" style={{background:'#F0FDFA', border:'1.5px solid #0D9488', color:'#0D9488'}}>1</div>
                                    <span className="sp-step-label" style={{color:'#0D9488'}}>Informations</span>
                                </div>
                                <div className="sp-step-line"/>
                                <div className="sp-step">
                                    <div className="sp-step-num" style={{background:'#F8FAFC', border:'1.5px solid #E2E8F0', color:'#94A3B8'}}>2</div>
                                    <span className="sp-step-label" style={{color:'#94A3B8'}}>Verification</span>
                                </div>
                            </div>
                        </div>

                        {/* Form body */}
                        <form onSubmit={handleSubmit}>
                            <div className="sp-form-body">

                                {error && (
                                    <div className="sp-error">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#E11D48" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#E11D48" strokeWidth="2" strokeLinecap="round"/></svg>
                                        {error}
                                    </div>
                                )}

                                {/* Personal info */}
                                <div className="sp-section-label">Personal Information</div>
                                <div className="sp-grid">
                                    {fields1.map(f => (
                                        <div key={f.name} className={`sp-input-group${f.full ? ' sp-full' : ''}`}>
                                            <label className="sp-label">{f.label}</label>
                                            <div className="sp-input-wrap">
                                                <input
                                                    type={f.type}
                                                    name={f.name}
                                                    className="sp-input"
                                                    value={formData[f.name]}
                                                    onChange={handleChange}
                                                    placeholder={f.placeholder}
                                                    required
                                                />
                                                <span className="sp-input-icon">{f.icon}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Security */}
                                <div className="sp-section-label">Security</div>
                                <div className="sp-grid">
                                    <div className="sp-input-group">
                                        <label className="sp-label">Password</label>
                                        <div className="sp-input-wrap">
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                name="password"
                                                className="sp-input"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Min. 6 characters"
                                                required
                                            />
                                            <span className="sp-input-icon"><Lock size={15}/></span>
                                            <button type="button" className="sp-eye" onClick={() => setShowPass(v => !v)}>
                                                {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="sp-input-group">
                                        <label className="sp-label">Confirm Password</label>
                                        <div className="sp-input-wrap">
                                            <input
                                                type={showConf ? 'text' : 'password'}
                                                name="confirmPassword"
                                                className="sp-input"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Re-enter password"
                                                required
                                            />
                                            <span className="sp-input-icon"><Lock size={15}/></span>
                                            <button type="button" className="sp-eye" onClick={() => setShowConf(v => !v)}>
                                                {showConf ? <EyeOff size={15}/> : <Eye size={15}/>}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Footer row */}
                            <div className="sp-footer-row">
                                <p className="sp-login-text">
                                    Already have an account? <Link href="/log-in">Sign in</Link>
                                </p>
                                <button type="submit" className="sp-submit" disabled={loading}>
                                    {loading ? 'Creating account…' : 'Create Account →'}
                                </button>
                            </div>
                        </form>

                    </div>
                </main>
            </div>
        </>
    );
};

export default SignUpPage;