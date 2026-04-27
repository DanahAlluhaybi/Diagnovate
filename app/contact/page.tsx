// Contact page — shows team members, contact info cards, and a CTA section. Public-facing.
'use client';

import Link from 'next/link';
import { ArrowRight, Mail, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const team = [
    { name: 'Danah Alluhyabi',  role: 'Business Development', area: 'Strategy & Partnerships', initials: 'DA', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
    { name: 'Renad Almazroui', role: 'Clinical Validation',   area: 'Data & Trial Design',     initials: 'RA', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { name: 'Jana Alghamdi',   role: 'Technical Lead',        area: 'AI & Backend',             initials: 'JA', color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD' },
    { name: 'Reena Aljahdali', role: 'Technical Lead',        area: 'Frontend & UX',            initials: 'RE', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
];

const info = [
    { icon: <Mail size={18}/>,   label: 'Email',    value: 'team@diagnovate.com',  color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
    { icon: <MapPin size={18}/>, label: 'Location', value: 'Saudi Arabia',         color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { icon: <Globe size={18}/>,  label: 'Platform', value: 'diagnovate.com',       color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD' },
];

export default function ContactPage() {
    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --teal:#0D9488;--teal-light:#F0FDFA;--teal-ring:#99F6E4;--teal-muted:#CCFBF1;
          --bg:#F0F4F8;--surface:#fff;--surface2:#F8FAFC;
          --text:#0F172A;--text2:#334155;--muted:#64748B;--subtle:#94A3B8;--border:#E2E8F0;
          --grad:linear-gradient(135deg,#0D9488,#0891B2);
          --display:'DM Serif Display',serif;--body:'Plus Jakarta Sans',sans-serif;
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--text);font-family:var(--body);overflow-x:hidden;-webkit-font-smoothing:antialiased}
        body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);background-size:28px 28px;opacity:.45;pointer-events:none;z-index:0}

        .nav{position:fixed;top:0;left:0;right:0;z-index:100;height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 48px;background:rgba(255,255,255,.92);backdrop-filter:blur(24px);border-bottom:1px solid var(--border)}
        .nav-logo{display:flex;align-items:center;gap:11px;text-decoration:none;color:var(--text)}
        .nav-mark{width:40px;height:40px;border-radius:12px;background:linear-gradient(145deg,#0D9488,#0891B2,#0369A1);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(13,148,136,.32),inset 0 1px 0 rgba(255,255,255,.18);position:relative}
        .nav-mark-ring{position:absolute;inset:-3px;border-radius:15px;border:1.5px solid rgba(13,148,136,.22);animation:ringPulse 3.5s ease-in-out infinite}
        .nav-wordmark{font-family:var(--display);font-size:20px;letter-spacing:-.3px}
        .nav-wordmark span{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .nav-links{display:flex;align-items:center;gap:4px}
        .nav-link{padding:7px 14px;border-radius:9px;font-size:13.5px;font-weight:500;color:var(--muted);text-decoration:none;transition:all .15s}
        .nav-link:hover{color:var(--text);background:#F1F5F9}
        .nav-link.active{color:var(--teal);background:var(--teal-light);font-weight:700}
        .nav-cta{display:inline-flex;align-items:center;gap:7px;background:var(--grad);color:white;font-size:13.5px;font-weight:700;padding:9px 20px;border-radius:11px;text-decoration:none;box-shadow:0 4px 16px rgba(13,148,136,.3);transition:all .2s}
        .nav-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,148,136,.4)}

        .page{position:relative;z-index:1;padding-top:68px}

        .hero{padding:72px 48px 56px;max-width:1200px;margin:0 auto;text-align:center;position:relative}
        .blob1{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(13,148,136,.1) 0%,transparent 65%);top:-200px;right:-100px;pointer-events:none}
        .blob2{position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,.07) 0%,transparent 65%);bottom:-80px;left:-80px;pointer-events:none}
        .badge{display:inline-flex;align-items:center;gap:7px;background:var(--teal-light);border:1px solid var(--teal-ring);color:var(--teal);font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:22px;animation:fadeUp .6s ease both}
        .badge-dot{width:7px;height:7px;border-radius:50%;background:var(--teal);animation:blink 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(13,148,136,.2)}
        .h1{font-family:var(--display);font-size:clamp(40px,5vw,64px);font-weight:400;line-height:1.08;letter-spacing:-1px;margin-bottom:16px;animation:fadeUp .6s .1s ease both}
        .h1 em{font-style:italic;background:linear-gradient(120deg,#0D9488,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .sub{font-size:17px;color:var(--muted);max-width:520px;margin:0 auto;line-height:1.7;animation:fadeUp .6s .2s ease both}

        .info-wrap{padding:40px 48px;max-width:1200px;margin:0 auto}
        .info-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
        .info-card{background:white;border:1.5px solid var(--border);border-radius:18px;padding:22px 24px;display:flex;align-items:center;gap:16px;transition:all .25s;box-shadow:0 2px 8px rgba(15,23,42,.05)}
        .info-card:hover{transform:translateY(-4px);box-shadow:0 14px 44px rgba(15,23,42,.1)}
        .info-icon{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .info-label{font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
        .info-value{font-size:15px;font-weight:700;color:var(--text)}

        .team-wrap{padding:0 48px 80px;max-width:1200px;margin:0 auto}
        .sec-head{display:flex;align-items:center;gap:14px;margin-bottom:40px}
        .sec-label{font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--teal);white-space:nowrap}
        .sec-line{flex:1;height:1px;background:linear-gradient(to right,var(--teal-muted),transparent)}
        .team-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .team-card{background:white;border:1.5px solid var(--border);border-radius:22px;padding:32px 24px;text-align:center;transition:all .28s;box-shadow:0 2px 8px rgba(15,23,42,.05);position:relative;overflow:hidden}
        .team-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;transition:opacity .25s}
        .team-card:hover{transform:translateY(-6px);box-shadow:0 20px 56px rgba(15,23,42,.13)}
        .avatar{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:28px;font-weight:400;color:white;margin:0 auto 18px;box-shadow:0 8px 24px rgba(0,0,0,.18)}
        .tc-name{font-family:var(--display);font-size:19px;color:var(--text);margin-bottom:6px;line-height:1.2}
        .tc-role{font-size:12px;font-weight:700;margin-bottom:4px}
        .tc-area{font-size:12px;color:var(--subtle)}
        .tc-socials{display:flex;justify-content:center;gap:8px;margin-top:18px}
        .tc-social{width:32px;height:32px;border-radius:9px;border:1px solid var(--border);background:var(--surface2);display:flex;align-items:center;justify-content:center;color:var(--subtle);transition:all .18s;cursor:pointer}
        .tc-social:hover{background:var(--teal-light);border-color:var(--teal-ring);color:var(--teal)}

        .cta{padding:0 48px 100px;position:relative;z-index:1}
        .cta-inner{max-width:1200px;margin:0 auto;background:linear-gradient(135deg,#0D9488 0%,#0891B2 50%,#7C3AED 100%);border-radius:28px;padding:72px;text-align:center;position:relative;overflow:hidden}
        .cta-c{position:absolute;border-radius:50%;background:rgba(255,255,255,.06)}
        .cta-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:white;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:24px;position:relative}
        .cta-h2{font-family:var(--display);font-size:clamp(28px,3.5vw,46px);color:white;letter-spacing:-.5px;margin-bottom:16px;position:relative}
        .cta-p{font-size:16px;color:rgba(255,255,255,.75);margin-bottom:36px;position:relative}
        .cta-btns{display:flex;gap:14px;justify-content:center;position:relative}
        .btn-white{display:inline-flex;align-items:center;gap:8px;background:white;color:var(--teal);font-family:var(--body);font-size:14.5px;font-weight:700;padding:12px 26px;border-radius:12px;border:none;cursor:pointer;text-decoration:none;transition:all .22s;box-shadow:0 6px 24px rgba(0,0,0,.15)}
        .btn-white:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,.2)}
        .btn-ow{display:inline-flex;align-items:center;gap:8px;background:transparent;color:white;font-family:var(--body);font-size:14.5px;font-weight:600;padding:12px 26px;border-radius:12px;border:1.5px solid rgba(255,255,255,.35);cursor:pointer;text-decoration:none;transition:all .22s}
        .btn-ow:hover{background:rgba(255,255,255,.1);transform:translateY(-2px)}

        .footer{position:relative;z-index:1;border-top:1px solid var(--border);padding:28px 48px;display:flex;align-items:center;justify-content:space-between;background:white}
        .footer-logo{display:flex;align-items:center;gap:9px;font-family:var(--display);font-size:18px;color:var(--text)}
        .footer-logo span{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .footer-copy{font-size:13px;color:var(--muted)}

        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes ringPulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.8;transform:scale(1.07)}}

        @media(max-width:960px){
          .nav{padding:0 20px}
          .hero,.info-wrap,.team-wrap,.cta{padding-left:20px;padding-right:20px}
          .team-grid{grid-template-columns:repeat(2,1fr)}
          .info-row{grid-template-columns:1fr}
          .cta-inner{padding:48px 24px}
          .footer{flex-direction:column;gap:12px;text-align:center;padding:24px 20px}
        }
        @media(max-width:520px){.team-grid{grid-template-columns:1fr}}
      `}</style>

            <nav className="nav">
                <Link href="/" className="nav-logo">
                    <div className="nav-mark">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/></svg>
                        <span className="nav-mark-ring"/>
                    </div>
                    <span className="nav-wordmark">Diagno<span>vate</span></span>
                </Link>
                <div className="nav-links">
                    <Link href="/" className="nav-link">Home</Link>
                    <Link href="/about" className="nav-link">About</Link>
                    <Link href="/contact" className="nav-link active">Contact</Link>
                    <Link href="/role" className="nav-cta">Login & Try <ArrowRight size={14}/></Link>
                </div>
            </nav>

            <div className="page">
                <div style={{position:'relative',overflow:'hidden'}}>
                    <div className="blob1"/><div className="blob2"/>
                    <div className="hero">
                        <div className="badge"><span className="badge-dot"/>Get In Touch</div>
                        <h1 className="h1">Meet the<br/><em>team</em> behind<br/>Diagnovate.</h1>
                        <p className="sub">Four specialists united by a single goal — making thyroid cancer diagnostics faster, smarter, and more accessible worldwide.</p>
                    </div>
                </div>

                <div className="info-wrap">
                    <div className="info-row">
                        {info.map(i=>(
                            <div key={i.label} className="info-card"
                                 onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=i.border}}
                                 onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='var(--border)'}}>
                                <div className="info-icon" style={{background:i.bg,border:`1px solid ${i.border}`,color:i.color}}>{i.icon}</div>
                                <div>
                                    <div className="info-label" style={{color:i.color}}>{i.label}</div>
                                    <div className="info-value">{i.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="team-wrap">
                    <div className="sec-head">
                        <span className="sec-label">Our Team</span>
                        <div className="sec-line"/>
                    </div>
                    <div className="team-grid">
                        {team.map(m=>(
                            <div key={m.name} className="team-card"
                                 onMouseEnter={e=>{
                                     (e.currentTarget as HTMLDivElement).style.borderColor=m.border;
                                     (e.currentTarget as HTMLDivElement).style.boxShadow=`0 20px 56px ${m.color}18`;
                                 }}
                                 onMouseLeave={e=>{
                                     (e.currentTarget as HTMLDivElement).style.borderColor='var(--border)';
                                     (e.currentTarget as HTMLDivElement).style.boxShadow='0 2px 8px rgba(15,23,42,.05)';
                                 }}>
                                <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${m.color},${m.color}88)`}}/>
                                <div className="avatar" style={{background:`linear-gradient(135deg,${m.color},${m.color}aa)`}}>
                                    {m.initials}
                                </div>
                                <div className="tc-name">{m.name}</div>
                                <div className="tc-role" style={{color:m.color}}>{m.role}</div>
                                <div className="tc-area">{m.area}</div>
                                <div className="tc-socials">
                                    <div className="tc-social"><Linkedin size={14}/></div>
                                    <div className="tc-social"><Github size={14}/></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cta">
                    <div className="cta-inner">
                        <div className="cta-c" style={{width:400,height:400,top:-160,right:-100}}/>
                        <div className="cta-c" style={{width:280,height:280,bottom:-80,left:-60}}/>
                        <div className="cta-badge"><span style={{width:6,height:6,borderRadius:'50%',background:'white',display:'inline-block'}}/>Reach Out</div>
                        <h2 className="cta-h2">Have questions?<br/>We'd love to hear from you.</h2>
                        <p className="cta-p">Whether you're a clinician, researcher, or institution — let's talk.</p>
                        <div className="cta-btns">
                            <a href="mailto:team@diagnovate.com" className="btn-white">Send Us an Email <ArrowRight size={16}/></a>
                            <Link href="/role" className="btn-ow">Try the Platform</Link>
                        </div>
                    </div>
                </div>

                <footer className="footer">
                    <div className="footer-logo">
                        <div className="nav-mark" style={{width:30,height:30,borderRadius:9}}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/></svg>
                        </div>
                        Diagno<span>vate</span>
                    </div>
                    <div className="footer-copy">© 2026 Diagnovate. Advanced AI for thyroid cancer diagnostics.</div>
                </footer>
            </div>
        </>
    );
}