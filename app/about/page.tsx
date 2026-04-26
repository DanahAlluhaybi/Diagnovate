// About page — mission statement, platform stats, feature breakdown, CTA, and footer. Public-facing, no auth required.
'use client';

import Link from 'next/link';
import { ArrowRight, Target, Microscope, ShieldCheck, Cpu, CheckCircle2 } from 'lucide-react';

const stats = [
  { val: '98.7%', lbl: 'Diagnostic Accuracy', sub: 'Validated across clinical trials' },
  { val: '< 2s',  lbl: 'Analysis Speed',       sub: 'Real-time AI processing'         },
  { val: '5',     lbl: 'AI Modules',            sub: 'Fully integrated workflow'       },
  { val: '2026',  lbl: 'Launched',              sub: 'Built for modern pathology'      },
];

const offer = [
  {
    icon: <Microscope size={22}/>, color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4',
    title: 'Automated Image Enhancement',
    desc: 'Transforms low-quality ultrasound scans into clinically actionable images using our proprietary AI pipeline.',
    points: ['Noise reduction & contrast boost','Edge sharpening for nodule boundaries','Instant before/after comparison'],
  },
  {
    icon: <Cpu size={22}/>, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
    title: 'Context-Aware AI Diagnostics',
    desc: 'Our AI understands patient history, scan type, and clinical guidelines — not just pixels.',
    points: ['Follows ICCR, WHO & TI-RADS','Bethesda III decision support','Explainable recommendations'],
  },
  {
    icon: <ShieldCheck size={22}/>, color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD',
    title: 'HIPAA-Compliant Security',
    desc: 'Every scan, every result, every note — encrypted end-to-end with full audit trails.',
    points: ['End-to-end encryption','Full audit logging','Role-based access control'],
  },
  {
    icon: <Target size={22}/>, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A',
    title: 'Clinician-First Workflow',
    desc: 'Designed with pathologists, not around algorithms. Every screen was user-tested by clinicians.',
    points: ['1-click feedback loop','Customizable model selection','Integrates with existing EHR'],
  },
];

export default function AboutPage() {
  return (
      <>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --teal:#0D9488;--teal-light:#F0FDFA;--teal-ring:#99F6E4;--teal-muted:#CCFBF1;
          --sky:#0891B2;--purple:#7C3AED;--amber:#F59E0B;
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

        .hero{padding:80px 48px 60px;max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
        .badge{display:inline-flex;align-items:center;gap:7px;background:var(--teal-light);border:1px solid var(--teal-ring);color:var(--teal);font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:6px 14px;border-radius:100px;margin-bottom:22px;width:fit-content;animation:fadeUp .6s ease both}
        .badge-dot{width:7px;height:7px;border-radius:50%;background:var(--teal);animation:blink 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(13,148,136,.2)}
        .h1{font-family:var(--display);font-size:clamp(40px,5vw,62px);font-weight:400;line-height:1.08;letter-spacing:-1px;margin-bottom:20px;animation:fadeUp .6s .1s ease both}
        .h1 em{font-style:italic;background:linear-gradient(120deg,#0D9488,#7C3AED);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .sub{font-size:16px;line-height:1.7;color:var(--muted);margin-bottom:36px;animation:fadeUp .6s .2s ease both}
        .btn-p{display:inline-flex;align-items:center;gap:8px;background:var(--grad);color:white;font-family:var(--body);font-size:14.5px;font-weight:700;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;text-decoration:none;transition:all .22s;box-shadow:0 6px 20px rgba(13,148,136,.3)}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(13,148,136,.4)}
        .btn-g{display:inline-flex;align-items:center;gap:8px;background:white;color:var(--text);font-family:var(--body);font-size:14.5px;font-weight:500;padding:12px 24px;border-radius:12px;border:1.5px solid var(--border);cursor:pointer;text-decoration:none;transition:all .22s;box-shadow:0 2px 8px rgba(0,0,0,.05)}
        .btn-g:hover{border-color:#CBD5E1;transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.09)}
        .btns{display:flex;gap:12px;animation:fadeUp .6s .3s ease both}

        .hero-side{animation:fadeUp .7s .15s ease both}
        .mission-card{background:white;border:1px solid var(--border);border-radius:22px;padding:32px;box-shadow:0 8px 32px rgba(15,23,42,.09);position:relative;overflow:hidden}
        .mission-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad)}
        .mc-label{font-size:10.5px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--teal);margin-bottom:16px;display:flex;align-items:center;gap:8px}
        .mc-label::after{content:'';flex:1;height:1px;background:var(--teal-muted)}
        .mc-h3{font-family:var(--display);font-size:26px;color:var(--text);margin-bottom:14px;line-height:1.2}
        .mc-p{font-size:14px;color:var(--muted);line-height:1.75}
        .mc-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
        .chip{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:5px 12px;font-size:12px;font-weight:600;color:var(--text2)}

        .stats-wrap{padding:0 48px 64px;position:relative;z-index:1}
        .stats-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .stat-card{background:white;border:1px solid var(--border);border-radius:18px;padding:26px 22px;text-align:center;box-shadow:0 2px 8px rgba(15,23,42,.05);transition:all .25s}
        .stat-card:hover{border-color:var(--teal-ring);transform:translateY(-4px);box-shadow:0 14px 44px rgba(13,148,136,.12)}
        .stat-val{font-family:var(--display);font-size:38px;font-weight:400;letter-spacing:-2px;color:var(--text);line-height:1;margin-bottom:6px}
        .stat-lbl{font-size:13px;font-weight:700;color:var(--text2);margin-bottom:4px}
        .stat-sub{font-size:11.5px;color:var(--subtle)}

        .offer-wrap{padding:0 48px 80px;position:relative;z-index:1}
        .sec-head{max-width:1200px;margin:0 auto 48px;display:flex;align-items:center;gap:14px}
        .sec-label{font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--teal);white-space:nowrap}
        .sec-line{flex:1;height:1px;background:linear-gradient(to right,var(--teal-muted),transparent)}
        .offer-grid{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .offer-card{background:white;border:1.5px solid var(--border);border-radius:20px;padding:28px;transition:all .25s;box-shadow:0 2px 8px rgba(15,23,42,.05)}
        .offer-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(15,23,42,.1)}
        .oc-icon{width:50px;height:50px;border-radius:15px;display:flex;align-items:center;justify-content:center;margin-bottom:18px}
        .oc-h3{font-family:var(--display);font-size:21px;color:var(--text);margin-bottom:10px;line-height:1.2}
        .oc-p{font-size:14px;color:var(--muted);line-height:1.65;margin-bottom:18px}
        .oc-pts{display:flex;flex-direction:column;gap:8px}
        .oc-pt{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:500;color:var(--text2)}

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
          .hero{grid-template-columns:1fr;gap:40px;padding:60px 20px 40px}
          .stats-grid{grid-template-columns:repeat(2,1fr)}
          .offer-grid{grid-template-columns:1fr}
          .stats-wrap,.offer-wrap,.cta{padding-left:20px;padding-right:20px}
          .cta-inner{padding:48px 24px}
          .footer{flex-direction:column;gap:12px;text-align:center;padding:24px 20px}
          .nav{padding:0 20px}
        }
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
            <Link href="/about" className="nav-link active">About</Link>
            <Link href="/contact" className="nav-link">Contact</Link>
            <Link href="/role" className="nav-cta">Login & Try <ArrowRight size={14}/></Link>
          </div>
        </nav>

        <div className="page">
          <div style={{position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(13,148,136,.1) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none'}}/>
            <div style={{position:'absolute',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,.07) 0%,transparent 65%)',bottom:-80,left:-80,pointerEvents:'none'}}/>
            <div className="hero">
              <div>
                <div className="badge"><span className="badge-dot"/>Our Mission</div>
                <h1 className="h1">Built for the<br/><em>future of</em><br/>pathology.</h1>
                <p className="sub">Diagnovate is a clinical AI platform designed to eliminate diagnostic uncertainty in thyroid cancer — starting with the tools pathologists actually need.</p>
                <div className="btns">
                  <Link href="/role" className="btn-p">Try the Platform <ArrowRight size={16}/></Link>
                  <Link href="/contact" className="btn-g">Meet the Team</Link>
                </div>
              </div>
              <div className="hero-side">
                <div className="mission-card">
                  <div className="mc-label">Our Mission</div>
                  <h3 className="mc-h3">Precision diagnostics, accessible to every clinician.</h3>
                  <p className="mc-p">Thyroid cancer affects millions worldwide. Our mission is to give every pathologist — regardless of institution size or resources — access to AI diagnostic tools that rival the best centres in the world.</p>
                  <div className="mc-chips">
                    {['TI-RADS Compliant','WHO Guidelines','ICCR Standards','HIPAA Secure','Real-Time AI'].map(c=>(
                        <span key={c} className="chip">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-wrap">
            <div className="stats-grid">
              {stats.map(s=>(
                  <div key={s.val} className="stat-card">
                    <div className="stat-val">{s.val}</div>
                    <div className="stat-lbl">{s.lbl}</div>
                    <div className="stat-sub">{s.sub}</div>
                  </div>
              ))}
            </div>
          </div>

          <div className="offer-wrap">
            <div className="sec-head">
              <span className="sec-label">What We Offer</span>
              <div className="sec-line"/>
            </div>
            <div className="offer-grid">
              {offer.map(o=>(
                  <div key={o.title} className="offer-card" style={{'--hc':o.color} as React.CSSProperties}
                       onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=o.border}}
                       onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor='var(--border)'}}>
                    <div className="oc-icon" style={{background:o.bg,border:`1px solid ${o.border}`,color:o.color}}>{o.icon}</div>
                    <h3 className="oc-h3">{o.title}</h3>
                    <p className="oc-p">{o.desc}</p>
                    <div className="oc-pts">
                      {o.points.map(p=>(
                          <div key={p} className="oc-pt">
                            <CheckCircle2 size={15} style={{color:o.color,flexShrink:0}}/> {p}
                          </div>
                      ))}
                    </div>
                  </div>
              ))}
            </div>
          </div>

          <div className="cta">
            <div className="cta-inner">
              <div className="cta-c" style={{width:400,height:400,top:-160,right:-100}}/>
              <div className="cta-c" style={{width:280,height:280,bottom:-80,left:-60}}/>
              <div className="cta-badge"><span style={{width:6,height:6,borderRadius:'50%',background:'white',display:'inline-block'}}/>Join Us</div>
              <h2 className="cta-h2">Diagnose with confidence.<br/>Every time.</h2>
              <p className="cta-p">Experience the platform that's changing how thyroid diagnostics work.</p>
              <div className="cta-btns">
                <Link href="/role" className="btn-white">Get Started <ArrowRight size={16}/></Link>
                <Link href="/contact" className="btn-ow">Contact the Team</Link>
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