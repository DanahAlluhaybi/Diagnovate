'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, Check } from 'lucide-react';
import { auth } from '@/lib/api';

const SPECIALTIES = ['Pathology', 'Radiology', 'Endocrinology', 'Surgery', 'Oncology', 'General Practice'];
const STEP_LABELS  = ['Personal Info', 'Account Setup', 'Verify'];

export default function SignUpPage() {
    const router = useRouter();
    const [step,    setStep]    = useState(0);
    const [showPw,  setShowPw]  = useState(false);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState<'sms' | 'email' | null>(null);
    const [error,   setError]   = useState('');
    const [signupPhone, setSignupPhone] = useState('');
    const [signupEmail, setSignupEmail] = useState('');

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '', idNumber: '',
        specialty: '', password: '', confirm: '',
    });

    const set = (k: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setError('');
            setForm(f => ({ ...f, [k]: e.target.value }));
        };

    const goNext = () => {
        const nameValid = /^[a-zA-Z؀-ۿ\s]+$/.test(form.firstName) &&
            /^[a-zA-Z؀-ۿ\s]+$/.test(form.lastName);
        if (!nameValid) { setError('First and last name must contain letters only, no numbers allowed.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email address.'); return; }
        if (!/^05\d{8}$/.test(form.phone)) { setError('Phone number must start with 05 and be 10 digits.'); return; }
        const idValid = /^[12]\d{9}$/.test(form.idNumber);
        if (!idValid) {
            setError(form.idNumber.length !== 10 ? 'ID number must be 10 digits.' : 'ID number must start with 1 or 2.');
            return;
        }
        setError(''); setStep(1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.specialty)                { setError('Please select your specialty.'); return; }
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        if (form.password.length < 8)       { setError('Password must be at least 8 characters.'); return; }

        setError(''); setLoading(true);
        try {
            const raw = await auth.signup({
                name:           `${form.firstName} ${form.lastName}`.trim(),
                email:          form.email,
                password:       form.password,
                specialty:      form.specialty,
                phone:          form.phone,
                license_number: form.idNumber,
            });

            if (raw?.next_step === 'choose_verification') {
                setSignupPhone(raw?.phone ?? form.phone);
                setSignupEmail(raw?.email ?? form.email);
                setStep(2);
            } else {
                localStorage.setItem('userEmail', form.email);
                router.push('/email-verification');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const handleChoose = async (method: 'sms' | 'email') => {
        setError(''); setSending(method);
        const identifier = method === 'sms' ? signupPhone : signupEmail;
        try {
            await auth.sendOtp(identifier, method);
            if (method === 'sms') {
                router.push(`/phone-verification?identifier=${encodeURIComponent(identifier)}`);
            } else {
                router.push(`/email-verification?identifier=${encodeURIComponent(identifier)}`);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to send code. Please try again.');
            setSending(null);
        }
    };

    const pw    = form.password;
    const pwStr = !pw ? 0 : pw.length < 6 ? 1 : pw.length < 8 ? 2 : /[^a-zA-Z0-9]/.test(pw) ? 4 : 3;
    const pwMeta = [null,
        { c: '#EF4444', l: 'Weak'   },
        { c: '#F59E0B', l: 'Fair'   },
        { c: '#0891B2', l: 'Good'   },
        { c: '#0D9488', l: 'Strong' },
    ];

    return (
        <>
            <style>{`
                .su-page{position:relative;z-index:1;min-height:100vh;background:#0D1B17;display:flex;flex-direction:column;overflow-x:hidden}
                .su-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.05;pointer-events:none;z-index:0}
                .su-blob{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
                .su-blob-1{width:640px;height:640px;background:radial-gradient(circle,rgba(29,158,117,.15) 0%,transparent 65%);top:-220px;right:-160px;animation:suDrift 16s ease-in-out infinite alternate}
                .su-blob-2{width:500px;height:500px;background:radial-gradient(circle,rgba(8,80,65,.22) 0%,transparent 65%);bottom:-160px;left:-130px;animation:suDrift 20s ease-in-out infinite alternate-reverse}
                .su-dots{position:fixed;inset:0;background-image:radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px);background-size:28px 28px;pointer-events:none;z-index:0}

                .su-topbar{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:28px 48px;flex-shrink:0}
                .su-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
                .su-logo-mark{width:44px;height:44px;border-radius:13px;background:linear-gradient(145deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(29,158,117,.4);flex-shrink:0;position:relative}
                .su-logo-mark::after{content:'';position:absolute;inset:-3px;border-radius:16px;border:1.5px solid rgba(29,158,117,.3);animation:suRingPulse 3.5s ease-in-out infinite}
                .su-logo-word{font-family:'DM Serif Display',serif;font-size:22px;color:white;letter-spacing:-.3px}
                .su-logo-word em{font-style:italic;color:#5DCAA5}
                .su-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:rgba(255,255,255,.45);text-decoration:none;padding:8px 16px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.05);transition:all .18s}
                .su-back:hover{color:rgba(255,255,255,.85);border-color:rgba(255,255,255,.25);background:rgba(255,255,255,.09)}

                .su-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 24px 40px}

                .su-card-wrap{position:relative;width:100%;max-width:520px;display:flex;align-items:center;justify-content:center}
                .su-card-glow{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(29,158,117,.08) 0%,transparent 65%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:0}
                .su-hex-float{position:absolute;pointer-events:none;opacity:.15;z-index:0}
                .su-hex-f1{top:-44px;left:4px;animation:suFloat 7s ease-in-out infinite}
                .su-hex-f2{top:-20px;right:0;animation:suFloat 9s ease-in-out infinite;animation-delay:-3s}
                .su-hex-f3{bottom:-30px;left:8px;animation:suFloat 8.5s ease-in-out infinite;animation-delay:-1.5s}
                .su-hex-f4{bottom:20px;right:4px;animation:suFloat 11s ease-in-out infinite;animation-delay:-5s}

                .su-card{position:relative;z-index:1;width:100%;background:rgba(255,255,255,.04);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.1);border-radius:28px;padding:40px 44px 48px;box-shadow:0 32px 80px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08);animation:suFadeUp .5s ease both;overflow:hidden}
                .su-top-line{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,#1D9E75,#0D9488,#1D9E75,transparent);pointer-events:none;z-index:2}
                .su-scan-line{position:absolute;left:0;right:0;height:40%;background:linear-gradient(to bottom,transparent,rgba(29,158,117,.03),transparent);pointer-events:none;z-index:0;animation:suScanMove 12s ease-in-out infinite}
                .su-card-body{position:relative;z-index:1}

                .su-steps{display:flex;align-items:center;justify-content:center;margin-bottom:32px}
                .su-step{display:flex;align-items:center}
                .su-step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif;flex-shrink:0;transition:all .3s}
                .su-step-dot--done{background:#1D9E75;color:white;box-shadow:0 0 0 3px rgba(29,158,117,.2)}
                .su-step-dot--curr{background:rgba(29,158,117,.15);color:#5DCAA5;border:1.5px solid rgba(29,158,117,.5);box-shadow:0 0 0 3px rgba(29,158,117,.1)}
                .su-step-dot--idle{background:rgba(255,255,255,.07);color:rgba(255,255,255,.3);border:1px solid rgba(255,255,255,.12)}
                .su-step-lbl{font-size:11px;font-weight:600;font-family:'DM Sans',sans-serif;margin:0 8px;white-space:nowrap;transition:color .3s}
                .su-step-lbl--done{color:#5DCAA5}
                .su-step-lbl--curr{color:white}
                .su-step-lbl--idle{color:rgba(255,255,255,.25)}
                .su-step-line{width:36px;height:1.5px;flex-shrink:0;transition:background .3s}
                .su-step-line--done{background:rgba(29,158,117,.6)}
                .su-step-line--idle{background:rgba(255,255,255,.1)}

                .su-chip{display:inline-flex;align-items:center;gap:6px;background:rgba(29,158,117,.1);border:1px solid rgba(29,158,117,.25);color:#5DCAA5;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:14px}
                .su-chip-dot{width:6px;height:6px;border-radius:50%;background:#5DCAA5;animation:suBlink 2s ease-in-out infinite}
                .su-h2{font-family:'DM Serif Display',serif;font-size:30px;letter-spacing:-.5px;color:white;margin-bottom:6px;line-height:1.1}
                .su-sub{font-size:13.5px;color:rgba(255,255,255,.45);margin-bottom:26px;line-height:1.6}
                .su-sub a{color:#5DCAA5;text-decoration:none;font-weight:600}
                .su-sub a:hover{color:#1D9E75}

                .su-label{display:block;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:7px;font-family:'DM Sans',sans-serif}
                .su-iw{position:relative}
                .su-iw-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.3);pointer-events:none;display:flex;z-index:1}
                .su-input{width:100%;height:50px;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);border-radius:13px;padding:0 16px 0 42px;font-family:'DM Sans',sans-serif;font-size:14.5px;color:white;outline:none;transition:all .2s;appearance:none;-webkit-appearance:none}
                .su-input:focus{border-color:rgba(29,158,117,.6);background:rgba(255,255,255,.09);box-shadow:0 0 0 3px rgba(29,158,117,.18)}
                .su-input::placeholder{color:rgba(255,255,255,.22)}
                .su-input option{background:#0D1B17;color:white}
                .su-eye{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);display:flex;padding:4px;transition:color .18s;z-index:1}
                .su-eye:hover{color:rgba(255,255,255,.7)}

                .su-g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
                .su-field{display:flex;flex-direction:column}
                .su-fields{display:flex;flex-direction:column;gap:18px}

                .su-pw-str{display:flex;align-items:center;gap:8px;margin-top:8px}
                .su-pw-bars{display:flex;gap:4px;flex:1}
                .su-pw-bar{flex:1;height:3px;border-radius:2px;transition:background .3s}
                .su-pw-lbl{font-size:11px;font-weight:700;font-family:'DM Sans',sans-serif;min-width:36px}
                .su-pw-match{display:flex;align-items:center;gap:6px;margin-top:7px;font-size:12px;font-weight:600;color:#5DCAA5;font-family:'DM Sans',sans-serif}

                .su-error{display:flex;align-items:center;gap:9px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:10px;padding:11px 14px;font-size:13px;color:#FCA5A5;font-family:'DM Sans',sans-serif}

                .su-btn{width:100%;height:52px;border:none;border-radius:14px;background:linear-gradient(135deg,#1D9E75,#0D9488);color:white;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;transition:all .22s;box-shadow:0 6px 20px rgba(29,158,117,.4);position:relative;overflow:hidden}
                .su-btn::after{content:'';position:absolute;top:0;left:-100%;width:55%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);transform:skewX(-15deg);pointer-events:none}
                .su-btn:not(:disabled):hover::after{left:160%;transition:left .55s ease}
                .su-btn:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(29,158,117,.5)}
                .su-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}

                .su-btn-ghost{width:100%;height:46px;border:1.5px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.55);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all .18s}
                .su-btn-ghost:hover{border-color:rgba(255,255,255,.22);background:rgba(255,255,255,.09);color:rgba(255,255,255,.85)}

                .su-verify-card{width:100%;border:1.5px solid rgba(255,255,255,.1);border-radius:16px;background:rgba(255,255,255,.04);padding:18px 20px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:all .22s;text-align:left;font-family:'DM Sans',sans-serif}
                .su-verify-card:hover:not(:disabled){border-color:rgba(29,158,117,.5);background:rgba(29,158,117,.06);box-shadow:0 0 0 3px rgba(29,158,117,.1)}
                .su-verify-card:disabled{cursor:not-allowed}
                .su-verify-icon{width:46px;height:46px;border-radius:12px;background:rgba(29,158,117,.12);border:1px solid rgba(29,158,117,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0}

                .su-footer{position:relative;z-index:1;text-align:center;padding:16px 24px 32px;display:flex;flex-direction:column;align-items:center;gap:10px}
                .su-footer-text{font-size:11px;color:rgba(255,255,255,.2);letter-spacing:.3px}
                .su-footer-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
                .su-badge-comp{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.1);padding:3px 10px;border-radius:100px}

                @keyframes suDrift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(24px,16px) scale(1.06)}}
                @keyframes suRingPulse{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.85;transform:scale(1.04)}}
                @keyframes suFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
                @keyframes suFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(10deg)}}
                @keyframes suScanMove{0%{top:-40%;opacity:0}15%{opacity:1}85%{opacity:1}100%{top:120%;opacity:0}}
                @keyframes suBlink{0%,100%{opacity:1}50%{opacity:.4}}
                @keyframes suSpin{to{transform:rotate(360deg)}}

                @media(max-width:640px){
                    .su-topbar{padding:20px 20px}
                    .su-card{padding:32px 22px 40px;border-radius:22px}
                    .su-h2{font-size:26px}
                    .su-g2{grid-template-columns:1fr}
                    .su-step-lbl{display:none}
                }
            `}</style>

            <div className="su-page">

                {/* Hex grid */}
                <svg className="su-hex" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="suHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#suHex)"/>
                </svg>
                <span className="su-blob su-blob-1"/>
                <span className="su-blob su-blob-2"/>
                <div className="su-dots"/>

                {/* Top bar */}
                <div className="su-topbar">
                    <Link href="/" className="su-logo">
                        <div className="su-logo-mark">
                            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="su-logo-word">Diagno<em>vate</em></span>
                    </Link>
                    <Link href="/log-in" className="su-back">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to Sign In
                    </Link>
                </div>

                {/* Main */}
                <div className="su-main">
                    <div className="su-card-wrap">
                        <div className="su-card-glow"/>

                        {/* Floating hex marks */}
                        <svg className="su-hex-float su-hex-f1" width="48" height="56" viewBox="0 0 48 56" fill="none">
                            <polygon points="24,2 44,13 44,35 24,46 4,35 4,13" fill="none" stroke="#1D9E75" strokeWidth="1.5"/>
                        </svg>
                        <svg className="su-hex-float su-hex-f2" width="36" height="42" viewBox="0 0 36 42" fill="none">
                            <polygon points="18,2 33,10 33,28 18,36 3,28 3,10" fill="none" stroke="#1D9E75" strokeWidth="1.5"/>
                        </svg>
                        <svg className="su-hex-float su-hex-f3" width="40" height="46" viewBox="0 0 40 46" fill="none">
                            <polygon points="20,2 37,11 37,31 20,40 3,31 3,11" fill="none" stroke="#1D9E75" strokeWidth="1.5"/>
                        </svg>
                        <svg className="su-hex-float su-hex-f4" width="30" height="34" viewBox="0 0 30 34" fill="none">
                            <polygon points="15,2 28,9 28,23 15,30 2,23 2,9" fill="none" stroke="#1D9E75" strokeWidth="1.5"/>
                        </svg>

                        <div className="su-card">
                            <div className="su-top-line"/>
                            <div className="su-scan-line"/>
                            <div className="su-card-body">

                                {/* Step progress */}
                                <div className="su-steps">
                                    {STEP_LABELS.map((lbl, i) => {
                                        const state = i < step ? 'done' : i === step ? 'curr' : 'idle';
                                        return (
                                            <div key={lbl} className="su-step">
                                                <div className={`su-step-dot su-step-dot--${state}`}>
                                                    {state === 'done' ? <Check size={13}/> : i + 1}
                                                </div>
                                                <span className={`su-step-lbl su-step-lbl--${state}`}>{lbl}</span>
                                                {i < STEP_LABELS.length - 1 && (
                                                    <div className={`su-step-line su-step-line--${step > i ? 'done' : 'idle'}`}/>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ── STEP 0: Personal Info ── */}
                                {step === 0 && (
                                    <>
                                        <div className="su-chip"><span className="su-chip-dot"/>Create Account</div>
                                        <h2 className="su-h2">Create your account.</h2>
                                        <p className="su-sub">Already registered? <a href="/log-in?role=doctor">Sign in</a></p>

                                        <div className="su-fields">
                                            <div className="su-g2">
                                                <div className="su-field">
                                                    <label className="su-label">First Name</label>
                                                    <div className="su-iw">
                                                        <span className="su-iw-icon">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                                                        </span>
                                                        <input className="su-input" placeholder="Sarah" value={form.firstName} onChange={set('firstName')}/>
                                                    </div>
                                                </div>
                                                <div className="su-field">
                                                    <label className="su-label">Last Name</label>
                                                    <div className="su-iw">
                                                        <span className="su-iw-icon">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                                                        </span>
                                                        <input className="su-input" placeholder="Al-Rashid" value={form.lastName} onChange={set('lastName')}/>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="su-field">
                                                <label className="su-label">Email Address</label>
                                                <div className="su-iw">
                                                    <span className="su-iw-icon">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                                                    </span>
                                                    <input type="email" className="su-input" placeholder="doctor@hospital.com" value={form.email} onChange={set('email')}/>
                                                </div>
                                            </div>

                                            <div className="su-g2">
                                                <div className="su-field">
                                                    <label className="su-label">Phone Number</label>
                                                    <div className="su-iw">
                                                        <span className="su-iw-icon">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9z"/></svg>
                                                        </span>
                                                        <input className="su-input" placeholder="05xxxxxxxx" value={form.phone} onChange={set('phone')}/>
                                                    </div>
                                                </div>
                                                <div className="su-field">
                                                    <label className="su-label">ID Number</label>
                                                    <div className="su-iw">
                                                        <span className="su-iw-icon">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
                                                        </span>
                                                        <input className="su-input" placeholder="National ID" value={form.idNumber} onChange={set('idNumber')}/>
                                                    </div>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="su-error">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                    {error}
                                                </div>
                                            )}

                                            <button type="button" className="su-btn" onClick={goNext}>
                                                Continue <ArrowRight size={16}/>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* ── STEP 1: Account Setup ── */}
                                {step === 1 && (
                                    <>
                                        <div className="su-chip"><span className="su-chip-dot"/>Account Setup</div>
                                        <h2 className="su-h2">Account setup.</h2>
                                        <p className="su-sub">Select your specialty and create a secure password.</p>

                                        <form className="su-fields" onSubmit={handleSubmit}>
                                            <div className="su-field">
                                                <label className="su-label">Specialty</label>
                                                <div className="su-iw">
                                                    <span className="su-iw-icon">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                                                    </span>
                                                    <select className="su-input" value={form.specialty} onChange={set('specialty')} style={{cursor:'pointer',paddingRight:16}}>
                                                        <option value="">Select your specialty...</option>
                                                        {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="su-field">
                                                <label className="su-label">Password</label>
                                                <div className="su-iw">
                                                    <span className="su-iw-icon">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                                    </span>
                                                    <input
                                                        type={showPw ? 'text' : 'password'}
                                                        className="su-input"
                                                        style={{paddingRight:46}}
                                                        placeholder="Min. 8 characters"
                                                        value={form.password}
                                                        onChange={set('password')}
                                                    />
                                                    <button type="button" className="su-eye" onClick={() => setShowPw(v => !v)}>
                                                        {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                                                    </button>
                                                </div>
                                                {pw && (
                                                    <div className="su-pw-str">
                                                        <div className="su-pw-bars">
                                                            {[1,2,3,4].map(i => (
                                                                <div key={i} className="su-pw-bar"
                                                                    style={{background: i <= pwStr ? pwMeta[pwStr]!.c : 'rgba(255,255,255,.1)'}}/>
                                                            ))}
                                                        </div>
                                                        <span className="su-pw-lbl" style={{color: pwMeta[pwStr]?.c}}>
                                                            {pwMeta[pwStr]?.l}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="su-field">
                                                <label className="su-label">Confirm Password</label>
                                                <div className="su-iw">
                                                    <span className="su-iw-icon">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                                    </span>
                                                    <input
                                                        type="password"
                                                        className="su-input"
                                                        placeholder="Repeat your password"
                                                        value={form.confirm}
                                                        onChange={set('confirm')}
                                                        style={form.confirm ? {borderColor: form.confirm === form.password ? 'rgba(29,158,117,.6)' : 'rgba(239,68,68,.5)'} : {}}
                                                    />
                                                </div>
                                                {form.confirm && form.confirm === form.password && (
                                                    <div className="su-pw-match">
                                                        <Check size={13}/> Passwords match
                                                    </div>
                                                )}
                                            </div>

                                            {error && (
                                                <div className="su-error">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                    {error}
                                                </div>
                                            )}

                                            <button type="submit" className="su-btn" disabled={loading}>
                                                {loading
                                                    ? <><Loader2 size={17} style={{animation:'suSpin .75s linear infinite'}}/>Creating account...</>
                                                    : <>Create Account <ArrowRight size={16}/></>
                                                }
                                            </button>

                                            <button type="button" className="su-btn-ghost" onClick={() => { setStep(0); setError(''); }}>
                                                <ArrowLeft size={14}/> Back
                                            </button>
                                        </form>
                                    </>
                                )}

                                {/* ── STEP 2: Choose Verification ── */}
                                {step === 2 && (
                                    <>
                                        <div className="su-chip"><span className="su-chip-dot"/>Verify Identity</div>
                                        <h2 className="su-h2">Choose verification.</h2>
                                        <p className="su-sub">How would you like to receive your verification code?</p>

                                        <div className="su-fields">
                                            <button
                                                type="button"
                                                className="su-verify-card"
                                                disabled={!!sending}
                                                onClick={() => handleChoose('sms')}
                                                style={{opacity: sending && sending !== 'sms' ? 0.4 : 1}}
                                            >
                                                <div className="su-verify-icon">
                                                    {sending === 'sms'
                                                        ? <Loader2 size={20} style={{animation:'suSpin .75s linear infinite',color:'#5DCAA5'}}/>
                                                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="1.8" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                                                    }
                                                </div>
                                                <div>
                                                    <div style={{fontWeight:700,fontSize:14,color:'white',marginBottom:3}}>Verify with Phone</div>
                                                    <div style={{fontSize:12,color:'rgba(255,255,255,.4)',lineHeight:1.4}}>Send a 6-digit SMS to your registered number</div>
                                                </div>
                                            </button>

                                            <button
                                                type="button"
                                                className="su-verify-card"
                                                disabled={!!sending}
                                                onClick={() => handleChoose('email')}
                                                style={{opacity: sending && sending !== 'email' ? 0.4 : 1}}
                                            >
                                                <div className="su-verify-icon">
                                                    {sending === 'email'
                                                        ? <Loader2 size={20} style={{animation:'suSpin .75s linear infinite',color:'#5DCAA5'}}/>
                                                        : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/></svg>
                                                    }
                                                </div>
                                                <div>
                                                    <div style={{fontWeight:700,fontSize:14,color:'white',marginBottom:3}}>Verify with Email</div>
                                                    <div style={{fontSize:12,color:'rgba(255,255,255,.4)',lineHeight:1.4}}>Send a 6-digit code to your registered email</div>
                                                </div>
                                            </button>

                                            {error && (
                                                <div className="su-error">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                    {error}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="su-footer">
                    <p className="su-footer-text">Protected by JWT authentication · Role-based access control</p>
                    <div className="su-footer-badges">
                        {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t => (
                            <span key={t} className="su-badge-comp">{t}</span>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}
