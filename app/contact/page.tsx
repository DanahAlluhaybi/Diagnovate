'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, Mail, MapPin, Globe } from 'lucide-react';

const LOGO_PATH = "M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z";

const team = [
    {
        initials: 'DA', name: 'Danah Alluhyabi',   role: 'Business Development', email: 'x.x@gmail.com',
        color: '#0D9488', bg: 'linear-gradient(135deg,#0D9488,#0891B2)', shadow: 'rgba(13,148,136,0.3)',
        tagBg: 'rgba(13,148,136,0.08)', tagBorder: 'rgba(13,148,136,0.2)',
    },
    {
        initials: 'RA', name: 'Renad Almazroui',  role: 'Validation Lead',       email: 'renad@gmail.com',
        color: '#7C3AED', bg: 'linear-gradient(135deg,#7C3AED,#6D28D9)', shadow: 'rgba(124,58,237,0.3)',
        tagBg: 'rgba(124,58,237,0.08)', tagBorder: 'rgba(124,58,237,0.2)',
    },
    {
        initials: 'JA', name: 'Jana Alghamdi',    role: 'Technical Lead',        email: 'r.r@gmail.com',
        color: '#F59E0B', bg: 'linear-gradient(135deg,#F59E0B,#D97706)', shadow: 'rgba(245,158,11,0.3)',
        tagBg: 'rgba(245,158,11,0.08)', tagBorder: 'rgba(245,158,11,0.2)',
    },
    {
        initials: 'RA', name: 'Reena Aljahdali',  role: 'Technical Lead',        email: 'r.r@diagnovate.com',
        color: '#E11D48', bg: 'linear-gradient(135deg,#E11D48,#BE123C)', shadow: 'rgba(225,29,72,0.3)',
        tagBg: 'rgba(225,29,72,0.08)', tagBorder: 'rgba(225,29,72,0.2)',
    },
];

export default function ContactPage() {
    const [visible, setVisible] = useState(false);
    useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #F0F4F8; --surface: #FFFFFF; --teal: #0D9488;
          --text: #0F172A; --text2: #334155; --muted: #64748B;
          --border: #E2E8F0;
          --body: 'Plus Jakarta Sans', sans-serif;
          --display: 'DM Serif Display', serif;
        }

        body { background: var(--bg); font-family: var(--body); -webkit-font-smoothing: antialiased; }

        .ct-wrap { min-height: 100vh; background: var(--bg); position: relative; overflow-x: hidden; }

        .ct-wrap::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
          background-size: 28px 28px; opacity: 0.4; pointer-events: none; z-index: 0;
        }
        .ct-blob1 {
          position: fixed; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 65%);
          top: -250px; right: -200px; pointer-events: none; z-index: 0;
        }
        .ct-blob2 {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%);
          bottom: -150px; left: -100px; pointer-events: none; z-index: 0;
        }

        /* NAV */
        .ct-nav {
          position: sticky; top: 0; z-index: 100; height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px;
          background: rgba(255,255,255,0.9); backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .ct-logo {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
          font-weight: 800; font-size: 17px; color: var(--text); letter-spacing: -0.3px;
        }
        .ct-logo-mark {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(13,148,136,0.3);
        }
        .ct-logo-accent { color: #0D9488; }
        .ct-nav-links { display: flex; align-items: center; gap: 4px; }
        .ct-nav-link {
          padding: 7px 14px; border-radius: 9px;
          font-size: 13.5px; font-weight: 500; color: var(--muted);
          text-decoration: none; transition: all 0.15s;
        }
        .ct-nav-link:hover { color: var(--text); background: #F1F5F9; }
        .ct-nav-link.active { color: #0D9488; background: #F0FDFA; font-weight: 700; }
        .ct-nav-cta {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          color: white; font-size: 13.5px; font-weight: 700;
          padding: 9px 20px; border-radius: 11px; text-decoration: none;
          box-shadow: 0 4px 16px rgba(13,148,136,0.3); transition: all 0.2s;
        }
        .ct-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,0.4); }

        /* MAIN */
        .ct-main { position: relative; z-index: 1; padding: 0 48px 80px; max-width: 1200px; margin: 0 auto; }

        /* HERO */
        .ct-hero {
          padding: 80px 0 64px;
          opacity: 0; transform: translateY(24px);
          transition: all 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .ct-hero.visible { opacity: 1; transform: translateY(0); }
        .ct-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #F0FDFA; border: 1px solid #99F6E4; color: #0D9488;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 6px 14px; border-radius: 100px; margin-bottom: 28px;
        }
        .ct-hero-dot { width: 6px; height: 6px; border-radius: 50%; background: #0D9488; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .ct-hero-h1 {
          font-family: var(--display); font-size: clamp(42px, 6vw, 68px);
          font-weight: 400; color: var(--text); line-height: 1.1;
          letter-spacing: -1px; margin-bottom: 24px;
        }
        .ct-hero-h1 em { color: #0D9488; font-style: italic; }
        .ct-hero-sub { font-size: 17px; color: var(--muted); line-height: 1.75; max-width: 520px; }

        /* Info row */
        .ct-info-row {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-bottom: 72px;
          opacity: 0; transform: translateY(20px);
          transition: all 0.7s 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        .ct-info-row.visible { opacity: 1; transform: translateY(0); }
        .ct-info-card {
          background: white; border: 1px solid var(--border); border-radius: 18px;
          padding: 24px; display: flex; align-items: flex-start; gap: 14px;
          box-shadow: 0 2px 12px rgba(15,23,42,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ct-info-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.1); }
        .ct-info-ic {
          width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .ct-info-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .ct-info-val   { font-size: 13px; color: var(--muted); }

        /* Sec head */
        .ct-sec-head { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
        .ct-sec-label {
          font-size: 11px; font-weight: 800; letter-spacing: 2px;
          text-transform: uppercase; color: #0D9488; white-space: nowrap;
        }
        .ct-sec-line { flex: 1; height: 1px; background: linear-gradient(90deg, #E2F7F5, transparent); }

        /* Team grid */
        .ct-team {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 20px; margin-bottom: 64px;
          opacity: 0; transform: translateY(20px);
          transition: all 0.7s 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .ct-team.visible { opacity: 1; transform: translateY(0); }

        .ct-member {
          background: white; border: 1.5px solid #EBF0F5;
          border-radius: 20px; padding: 28px 20px;
          text-align: center;
          position: relative; overflow: hidden;
          box-shadow: 0 2px 12px rgba(15,23,42,0.04);
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .ct-member:hover { transform: translateY(-4px); }
        .ct-member-glow {
          position: absolute; inset: 0; pointer-events: none;
          opacity: 0; transition: opacity 0.3s;
        }
        .ct-member:hover .ct-member-glow { opacity: 1; }

        .ct-member-av {
          width: 64px; height: 64px; border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 800; color: white;
          margin: 0 auto 16px;
        }
        .ct-member-role-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
          padding: 4px 10px; border-radius: 100px; margin-bottom: 12px;
        }
        .ct-member-name {
          font-size: 15px; font-weight: 700; color: var(--text);
          margin-bottom: 4px; line-height: 1.3;
        }
        .ct-member-region {
          font-size: 11.5px; color: var(--muted); margin-bottom: 16px;
          display: flex; align-items: center; justify-content: center; gap: 4px;
        }
        .ct-member-email {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11.5px; font-weight: 600; color: var(--muted);
          text-decoration: none; padding: 7px 14px;
          background: #F8FAFC; border: 1px solid var(--border);
          border-radius: 9px; transition: all 0.18s;
          word-break: break-all;
        }
        .ct-member-email:hover { background: #F0FDFA; color: #0D9488; border-color: #CCFBF1; }

        /* CTA block */
        .ct-cta {
          background: white; border: 1px solid var(--border);
          border-radius: 24px; padding: 52px;
          display: flex; align-items: center; justify-content: space-between; gap: 40px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 24px rgba(15,23,42,0.06);
          opacity: 0; transform: translateY(20px);
          transition: all 0.7s 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .ct-cta.visible { opacity: 1; transform: translateY(0); }
        .ct-cta::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #0D9488, #0891B2, #7C3AED);
        }
        .ct-cta-glow {
          position: absolute; width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.07) 0%, transparent 65%);
          right: -60px; top: -60px; pointer-events: none;
        }
        .ct-cta-h2 {
          font-family: var(--display); font-size: 28px; color: var(--text);
          margin-bottom: 10px; letter-spacing: -0.3px;
        }
        .ct-cta-sub { font-size: 14.5px; color: var(--muted); line-height: 1.65; max-width: 400px; }
        .ct-cta-btn {
          display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          color: white; font-size: 14px; font-weight: 700;
          padding: 14px 28px; border-radius: 13px; text-decoration: none;
          box-shadow: 0 6px 20px rgba(13,148,136,0.3); transition: all 0.2s;
          position: relative;
        }
        .ct-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(13,148,136,0.4); }

        /* FOOTER */
        .ct-footer {
          position: relative; z-index: 1; border-top: 1px solid var(--border);
          padding: 28px 48px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.6);
        }
        .ct-footer-logo {
          display: flex; align-items: center; gap: 8px;
          font-weight: 800; font-size: 15px; color: var(--text); text-decoration: none;
        }
        .ct-footer-copy { font-size: 12.5px; color: var(--muted); }

        @media (max-width: 1024px) { .ct-team { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 900px) {
          .ct-nav { padding: 0 20px; }
          .ct-main { padding: 0 20px 60px; }
          .ct-info-row { grid-template-columns: 1fr; }
          .ct-team { grid-template-columns: repeat(2,1fr); }
          .ct-cta { flex-direction: column; text-align: center; padding: 36px 24px; }
          .ct-footer { flex-direction: column; gap: 12px; padding: 24px 20px; }
          .ct-nav-links { display: none; }
        }
        @media (max-width: 600px) { .ct-team { grid-template-columns: 1fr; } }
      `}</style>

            <div className="ct-wrap">
                <div className="ct-blob1" /><div className="ct-blob2" />

                {/* NAV */}
                <nav className="ct-nav">
                    <Link href="/" className="ct-logo">
                        <div className="ct-logo-mark">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d={LOGO_PATH} fill="white" />
                            </svg>
                        </div>
                        DIAGNO<span className="ct-logo-accent">VATE</span>
                    </Link>
                    <div className="ct-nav-links">
                        <Link href="/"        className="ct-nav-link">Home</Link>
                        <Link href="/about"   className="ct-nav-link">About</Link>
                        <Link href="/contact" className="ct-nav-link active">Contact</Link>
                    </div>
                    <Link href="/log-in" className="ct-nav-cta">
                        Login & Try <ArrowRight size={14} />
                    </Link>
                </nav>

                {/* MAIN */}
                <div className="ct-main">

                    {/* HERO */}
                    <div className={`ct-hero${visible ? ' visible' : ''}`}>
                        <div className="ct-hero-badge">
                            <span className="ct-hero-dot" />
                            Get in Touch
                        </div>
                        <h1 className="ct-hero-h1">
                            Meet the <em>team</em><br />behind Diagnovate.
                        </h1>
                        <p className="ct-hero-sub">
                            Curious about our AI solutions? Looking to collaborate? We'd love to hear from you.
                        </p>
                    </div>

                    {/* INFO ROW */}
                    <div className={`ct-info-row${visible ? ' visible' : ''}`}>
                        {[
                            { icon: <Mail size={18} color="#0D9488" />, icBg: 'rgba(13,148,136,0.1)', icBorder: '#CCFBF1', title: 'Email Us', val: 'team@diagnovate.com' },
                            { icon: <MapPin size={18} color="#7C3AED" />, icBg: 'rgba(124,58,237,0.1)', icBorder: '#EDE9FE', title: 'Location', val: 'Saudi Arabia' },
                            { icon: <Globe size={18} color="#F59E0B" />, icBg: 'rgba(245,158,11,0.1)', icBorder: '#FEF3C7', title: 'Platform', val: 'diagnovate.com' },
                        ].map((item, i) => (
                            <div key={i} className="ct-info-card">
                                <div className="ct-info-ic" style={{ background: item.icBg, border: `1px solid ${item.icBorder}` }}>
                                    {item.icon}
                                </div>
                                <div>
                                    <div className="ct-info-title">{item.title}</div>
                                    <div className="ct-info-val">{item.val}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TEAM */}
                    <div className="ct-sec-head">
                        <span className="ct-sec-label">Our Team</span>
                        <div className="ct-sec-line" />
                    </div>
                    <div className={`ct-team${visible ? ' visible' : ''}`}>
                        {team.map((m, i) => (
                            <div key={i} className="ct-member"
                                 onMouseEnter={e => {
                                     (e.currentTarget as HTMLElement).style.borderColor = m.color + '44';
                                     (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 48px ${m.color}18`;
                                 }}
                                 onMouseLeave={e => {
                                     (e.currentTarget as HTMLElement).style.borderColor = '#EBF0F5';
                                     (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(15,23,42,0.04)';
                                 }}
                            >
                                <div className="ct-member-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${m.color}12 0%, transparent 70%)` }} />
                                <div className="ct-member-av" style={{ background: m.bg, boxShadow: `0 8px 24px ${m.shadow}` }}>
                                    {m.initials}
                                </div>
                                <div className="ct-member-role-tag" style={{ background: m.tagBg, color: m.color, border: `1px solid ${m.tagBorder}` }}>
                                    {m.role}
                                </div>
                                <div className="ct-member-name">{m.name}</div>
                                <div className="ct-member-region">
                                    <MapPin size={11} /> {/* region */} Saudi Arabia
                                </div>
                                <a href={`mailto:${m.email}`} className="ct-member-email">
                                    <Mail size={11} /> {m.email}
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className={`ct-cta${visible ? ' visible' : ''}`}>
                        <div className="ct-cta-glow" />
                        <div>
                            <h2 className="ct-cta-h2">Interested in collaborating?</h2>
                            <p className="ct-cta-sub">Whether you're exploring partnership opportunities or seeking more information about our AI tools, we'd love to connect.</p>
                        </div>
                        <a href="mailto:team@diagnovate.com" className="ct-cta-btn">
                            Send us an Email <ArrowRight size={15} />
                        </a>
                    </div>

                </div>

                {/* FOOTER */}
                <footer className="ct-footer">
                    <Link href="/" className="ct-footer-logo">
                        <div className="ct-logo-mark" style={{ width:28, height:28, borderRadius:8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d={LOGO_PATH} fill="white" />
                            </svg>
                        </div>
                        DIAGNO<span style={{ color:'#0D9488' }}>VATE</span>
                    </Link>
                    <span className="ct-footer-copy">© 2026 Diagnovate. Advanced AI for thyroid cancer diagnostics.</span>
                </footer>
            </div>
        </>
    );
}