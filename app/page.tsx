'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    Scan, Brain, GitBranch, MessageSquare, Layers,
    ArrowRight, Activity, Zap, ChevronRight, CheckCircle2,
} from 'lucide-react';

const FEATURES = [
    {
        id: 1, tag: 'Image Analysis', title: 'Ultrasound Image Analysis',
        icon: <Scan size={18} />,
        accent: '#2EC4B6', glow: 'rgba(46,196,182,0.08)', ring: 'rgba(46,196,182,0.22)',
        desc: 'Three deep learning models analyze thyroid ultrasound scans in parallel and produce a consensus diagnosis through majority voting.',
        pts: [
            'EfficientNet+YOLO for nodule detection and localization',
            'Swin Transformer for context-aware spatial feature analysis',
            'DenseNet-121 for dense feature pattern recognition',
            'Ensemble majority voting yields the final diagnosis',
        ],
    },
    {
        id: 2, tag: 'Lab Diagnostics', title: 'Thyroid Lab Value Analysis',
        icon: <Brain size={18} />,
        accent: '#818CF8', glow: 'rgba(129,140,248,0.08)', ring: 'rgba(129,140,248,0.22)',
        desc: 'Machine learning classifiers analyze TSH, T3, T4, FTI and other biomarkers to diagnose thyroid conditions with clinical-grade accuracy.',
        pts: [
            'XGBoost gradient boosting for structured biomarker data',
            'CatBoost with full categorical and numerical feature support',
            'Random Forest ensemble for robust edge-case handling',
            'Accepts TSH, T3, TT4, T4U, FTI, Age, and Sex inputs',
        ],
    },
    {
        id: 3, tag: 'Multi-Modal', title: 'Combined Image and Lab Analysis',
        icon: <Layers size={18} />,
        accent: '#34D399', glow: 'rgba(52,211,153,0.08)', ring: 'rgba(52,211,153,0.22)',
        desc: 'Simultaneous analysis of ultrasound imaging and laboratory values delivers the most comprehensive thyroid cancer assessment available.',
        pts: [
            'Parallel API calls with no added latency',
            'Cross-modal majority voting across all six models',
            'Higher diagnostic confidence than single-modality input',
            'Optimal for ambiguous or borderline clinical presentations',
        ],
    },
    {
        id: 4, tag: 'Model Control', title: 'Manual Model Selection',
        icon: <GitBranch size={18} />,
        accent: '#FBBF24', glow: 'rgba(251,191,36,0.08)', ring: 'rgba(251,191,36,0.22)',
        desc: 'Override the default ensemble and pin to a specific AI model, giving clinicians direct control over which algorithm drives the diagnosis.',
        pts: [
            'Default: majority voting across all available models',
            'Override: choose a single model for targeted analysis',
            'Useful for institutional protocol compliance workflows',
            'Side-by-side confidence comparison across all models',
        ],
    },
    {
        id: 5, tag: 'Patient Records', title: 'Integrated Patient Management',
        icon: <MessageSquare size={18} />,
        accent: '#FB7185', glow: 'rgba(251,113,133,0.08)', ring: 'rgba(251,113,133,0.22)',
        desc: 'Diagnoses auto-save to patient records with full findings, confidence scores, and model outputs indexed by MRN.',
        pts: [
            'Results auto-saved when a patient MRN is selected',
            'Complete diagnosis history per patient record',
            'Severity, confidence, and key findings all logged',
            'Direct navigation from diagnosis result to patient profile',
        ],
    },
];

export default function HomePage() {
    const [tab, setTab] = useState(0);
    const f = FEATURES[tab];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                :root {
                    --bg:     #070D1A;
                    --surf:   #0D1627;
                    --surf2:  #111E30;
                    --b1:     rgba(255,255,255,0.07);
                    --b2:     rgba(255,255,255,0.12);
                    --teal:   #0D9488;
                    --teal2:  #2EC4B6;
                    --tg:     rgba(13,148,136,0.15);
                    --text:   #F1F5F9;
                    --text2:  #CBD5E1;
                    --muted:  #94A3B8;
                    --dim:    #475569;
                    --disp:   'DM Serif Display', serif;
                    --body:   'Plus Jakarta Sans', sans-serif;
                    --grad:   linear-gradient(135deg, #0D9488, #0891B2);
                }
                html { scroll-behavior: smooth; }
                body {
                    background: var(--bg); color: var(--text); font-family: var(--body);
                    overflow-x: hidden; -webkit-font-smoothing: antialiased;
                }
                body::before {
                    content: ''; position: fixed; inset: 0;
                    background-image: radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px);
                    background-size: 32px 32px; pointer-events: none; z-index: 0;
                }

                /* ── NAV ── */
                .nav {
                    position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 68px;
                    display: flex; align-items: center; justify-content: space-between; padding: 0 48px;
                    background: rgba(7,13,26,0.88); backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--b1);
                }
                .nav-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; }
                .nav-mark {
                    width: 42px; height: 42px; border-radius: 50%;
                    background: #1B2B5E; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 4px 20px rgba(27,43,94,0.8);
                    position: relative; flex-shrink: 0;
                }
                .nav-mark-ring {
                    position: absolute; inset: -4px; border-radius: 50%;
                    border: 1.5px solid rgba(45,212,191,0.35);
                    animation: ringPulse 3.5s ease-in-out infinite;
                }
                .nav-mark-dot {
                    position: absolute; top: 1px; right: 1px;
                    width: 10px; height: 10px; border-radius: 50%;
                    background: #2DD4BF; border: 2px solid var(--bg);
                    box-shadow: 0 0 8px rgba(45,212,191,0.6); pointer-events: none;
                }
                .nav-word { font-family: var(--disp); font-size: 20px; letter-spacing: -0.3px; color: var(--text); line-height: 1.1; }
                .nav-word span { color: var(--teal2); font-style: italic; }
                .nav-subtitle { font-size: 7.5px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--dim); font-family: var(--body); line-height: 1; }
                .nav-links { display: flex; align-items: center; gap: 4px; }
                .nav-link {
                    padding: 7px 14px; border-radius: 9px; font-size: 13.5px; font-weight: 500;
                    color: var(--muted); text-decoration: none; transition: all 0.15s;
                }
                .nav-link:hover { color: var(--text); background: rgba(255,255,255,0.06); }
                .nav-link.active { color: var(--teal2); background: rgba(46,196,182,0.1); font-weight: 700; }
                .nav-cta {
                    display: inline-flex; align-items: center; gap: 7px;
                    background: var(--grad); color: white; font-size: 13.5px; font-weight: 700;
                    padding: 9px 20px; border-radius: 11px; text-decoration: none;
                    box-shadow: 0 4px 16px rgba(13,148,136,0.35); transition: all 0.2s;
                }
                .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,0.45); }

                /* ── PAGE ── */
                .page { position: relative; z-index: 1; }

                /* ── HERO ── */
                .hero {
                    min-height: 100vh; padding: 110px 48px 80px;
                    display: flex; align-items: center; position: relative; overflow: hidden;
                }
                .blob { position: absolute; border-radius: 50%; pointer-events: none; }
                .blob1 { width: 800px; height: 800px; background: radial-gradient(circle, rgba(13,148,136,0.11) 0%, transparent 65%); top: -300px; right: -200px; }
                .blob2 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(8,145,178,0.07) 0%, transparent 65%); bottom: -200px; left: -200px; }
                .hero-inner {
                    max-width: 1200px; margin: 0 auto; width: 100%;
                    display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center;
                }
                .eyebrow {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(13,148,136,0.12); border: 1px solid rgba(13,148,136,0.28);
                    color: var(--teal2); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
                    padding: 6px 14px; border-radius: 100px; margin-bottom: 24px; width: fit-content;
                    animation: fadeUp 0.5s ease both;
                }
                .eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal2); animation: blink 2s ease-in-out infinite; box-shadow: 0 0 0 3px rgba(46,196,182,0.2); }
                .hero-h1 {
                    font-family: var(--disp); font-size: clamp(42px, 5vw, 66px); font-weight: 400;
                    line-height: 1.07; letter-spacing: -1px; color: var(--text); margin-bottom: 22px;
                    animation: fadeUp 0.5s 0.08s ease both;
                }
                .hero-h1 em { font-style: italic; color: var(--teal2); }
                .hero-sub {
                    font-size: 16.5px; line-height: 1.72; color: var(--muted); margin-bottom: 40px; max-width: 460px;
                    animation: fadeUp 0.5s 0.14s ease both;
                }
                .btns { display: flex; gap: 12px; animation: fadeUp 0.5s 0.2s ease both; }
                .btn-p {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: var(--grad); color: white; font-family: var(--body); font-size: 15px; font-weight: 700;
                    padding: 13px 26px; border-radius: 12px; border: none; cursor: pointer; text-decoration: none;
                    transition: all 0.22s; box-shadow: 0 6px 24px rgba(13,148,136,0.35);
                }
                .btn-p:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(13,148,136,0.45); }
                .btn-g {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: rgba(255,255,255,0.05); color: var(--text2); font-family: var(--body); font-size: 15px; font-weight: 500;
                    padding: 13px 26px; border-radius: 12px; border: 1px solid var(--b2); cursor: pointer;
                    text-decoration: none; transition: all 0.22s;
                }
                .btn-g:hover { background: rgba(255,255,255,0.09); transform: translateY(-2px); }

                /* ── HERO VISUAL ── */
                .hero-visual { position: relative; animation: fadeUp 0.6s 0.1s ease both; }
                .illus-card {
                    background: var(--surf); border-radius: 20px;
                    border: 1px solid var(--b2); box-shadow: 0 32px 80px rgba(0,0,0,0.55); overflow: hidden;
                }
                .illus-header {
                    padding: 14px 18px; border-bottom: 1px solid var(--b1);
                    display: flex; align-items: center; justify-content: space-between; background: var(--surf2);
                }
                .illus-header-left { display: flex; align-items: center; gap: 11px; }
                .illus-avatar {
                    width: 34px; height: 34px; border-radius: 9px;
                    background: rgba(13,148,136,0.14); border: 1px solid rgba(13,148,136,0.28);
                    display: flex; align-items: center; justify-content: center;
                }
                .illus-live {
                    display: flex; align-items: center; gap: 5px;
                    background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25);
                    color: #FC8181; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; padding: 4px 9px; border-radius: 5px;
                }
                .illus-live-dot { width: 5px; height: 5px; border-radius: 50%; background: #FC8181; animation: blink 1.2s ease-in-out infinite; }
                .illus-ai-row {
                    padding: 13px 18px; border-top: 1px solid var(--b1);
                    display: flex; align-items: center; background: var(--surf2);
                }
                .illus-ai-item { flex: 1; text-align: center; }
                .illus-ai-label { font-size: 10px; color: var(--dim); font-weight: 500; margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.5px; }
                .illus-ai-val { font-size: 15px; font-weight: 800; font-family: var(--disp); letter-spacing: -0.3px; }
                .illus-divider { width: 1px; height: 30px; background: var(--b1); flex-shrink: 0; }
                .illus-ai-badge {
                    background: var(--grad); color: white; font-size: 10px; font-weight: 800;
                    padding: 4px 10px; border-radius: 5px; letter-spacing: 1px; margin-left: 12px;
                }
                .fbadge {
                    position: absolute; background: var(--surf); border: 1px solid var(--b2);
                    border-radius: 14px; padding: 11px 14px; display: flex; align-items: center; gap: 11px;
                    box-shadow: 0 16px 48px rgba(0,0,0,0.45); z-index: 5;
                }
                .fb1 { bottom: -16px; left: -24px; animation: fltA 4s ease-in-out infinite; }
                .fb2 { top: 20px; right: -24px; animation: fltB 4s 1.2s ease-in-out infinite; }
                .fbi { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .fblbl { font-size: 10.5px; color: var(--muted); margin-bottom: 2px; }
                .fbval { font-size: 15px; font-weight: 800; font-family: var(--disp); letter-spacing: -0.5px; }

                /* ── TRUST ── */
                .trust { position: relative; z-index: 1; padding: 16px 48px 52px; }
                .trust-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 36px; }
                .trust-label { font-size: 10.5px; color: var(--dim); font-weight: 700; white-space: nowrap; letter-spacing: 1.2px; text-transform: uppercase; }
                .trust-line { flex: 1; height: 1px; background: var(--b1); }
                .trust-badges { display: flex; gap: 8px; flex-wrap: wrap; }
                .trust-badge {
                    background: var(--surf2); border: 1px solid var(--b1); border-radius: 7px;
                    padding: 5px 13px; font-size: 11px; font-weight: 700; color: var(--dim); letter-spacing: 0.5px;
                }

                /* ── STATS ── */
                .stats { padding: 0 48px 72px; position: relative; z-index: 1; }
                .stats-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
                .stat-card {
                    background: var(--surf); border: 1px solid var(--b1); border-radius: 16px;
                    padding: 26px 28px; display: flex; align-items: center; gap: 16px;
                    transition: all 0.25s; cursor: default;
                }
                .stat-card:hover { border-color: rgba(13,148,136,0.3); transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.35); }
                .stat-ic {
                    width: 46px; height: 46px; border-radius: 13px;
                    background: rgba(13,148,136,0.1); border: 1px solid rgba(13,148,136,0.22);
                    display: flex; align-items: center; justify-content: center; color: var(--teal2); flex-shrink: 0;
                }
                .stat-val { font-family: var(--disp); font-size: 30px; font-weight: 400; letter-spacing: -1.5px; color: var(--text); line-height: 1; }
                .stat-lbl { font-size: 12.5px; color: var(--muted); margin-top: 4px; }

                /* ── FEATURES ── */
                .features { padding: 72px 48px 80px; position: relative; z-index: 1; }
                .sec-ey { text-align: center; font-size: 11px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: var(--teal2); margin-bottom: 14px; }
                .sec-h2 {
                    font-family: var(--disp); font-size: clamp(30px, 4vw, 50px); font-weight: 400;
                    text-align: center; letter-spacing: -0.5px; color: var(--text); margin-bottom: 14px;
                }
                .sec-p { text-align: center; font-size: 15.5px; color: var(--muted); max-width: 480px; margin: 0 auto 60px; line-height: 1.65; }
                .feat-layout { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start; }
                .tabs { display: flex; flex-direction: column; gap: 6px; position: sticky; top: 88px; }
                .tab {
                    background: var(--surf); border: 1px solid var(--b1); border-radius: 14px; padding: 13px 16px;
                    cursor: pointer; text-align: left; display: flex; align-items: center; gap: 12px;
                    font-family: var(--body); transition: all 0.2s;
                }
                .tab:hover { border-color: var(--b2); transform: translateX(2px); }
                .tab-ic { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
                .tab-tag { font-size: 9.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
                .tab-name { font-size: 12px; font-weight: 500; color: var(--muted); line-height: 1.3; }
                .tab.active .tab-name { color: var(--text2); font-weight: 600; }
                .tab-arr { margin-left: auto; flex-shrink: 0; opacity: 0; transition: all 0.18s; }
                .tab:hover .tab-arr, .tab.active .tab-arr { opacity: 1; }
                .panel {
                    background: var(--surf); border: 1px solid var(--b1); border-radius: 20px;
                    overflow: hidden; box-shadow: 0 4px 32px rgba(0,0,0,0.3);
                }
                .panel-top { padding: 32px 36px 24px; position: relative; border-bottom: 1px solid var(--b1); }
                .panel-num { position: absolute; top: 20px; right: 30px; font-family: var(--disp); font-size: 72px; opacity: 0.035; letter-spacing: -4px; line-height: 1; color: white; }
                .panel-icon-wrap { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; }
                .panel-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px; }
                .panel-h3 { font-family: var(--disp); font-size: 26px; font-weight: 400; letter-spacing: -0.3px; margin-bottom: 10px; color: var(--text); }
                .panel-desc { font-size: 14.5px; color: var(--muted); line-height: 1.7; }
                .panel-pts { padding: 24px 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .pt {
                    display: flex; align-items: flex-start; gap: 9px; padding: 12px 14px;
                    border-radius: 11px; border: 1px solid var(--b1); background: var(--surf2); transition: all 0.18s;
                }
                .pt:hover { border-color: var(--b2); transform: translateY(-1px); }
                .pt-txt { font-size: 13px; color: var(--text2); line-height: 1.5; }

                /* ── CTA ── */
                .cta { padding: 72px 48px 96px; position: relative; z-index: 1; }
                .cta-inner {
                    max-width: 1200px; margin: 0 auto;
                    background: linear-gradient(135deg, #091E2E 0%, #0D2240 50%, #091E2E 100%);
                    border: 1px solid rgba(13,148,136,0.22);
                    border-radius: 24px; padding: 72px 64px; text-align: center; position: relative; overflow: hidden;
                }
                .cta-glow {
                    position: absolute; width: 600px; height: 600px; border-radius: 50%;
                    background: radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 65%);
                    top: -250px; left: 50%; transform: translateX(-50%); pointer-events: none;
                }
                .cta-eyebrow {
                    display: inline-flex; align-items: center; gap: 7px;
                    background: rgba(13,148,136,0.14); border: 1px solid rgba(13,148,136,0.28);
                    color: var(--teal2); font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
                    padding: 6px 14px; border-radius: 100px; margin: 0 auto 22px; width: fit-content; position: relative;
                }
                .cta-h2 { font-family: var(--disp); font-size: clamp(28px, 4vw, 48px); font-weight: 400; letter-spacing: -0.5px; color: var(--text); margin-bottom: 16px; position: relative; }
                .cta-p { font-size: 16px; color: var(--muted); margin-bottom: 36px; position: relative; }
                .cta-btns { display: flex; gap: 12px; justify-content: center; position: relative; }
                .btn-teal {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: var(--grad); color: white; font-family: var(--body); font-size: 15px; font-weight: 700;
                    padding: 13px 28px; border-radius: 12px; border: none; cursor: pointer; text-decoration: none;
                    transition: all 0.22s; box-shadow: 0 6px 24px rgba(13,148,136,0.4);
                }
                .btn-teal:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(13,148,136,0.5); }
                .btn-outline {
                    display: inline-flex; align-items: center; gap: 8px;
                    background: transparent; color: var(--text2); font-family: var(--body); font-size: 15px; font-weight: 600;
                    padding: 13px 28px; border-radius: 12px; border: 1px solid var(--b2); cursor: pointer;
                    text-decoration: none; transition: all 0.22s;
                }
                .btn-outline:hover { background: rgba(255,255,255,0.06); transform: translateY(-2px); }

                /* ── FOOTER ── */
                .footer {
                    position: relative; z-index: 1; border-top: 1px solid var(--b1);
                    padding: 28px 48px; display: flex; align-items: center; justify-content: space-between;
                    background: var(--surf);
                }
                .footer-logo { display: flex; align-items: center; gap: 9px; }
                .footer-word { font-family: var(--disp); font-size: 18px; color: var(--text); }
                .footer-word span { color: var(--teal2); font-style: italic; }
                .footer-copy { font-size: 13px; color: var(--dim); }

                /* ── KEYFRAMES ── */
                @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
                @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.35} }
                @keyframes fltA   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                @keyframes fltB   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
                @keyframes ringPulse { 0%,100%{opacity:0.3;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.06)} }

                /* ── RESPONSIVE ── */
                @media (max-width: 960px) {
                    .hero-inner, .feat-layout { grid-template-columns: 1fr; gap: 48px; }
                    .tabs { flex-direction: row; flex-wrap: wrap; position: static; }
                    .tab { flex: 1; min-width: 140px; }
                    .stats-grid { grid-template-columns: 1fr; }
                    .panel-pts { grid-template-columns: 1fr; }
                    .nav, .hero, .stats, .features, .cta, .trust { padding-left: 20px; padding-right: 20px; }
                    .cta-inner { padding: 48px 24px; }
                    .footer { flex-direction: column; gap: 14px; text-align: center; padding: 24px 20px; }
                    .fb1, .fb2 { display: none; }
                }
            `}</style>

            {/* ── NAVBAR ── */}
            <nav className="nav">
                <Link href="/" className="nav-logo">
                    <div className="nav-mark">
                        <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                            <ellipse cx="7" cy="9" rx="5.5" ry="7.5" stroke="white" strokeWidth="1.4" fill="white" fillOpacity="0.12"/>
                            <ellipse cx="15" cy="9" rx="5.5" ry="7.5" stroke="white" strokeWidth="1.4" fill="white" fillOpacity="0.12"/>
                            <rect x="9.5" y="8" width="3" height="2.5" rx="1.25" fill="white"/>
                        </svg>
                        <span className="nav-mark-dot" />
                        <span className="nav-mark-ring" />
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:2}}>
                        <span className="nav-word">Diagno<span>vate</span></span>
                        <span className="nav-subtitle">CLINICAL PLATFORM</span>
                    </div>
                </Link>
                <div className="nav-links">
                    <Link href="/" className="nav-link active">Home</Link>
                    <Link href="/about" className="nav-link">About</Link>
                    <Link href="/contact" className="nav-link">Contact</Link>
                    <Link href="/role" className="nav-cta">Sign In <ArrowRight size={13}/></Link>
                </div>
            </nav>

            <div className="page">

                {/* ── HERO ── */}
                <section className="hero">
                    <div className="blob blob1"/><div className="blob blob2"/>
                    <div className="hero-inner">
                        <div>
                            <div className="eyebrow"><span className="eyebrow-dot"/>AI Thyroid Diagnostics</div>
                            <h1 className="hero-h1">
                                Clinical-Grade<br/>
                                <em>Thyroid Cancer</em><br/>
                                AI Diagnosis
                            </h1>
                            <p className="hero-sub">
                                Three deep learning models analyze ultrasound scans and lab values simultaneously,
                                producing ensemble diagnoses through majority voting for maximum accuracy.
                            </p>
                            <div className="btns">
                                <Link href="/role" className="btn-p">Get Started <ArrowRight size={15}/></Link>
                                <Link href="/contact" className="btn-g">Contact Us</Link>
                            </div>
                        </div>

                        <div className="hero-visual">
                            <div style={{position:'relative'}}>
                                <div className="illus-card">
                                    <div className="illus-header">
                                        <div className="illus-header-left">
                                            <div className="illus-avatar">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="8" r="4" fill="#2EC4B6"/>
                                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#2EC4B6" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <div style={{fontSize:12,fontWeight:700,color:'#F1F5F9'}}>Patient #TH-2847</div>
                                                <div style={{fontSize:10.5,color:'#94A3B8'}}>Thyroid Scan · Live Analysis</div>
                                            </div>
                                        </div>
                                        <div className="illus-live"><span className="illus-live-dot"/>LIVE</div>
                                    </div>
                                    <svg width="100%" viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <radialGradient id="scanBg" cx="50%" cy="50%">
                                                <stop offset="0%" stopColor="#0D9488" stopOpacity="0.1"/>
                                                <stop offset="100%" stopColor="#070D1A" stopOpacity="0"/>
                                            </radialGradient>
                                            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                                        </defs>
                                        <rect width="380" height="200" fill="#070D1A" rx="4"/>
                                        <rect width="380" height="200" fill="url(#scanBg)"/>
                                        {[40,80,120,160,200,240,280,320,360].map(x=><line key={x} x1={x} y1="0" x2={x} y2="200" stroke="#1A2F50" strokeWidth="0.5"/>)}
                                        {[40,80,120,160].map(y=><line key={y} x1="0" y1={y} x2="380" y2={y} stroke="#1A2F50" strokeWidth="0.5"/>)}
                                        <ellipse cx="155" cy="105" rx="52" ry="68" fill="#0D9488" fillOpacity="0.1" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.45"/>
                                        <ellipse cx="225" cy="105" rx="52" ry="68" fill="#0D9488" fillOpacity="0.1" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.45"/>
                                        <circle cx="170" cy="98" r="18" fill="#EF4444" fillOpacity="0.18" stroke="#EF4444" strokeWidth="2" strokeOpacity="0.8" filter="url(#glow)"/>
                                        <circle cx="170" cy="98" r="10" fill="#EF4444" fillOpacity="0.38"/>
                                        <circle cx="170" cy="98" r="5" fill="#EF4444" fillOpacity="0.9"/>
                                        <circle cx="230" cy="115" r="10" fill="#F59E0B" fillOpacity="0.22" stroke="#F59E0B" strokeWidth="1.5"/>
                                        <circle cx="230" cy="115" r="5" fill="#F59E0B" fillOpacity="0.6"/>
                                        <line x1="0" y1="0" x2="380" y2="0" stroke="#2EC4B6" strokeWidth="2" strokeOpacity="0.8">
                                            <animateTransform attributeName="transform" type="translate" values="0,10;0,195;0,10" dur="3s" repeatCount="indefinite"/>
                                        </line>
                                        <line x1="152" y1="98" x2="188" y2="98" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.9" strokeDasharray="4 3"/>
                                        <line x1="170" y1="80" x2="170" y2="116" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.9" strokeDasharray="4 3"/>
                                        <rect x="186" y="85" width="80" height="20" rx="4" fill="#EF4444" fillOpacity="0.1"/>
                                        <text x="226" y="99" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="700" fontFamily="monospace">NODULE 1.8cm</text>
                                        <rect x="200" y="122" width="60" height="18" rx="4" fill="#F59E0B" fillOpacity="0.1"/>
                                        <text x="230" y="134" textAnchor="middle" fill="#F59E0B" fontSize="9" fontWeight="600" fontFamily="monospace">BENIGN</text>
                                        <text x="8" y="15" fill="#2EC4B6" fontSize="9" fontFamily="monospace" opacity="0.7">THYROID SCAN</text>
                                        <text x="300" y="15" fill="#475569" fontSize="9" fontFamily="monospace" opacity="0.7">AI ENHANCED</text>
                                        <text x="8" y="195" fill="#475569" fontSize="9" fontFamily="monospace" opacity="0.7">D: 08/03/2026</text>
                                        <text x="322" y="195" fill="#2EC4B6" fontSize="9" fontFamily="monospace" opacity="0.7">REC</text>
                                    </svg>
                                    <div className="illus-ai-row">
                                        <div className="illus-ai-item">
                                            <div className="illus-ai-label">TI-RADS Score</div>
                                            <div className="illus-ai-val" style={{color:'#FC8181'}}>4B</div>
                                        </div>
                                        <div className="illus-divider"/>
                                        <div className="illus-ai-item">
                                            <div className="illus-ai-label">Malignancy Risk</div>
                                            <div className="illus-ai-val" style={{color:'#FBBF24'}}>34%</div>
                                        </div>
                                        <div className="illus-divider"/>
                                        <div className="illus-ai-item">
                                            <div className="illus-ai-label">Recommendation</div>
                                            <div className="illus-ai-val" style={{color:'#2EC4B6',fontSize:12}}>FNA Biopsy</div>
                                        </div>
                                        <div className="illus-ai-badge">AI</div>
                                    </div>
                                </div>
                                <div className="fbadge fb1">
                                    <div className="fbi" style={{background:'rgba(46,196,182,0.1)',border:'1px solid rgba(46,196,182,0.22)'}}>
                                        <Activity size={16} color="#2EC4B6"/>
                                    </div>
                                    <div>
                                        <div className="fblbl">DenseNet-121</div>
                                        <div className="fbval" style={{color:'#2EC4B6'}}>97.6%</div>
                                    </div>
                                </div>
                                <div className="fbadge fb2">
                                    <div className="fbi" style={{background:'rgba(129,140,248,0.1)',border:'1px solid rgba(129,140,248,0.22)'}}>
                                        <Zap size={16} color="#818CF8"/>
                                    </div>
                                    <div>
                                        <div className="fblbl">Analysis Time</div>
                                        <div className="fbval" style={{color:'#818CF8'}}>&lt;2 sec</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TRUST ── */}
                <div className="trust">
                    <div className="trust-inner">
                        <span className="trust-label">Clinical Standards</span>
                        <div className="trust-line"/>
                        <div className="trust-badges">
                            {['HIPAA','ICCR','WHO','TI-RADS','GDPR'].map(t=>(
                                <div key={t} className="trust-badge">{t}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── STATS ── */}
                <div className="stats">
                    <div className="stats-grid">
                        {[
                            { icon:<Activity size={20}/>, val:'97.6%', lbl:'DenseNet-121 Accuracy' },
                            { icon:<Brain size={20}/>,   val:'96.9%', lbl:'Swin Transformer Accuracy' },
                            { icon:<Layers size={20}/>,  val:'3 Models', lbl:'Majority Voting Ensemble' },
                        ].map((s,i)=>(
                            <div className="stat-card" key={i}>
                                <div className="stat-ic">{s.icon}</div>
                                <div>
                                    <div className="stat-val">{s.val}</div>
                                    <div className="stat-lbl">{s.lbl}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FEATURES ── */}
                <section className="features">
                    <div className="sec-ey">Capabilities</div>
                    <h2 className="sec-h2">AI-Powered Features</h2>
                    <p className="sec-p">Five integrated modules built specifically for thyroid cancer diagnostics.</p>
                    <div className="feat-layout">
                        <div className="tabs">
                            {FEATURES.map((ft,i)=>(
                                <button key={ft.id}
                                    className={`tab${tab===i?' active':''}`}
                                    style={tab===i ? {borderColor:ft.ring, background:ft.glow} : {}}
                                    onClick={()=>setTab(i)}
                                >
                                    <div className="tab-ic" style={{
                                        background: tab===i ? ft.glow : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${tab===i ? ft.ring : 'rgba(255,255,255,0.07)'}`,
                                        color: tab===i ? ft.accent : '#475569',
                                    }}>
                                        {ft.icon}
                                    </div>
                                    <div style={{flex:1,minWidth:0}}>
                                        <div className="tab-tag" style={{color: tab===i ? ft.accent : '#475569'}}>{ft.tag}</div>
                                        <div className="tab-name">{ft.title}</div>
                                    </div>
                                    <ChevronRight size={14} className="tab-arr" style={{color:ft.accent}}/>
                                </button>
                            ))}
                        </div>
                        <div className="panel" style={{borderColor:f.ring}}>
                            <div className="panel-top" style={{background:f.glow}}>
                                <div className="panel-num">0{f.id}</div>
                                <div className="panel-icon-wrap" style={{background:f.glow,border:`1px solid ${f.ring}`,color:f.accent}}>
                                    {f.icon}
                                </div>
                                <div className="panel-pill" style={{background:f.glow,color:f.accent,border:`1px solid ${f.ring}`}}>
                                    <span style={{width:4,height:4,borderRadius:'50%',background:f.accent,display:'inline-block'}}/>
                                    {f.tag}
                                </div>
                                <h3 className="panel-h3">{f.title}</h3>
                                <p className="panel-desc">{f.desc}</p>
                            </div>
                            <div className="panel-pts">
                                {f.pts.map((pt,i)=>(
                                    <div className="pt" key={i}>
                                        <CheckCircle2 size={15} style={{color:f.accent,flexShrink:0,marginTop:1}}/>
                                        <span className="pt-txt">{pt}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="cta">
                    <div className="cta-inner">
                        <div className="cta-glow"/>
                        <div className="cta-eyebrow">
                            <span style={{width:5,height:5,borderRadius:'50%',background:'var(--teal2)',display:'inline-block'}}/>
                            Get Started Today
                        </div>
                        <h2 className="cta-h2">Ready to transform your<br/>thyroid diagnostics?</h2>
                        <p className="cta-p">Join clinicians already using Diagnovate for AI-assisted thyroid cancer diagnosis.</p>
                        <div className="cta-btns">
                            <Link href="/role" className="btn-teal">Start Free Trial <ArrowRight size={15}/></Link>
                            <Link href="/contact" className="btn-outline">Contact Us</Link>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="footer">
                    <div className="footer-logo">
                        <div className="nav-mark" style={{width:30,height:30,borderRadius:9,boxShadow:'0 0 14px rgba(13,148,136,0.35)'}}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
                            </svg>
                        </div>
                        <span className="footer-word">Diagno<span>vate</span></span>
                    </div>
                    <div className="footer-copy">2026 Diagnovate. Advanced AI for thyroid cancer diagnostics.</div>
                </footer>

            </div>
        </>
    );
}
