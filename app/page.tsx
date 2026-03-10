'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
    Scan, Brain, GitBranch, MessageSquare, Layers,
    ArrowRight, Activity, Shield, Zap, ChevronRight, CheckCircle2,
} from 'lucide-react';

const features = [
    {
        id: 1, category: 'Image Enhancement', fullName: 'Automated Medical Image Enhancement',
        icon: <Scan size={20} />, color: '#0D9488', lightBg: '#F0FDFA', border: '#99F6E4',
        description: 'Transform blurry ultrasound images into crystal-clear diagnostic quality in real-time.',
        points: ['Enhances contrast to make thyroid nodules clearly visible','Removes noise and graininess from ultrasound scans','Sharpens edges for precise boundary detection','Shows before/after comparison instantly','Alerts you if image quality needs improvement'],
    },
    {
        id: 2, category: 'Smart Diagnostics', fullName: 'Context-Aware Diagnostic Recommendations',
        icon: <Brain size={20} />, color: '#7C3AED', lightBg: '#F5F3FF', border: '#DDD6FE',
        description: 'AI that thinks like a pathologist — analyzing images, patient history, and guidelines together.',
        points: ['Suggests next steps based on patient\'s specific case','Follows ICCR, WHO, and hospital protocols automatically','Explains why each recommendation is made','Especially helpful for unclear cases (Bethesda III)'],
    },
    {
        id: 3, category: 'Model Control', fullName: 'Model Selection & Execution Control',
        icon: <GitBranch size={20} />, color: '#0EA5E9', lightBg: '#F0F9FF', border: '#BAE6FD',
        description: 'Choose your AI assistant — let it work automatically or pick specific models yourself.',
        points: ['Auto-selects the right AI models for your image type','Or manually choose which algorithms to run','Remembers your preferences for next time','Runs multiple models at once for better accuracy'],
    },
    {
        id: 4, category: 'Clinician Feedback', fullName: 'Structured Clinician Feedback',
        icon: <MessageSquare size={20} />, color: '#F59E0B', lightBg: '#FFFBEB', border: '#FDE68A',
        description: 'Your expertise makes our AI smarter — flag issues and help us improve.',
        points: ['One-click flagging when AI gets it wrong','Choose from common issue categories','Add notes to explain complex cases','Every feedback helps retrain better models'],
    },
    {
        id: 5, category: 'Result Aggregation', fullName: 'Result Aggregation & Presentation',
        icon: <Layers size={20} />, color: '#EF4444', lightBg: '#FFF1F2', border: '#FECDD3',
        description: 'Never miss a diagnosis — see what multiple AI models agree on at a glance.',
        points: ['Combines results from all AI models automatically','Shows consensus score when models agree','Still lets you see each model\'s individual opinion','Know exactly which data each model used'],
    },
];

export default function HomePage() {
    const [active, setActive] = useState(0);
    const af = features[active];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #F0F4F8; --surface: #fff; --surface2: #F8FAFC;
          --teal: #0D9488; --teal-light: #F0FDFA; --teal-ring: #99F6E4; --teal-muted: #CCFBF1;
          --sky: #0891B2; --purple: #7C3AED; --amber: #F59E0B; --red: #EF4444;
          --text: #0F172A; --text2: #334155; --muted: #64748B; --subtle: #94A3B8; --border: #E2E8F0;
          --display: 'DM Serif Display', serif; --body: 'Plus Jakarta Sans', sans-serif;
          --grad: linear-gradient(135deg, #0D9488, #0891B2);
          --shadow-brand: 0 6px 20px rgba(13,148,136,0.28);
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: var(--body); overflow-x: hidden; -webkit-font-smoothing: antialiased; }
        body::before {
          content: ''; position: fixed; inset: 0;
          background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
          background-size: 28px 28px; opacity: 0.45; pointer-events: none; z-index: 0;
        }

        /* NAV */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 68px;
          display: flex; align-items: center; justify-content: space-between; padding: 0 48px;
          background: rgba(255,255,255,0.9); backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
        }
        .nav-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; color: var(--text); }
        .nav-mark {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(145deg,#0D9488,#0891B2,#0369A1);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 6px 18px rgba(13,148,136,0.32), inset 0 1px 0 rgba(255,255,255,0.18);
          position: relative;
        }
        .nav-mark-ring {
          position: absolute; inset: -3px; border-radius: 15px;
          border: 1.5px solid rgba(13,148,136,0.22);
          animation: ringPulse 3.5s ease-in-out infinite;
        }
        .nav-wordmark {
          font-family: var(--display); font-size: 20px; font-weight: 400; letter-spacing: -0.3px;
        }
        .nav-wordmark span { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          padding: 7px 14px; border-radius: 9px;
          font-size: 13.5px; font-weight: 500; color: var(--muted);
          text-decoration: none; transition: all 0.15s;
        }
        .nav-link:hover { color: var(--text); background: #F1F5F9; }
        .nav-link.active { color: var(--teal); background: var(--teal-light); font-weight: 700; }
        .nav-cta {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--grad); color: white;
          font-size: 13.5px; font-weight: 700;
          padding: 9px 20px; border-radius: 11px; text-decoration: none;
          box-shadow: 0 4px 16px rgba(13,148,136,0.3); transition: all 0.2s;
        }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,0.4); }

        /* PAGE */
        .page { position: relative; z-index: 1; }

        /* HERO */
        .hero { min-height: 100vh; padding: 108px 48px 80px; display: flex; align-items: center; position: relative; overflow: hidden; }
        .blob1 { position: absolute; width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(13,148,136,0.11) 0%, transparent 65%); top: -200px; right: -100px; pointer-events: none; }
        .blob2 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 65%); bottom: -100px; left: -100px; pointer-events: none; }
        .blob3 { position: absolute; width: 320px; height: 320px; border-radius: 50%; background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%); top: 32%; left: 38%; pointer-events: none; }

        .hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }

        .badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--teal-light); border: 1px solid var(--teal-ring);
          color: var(--teal); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 6px 14px; border-radius: 100px; margin-bottom: 22px; width: fit-content;
          animation: fadeUp 0.6s ease both;
        }
        .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--teal); animation: blink 2s ease-in-out infinite; box-shadow: 0 0 0 3px rgba(13,148,136,0.2); }

        .hero-h1 {
          font-family: var(--display); font-size: clamp(44px, 5.5vw, 72px); font-weight: 400;
          line-height: 1.08; letter-spacing: -1px; color: var(--text); margin-bottom: 22px;
          animation: fadeUp 0.6s 0.1s ease both;
        }
        .hero-h1 .line2 { display: block; font-style: italic; }
        .grad-text {
          background: linear-gradient(120deg, #0D9488 0%, #7C3AED 55%, #F59E0B 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub { font-size: 17px; line-height: 1.7; color: var(--text2); margin-bottom: 40px; max-width: 460px; animation: fadeUp 0.6s 0.2s ease both; }
        .btns { display: flex; gap: 12px; animation: fadeUp 0.6s 0.3s ease both; }
        .btn-p {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--grad); color: white; font-family: var(--body); font-size: 15px; font-weight: 700;
          padding: 13px 26px; border-radius: 12px; border: none; cursor: pointer; text-decoration: none;
          transition: all 0.22s; box-shadow: 0 6px 20px rgba(13,148,136,0.3);
        }
        .btn-p:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(13,148,136,0.4); }
        .btn-g {
          display: inline-flex; align-items: center; gap: 8px;
          background: white; color: var(--text); font-family: var(--body); font-size: 15px; font-weight: 500;
          padding: 13px 26px; border-radius: 12px; border: 1.5px solid var(--border); cursor: pointer;
          text-decoration: none; transition: all 0.22s; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .btn-g:hover { border-color: #CBD5E1; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }

        /* HERO VISUAL */
        .hero-visual { position: relative; animation: fadeUp 0.7s 0.15s ease both; }
        .illus-card { background: white; border-radius: 22px; border: 1px solid var(--border); box-shadow: 0 28px 72px rgba(15,23,42,0.13); overflow: hidden; }
        .illus-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; background: var(--surface2); }
        .illus-header-left { display: flex; align-items: center; gap: 12px; }
        .illus-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--teal-light); border: 1px solid var(--teal-ring); display: flex; align-items: center; justify-content: center; }
        .illus-live { display: flex; align-items: center; gap: 6px; background: #FFF1F2; border: 1px solid #FECDD3; color: var(--red); font-size: 10px; font-weight: 800; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 6px; }
        .illus-live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--red); animation: blink 1.2s ease-in-out infinite; }
        .illus-ai-row { padding: 14px 20px; border-top: 1px solid var(--border); display: flex; align-items: center; background: var(--surface2); }
        .illus-ai-item { flex: 1; text-align: center; }
        .illus-ai-label { font-size: 10px; color: var(--muted); font-weight: 500; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
        .illus-ai-val { font-size: 16px; font-weight: 800; font-family: var(--display); letter-spacing: -0.3px; }
        .illus-divider { width: 1px; height: 32px; background: var(--border); flex-shrink: 0; }
        .illus-ai-badge { background: var(--grad); color: white; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; letter-spacing: 1px; margin-left: 12px; }

        .fbadge { position: absolute; background: white; border: 1px solid var(--border); border-radius: 16px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 12px 40px rgba(15,23,42,0.12); z-index: 5; }
        .fb1 { bottom: -18px; left: -28px; animation: fltA 4s ease-in-out infinite; }
        .fb2 { top: 20px; right: -28px; animation: fltB 4s 1.2s ease-in-out infinite; }
        .fbi { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fblbl { font-size: 11px; color: var(--muted); margin-bottom: 2px; }
        .fbval { font-size: 16px; font-weight: 800; font-family: var(--display); letter-spacing: -0.5px; }

        /* TRUST STRIP */
        .trust { position: relative; z-index: 1; padding: 20px 48px 56px; }
        .trust-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 40px; }
        .trust-label { font-size: 11px; color: var(--muted); font-weight: 700; white-space: nowrap; letter-spacing: 1px; text-transform: uppercase; }
        .trust-line { flex: 1; height: 1px; background: var(--border); }
        .trust-badges { display: flex; gap: 10px; }
        .trust-badge { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 6px 14px; font-size: 11.5px; font-weight: 700; color: var(--muted); letter-spacing: 0.5px; }

        /* STATS */
        .stats { padding: 0 48px 72px; position: relative; z-index: 1; }
        .stats-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .stat-card {
          background: white; border: 1px solid var(--border); border-radius: 18px;
          padding: 28px 30px; display: flex; align-items: center; gap: 18px;
          transition: all 0.28s; cursor: default; box-shadow: 0 2px 8px rgba(15,23,42,0.05);
        }
        .stat-card:hover { border-color: var(--teal-ring); transform: translateY(-4px); box-shadow: 0 16px 48px rgba(13,148,136,0.12); }
        .stat-ic { width: 48px; height: 48px; border-radius: 14px; background: var(--teal-light); border: 1px solid var(--teal-muted); display: flex; align-items: center; justify-content: center; color: var(--teal); flex-shrink: 0; }
        .stat-val { font-family: var(--display); font-size: 32px; font-weight: 400; letter-spacing: -1.5px; color: var(--text); line-height: 1; }
        .stat-lbl { font-size: 13px; color: var(--muted); margin-top: 4px; }

        /* FEATURES */
        .features { padding: 80px 48px; position: relative; z-index: 1; }
        .sec-label { text-align: center; font-size: 11px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: var(--teal); margin-bottom: 14px; }
        .sec-h2 { font-family: var(--display); font-size: clamp(32px,4vw,52px); font-weight: 400; text-align: center; letter-spacing: -0.5px; color: var(--text); margin-bottom: 16px; }
        .sec-p { text-align: center; font-size: 16px; color: var(--muted); max-width: 500px; margin: 0 auto 64px; line-height: 1.65; }

        .feat-layout { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; }
        .tabs { display: flex; flex-direction: column; gap: 8px; position: sticky; top: 88px; }
        .tab {
          background: white; border: 1.5px solid var(--border); border-radius: 16px; padding: 15px 18px;
          cursor: pointer; text-align: left; display: flex; align-items: center; gap: 13px;
          font-family: var(--body); transition: all 0.22s; box-shadow: 0 2px 6px rgba(15,23,42,0.04);
        }
        .tab:hover { border-color: #CBD5E1; box-shadow: 0 4px 16px rgba(15,23,42,0.08); transform: translateX(2px); }
        .tab-ic { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.22s; }
        .tab-cat { font-size: 10px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 3px; }
        .tab-name { font-size: 12.5px; font-weight: 500; color: var(--muted); line-height: 1.35; }
        .tab.active .tab-name { color: var(--text); font-weight: 600; }
        .tab-arr { margin-left: auto; transition: all 0.2s; flex-shrink: 0; opacity: 0; }
        .tab:hover .tab-arr, .tab.active .tab-arr { opacity: 1; }

        .panel { background: white; border: 1.5px solid var(--border); border-radius: 22px; overflow: hidden; box-shadow: 0 4px 24px rgba(15,23,42,0.08); }
        .panel-top { padding: 36px 40px 28px; position: relative; border-bottom: 1px solid var(--border); }
        .panel-num { position: absolute; top: 24px; right: 36px; font-family: var(--display); font-size: 72px; opacity: 0.05; letter-spacing: -4px; line-height: 1; color: var(--text); }
        .panel-icon-wrap { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .panel-tag { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 14px; }
        .panel-h3 { font-family: var(--display); font-size: 28px; font-weight: 400; letter-spacing: -0.3px; margin-bottom: 12px; color: var(--text); }
        .panel-desc { font-size: 15px; color: var(--muted); line-height: 1.7; }
        .panel-pts { padding: 28px 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pt { display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px; border-radius: 13px; border: 1px solid var(--border); background: var(--surface2); transition: all 0.2s; }
        .pt:hover { border-color: #CBD5E1; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(15,23,42,0.07); }
        .pt-txt { font-size: 13.5px; color: var(--text2); line-height: 1.5; }

        /* CTA */
        .cta { padding: 80px 48px 100px; position: relative; z-index: 1; }
        .cta-inner { max-width: 1200px; margin: 0 auto; background: linear-gradient(135deg, #0D9488 0%, #0891B2 50%, #7C3AED 100%); border-radius: 28px; padding: 80px 72px; text-align: center; position: relative; overflow: hidden; }
        .cta-c1 { position: absolute; width: 400px; height: 400px; border-radius: 50%; background: rgba(255,255,255,0.06); top: -150px; right: -100px; }
        .cta-c2 { position: absolute; width: 300px; height: 300px; border-radius: 50%; background: rgba(255,255,255,0.05); bottom: -100px; left: -80px; }
        .cta-badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: white; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; margin: 0 auto 24px; width: fit-content; position: relative; }
        .cta-h2 { font-family: var(--display); font-size: clamp(30px,4vw,52px); font-weight: 400; letter-spacing: -0.5px; color: white; margin-bottom: 18px; position: relative; }
        .cta-p { font-size: 17px; color: rgba(255,255,255,0.75); margin-bottom: 40px; position: relative; }
        .cta-btns { display: flex; gap: 14px; justify-content: center; position: relative; }
        .btn-white { display: inline-flex; align-items: center; gap: 8px; background: white; color: var(--teal); font-family: var(--body); font-size: 15px; font-weight: 700; padding: 13px 28px; border-radius: 12px; border: none; cursor: pointer; text-decoration: none; transition: all 0.22s; box-shadow: 0 6px 24px rgba(0,0,0,0.15); }
        .btn-white:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.2); }
        .btn-outline-white { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: white; font-family: var(--body); font-size: 15px; font-weight: 600; padding: 13px 28px; border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.35); cursor: pointer; text-decoration: none; transition: all 0.22s; }
        .btn-outline-white:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); }

        /* FOOTER */
        .footer { position: relative; z-index: 1; border-top: 1px solid var(--border); padding: 28px 48px; display: flex; align-items: center; justify-content: space-between; background: white; }
        .footer-logo { display: flex; align-items: center; gap: 9px; font-family: var(--display); font-size: 18px; color: var(--text); }
        .footer-logo span { background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .footer-copy { font-size: 13px; color: var(--muted); }

        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fltA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fltB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes ringPulse { 0%,100%{opacity:0.35;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.07)} }

        @media (max-width: 960px) {
          .hero-inner, .feat-layout { grid-template-columns: 1fr; gap: 48px; }
          .tabs { flex-direction: row; flex-wrap: wrap; position: static; }
          .tab { flex: 1; min-width: 140px; }
          .stats-grid { grid-template-columns: 1fr; }
          .panel-pts { grid-template-columns: 1fr; }
          .nav, .hero, .stats, .features, .cta, .trust { padding-left: 20px; padding-right: 20px; }
          .cta-inner { padding: 52px 28px; }
          .footer { flex-direction: column; gap: 14px; text-align: center; padding: 24px 20px; }
          .fb1, .fb2 { display: none; }
        }
      `}</style>

            {/* NAV */}
            <nav className="nav">
                <Link href="/" className="nav-logo">
                    <div className="nav-mark">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
                        </svg>
                        <span className="nav-mark-ring" />
                    </div>
                    <span className="nav-wordmark">Diagno<span>vate</span></span>
                </Link>
                <div className="nav-links">
                    <Link href="/" className="nav-link active">Home</Link>
                    <Link href="/about" className="nav-link">About</Link>
                    <Link href="/contact" className="nav-link">Contact</Link>
                    <Link href="/role" className="nav-cta">Login & Try <ArrowRight size={14}/></Link>
                </div>
            </nav>

            <div className="page">

                {/* HERO */}
                <section className="hero">
                    <div className="blob1"/><div className="blob2"/><div className="blob3"/>
                    <div className="hero-inner">
                        <div>
                            <div className="badge"><span className="badge-dot"/>AI Thyroid Diagnostics Platform</div>
                            <h1 className="hero-h1">
                                Smarter
                                <span className="line2"><span className="grad-text">Thyroid</span></span>
                                Diagnosis.
                            </h1>
                            <p className="hero-sub">Web platform combining AI image enhancement, diagnostic intelligence, and clinical workflows into one unified system.</p>
                            <div className="btns">
                                <Link href="/role" className="btn-p">Get Started <ArrowRight size={16}/></Link>
                                <Link href="/contact" className="btn-g">Contact Us</Link>
                            </div>
                        </div>

                        <div className="hero-visual">
                            <div style={{position:'relative'}}>
                                <div className="illus-card">
                                    <div className="illus-header">
                                        <div className="illus-header-left">
                                            <div className="illus-avatar">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#0D9488"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/></svg>
                                            </div>
                                            <div>
                                                <div style={{fontSize:13,fontWeight:700,color:'#0F172A'}}>Patient #TH-2847</div>
                                                <div style={{fontSize:11,color:'#64748B'}}>Thyroid Scan · Live Analysis</div>
                                            </div>
                                        </div>
                                        <div className="illus-live"><span className="illus-live-dot"/>LIVE</div>
                                    </div>
                                    <svg width="100%" viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <radialGradient id="scanBg" cx="50%" cy="50%"><stop offset="0%" stopColor="#0D9488" stopOpacity="0.08"/><stop offset="100%" stopColor="#F0FDFA" stopOpacity="0"/></radialGradient>
                                            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                                        </defs>
                                        <rect width="380" height="200" fill="#0A1628" rx="4"/>
                                        <rect width="380" height="200" fill="url(#scanBg)"/>
                                        {[40,80,120,160,200,240,280,320,360].map(x=><line key={x} x1={x} y1="0" x2={x} y2="200" stroke="#1E3A5F" strokeWidth="0.5" strokeOpacity="0.5"/>)}
                                        {[40,80,120,160].map(y=><line key={y} x1="0" y1={y} x2="380" y2={y} stroke="#1E3A5F" strokeWidth="0.5" strokeOpacity="0.5"/>)}
                                        <ellipse cx="155" cy="105" rx="52" ry="68" fill="#0D9488" fillOpacity="0.18" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.6"/>
                                        <ellipse cx="225" cy="105" rx="52" ry="68" fill="#0D9488" fillOpacity="0.18" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.6"/>
                                        <rect x="155" y="90" width="70" height="30" rx="12" fill="#0D9488" fillOpacity="0.12" stroke="#0D9488" strokeWidth="1" strokeOpacity="0.4"/>
                                        <circle cx="170" cy="98" r="18" fill="#EF4444" fillOpacity="0.25" stroke="#EF4444" strokeWidth="2" strokeOpacity="0.8" filter="url(#glow)"/>
                                        <circle cx="170" cy="98" r="10" fill="#EF4444" fillOpacity="0.45"/>
                                        <circle cx="170" cy="98" r="5" fill="#EF4444" fillOpacity="0.8"/>
                                        <circle cx="230" cy="115" r="10" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1.5"/>
                                        <circle cx="230" cy="115" r="5" fill="#F59E0B" fillOpacity="0.6"/>
                                        <line x1="0" y1="0" x2="380" y2="0" stroke="#0D9488" strokeWidth="2" strokeOpacity="0.9">
                                            <animateTransform attributeName="transform" type="translate" values="0,10;0,195;0,10" dur="3s" repeatCount="indefinite"/>
                                        </line>
                                        <line x1="152" y1="98" x2="188" y2="98" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.9" strokeDasharray="4 3"/>
                                        <line x1="170" y1="80" x2="170" y2="116" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.9" strokeDasharray="4 3"/>
                                        <rect x="186" y="85" width="80" height="20" rx="4" fill="#EF4444" fillOpacity="0.15"/>
                                        <text x="226" y="99" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="700" fontFamily="monospace">NODULE 1.8cm</text>
                                        <rect x="200" y="122" width="60" height="18" rx="4" fill="#F59E0B" fillOpacity="0.15"/>
                                        <text x="230" y="134" textAnchor="middle" fill="#F59E0B" fontSize="9" fontWeight="600" fontFamily="monospace">BENIGN</text>
                                        <text x="8" y="15" fill="#0D9488" fontSize="9" fontFamily="monospace" opacity="0.7">THYROID SCAN</text>
                                        <text x="310" y="15" fill="#64748B" fontSize="9" fontFamily="monospace" opacity="0.7">AI ENHANCED</text>
                                        <text x="8" y="195" fill="#64748B" fontSize="9" fontFamily="monospace" opacity="0.7">D: 08/03/2026</text>
                                        <text x="310" y="195" fill="#0D9488" fontSize="9" fontFamily="monospace" opacity="0.7">REC</text>
                                    </svg>
                                    <div className="illus-ai-row">
                                        <div className="illus-ai-item"><div className="illus-ai-label">TI-RADS Score</div><div className="illus-ai-val" style={{color:'#EF4444'}}>4B</div></div>
                                        <div className="illus-divider"/>
                                        <div className="illus-ai-item"><div className="illus-ai-label">Malignancy Risk</div><div className="illus-ai-val" style={{color:'#F59E0B'}}>34%</div></div>
                                        <div className="illus-divider"/>
                                        <div className="illus-ai-item"><div className="illus-ai-label">Recommendation</div><div className="illus-ai-val" style={{color:'#0D9488',fontSize:12}}>FNA Biopsy</div></div>
                                        <div className="illus-ai-badge">AI</div>
                                    </div>
                                </div>
                                <div className="fbadge fb1">
                                    <div className="fbi" style={{background:'#F0FDFA',border:'1px solid #99F6E4'}}><Activity size={17} color="#0D9488"/></div>
                                    <div><div className="fblbl">Accuracy</div><div className="fbval" style={{color:'#0D9488'}}>98.7%</div></div>
                                </div>
                                <div className="fbadge fb2">
                                    <div className="fbi" style={{background:'#F5F3FF',border:'1px solid #DDD6FE'}}><Zap size={17} color="#7C3AED"/></div>
                                    <div><div className="fblbl">Analysis</div><div className="fbval" style={{color:'#7C3AED'}}>&lt;2 sec</div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TRUST */}
                <div className="trust">
                    <div className="trust-inner">
                        <span className="trust-label">Trusted Standards</span>
                        <div className="trust-line"/>
                        <div className="trust-badges">
                            {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t=><div key={t} className="trust-badge">{t}</div>)}
                        </div>
                    </div>
                </div>

                {/* STATS */}
                <div className="stats">
                    <div className="stats-grid">
                        {[
                            {icon:<Activity size={22}/>, val:'98.7%', lbl:'Diagnostic Accuracy'},
                            {icon:<Zap size={22}/>, val:'< 2s', lbl:'Real-Time Analysis'},
                            {icon:<Shield size={22}/>, val:'HIPAA', lbl:'Compliant & Secure'},
                        ].map((s,i)=>(
                            <div className="stat-card" key={i}>
                                <div className="stat-ic">{s.icon}</div>
                                <div><div className="stat-val">{s.val}</div><div className="stat-lbl">{s.lbl}</div></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FEATURES */}
                <section className="features">
                    <div className="sec-label">Capabilities</div>
                    <h2 className="sec-h2">AI-Powered Features</h2>
                    <p className="sec-p">Five integrated modules built specifically for thyroid cancer diagnostics.</p>
                    <div className="feat-layout">
                        <div className="tabs">
                            {features.map((f,i)=>(
                                <button key={f.id} className={`tab${active===i?' active':''}`}
                                        style={active===i?{borderColor:f.border,background:f.lightBg,boxShadow:`0 4px 20px ${f.color}18`}:{}}
                                        onClick={()=>setActive(i)}>
                                    <div className="tab-ic" style={{background:active===i?`${f.color}15`:'#F8FAFC',border:`1px solid ${active===i?f.border:'#E2E8F0'}`,color:active===i?f.color:'#94A3B8'}}>{f.icon}</div>
                                    <div style={{flex:1}}>
                                        <div className="tab-cat" style={{color:active===i?f.color:'#94A3B8'}}>{f.category}</div>
                                        <div className="tab-name">{f.fullName}</div>
                                    </div>
                                    <ChevronRight size={15} className="tab-arr" style={{color:f.color}}/>
                                </button>
                            ))}
                        </div>
                        <div className="panel" style={{borderColor:af.border,boxShadow:`0 4px 32px ${af.color}14`}}>
                            <div className="panel-top" style={{background:af.lightBg}}>
                                <div className="panel-num">0{af.id}</div>
                                <div className="panel-icon-wrap" style={{background:`${af.color}15`,border:`1px solid ${af.border}`,color:af.color}}>{af.icon}</div>
                                <div className="panel-tag" style={{background:`${af.color}12`,color:af.color}}>
                                    <span style={{width:5,height:5,borderRadius:'50%',background:af.color,display:'inline-block'}}/>
                                    {af.category}
                                </div>
                                <h3 className="panel-h3">{af.fullName}</h3>
                                <p className="panel-desc">{af.description}</p>
                            </div>
                            <div className="panel-pts">
                                {af.points.map((pt,i)=>(
                                    <div className="pt" key={i}>
                                        <CheckCircle2 size={16} style={{color:af.color,flexShrink:0,marginTop:1}}/>
                                        <span className="pt-txt">{pt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="cta">
                    <div className="cta-inner">
                        <div className="cta-c1"/><div className="cta-c2"/>
                        <div className="cta-badge"><span style={{width:6,height:6,borderRadius:'50%',background:'white',display:'inline-block'}}/>Get Started Today</div>
                        <h2 className="cta-h2">Ready to transform your<br/>thyroid diagnostics?</h2>
                        <p className="cta-p">Join leading pathology labs already using Diagnovate AI platform.</p>
                        <div className="cta-btns">
                            <Link href="/role" className="btn-white">Start Free Trial <ArrowRight size={16}/></Link>
                            <button className="btn-outline-white">Schedule Demo</button>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
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