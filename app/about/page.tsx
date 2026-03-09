'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, Brain, Shield, FileText, Heart, ChevronRight } from 'lucide-react';

const LOGO_PATH = "M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z";

const offers = [
  {
    icon: <Brain size={22} color="white" />,
    icBg: 'linear-gradient(135deg,#0D9488,#0891B2)',
    icShadow: '0 6px 20px rgba(13,148,136,0.35)',
    tag: 'AI-Powered',
    tagColor: '#0D9488', tagBg: 'rgba(13,148,136,0.08)', tagBorder: 'rgba(13,148,136,0.2)',
    title: 'AI Diagnosis',
    desc: 'We support clinicians with intelligent analysis of thyroid ultrasound images and structured risk scoring.',
    glow: 'radial-gradient(circle at 80% 110%, rgba(13,148,136,0.1) 0%, transparent 60%)',
  },
  {
    icon: <Shield size={22} color="white" />,
    icBg: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
    icShadow: '0 6px 20px rgba(124,58,237,0.35)',
    tag: 'Secure Access',
    tagColor: '#7C3AED', tagBg: 'rgba(124,58,237,0.08)', tagBorder: 'rgba(124,58,237,0.2)',
    title: 'Doctor Approval Flow',
    desc: 'Secure role-based onboarding, with admin review to ensure verified clinical access.',
    glow: 'radial-gradient(circle at 80% 110%, rgba(124,58,237,0.1) 0%, transparent 60%)',
  },
  {
    icon: <FileText size={22} color="white" />,
    icBg: 'linear-gradient(135deg,#F59E0B,#D97706)',
    icShadow: '0 6px 20px rgba(245,158,11,0.35)',
    tag: 'AI-Assisted',
    tagColor: '#D97706', tagBg: 'rgba(245,158,11,0.08)', tagBorder: 'rgba(245,158,11,0.2)',
    title: 'Reports & Insights',
    desc: 'Generate clear summaries and organize cases to support decisions and documentation.',
    glow: 'radial-gradient(circle at 80% 110%, rgba(245,158,11,0.09) 0%, transparent 60%)',
  },
  {
    icon: <Heart size={22} color="white" />,
    icBg: 'linear-gradient(135deg,#E11D48,#BE123C)',
    icShadow: '0 6px 20px rgba(225,29,72,0.35)',
    tag: 'Patient-First',
    tagColor: '#E11D48', tagBg: 'rgba(225,29,72,0.08)', tagBorder: 'rgba(225,29,72,0.2)',
    title: 'Patient Impact',
    desc: 'Our goal is to improve early detection and streamline the clinical workflow.',
    glow: 'radial-gradient(circle at 80% 110%, rgba(225,29,72,0.09) 0%, transparent 60%)',
  },
];

const stats = [
  { value: '98.7%', label: 'Diagnostic Accuracy', color: '#0D9488' },
  { value: '<2s',   label: 'Analysis Time',        color: '#7C3AED' },
  { value: '4+',    label: 'AI Models',             color: '#F59E0B' },
  { value: '100%',  label: 'Secure & Private',      color: '#E11D48' },
];

export default function AboutPage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

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

        .ab-wrap { min-height: 100vh; background: var(--bg); position: relative; overflow-x: hidden; }

        /* bg dots */
        .ab-wrap::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.4; pointer-events: none; z-index: 0;
        }

        /* blobs */
        .ab-blob1 {
          position: fixed; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 65%);
          top: -250px; right: -200px; pointer-events: none; z-index: 0;
        }
        .ab-blob2 {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 65%);
          bottom: -150px; left: -100px; pointer-events: none; z-index: 0;
        }

        /* NAV */
        .ab-nav {
          position: sticky; top: 0; z-index: 100;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .ab-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; font-weight: 800; font-size: 17px;
          color: var(--text); letter-spacing: -0.3px;
        }
        .ab-logo-mark {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(13,148,136,0.3);
        }
        .ab-logo-accent { color: #0D9488; }
        .ab-nav-links { display: flex; align-items: center; gap: 4px; }
        .ab-nav-link {
          padding: 7px 14px; border-radius: 9px;
          font-size: 13.5px; font-weight: 500; color: var(--muted);
          text-decoration: none; transition: all 0.15s;
        }
        .ab-nav-link:hover { color: var(--text); background: #F1F5F9; }
        .ab-nav-link.active { color: #0D9488; background: #F0FDFA; font-weight: 700; }
        .ab-nav-cta {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          color: white; font-size: 13.5px; font-weight: 700;
          padding: 9px 20px; border-radius: 11px; text-decoration: none;
          box-shadow: 0 4px 16px rgba(13,148,136,0.3);
          transition: all 0.2s;
        }
        .ab-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,0.4); }

        /* MAIN */
        .ab-main { position: relative; z-index: 1; padding: 0 48px 80px; max-width: 1200px; margin: 0 auto; }

        /* HERO */
        .ab-hero {
          padding: 80px 0 64px;
          opacity: 0; transform: translateY(24px);
          transition: all 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .ab-hero.visible { opacity: 1; transform: translateY(0); }

        .ab-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #F0FDFA; border: 1px solid #99F6E4; color: #0D9488;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 6px 14px; border-radius: 100px; margin-bottom: 28px;
        }
        .ab-hero-dot { width: 6px; height: 6px; border-radius: 50%; background: #0D9488; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .ab-hero-h1 {
          font-family: var(--display); font-size: clamp(42px, 6vw, 72px);
          font-weight: 400; color: var(--text); line-height: 1.1;
          letter-spacing: -1px; margin-bottom: 24px;
        }
        .ab-hero-h1 em { color: #0D9488; font-style: italic; }

        .ab-hero-sub {
          font-size: 17px; color: var(--muted); line-height: 1.75;
          max-width: 560px; margin-bottom: 40px;
        }

        /* Stats row */
        .ab-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 16px; margin-bottom: 80px;
          opacity: 0; transform: translateY(20px);
          transition: all 0.7s 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        .ab-stats.visible { opacity: 1; transform: translateY(0); }

        .ab-stat {
          background: white; border: 1px solid var(--border);
          border-radius: 18px; padding: 24px 20px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(15,23,42,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ab-stat:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.1); }
        .ab-stat-val { font-family: var(--display); font-size: 36px; font-weight: 400; line-height: 1; margin-bottom: 8px; }
        .ab-stat-lbl { font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: 0.3px; }

        /* Section label */
        .ab-sec-head {
          display: flex; align-items: center; gap: 14px; margin-bottom: 28px;
        }
        .ab-sec-label {
          font-size: 11px; font-weight: 800; letter-spacing: 2px;
          text-transform: uppercase; color: #0D9488; white-space: nowrap;
        }
        .ab-sec-line { flex: 1; height: 1px; background: linear-gradient(90deg, #E2F7F5, transparent); }

        /* Mission block */
        .ab-mission {
          background: white; border: 1px solid var(--border);
          border-radius: 24px; padding: 52px;
          margin-bottom: 64px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 24px rgba(15,23,42,0.06);
          opacity: 0; transform: translateY(20px);
          transition: all 0.7s 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .ab-mission.visible { opacity: 1; transform: translateY(0); }
        .ab-mission::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #0D9488, #0891B2, #7C3AED);
        }
        .ab-mission-glow {
          position: absolute; width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 65%);
          right: -100px; top: -100px; pointer-events: none;
        }
        .ab-mission-h2 {
          font-family: var(--display); font-size: 32px; font-weight: 400;
          color: var(--text); margin-bottom: 20px; letter-spacing: -0.3px;
        }
        .ab-mission-p {
          font-size: 15.5px; color: var(--text2); line-height: 1.8;
          margin-bottom: 16px; max-width: 640px;
        }
        .ab-mission-p:last-child { margin-bottom: 0; }
        .ab-mission-p strong { color: #0D9488; font-weight: 700; }

        /* Offer cards */
        .ab-offers {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 20px; margin-bottom: 64px;
          opacity: 0; transform: translateY(20px);
          transition: all 0.7s 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .ab-offers.visible { opacity: 1; transform: translateY(0); }

        .ab-offer {
          background: white; border: 1.5px solid #EBF0F5;
          border-radius: 20px; padding: 28px;
          position: relative; overflow: hidden;
          box-shadow: 0 2px 12px rgba(15,23,42,0.04);
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
          cursor: default;
        }
        .ab-offer:hover { transform: translateY(-3px); }
        .ab-offer-glow { position: absolute; inset: 0; pointer-events: none; }
        .ab-offer-ic {
          width: 44px; height: 44px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .ab-offer-tag {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          padding: 4px 10px; border-radius: 100px; margin-bottom: 12px;
        }
        .ab-offer-tag-dot { width: 4px; height: 4px; border-radius: 50%; }
        .ab-offer-title { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .ab-offer-desc  { font-size: 13.5px; color: var(--muted); line-height: 1.65; }

        /* CTA */
        .ab-cta {
          background: linear-gradient(135deg, #0D9488 0%, #0891B2 100%);
          border-radius: 24px; padding: 52px;
          text-align: center; position: relative; overflow: hidden;
          opacity: 0; transform: translateY(20px);
          transition: all 0.7s 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .ab-cta.visible { opacity: 1; transform: translateY(0); }
        .ab-cta::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .ab-cta-h2 {
          font-family: var(--display); font-size: 32px; color: white;
          margin-bottom: 12px; position: relative;
        }
        .ab-cta-sub { font-size: 15px; color: rgba(255,255,255,0.8); margin-bottom: 32px; position: relative; }
        .ab-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; color: #0D9488;
          font-size: 14px; font-weight: 800;
          padding: 13px 28px; border-radius: 13px;
          text-decoration: none; position: relative;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          transition: all 0.2s;
        }
        .ab-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,0,0,0.2); }

        /* Footer */
        .ab-footer {
          position: relative; z-index: 1;
          border-top: 1px solid var(--border);
          padding: 28px 48px;
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.6);
        }
        .ab-footer-logo {
          display: flex; align-items: center; gap: 8px;
          font-weight: 800; font-size: 15px; color: var(--text);
          text-decoration: none;
        }
        .ab-footer-copy { font-size: 12.5px; color: var(--muted); }

        @media (max-width: 900px) {
          .ab-nav { padding: 0 20px; }
          .ab-main { padding: 0 20px 60px; }
          .ab-stats { grid-template-columns: repeat(2,1fr); }
          .ab-offers { grid-template-columns: 1fr; }
          .ab-mission { padding: 32px 24px; }
          .ab-cta { padding: 36px 24px; }
          .ab-footer { flex-direction: column; gap: 12px; padding: 24px 20px; }
          .ab-nav-links { display: none; }
        }
      `}</style>

        <div className="ab-wrap">
          <div className="ab-blob1" /><div className="ab-blob2" />

          {/* NAV */}
          <nav className="ab-nav">
            <Link href="/" className="ab-logo">
              <div className="ab-logo-mark">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d={LOGO_PATH} fill="white" />
                </svg>
              </div>
              DIAGNO<span className="ab-logo-accent">VATE</span>
            </Link>
            <div className="ab-nav-links">
              <Link href="/"        className="ab-nav-link">Home</Link>
              <Link href="/about"   className="ab-nav-link active">About</Link>
              <Link href="/contact" className="ab-nav-link">Contact</Link>
            </div>
            <Link href="/log-in" className="ab-nav-cta">
              Login & Try <ArrowRight size={14} />
            </Link>
          </nav>

          {/* MAIN */}
          <div className="ab-main">

            {/* HERO */}
            <div className={`ab-hero${visible ? ' visible' : ''}`}>
              <div className="ab-hero-badge">
                <span className="ab-hero-dot" />
                About Diagnovate
              </div>
              <h1 className="ab-hero-h1">
                Built for <em>smarter</em><br />thyroid diagnostics.
              </h1>
              <p className="ab-hero-sub">
                Diagnovate is an AI-powered platform designed to support clinicians with thyroid cancer diagnostics — combining image enhancement, structured scoring, and intelligent workflows.
              </p>
            </div>

            {/* STATS */}
            <div className={`ab-stats${visible ? ' visible' : ''}`}>
              {stats.map((s, i) => (
                  <div key={i} className="ab-stat">
                    <div className="ab-stat-val" style={{ color: s.color }}>{s.value}</div>
                    <div className="ab-stat-lbl">{s.label}</div>
                  </div>
              ))}
            </div>

            {/* MISSION */}
            <div className="ab-sec-head">
              <span className="ab-sec-label">Our Mission</span>
              <div className="ab-sec-line" />
            </div>
            <div className={`ab-mission${visible ? ' visible' : ''}`}>
              <div className="ab-mission-glow" />
              <h2 className="ab-mission-h2">Why we built Diagnovate</h2>
              <p className="ab-mission-p">
                Diagnovate was created to bridge the gap between advanced AI capabilities and clinical practice. We aim to help clinicians by improving image clarity, organizing cases, and providing <strong>structured scoring to support clinical decisions</strong>.
              </p>
              <p className="ab-mission-p">
                The system includes role-based access (Admin / Doctor) with approval workflows for secure onboarding — ensuring only verified clinicians can access patient data.
              </p>
              <p className="ab-mission-p">
                Our mission is to combine advanced AI with a clean clinical workflow to <strong>improve outcomes and accelerate early detection</strong> of thyroid cancer.
              </p>
            </div>

            {/* OFFERS */}
            <div className="ab-sec-head">
              <span className="ab-sec-label">What We Offer</span>
              <div className="ab-sec-line" />
            </div>
            <div className={`ab-offers${visible ? ' visible' : ''}`}>
              {offers.map((o, i) => (
                  <div key={i} className="ab-offer"
                       onMouseEnter={e => {
                         (e.currentTarget as HTMLElement).style.borderColor = o.tagColor + '44';
                         (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 48px ${o.tagColor}18`;
                       }}
                       onMouseLeave={e => {
                         (e.currentTarget as HTMLElement).style.borderColor = '#EBF0F5';
                         (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(15,23,42,0.04)';
                       }}
                  >
                    <div className="ab-offer-glow" style={{ background: o.glow }} />
                    <div className="ab-offer-ic" style={{ background: o.icBg, boxShadow: o.icShadow }}>{o.icon}</div>
                    <div className="ab-offer-tag" style={{ background: o.tagBg, color: o.tagColor, border: `1px solid ${o.tagBorder}` }}>
                      <span className="ab-offer-tag-dot" style={{ background: o.tagColor }} />
                      {o.tag}
                    </div>
                    <div className="ab-offer-title">{o.title}</div>
                    <p className="ab-offer-desc">{o.desc}</p>
                  </div>
              ))}
            </div>

            {/* CTA */}
            <div className={`ab-cta${visible ? ' visible' : ''}`}>
              <h2 className="ab-cta-h2">Want to collaborate with us?</h2>
              <p className="ab-cta-sub">Reach out to the team — we'd love to hear from you.</p>
              <Link href="/contact" className="ab-cta-btn">
                Contact the Team <ArrowRight size={15} />
              </Link>
            </div>

          </div>

          {/* FOOTER */}
          <footer className="ab-footer">
            <Link href="/" className="ab-footer-logo">
              <div className="ab-logo-mark" style={{ width:28, height:28, borderRadius:8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d={LOGO_PATH} fill="white" />
                </svg>
              </div>
              DIAGNO<span style={{ color:'#0D9488' }}>VATE</span>
            </Link>
            <span className="ab-footer-copy">© 2026 Diagnovate. Advanced AI for thyroid cancer diagnostics.</span>
          </footer>
        </div>
      </>
  );
}