// Role selection page — lets users choose between Admin and Doctor before being sent to the login page.
'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';

export default function RolePage() {
    return (
        <>
            <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --teal:#1D9E75;--teal-light:#E1F5EE;--teal-ring:#6EE7C7;
          --blue:#1E40AF;--blue-mid:#3B82F6;--blue-light:#EFF6FF;--blue-ring:#BFDBFE;
          --bg:#F4F9F7;--surface:#fff;
          --text:#0D1B17;--muted:#8A9E97;--border:#D1E5DC;
          --grad-teal:linear-gradient(135deg,#1D9E75,#0D9488);
          --grad-blue:linear-gradient(135deg,#1E40AF,#3B82F6);
          --display:var(--font-display,'DM Serif Display',serif);--body:var(--font-body,'DM Sans',sans-serif);
        }
        body{background:var(--bg);color:var(--text);font-family:var(--body);overflow-x:hidden;-webkit-font-smoothing:antialiased;min-height:100vh;display:flex;flex-direction:column}

        .nav{position:relative;z-index:10;height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;background:rgba(244,249,247,.92);backdrop-filter:blur(24px);border-bottom:1px solid rgba(29,158,117,.12)}
        .nav-logo{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--text)}
        .nav-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(29,158,117,.3);position:relative}
        .nav-mark-ring{position:absolute;inset:-3px;border-radius:15px;border:1.5px solid rgba(29,158,117,.25);animation:ringPulse 3.5s ease-in-out infinite}
        .nav-wordmark{font-family:var(--display);font-size:20px;letter-spacing:-.3px;color:var(--text)}
        .nav-wordmark em{font-style:italic;color:#1D9E75}
        .nav-back{display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:var(--muted);text-decoration:none;padding:8px 14px;background:white;border:1px solid var(--border);border-radius:10px;transition:all .18s}
        .nav-back:hover{color:#1D9E75;border-color:var(--teal-ring);background:var(--teal-light)}

        .page{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px}

        .blob1{position:fixed;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(29,158,117,.1) 0%,transparent 65%);top:-250px;right:-200px;pointer-events:none;z-index:0}
        .blob2{position:fixed;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(30,64,175,.07) 0%,transparent 65%);bottom:-150px;left:-100px;pointer-events:none;z-index:0}

        .header{text-align:center;margin-bottom:56px;animation:fadeUp .6s ease both}
        .badge{display:inline-flex;align-items:center;gap:7px;background:var(--teal-light);border:1px solid var(--teal-ring);color:#1D9E75;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:22px}
        .badge-dot{width:7px;height:7px;border-radius:50%;background:#1D9E75;animation:blink 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(29,158,117,.2)}
        .h1{font-family:var(--display);font-size:clamp(36px,5vw,56px);font-weight:400;line-height:1.1;letter-spacing:-1px;margin-bottom:14px}
        .h1 em{font-style:italic;color:#1D9E75}
        .sub{font-size:16px;color:var(--muted);max-width:440px;margin:0 auto;line-height:1.65}

        .cards{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:860px;width:100%;animation:fadeUp .6s .15s ease both}
        .role-card{position:relative;background:white;border:1.5px solid var(--border);border-radius:24px;padding:40px 36px;text-decoration:none;color:var(--text);transition:all .35s cubic-bezier(.16,1,.3,1);overflow:hidden;box-shadow:0 2px 12px rgba(13,27,23,.06),0 8px 32px rgba(13,27,23,.04)}
        .role-card:hover{transform:translateY(-10px);box-shadow:0 8px 32px rgba(13,27,23,.1),0 32px 72px rgba(13,27,23,.08)}
        .rc-glow{position:absolute;inset:0;opacity:0;transition:opacity .35s}
        .role-card:hover .rc-glow{opacity:1}
        .rc-icon{width:64px;height:64px;border-radius:18px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;position:relative;z-index:1}
        .rc-tag{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;position:relative;z-index:1}
        .rc-h2{font-family:var(--display);font-size:30px;font-weight:400;letter-spacing:-.5px;margin-bottom:12px;line-height:1.1;position:relative;z-index:1}
        .rc-p{font-size:14px;color:var(--muted);line-height:1.65;margin-bottom:28px;position:relative;z-index:1}
        .rc-perms{display:flex;flex-direction:column;gap:8px;margin-bottom:32px;position:relative;z-index:1}
        .rc-perm{display:flex;align-items:center;gap:9px;font-size:13px;color:#334E47;font-weight:500}
        .rc-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
        .rc-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--body);font-size:14.5px;font-weight:700;padding:13px 24px;border-radius:12px;border:none;cursor:pointer;transition:all .22s;position:relative;z-index:1;width:100%;justify-content:center}

        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes ringPulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.8;transform:scale(1.07)}}
        .role-card--admin:hover{border-color:#BFDBFE !important;box-shadow:0 8px 32px rgba(30,64,175,.12),0 32px 72px rgba(30,64,175,.08) !important}
        .role-card--doctor:hover{border-color:#6EE7C7 !important;box-shadow:0 8px 32px rgba(29,158,117,.12),0 32px 72px rgba(29,158,117,.08) !important}

        @media(max-width:720px){.cards{grid-template-columns:1fr}.page{padding:40px 16px}}
        @media(max-width:480px){.nav{padding:0 16px}}
      `}</style>

            {/* Hex grid background */}
            <svg style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.055, pointerEvents: 'none', zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="hexRole" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                        <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexRole)" />
            </svg>

            <div className="blob1"/><div className="blob2"/>

            <nav className="nav">
                <Link href="/" className="nav-logo">
                    <div className="nav-mark">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/></svg>
                        <span className="nav-mark-ring"/>
                    </div>
                    <span className="nav-wordmark">Diagno<em>vate</em></span>
                </Link>
                <Link href="/" className="nav-back">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    Back to Home
                </Link>
            </nav>

            <div className="page">
                <div className="header">
                    <div className="badge"><span className="badge-dot"/>Secure Access</div>
                    <h1 className="h1">Select your<br/><em>role</em> to continue.</h1>
                    <p className="sub">Each role provides a tailored experience built for your specific workflow and permissions.</p>
                </div>

                <div className="cards">
                    <Link href="/log-in?role=admin" className="role-card role-card--admin">
                        <div className="rc-glow" style={{background:'radial-gradient(circle at 30% 20%, rgba(30,64,175,.05) 0%, transparent 60%)'}}/>
                        <div className="rc-icon" style={{background:'linear-gradient(135deg,#1E40AF,#3B82F6)',boxShadow:'0 8px 24px rgba(30,64,175,.35)'}}>
                            <ShieldCheck size={28} color="white"/>
                        </div>
                        <div className="rc-tag" style={{color:'#1E40AF'}}>Administrator</div>
                        <div className="rc-h2">Admin Console</div>
                        <p className="rc-p">Full platform oversight — manage doctor accounts, review requests, and monitor system health.</p>
                        <div className="rc-perms">
                            {['Doctor account management','Request approval & rejection','Platform analytics access','System configuration'].map(p=>(
                                <div key={p} className="rc-perm">
                                    <span className="rc-dot" style={{background:'#3B82F6'}}/>
                                    {p}
                                </div>
                            ))}
                        </div>
                        <div className="rc-btn" style={{background:'linear-gradient(135deg,#1E40AF,#3B82F6)',color:'white',boxShadow:'0 6px 20px rgba(30,64,175,.35)'}}>
                            Enter as Admin <ArrowRight size={16}/>
                        </div>
                    </Link>

                    <Link href="/log-in?role=doctor" className="role-card role-card--doctor">
                        <div className="rc-glow" style={{background:'radial-gradient(circle at 30% 20%, rgba(13,148,136,.05) 0%, transparent 60%)'}}/>
                        <div className="rc-icon" style={{background:'linear-gradient(135deg,#0D9488,#0891B2)',boxShadow:'0 8px 24px rgba(13,148,136,.35)'}}>
                            <Stethoscope size={28} color="white"/>
                        </div>
                        <div className="rc-tag" style={{color:'#0D9488'}}>Clinician</div>
                        <div className="rc-h2">Doctor Portal</div>
                        <p className="rc-p">Your complete diagnostic workspace — enhance images, run AI analysis, and manage your patients.</p>
                        <div className="rc-perms">
                            {['AI-powered image enhancement','Smart diagnostic recommendations','Patient record management','Clinical report generation'].map(p=>(
                                <div key={p} className="rc-perm">
                                    <span className="rc-dot" style={{background:'#0D9488'}}/>
                                    {p}
                                </div>
                            ))}
                        </div>
                        <div className="rc-btn" style={{background:'linear-gradient(135deg,#0D9488,#0891B2)',color:'white',boxShadow:'0 6px 20px rgba(13,148,136,.35)'}}>
                            Enter as Doctor <ArrowRight size={16}/>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}