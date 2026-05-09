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

                .rsel-page {
                    min-height: 100vh;
                    background:
                        radial-gradient(ellipse 80% 50% at 50% -5%, rgba(29,158,117,0.07) 0%, transparent 65%),
                        radial-gradient(ellipse 50% 40% at 85% 85%, rgba(13,148,136,0.05) 0%, transparent 55%),
                        #FFFFFF;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow-x: hidden;
                }

                .rsel-hex {
                    position: fixed; inset: 0;
                    width: 100%; height: 100%;
                    opacity: .025; pointer-events: none; z-index: 0;
                }

                .rsel-topbar {
                    position: relative; z-index: 10;
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 0 48px; height: 64px;
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(24px) saturate(180%);
                    -webkit-backdrop-filter: blur(24px) saturate(180%);
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                    flex-shrink: 0;
                }
                .rsel-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
                .rsel-mark {
                    width: 44px; height: 44px; border-radius: 13px;
                    background: linear-gradient(145deg,#1D9E75,#0D9488);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 6px 20px rgba(29,158,117,0.35); flex-shrink: 0;
                }
                .rsel-name { font-family: 'DM Serif Display', serif; font-size: 20px; color: #111827; letter-spacing: -0.3px; }
                .rsel-name em { color: #1D9E75; font-style: italic; }
                .rsel-back {
                    display: inline-flex; align-items: center; gap: 7px;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 13px; font-weight: 600; color: #374151;
                    text-decoration: none; padding: 8px 16px;
                    border: 1px solid rgba(0,0,0,0.12); border-radius: 10px;
                    background: white; transition: all .18s;
                }
                .rsel-back:hover { border-color: #1D9E75; color: #1D9E75; background: #F0FDF9; }

                .rsel-body {
                    flex: 1;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 56px 24px 64px;
                    position: relative; z-index: 1;
                }

                .rsel-badge {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(29,158,117,0.06); border: 1px solid rgba(29,158,117,0.18);
                    color: #1D9E75; font-family: 'DM Sans', sans-serif;
                    font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
                    padding: 6px 14px; border-radius: 100px;
                    margin-bottom: 28px; width: fit-content;
                    animation: rselFadeUp 0.5s cubic-bezier(.16,1,.3,1) both;
                }
                .rsel-badge-dot {
                    width: 6px; height: 6px; border-radius: 50%; background: #1D9E75;
                    animation: rselBlink 2s ease-in-out infinite;
                }

                .rsel-h1 {
                    font-family: 'DM Serif Display', serif;
                    font-size: 64px; color: #111827; letter-spacing: -2px;
                    line-height: 1.0; text-align: center; margin-bottom: 16px;
                    animation: rselFadeUp 0.5s 0.05s cubic-bezier(.16,1,.3,1) both;
                }
                .rsel-h1 em { font-style: italic; color: #1D9E75; }
                .rsel-sub {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 16px; color: #6B7280; text-align: center;
                    margin-bottom: 52px; max-width: 400px;
                    animation: rselFadeUp 0.5s 0.1s cubic-bezier(.16,1,.3,1) both;
                }

                .rsel-cards {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 20px; width: 100%; max-width: 840px; margin-bottom: 36px;
                    animation: rselFadeUp 0.5s 0.15s cubic-bezier(.16,1,.3,1) both;
                }

                .rsel-card {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.06);
                    border-radius: 20px; padding: 40px;
                    cursor: pointer; position: relative; overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
                    transition: transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease;
                }
                .rsel-card::before {
                    content: ''; position: absolute;
                    top: 0; left: 0; right: 0; height: 3px;
                    transform: scaleX(0); transform-origin: left;
                    transition: transform 0.28s ease;
                }
                .rsel-card-admin::before { background: linear-gradient(90deg,#2563EB,#3B82F6); }
                .rsel-card-admin:hover {
                    transform: translateY(-6px);
                    border-color: rgba(37,99,235,0.15);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 20px 48px rgba(37,99,235,0.12), 0 0 80px rgba(37,99,235,0.06);
                }
                .rsel-card-admin:hover::before { transform: scaleX(1); }

                .rsel-card-doctor::before { background: linear-gradient(90deg,#1D9E75,#0D9488); }
                .rsel-card-doctor:hover {
                    transform: translateY(-6px);
                    border-color: rgba(29,158,117,0.15);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 20px 48px rgba(29,158,117,0.12), 0 0 80px rgba(29,158,117,0.07);
                }
                .rsel-card-doctor:hover::before { transform: scaleX(1); }

                .rsel-check {
                    position: absolute; top: 20px; right: 20px;
                    width: 26px; height: 26px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    opacity: 0; transition: opacity 0.22s;
                }
                .rsel-card:hover .rsel-check { opacity: 1; }
                .rsel-check-admin  { background: #2563EB; }
                .rsel-check-doctor { background: #1D9E75; }

                .rsel-icon {
                    width: 60px; height: 60px; border-radius: 16px;
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 20px; flex-shrink: 0;
                    transition: transform 0.22s;
                }
                .rsel-card:hover .rsel-icon { transform: scale(1.06); }
                .rsel-icon-admin  { background: linear-gradient(135deg,#2563EB,#1E40AF); box-shadow: 0 8px 24px rgba(37,99,235,0.32); }
                .rsel-icon-doctor { background: linear-gradient(135deg,#1D9E75,#0D9488); box-shadow: 0 8px 24px rgba(29,158,117,0.32); }

                .rsel-tag {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
                    margin-bottom: 8px; display: block;
                }
                .rsel-tag-admin  { color: #2563EB; }
                .rsel-tag-doctor { color: #1D9E75; }

                .rsel-card-title {
                    font-family: 'DM Serif Display', serif;
                    font-size: 26px; color: #111827; margin-bottom: 10px; line-height: 1.1;
                }

                .rsel-card-desc {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px; color: #6B7280; line-height: 1.65; margin-bottom: 24px;
                }

                .rsel-perms { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
                .rsel-perm {
                    display: flex; align-items: center; gap: 10px;
                    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #374151;
                }
                .rsel-perm-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
                .rsel-perm-dot-admin  { background: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
                .rsel-perm-dot-doctor { background: #1D9E75; box-shadow: 0 0 0 3px rgba(29,158,117,0.12); }

                .rsel-btn {
                    display: flex; align-items: center; justify-content: center; gap: 9px;
                    width: 100%; height: 50px;
                    border: none; border-radius: 12px; cursor: pointer;
                    font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
                    color: white; transition: all 0.22s; position: relative; overflow: hidden;
                }
                .rsel-btn::before {
                    content: ''; position: absolute; inset: 0; border-radius: 12px;
                    background: rgba(255,255,255,0); transition: background 0.22s;
                }
                .rsel-btn:hover::before { background: rgba(255,255,255,0.08); }
                .rsel-btn::after {
                    content: ''; position: absolute; top: 0; left: -100%;
                    width: 55%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
                    transform: skewX(-15deg); pointer-events: none;
                }
                .rsel-btn:not(:disabled):hover::after { left: 160%; transition: left 0.55s ease; }
                .rsel-btn:hover { transform: translateY(-2px); }
                .rsel-btn-admin {
                    background: linear-gradient(135deg,#2563EB 0%,#1E40AF 50%,#1D4ED8 100%);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 4px 16px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.15);
                }
                .rsel-btn-doctor {
                    background: linear-gradient(135deg,#1D9E75 0%,#0D9488 50%,#0F6E56 100%);
                    box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 4px 16px rgba(29,158,117,0.28), inset 0 1px 0 rgba(255,255,255,0.15);
                }
                .rsel-btn-admin:hover  { box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 10px 28px rgba(37,99,235,0.36), inset 0 1px 0 rgba(255,255,255,0.15); }
                .rsel-btn-doctor:hover { box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 10px 28px rgba(29,158,117,0.36), inset 0 1px 0 rgba(255,255,255,0.15); }

                .rsel-arrow { transition: transform 0.2s; }
                .rsel-btn:hover .rsel-arrow { transform: translateX(4px); }

                .rsel-foot {
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px; color: #9CA3AF; text-align: center;
                    animation: rselFadeUp 0.5s 0.2s cubic-bezier(.16,1,.3,1) both;
                }

                @keyframes rselFadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes rselBlink  { 0%,100%{opacity:1} 50%{opacity:0.3} }

                @media (max-width: 760px) {
                    .rsel-cards { grid-template-columns: 1fr; max-width: 480px; }
                    .rsel-topbar { padding: 0 20px; }
                    .rsel-body { padding: 40px 16px 48px; }
                    .rsel-h1 { font-size: 44px; letter-spacing: -1.5px; }
                }
                @media (max-width: 480px) {
                    .rsel-card { padding: 28px 24px; }
                    .rsel-h1 { font-size: 36px; }
                }
            `}</style>

            <div className="rsel-page">

                <svg className="rsel-hex" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="rselHexPat" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#rselHexPat)"/>
                </svg>

                <div className="rsel-topbar">
                    <Link href="/" className="rsel-logo">
                        <div className="rsel-mark">
                            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="rsel-name">Diagno<em>vate</em></span>
                    </Link>
                    <Link href="/" className="rsel-back">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to Home
                    </Link>
                </div>

                <div className="rsel-body">

                    <div className="rsel-badge">
                        <span className="rsel-badge-dot"/>
                        Secure Access · JWT Protected
                    </div>

                    <h1 className="rsel-h1">
                        Choose your<br/>
                        <em>workspace.</em>
                    </h1>
                    <p className="rsel-sub">Select your role to access your personalized clinical workspace.</p>

                    <div className="rsel-cards">

                        {/* ── Admin card ── */}
                        <div
                            className="rsel-card rsel-card-admin"
                            onClick={() => router.push('/log-in?role=admin')}
                            onMouseEnter={() => setHov('admin')}
                            onMouseLeave={() => setHov(null)}
                            style={{ opacity: hov === 'doctor' ? 0.6 : 1 }}
                        >
                            <div className="rsel-check rsel-check-admin">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>

                            <div className="rsel-icon rsel-icon-admin">
                                <ShieldCheck size={26} color="white"/>
                            </div>

                            <span className="rsel-tag rsel-tag-admin">Administrator</span>
                            <h2 className="rsel-card-title">Admin Console</h2>
                            <p className="rsel-card-desc">
                                Full platform oversight — approve clinicians, monitor AI systems, configure workflows, and review diagnostic performance across the organization.
                            </p>

                            <div className="rsel-perms">
                                {['Doctor account management', 'Request approval & review', 'Platform analytics', 'System configuration'].map(p => (
                                    <div key={p} className="rsel-perm">
                                        <span className="rsel-perm-dot rsel-perm-dot-admin"/>
                                        {p}
                                    </div>
                                ))}
                            </div>

                            <button className="rsel-btn rsel-btn-admin">
                                Enter as Admin
                                <span className="rsel-arrow"><ArrowRight size={16}/></span>
                            </button>
                        </div>

                        {/* ── Doctor card ── */}
                        <div
                            className="rsel-card rsel-card-doctor"
                            onClick={() => router.push('/log-in?role=doctor')}
                            onMouseEnter={() => setHov('doctor')}
                            onMouseLeave={() => setHov(null)}
                            style={{ opacity: hov === 'admin' ? 0.6 : 1 }}
                        >
                            <div className="rsel-check rsel-check-doctor">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            </div>

                            <div className="rsel-icon rsel-icon-doctor">
                                <Stethoscope size={26} color="white"/>
                            </div>

                            <span className="rsel-tag rsel-tag-doctor">Clinician</span>
                            <h2 className="rsel-card-title">Doctor Portal</h2>
                            <p className="rsel-card-desc">
                                AI-powered clinical workspace — enhance ultrasound imagery, run ensemble diagnostics, manage patients, and generate HIPAA-compliant reports.
                            </p>

                            <div className="rsel-perms">
                                {['AI-powered image enhancement', 'Ensemble diagnostic analysis', 'Patient record management', 'Clinical report generation'].map(p => (
                                    <div key={p} className="rsel-perm">
                                        <span className="rsel-perm-dot rsel-perm-dot-doctor"/>
                                        {p}
                                    </div>
                                ))}
                            </div>

                            <button className="rsel-btn rsel-btn-doctor">
                                Enter as Doctor
                                <span className="rsel-arrow"><ArrowRight size={16}/></span>
                            </button>
                        </div>

                    </div>

                    <p className="rsel-foot">Protected by JWT authentication · Role-based access control</p>

                </div>
            </div>
        </>
    );
}
