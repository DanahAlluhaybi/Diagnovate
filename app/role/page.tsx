'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';

export default function RolePage() {
    return (
        <>
            <style>{`
                .rl-page{position:relative;z-index:1;min-height:100vh;background:#F0F7F4;display:flex;flex-direction:column;overflow-x:hidden}
                .rl-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.035;pointer-events:none;z-index:0}
                .rl-blob{position:fixed;border-radius:50%;pointer-events:none;z-index:0}
                .rl-blob-1{width:600px;height:600px;background:radial-gradient(circle,rgba(29,158,117,.06) 0%,transparent 65%);top:-200px;right:-150px}
                .rl-blob-2{width:400px;height:400px;background:radial-gradient(circle,rgba(8,80,65,.04) 0%,transparent 65%);bottom:-120px;left:-100px}

                .rl-nav{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:68px;background:rgba(255,255,255,.85);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(29,158,117,.08);flex-shrink:0}
                .rl-logo{display:flex;align-items:center;gap:12px;text-decoration:none}
                .rl-logo-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(29,158,117,.3);flex-shrink:0}
                .rl-logo-word{font-family:'DM Serif Display',serif;font-size:20px;color:#0D1B17;letter-spacing:-.3px}
                .rl-logo-word em{font-style:italic;color:#1D9E75}
                .rl-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:#2F4A40;text-decoration:none;padding:8px 16px;border:1.5px solid #D1E5DC;border-radius:10px;background:white;transition:all .18s}
                .rl-back:hover{border-color:#1D9E75;color:#1D9E75;background:#F0F7F4}

                .rl-main{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px}

                .rl-header{text-align:center;margin-bottom:52px;animation:rlFadeUp .55s ease both}
                .rl-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(29,158,117,.07);border:1px solid rgba(29,158,117,.18);color:#0F6E56;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:22px}
                .rl-badge-dot{width:7px;height:7px;border-radius:50%;background:#1D9E75;animation:rlBlink 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(29,158,117,.15)}
                .rl-h1{font-family:'DM Serif Display',serif;font-size:clamp(34px,5vw,52px);font-weight:400;line-height:1.1;letter-spacing:-1px;color:#0D1B17;margin-bottom:14px}
                .rl-h1 em{font-style:italic;color:#1D9E75}
                .rl-sub{font-size:16px;color:#8A9E97;max-width:440px;margin:0 auto;line-height:1.65}

                .rl-cards{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:860px;width:100%;animation:rlFadeUp .55s .15s ease both}
                .rl-card{position:relative;background:white;border:1.5px solid #D1E5DC;border-radius:24px;padding:40px 36px;text-decoration:none;color:#0D1B17;transition:all .25s cubic-bezier(.4,0,.2,1);overflow:hidden;box-shadow:0 2px 12px rgba(13,27,23,.05),0 8px 32px rgba(13,27,23,.03)}
                .rl-card:hover{transform:translateY(-10px)}
                .rl-card--admin:hover{border-color:#BFDBFE;box-shadow:0 8px 32px rgba(30,64,175,.1),0 32px 72px rgba(30,64,175,.07)}
                .rl-card--doctor:hover{border-color:rgba(29,158,117,.4);box-shadow:0 8px 32px rgba(29,158,117,.1),0 32px 72px rgba(29,158,117,.07)}

                .rl-check{position:absolute;top:16px;right:16px;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s}
                .rl-card:hover .rl-check{opacity:1}
                .rl-check--admin{background:#3B82F6}
                .rl-check--doctor{background:#1D9E75}

                .rl-icon{width:64px;height:64px;border-radius:18px;display:flex;align-items:center;justify-content:center;margin-bottom:24px}
                .rl-tag{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px}
                .rl-h2{font-family:'DM Serif Display',serif;font-size:28px;font-weight:400;letter-spacing:-.5px;color:#0D1B17;margin-bottom:12px;line-height:1.1}
                .rl-p{font-size:14px;color:#8A9E97;line-height:1.65;margin-bottom:28px}
                .rl-perms{display:flex;flex-direction:column;gap:8px;margin-bottom:32px}
                .rl-perm{display:flex;align-items:center;gap:9px;font-size:13px;color:#334E47;font-weight:500}
                .rl-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
                .rl-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:'DM Sans',sans-serif;font-size:14.5px;font-weight:700;padding:13px 24px;border-radius:12px;border:none;cursor:pointer;transition:all .25s;width:100%;color:white}
                .rl-btn svg{transition:transform .25s}
                .rl-card:hover .rl-btn svg{transform:translateX(4px)}

                .rl-footer{position:relative;z-index:1;text-align:center;padding:20px 24px 36px;display:flex;flex-direction:column;align-items:center;gap:10px}
                .rl-footer-text{font-size:11px;color:#8A9E97;letter-spacing:.3px}
                .rl-badges{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
                .rl-badge-comp{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8A9E97;border:1px solid #D1E5DC;padding:3px 10px;border-radius:100px}

                @keyframes rlFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes rlBlink{0%,100%{opacity:1}50%{opacity:.4}}

                @media(max-width:720px){
                    .rl-nav{padding:0 20px}
                    .rl-cards{grid-template-columns:1fr}
                    .rl-main{padding:40px 16px}
                }
            `}</style>

            {/* Hex grid */}
            <svg className="rl-hex" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="rlHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                        <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#rlHex)"/>
            </svg>
            <span className="rl-blob rl-blob-1"/>
            <span className="rl-blob rl-blob-2"/>

            <div className="rl-page">

                {/* Nav */}
                <nav className="rl-nav">
                    <Link href="/" className="rl-logo">
                        <div className="rl-logo-mark">
                            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span className="rl-logo-word">Diagno<em>vate</em></span>
                    </Link>
                    <Link href="/" className="rl-back">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to Home
                    </Link>
                </nav>

                {/* Main */}
                <div className="rl-main">
                    <div className="rl-header">
                        <div className="rl-badge"><span className="rl-badge-dot"/>Secure Access</div>
                        <h1 className="rl-h1">Select your<br/><em>role</em> to continue.</h1>
                        <p className="rl-sub">Each role provides a tailored experience built for your specific workflow and permissions.</p>
                    </div>

                    <div className="rl-cards">
                        {/* Admin card */}
                        <Link href="/log-in?role=admin" className="rl-card rl-card--admin">
                            <div className="rl-check rl-check--admin">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div className="rl-icon" style={{background:'linear-gradient(135deg,#1E40AF,#3B82F6)',boxShadow:'0 8px 24px rgba(30,64,175,.3)'}}>
                                <ShieldCheck size={28} color="white"/>
                            </div>
                            <div className="rl-tag" style={{color:'#1E40AF'}}>Administrator</div>
                            <div className="rl-h2">Admin Console</div>
                            <p className="rl-p">Oversee the entire platform — verify clinicians, review diagnostic submissions, monitor AI performance, and configure system-wide settings.</p>
                            <div className="rl-perms">
                                {['Doctor account management','Request approval & rejection','Platform analytics access','System configuration'].map(p => (
                                    <div key={p} className="rl-perm">
                                        <span className="rl-dot" style={{background:'#3B82F6'}}/>
                                        {p}
                                    </div>
                                ))}
                            </div>
                            <div className="rl-btn" style={{background:'linear-gradient(135deg,#1E40AF,#3B82F6)',boxShadow:'0 6px 20px rgba(30,64,175,.3)'}}>
                                Enter as Admin <ArrowRight size={16}/>
                            </div>
                        </Link>

                        {/* Doctor card */}
                        <Link href="/log-in?role=doctor" className="rl-card rl-card--doctor">
                            <div className="rl-check rl-check--doctor">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div className="rl-icon" style={{background:'linear-gradient(135deg,#1D9E75,#0D9488)',boxShadow:'0 8px 24px rgba(29,158,117,.3)'}}>
                                <Stethoscope size={28} color="white"/>
                            </div>
                            <div className="rl-tag" style={{color:'#1D9E75'}}>Clinician</div>
                            <div className="rl-h2">Doctor Portal</div>
                            <p className="rl-p">Your AI-powered clinical workspace — enhance ultrasound imagery, run ensemble diagnostics, manage patient records, and generate clinical-grade reports.</p>
                            <div className="rl-perms">
                                {['AI-powered image enhancement','Ensemble diagnostic analysis','Patient record management','Clinical report generation'].map(p => (
                                    <div key={p} className="rl-perm">
                                        <span className="rl-dot" style={{background:'#1D9E75'}}/>
                                        {p}
                                    </div>
                                ))}
                            </div>
                            <div className="rl-btn" style={{background:'linear-gradient(135deg,#1D9E75,#0D9488)',boxShadow:'0 6px 20px rgba(29,158,117,.3)'}}>
                                Enter as Doctor <ArrowRight size={16}/>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="rl-footer">
                    <p className="rl-footer-text">Protected by JWT authentication · Role-based access control</p>
                    <div className="rl-badges">
                        {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t => (
                            <span key={t} className="rl-badge-comp">{t}</span>
                        ))}
                    </div>
                </div>

            </div>
        </>
    );
}
