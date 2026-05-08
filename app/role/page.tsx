'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Stethoscope, ArrowRight } from 'lucide-react';

export default function RolePage() {
    const router = useRouter();
    const [hov, setHov] = useState<'admin' | 'doctor' | null>(null);

    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .rp-page {
                    min-height: 100vh;
                    background: #F0F4F8;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow-x: hidden;
                }
                .rp-page::before {
                    content: '';
                    position: absolute; inset: 0;
                    background-image: radial-gradient(circle, rgba(13,148,136,0.04) 1px, transparent 1px);
                    background-size: 28px 28px;
                    pointer-events: none; z-index: 0;
                }

                /* Navbar */
                .rp-nav {
                    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
                    height: 68px;
                    background: rgba(255,255,255,0.95);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid #EBF0F5;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 48px;
                    box-shadow: 0 1px 0 rgba(13,148,136,0.05);
                }
                .rp-back {
                    display: inline-flex; align-items: center; gap: 7px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px; font-weight: 600; color: #64748B;
                    text-decoration: none; padding: 7px 14px;
                    background: #F8FAFC; border: 1px solid #E2E8F0;
                    border-radius: 10px; transition: all 0.18s;
                }
                .rp-back:hover { color: #0D9488; border-color: #CCFBF1; background: #F0FDFA; transform: translateX(-2px); }
                .rp-wordmark { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .rp-mark {
                    width: 38px; height: 38px; border-radius: 11px;
                    background: linear-gradient(140deg, #0D9488, #0891B2);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 12px rgba(13,148,136,0.28);
                }
                .rp-name { font-family: 'DM Serif Display', serif; font-size: 20px; color: #0F172A; letter-spacing: -0.3px; }
                .rp-name em { color: #0D9488; font-style: italic; }
                .rp-nav-r {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: #94A3B8;
                }

                /* Body */
                .rp-body {
                    flex: 1;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 104px 24px 64px;
                    position: relative; z-index: 1;
                    max-width: 1000px; margin: 0 auto; width: 100%;
                }

                /* Logo header */
                .rp-logo-wrap {
                    display: flex; align-items: center; gap: 12px;
                    margin-bottom: 10px;
                    animation: rpFadeUp 0.5s cubic-bezier(.16,1,.3,1) both;
                }
                .rp-logo-mark {
                    width: 52px; height: 52px; border-radius: 15px;
                    background: linear-gradient(140deg, #0D9488, #0891B2);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 6px 20px rgba(13,148,136,0.3);
                }
                .rp-logo-name { font-family: 'DM Serif Display', serif; font-size: 28px; color: #0F172A; letter-spacing: -0.5px; }
                .rp-logo-name em { color: #0D9488; font-style: italic; }
                .rp-subtitle {
                    font-family: 'DM Sans', sans-serif; font-size: 15px; color: #64748B;
                    text-align: center; margin-bottom: 48px;
                    animation: rpFadeUp 0.5s 0.06s cubic-bezier(.16,1,.3,1) both;
                }

                /* Cards */
                .rp-cards {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 24px; width: 100%; margin-bottom: 40px;
                    animation: rpFadeUp 0.5s 0.12s cubic-bezier(.16,1,.3,1) both;
                }
                .rp-card {
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 16px;
                    padding: 40px 32px;
                    cursor: pointer;
                    transition: all 250ms ease;
                    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
                    position: relative; overflow: hidden;
                }
                /* top accent bar */
                .rp-card::before {
                    content: ''; position: absolute;
                    top: 0; left: 0; right: 0; height: 3px;
                    background: linear-gradient(90deg, #0D9488, #0891B2);
                    opacity: 0; transition: opacity 0.25s;
                }
                .rp-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 16px 48px rgba(13,148,136,0.12), 0 4px 16px rgba(15,23,42,0.06);
                    border-color: rgba(13,148,136,0.25);
                }
                .rp-card:hover::before { opacity: 1; }

                /* Icon */
                .rp-icon {
                    width: 56px; height: 56px; border-radius: 50%;
                    background: #0D9488;
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 20px;
                    box-shadow: 0 6px 20px rgba(13,148,136,0.28);
                    transition: transform 0.25s, box-shadow 0.25s;
                }
                .rp-card:hover .rp-icon { transform: scale(1.06); box-shadow: 0 10px 28px rgba(13,148,136,0.38); }

                /* Role badge */
                .rp-role-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 4px 12px;
                    background: rgba(13,148,136,0.08);
                    border: 1px solid rgba(13,148,136,0.2);
                    border-radius: 9999px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 10.5px; font-weight: 700; letter-spacing: 1.5px;
                    text-transform: uppercase; color: #0D9488;
                    margin-bottom: 16px;
                }
                .rp-role-dot { width: 6px; height: 6px; border-radius: 50%; background: #0D9488; flex-shrink: 0; }

                /* Card title */
                .rp-card-h { font-size: clamp(26px, 2.5vw, 34px); color: #0F172A; margin-bottom: 12px; line-height: 1.1; }
                .rp-card-h strong { font-weight: 800; }
                .rp-card-h em { font-style: italic; color: #0D9488; font-family: Georgia, 'DM Serif Display', serif; }

                /* Card desc */
                .rp-card-sub {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px; color: #64748B; line-height: 1.65;
                    margin-bottom: 24px;
                }

                /* Feature list */
                .rp-features { display: flex; flex-direction: column; gap: 9px; margin-bottom: 32px; }
                .rp-feat {
                    display: flex; align-items: center; gap: 10px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13.5px; font-weight: 500; color: #334155;
                }
                .rp-feat-dot {
                    width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
                    background: #0D9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.15);
                }

                /* Button */
                .rp-btn {
                    display: flex; align-items: center; justify-content: center; gap: 9px;
                    width: 100%; padding: 14px;
                    background: #0D9488; color: white;
                    border: none; border-radius: 10px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 15px; font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(13,148,136,0.28);
                    transition: all 0.2s;
                }
                .rp-btn:hover { background: #0F766E; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(13,148,136,0.38); }
                .rp-btn:active { transform: scale(0.98); }

                /* Compliance footer */
                .rp-foot {
                    display: flex; flex-direction: column; align-items: center; gap: 10px;
                    animation: rpFadeUp 0.5s 0.18s cubic-bezier(.16,1,.3,1) both;
                }
                .rp-compliance { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
                .rp-comp {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 10px; font-weight: 700; letter-spacing: 1px;
                    text-transform: uppercase; color: white;
                    background: #1E293B; padding: 4px 12px; border-radius: 9999px;
                }
                .rp-secure-txt { font-family: 'DM Sans', sans-serif; font-size: 11.5px; color: #94A3B8; }

                /* Responsive */
                @media (max-width: 760px) {
                    .rp-cards { grid-template-columns: 1fr; max-width: 480px; margin-left: auto; margin-right: auto; }
                    .rp-nav { padding: 0 20px; }
                    .rp-body { padding: 92px 16px 48px; }
                }
                @media (max-width: 480px) {
                    .rp-card { padding: 28px 24px 24px; }
                    .rp-nav-r { display: none; }
                }

                @keyframes rpFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

            <div className="rp-page">

                {/* Navbar */}
                <nav className="rp-nav">
                    <Link href="/" className="rp-back">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Back to Home
                    </Link>

                    <Link href="/" className="rp-wordmark">
                        <div className="rp-mark">
                            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="rp-name">Diagn<em>ovate</em></span>
                    </Link>

                    <div className="rp-nav-r">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round">
                            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Secure access
                    </div>
                </nav>

                {/* Body */}
                <div className="rp-body">

                    {/* Logo + subtitle */}
                    <div className="rp-logo-wrap">
                        <div className="rp-logo-mark">
                            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="rp-logo-name">Diagn<em>ovate</em></span>
                    </div>

                    <p className="rp-subtitle">Select your access portal</p>

                    {/* Cards */}
                    <div className="rp-cards">

                        {/* Admin card */}
                        <div
                            className="rp-card"
                            onClick={() => router.push('/log-in?role=admin')}
                            onMouseEnter={() => setHov('admin')}
                            onMouseLeave={() => setHov(null)}
                            style={{ opacity: hov === 'doctor' ? 0.7 : 1 }}
                        >
                            <div className="rp-icon">
                                <ShieldCheck size={26} color="white"/>
                            </div>
                            <div className="rp-role-badge">
                                <span className="rp-role-dot"/>
                                Administrator
                            </div>
                            <h2 className="rp-card-h">
                                <strong>Admin</strong> <em>Console.</em>
                            </h2>
                            <p className="rp-card-sub">
                                Platform oversight, clinician verification, and system control.
                            </p>
                            <div className="rp-features">
                                {['Doctor account management', 'Request approval & review', 'Platform analytics', 'System configuration'].map(f => (
                                    <div key={f} className="rp-feat">
                                        <span className="rp-feat-dot"/>
                                        {f}
                                    </div>
                                ))}
                            </div>
                            <button className="rp-btn">
                                Enter Admin Console
                                <ArrowRight size={16}/>
                            </button>
                        </div>

                        {/* Doctor card */}
                        <div
                            className="rp-card"
                            onClick={() => router.push('/log-in?role=doctor')}
                            onMouseEnter={() => setHov('doctor')}
                            onMouseLeave={() => setHov(null)}
                            style={{ opacity: hov === 'admin' ? 0.7 : 1 }}
                        >
                            <div className="rp-icon">
                                <Stethoscope size={26} color="white"/>
                            </div>
                            <div className="rp-role-badge">
                                <span className="rp-role-dot"/>
                                Clinician
                            </div>
                            <h2 className="rp-card-h">
                                <strong>Doctor</strong> <em>Portal.</em>
                            </h2>
                            <p className="rp-card-sub">
                                AI-powered diagnostics, patient management, and clinical report generation.
                            </p>
                            <div className="rp-features">
                                {['AI-powered image enhancement', 'Ensemble diagnostic analysis', 'Patient record management', 'Clinical report generation'].map(f => (
                                    <div key={f} className="rp-feat">
                                        <span className="rp-feat-dot"/>
                                        {f}
                                    </div>
                                ))}
                            </div>
                            <button className="rp-btn">
                                Enter Doctor Portal
                                <ArrowRight size={16}/>
                            </button>
                        </div>

                    </div>

                    {/* Security badges */}
                    <div className="rp-foot">
                        <div className="rp-compliance">
                            {['HIPAA', 'ICCR', 'WHO', 'TI-RADS', 'GDPR'].map(t => (
                                <span key={t} className="rp-comp">{t}</span>
                            ))}
                        </div>
                        <p className="rp-secure-txt">Protected by JWT · Role-based access control</p>
                    </div>

                </div>
            </div>
        </>
    );
}
