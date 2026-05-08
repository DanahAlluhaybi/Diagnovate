// Home landing page — complete marketing redesign with dark hero, stats bar, features, AI models, how it works, footer.
'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import PublicNavbar from '../components/PublicNavbar';

// ─── Inline SVG Icons ────────────────────────────────────────────
const IconLayers = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
);
const IconZap = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);
const IconShield = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);
const IconImage = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
);
const IconBarChart = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
);
const IconCode = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
);
const IconCpu = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
        <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
        <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
        <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
        <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
);
const IconUpload = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
);
const IconFileText = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
);

const features = [
    { icon: <IconLayers />, title: 'Ensemble Architecture', desc: 'Three vision models and three lab models vote independently — reaching consensus before returning any result to the clinician.' },
    { icon: <IconZap />, title: 'Real-Time Inference', desc: 'Sub-second analysis pipeline from scan upload to majority-voted diagnosis, fully optimized for clinical workflow speed.' },
    { icon: <IconImage />, title: 'Image Enhancement', desc: 'CLAHE preprocessing sharpens and normalizes thyroid ultrasound scans before feeding them into the vision inference pipeline.' },
    { icon: <IconBarChart />, title: 'Lab-Based Diagnosis', desc: '16 thyroid biomarkers — TSH, T3, TT4, T4U, FTI and more — power an XGBoost + CatBoost + Random Forest ensemble.' },
    { icon: <IconFileText />, title: 'Report Generation', desc: 'Structured clinical reports with confidence scores, majority-vote breakdown, and annotated findings — ready for physician review.' },
];

const models = [
    /* IMAGE PIPELINE */
    { name: 'Swin Transformer', category: 'Image', dark: false, badge: null,
      acc: '96.85%', auc: '0.9939',
      desc: 'Vision transformer capturing long-range spatial dependencies in thyroid ultrasound images via shifted window attention.',
      detail: 'swin_base_patch4_window7_224 — weights from HuggingFace (iimvbii/diagnovate-models)' },
    { name: 'DenseNet-121', category: 'Image', dark: true, badge: 'HIGHEST ACCURACY',
      acc: '97.64%', auc: '0.9979',
      desc: 'Dense skip connections preserve fine-grained diagnostic features across 121 layers for superior nodule classification.',
      detail: 'densenet121_thyroid_v2_BEST.pth — 97.64% accuracy, AUC 0.9979' },
    { name: 'EfficientNet-B4', category: 'Image', dark: false, badge: null,
      acc: '96.85%', auc: '0.993',
      desc: 'Compound-scaled efficient architecture for accurate thyroid image classification with minimal computational overhead.',
      detail: 'efficientnet_b4 via timm — CPU-optimized for reliable production inference' },
    /* LAB PIPELINE */
    { name: 'XGBoost', category: 'Lab', dark: false, badge: 'PRIMARY',
      desc: 'Gradient-boosted trees trained on 16 thyroid biomarkers — primary classifier in the lab ensemble.',
      detail: 'Handles TSH, T3, TT4, T4U, FTI and 11 additional biomarkers with feature importance ranking.' },
    { name: 'CatBoost', category: 'Lab', dark: false, badge: null,
      desc: 'Categorical boosting algorithm providing robust predictions across diverse thyroid lab panels.',
      detail: 'Gradient boosting with ordered boosting and oblivious trees for stable lab predictions.' },
    { name: 'Random Forest', category: 'Lab', dark: false, badge: null,
      desc: 'Ensemble of decision trees delivering reliable majority-voted predictions from thyroid biomarker data.',
      detail: 'Handles missing biomarker values gracefully with probabilistic soft voting.' },
];

const steps = [
    { num: '01', title: 'Upload Scan', desc: 'Submit thyroid ultrasound image or lab values via secure API' },
    { num: '02', title: 'Preprocessing', desc: 'CLAHE enhancement and normalization prepare the image for analysis' },
    { num: '03', title: 'Ensemble Inference', desc: 'Three models independently analyze the data and cast votes' },
    { num: '04', title: 'Clinical Report', desc: 'Majority vote with confidence scores delivered in <2 seconds' },
];

export default function HomePage() {
    const floatRef1 = useRef<HTMLDivElement>(null);
    const floatRef2 = useRef<HTMLDivElement>(null);
    const floatRef3 = useRef<HTMLDivElement>(null);

    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { overflow-x: hidden; -webkit-font-smoothing: antialiased; }

                .pub-home-hero { min-height: 100vh; background: #0D1B17; padding: 96px 48px 80px; display: flex; align-items: center; position: relative; overflow: hidden; }
                .pub-home-hero::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(29,158,117,0.06) 1px, transparent 1px); background-size: 32px 32px; pointer-events: none; }

                .pub-hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 55% 45%; gap: 64px; align-items: center; position: relative; z-index: 1; }

                .pub-hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(29,158,117,0.12); border: 1px solid rgba(29,158,117,0.35); color: #5DCAA5; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; margin-bottom: 24px; width: fit-content; animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
                .pub-hero-dot { width: 7px; height: 7px; border-radius: 50%; background: #1D9E75; animation: dotBlink 1.4s ease-in-out infinite; box-shadow: 0 0 0 3px rgba(29,158,117,0.2); }

                .pub-hero-h1 { font-family: var(--font-dm-serif, 'DM Serif Display', serif); font-size: clamp(40px, 4.5vw, 56px); font-weight: 400; line-height: 1.1; letter-spacing: -1px; color: #fff; margin-bottom: 20px; white-space: pre-line; animation: fadeUp 0.7s 0.1s cubic-bezier(.16,1,.3,1) both; }

                .pub-hero-p { font-size: 17px; line-height: 1.75; color: #8A9E97; margin-bottom: 40px; max-width: 480px; animation: fadeUp 0.7s 0.2s cubic-bezier(.16,1,.3,1) both; }

                .pub-hero-btns { display: flex; gap: 14px; animation: fadeUp 0.7s 0.3s cubic-bezier(.16,1,.3,1) both; flex-wrap: wrap; }
                .pub-btn-solid { display: inline-flex; align-items: center; gap: 8px; background: #1D9E75; color: #fff; font-family: var(--font-dm-sans, sans-serif); font-size: 15px; font-weight: 700; padding: 13px 26px; border-radius: 12px; text-decoration: none; border: none; cursor: pointer; transition: all 0.22s; box-shadow: 0 6px 20px rgba(29,158,117,0.3); }
                .pub-btn-solid:hover { background: #0F6E56; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(29,158,117,0.4); }
                .pub-btn-ghost-white { display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #fff; font-family: var(--font-dm-sans, sans-serif); font-size: 15px; font-weight: 500; padding: 13px 26px; border-radius: 12px; text-decoration: none; border: 1.5px solid rgba(255,255,255,0.25); cursor: pointer; transition: all 0.22s; }
                .pub-btn-ghost-white:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.45); transform: translateY(-2px); }

                /* Hex visual */
                .pub-hex-visual { position: relative; display: flex; align-items: center; justify-content: center; animation: fadeUp 0.7s 0.15s cubic-bezier(.16,1,.3,1) both; }
                .pub-hex-outer { position: relative; width: 300px; height: 340px; }
                .pub-hex-scan-line { position: absolute; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #1D9E75, transparent); animation: scanLine 2.8s ease-in-out infinite; top: 0; }
                .pub-float-card { position: absolute; background: #fff; border-radius: 14px; padding: 14px 18px; box-shadow: 0 12px 40px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 12px; z-index: 10; }
                .pub-fc-1 { top: 0px; right: -60px; animation: float 3s ease-in-out infinite; }
                .pub-fc-2 { bottom: 60px; right: -70px; animation: float 3s 1s ease-in-out infinite; }
                .pub-fc-3 { bottom: 10px; left: -60px; animation: float 3s 0.5s ease-in-out infinite; }
                .pub-fc-num { font-family: var(--font-dm-serif, serif); font-size: 26px; font-weight: 400; color: #0D1B17; line-height: 1; }
                .pub-fc-lbl { font-size: 11px; color: #8A9E97; font-weight: 500; }
                .pub-fc-dot { width: 10px; height: 10px; border-radius: 50%; background: #1D9E75; animation: dotBlink 1.4s ease-in-out infinite; }

                /* Stats bar */
                .pub-stats-bar { background: #fff; border-top: 3px solid #1D9E75; padding: 40px 48px; }
                .pub-stats-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; }
                .pub-stat { text-align: center; padding: 0 24px; position: relative; }
                .pub-stat + .pub-stat::before { content: ''; position: absolute; left: 0; top: 10%; height: 80%; width: 1px; background: #E1F5EE; }
                .pub-stat-num { font-family: var(--font-dm-serif, serif); font-size: 44px; font-weight: 400; color: #1D9E75; line-height: 1; letter-spacing: -2px; margin-bottom: 6px; }
                .pub-stat-lbl { font-size: 13px; color: #8A9E97; font-weight: 500; }

                /* Features */
                .pub-features { background: #fff; padding: 96px 48px; }
                .pub-features-inner { max-width: 1200px; margin: 0 auto; }
                .pub-sec-eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #1D9E75; text-align: center; margin-bottom: 12px; }
                .pub-sec-h2 { font-family: var(--font-dm-serif, serif); font-size: clamp(32px, 3.5vw, 46px); font-weight: 400; text-align: center; color: #0D1B17; letter-spacing: -0.5px; margin-bottom: 56px; }
                .pub-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .pub-feat-card { background: #fff; border: 1px solid #E1F5EE; border-top: 3px solid transparent; border-radius: 16px; padding: 28px; transition: all 0.22s; cursor: default; }
                .pub-feat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(29,158,117,0.1); border-top-color: #1D9E75; border-color: #C5D6D0; }
                .pub-feat-icon { width: 48px; height: 48px; border-radius: 12px; background: #E1F5EE; display: flex; align-items: center; justify-content: center; color: #1D9E75; margin-bottom: 18px; }
                .pub-feat-title { font-family: var(--font-dm-serif, serif); font-size: 18px; font-weight: 400; color: #0D1B17; margin-bottom: 8px; }
                .pub-feat-desc { font-size: 14px; color: #8A9E97; line-height: 1.65; }

                /* AI Models */
                .pub-models { background: #F4F9F7; padding: 96px 48px; }
                .pub-models-inner { max-width: 1200px; margin: 0 auto; }
                .pub-models-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 56px; }
                .pub-model-card { border-radius: 20px; padding: 32px; position: relative; transition: all 0.22s; }
                .pub-model-card-light { background: #fff; border: 1px solid #C5D6D0; }
                .pub-model-card-light:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(29,158,117,0.1); }
                .pub-model-card-dark { background: linear-gradient(135deg, #0F6E56 0%, #085041 60%, #0D1B17 100%); border: 1.5px solid rgba(93,202,165,0.35); box-shadow: 0 0 0 1px rgba(29,158,117,0.1), 0 24px 64px rgba(13,27,23,0.3), inset 0 1px 0 rgba(93,202,165,0.15); overflow: hidden; }
                .pub-model-badge { display: inline-block; background: rgba(93,202,165,0.15); border: 1px solid rgba(93,202,165,0.4); color: #5DCAA5; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; padding: 5px 12px; border-radius: 100px; margin-bottom: 14px; }
                .pub-model-name-light { font-family: var(--font-dm-serif, serif); font-size: 22px; color: #0D1B17; margin-bottom: 12px; }
                .pub-model-name-dark { font-family: var(--font-dm-serif, serif); font-size: 22px; color: #fff; margin-bottom: 12px; }
                .pub-model-desc-light { font-size: 14px; color: #8A9E97; line-height: 1.65; margin-bottom: 16px; }
                .pub-model-desc-dark { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.65; margin-bottom: 16px; }
                .pub-model-detail-light { font-size: 12.5px; color: #C5D6D0; border-top: 1px solid #E1F5EE; padding-top: 14px; }
                .pub-model-detail-dark { font-size: 12.5px; color: rgba(29,158,117,0.8); border-top: 1px solid rgba(29,158,117,0.2); padding-top: 14px; }

                /* How It Works */
                .pub-how { background: #fff; padding: 96px 48px; }
                .pub-how-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
                .pub-how-h2 { font-family: var(--font-dm-serif, serif); font-size: clamp(28px, 3vw, 42px); font-weight: 400; color: #0D1B17; letter-spacing: -0.5px; margin-bottom: 40px; }
                .pub-step { display: flex; gap: 20px; margin-bottom: 28px; }
                .pub-step-num { font-family: var(--font-dm-serif, serif); font-size: 13px; font-weight: 400; color: #1D9E75; background: #E1F5EE; border-radius: 8px; padding: 6px 10px; height: fit-content; flex-shrink: 0; margin-top: 2px; letter-spacing: 1px; }
                .pub-step-title { font-family: var(--font-dm-serif, serif); font-size: 17px; color: #0D1B17; margin-bottom: 4px; }
                .pub-step-desc { font-size: 14px; color: #8A9E97; line-height: 1.65; }

                /* Pipeline visual */
                .pub-pipeline { display: flex; flex-direction: column; align-items: center; gap: 0; }
                .pub-pipe-node { width: 56px; height: 56px; border-radius: 50%; background: #E1F5EE; border: 2px solid #1D9E75; display: flex; align-items: center; justify-content: center; color: #1D9E75; position: relative; z-index: 2; }
                .pub-pipe-node-active { background: #1D9E75; border-color: #0F6E56; color: #fff; }
                .pub-pipe-connector { width: 2px; height: 40px; background: linear-gradient(to bottom, #1D9E75, #C5D6D0); position: relative; }
                .pub-pipe-dot { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #1D9E75; left: 50%; transform: translateX(-50%); animation: float 2s ease-in-out infinite; }
                .pub-pipe-row { display: flex; align-items: center; gap: 20px; }
                .pub-pipe-label { font-family: var(--font-dm-sans, sans-serif); font-size: 13px; font-weight: 600; color: #2F4A40; }

                /* Footer */
                .pub-footer { background: #0D1B17; padding: 72px 48px 0; }
                .pub-footer-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 48px; padding-bottom: 56px; }
                .pub-footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; text-decoration: none; }
                .pub-footer-tagline { font-size: 12px; color: rgba(29,158,117,0.7); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 12px; }
                .pub-footer-desc { font-size: 13.5px; color: rgba(255,255,255,0.4); line-height: 1.65; max-width: 260px; }
                .pub-footer-col-title { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 18px; }
                .pub-footer-link { display: block; font-size: 14px; color: rgba(255,255,255,0.55); text-decoration: none; margin-bottom: 10px; transition: color 0.15s; }
                .pub-footer-link:hover { color: #5DCAA5; }
                .pub-footer-contact { font-size: 14px; color: rgba(255,255,255,0.55); margin-bottom: 10px; }
                .pub-footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding: 20px 0; display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; }
                .pub-footer-copy { font-size: 13px; color: rgba(255,255,255,0.25); }

                @media (max-width: 1024px) {
                    .pub-hero-inner { grid-template-columns: 1fr; gap: 48px; }
                    .pub-fc-1, .pub-fc-2, .pub-fc-3 { display: none; }
                    .pub-feat-grid { grid-template-columns: 1fr 1fr; }
                    .pub-models-grid { grid-template-columns: 1fr; }
                    .pub-how-inner { grid-template-columns: 1fr; gap: 40px; }
                    .pub-footer-inner { grid-template-columns: 1fr 1fr; gap: 32px; }
                    .pub-stats-inner { grid-template-columns: repeat(2, 1fr); gap: 24px; }
                    .pub-stat + .pub-stat::before { display: none; }
                }
                @media (max-width: 768px) {
                    .pub-home-hero { padding: 96px 24px 64px; }
                    .pub-stats-bar { padding: 32px 24px; }
                    .pub-features { padding: 64px 24px; }
                    .pub-models { padding: 64px 24px; }
                    .pub-how { padding: 64px 24px; }
                    .pub-footer { padding: 56px 24px 0; }
                    .pub-feat-grid { grid-template-columns: 1fr 1fr; }
                    .pub-footer-inner { grid-template-columns: 1fr; }
                    .pub-stats-inner { grid-template-columns: 1fr 1fr; }
                }
            `}</style>

            <PublicNavbar />

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <section className="pub-home-hero">
                {/* Background glow */}
                <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 65%)', top: -200, right: -100, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(8,80,65,0.1) 0%, transparent 65%)', bottom: -100, left: -80, pointerEvents: 'none' }} />

                <div className="pub-hero-inner">
                    {/* Left col */}
                    <div>
                        <div className="pub-hero-badge">
                            <span className="pub-hero-dot" />
                            CLINICAL DECISION SUPPORT · AI
                        </div>
                        <h1 className="pub-hero-h1">
                          Where Clinical Precision<br/>
                          <em style={{ color: '#1D9E75', fontStyle: 'italic' }}>Meets Artificial Intelligence.</em>
                        </h1>
                        <p className="pub-hero-p">
                            Diagnovate harnesses ensemble deep learning to analyze thyroid ultrasound scans — delivering majority-voted, clinician-ready diagnoses that support and empower physician decision-making.
                        </p>
                        <div className="pub-hero-btns">
                            <Link href="/contact" className="pub-btn-solid">Request Access</Link>
                            <Link href="/about" className="pub-btn-ghost-white">Learn More</Link>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          marginTop: 32, padding: '14px 20px',
                          background: 'rgba(29,158,117,0.08)',
                          border: '1px solid rgba(29,158,117,0.2)',
                          borderRadius: 12, maxWidth: 420
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                          </svg>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                            <strong style={{ color: '#5DCAA5', fontWeight: 600 }}>Designed to assist, not replace.</strong>{' '}
                            Diagnovate supports clinical judgment — every result is a second opinion, not a final verdict.
                          </span>
                        </div>
                    </div>

                    {/* Right col — Hexagonal scan visual */}
                    <div className="pub-hex-visual">
                        <div className="pub-hex-outer">
                            {/* Main hex SVG */}
                            <svg width="300" height="340" viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0 }}>
                                {/* Outer hex */}
                                <polygon
                                    points="150,10 280,80 280,260 150,330 20,260 20,80"
                                    fill="rgba(29,158,117,0.04)"
                                    stroke="#1D9E75"
                                    strokeWidth="1.5"
                                    style={{ animation: 'hexPulse 2.5s ease-in-out infinite' }}
                                />
                                {/* Inner hex */}
                                <polygon
                                    points="150,50 245,102 245,238 150,290 55,238 55,102"
                                    fill="rgba(29,158,117,0.06)"
                                    stroke="#1D9E75"
                                    strokeWidth="1"
                                    strokeDasharray="6 4"
                                    opacity="0.6"
                                />
                                {/* Scan area */}
                                <rect x="80" y="120" width="140" height="100" rx="8" fill="rgba(29,158,117,0.05)" stroke="rgba(29,158,117,0.3)" strokeWidth="1" />
                                {/* Grid lines */}
                                {[100, 120, 140, 160, 180, 200].map(x => (
                                    <line key={x} x1={x} y1="120" x2={x} y2="220"
                                        stroke="rgba(29,158,117,0.15)" strokeWidth="0.5" />
                                ))}
                                {[140, 160, 180, 200].map(y => (
                                    <line key={y} x1="80" y1={y} x2="220" y2={y}
                                        stroke="rgba(29,158,117,0.15)" strokeWidth="0.5" />
                                ))}
                                {/* Nodule simulation */}
                                <circle cx="140" cy="170" r="22" fill="rgba(29,158,117,0.15)" stroke="#1D9E75" strokeWidth="1.5" />
                                <circle cx="140" cy="170" r="10" fill="rgba(29,158,117,0.35)" />
                                {/* Crosshair */}
                                <line x1="118" y1="170" x2="162" y2="170" stroke="#1D9E75" strokeWidth="1" strokeDasharray="3 2" />
                                <line x1="140" y1="148" x2="140" y2="192" stroke="#1D9E75" strokeWidth="1" strokeDasharray="3 2" />
                                {/* AI label */}
                                <rect x="155" y="155" width="58" height="18" rx="4" fill="rgba(29,158,117,0.15)" />
                                <text x="184" y="168" textAnchor="middle" fill="#5DCAA5" fontSize="9" fontFamily="monospace" fontWeight="700">THYROID AI</text>
                                {/* Corner marks */}
                                <path d="M80,120 L96,120 M80,120 L80,136" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" />
                                <path d="M220,120 L204,120 M220,120 L220,136" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" />
                                <path d="M80,220 L96,220 M80,220 L80,204" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" />
                                <path d="M220,220 L204,220 M220,220 L220,204" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" />
                            </svg>

                            {/* Scan line animation */}
                            <div style={{ position: 'absolute', top: 50, left: 55, right: 55, bottom: 50, overflow: 'hidden', borderRadius: 4, pointerEvents: 'none' }}>
                                <div className="pub-hex-scan-line" />
                            </div>

                            {/* Floating cards */}
                            <div className="pub-float-card pub-fc-1">
                                <div>
                                    <div className="pub-fc-num" style={{ color: '#1D9E75' }}>97.4%</div>
                                    <div className="pub-fc-lbl">Confidence Score</div>
                                </div>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
                            </div>
                            <div className="pub-float-card pub-fc-2">
                                <div>
                                    <div className="pub-fc-num">1.2s</div>
                                    <div className="pub-fc-lbl">Inference Time</div>
                                </div>
                            </div>
                            <div className="pub-float-card pub-fc-3">
                                <span className="pub-fc-dot" />
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0D1B17' }}>Models Online</div>
                                    <div className="pub-fc-lbl">3 / 3 Active</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ─────────────────────────────────────────────── */}
            <div className="pub-stats-bar">
                <div className="pub-stats-inner">
                    {[
                        { num: '5', lbl: 'Core Capabilities' },
                        { num: '9', lbl: 'AI Models' },
                        { num: '97.6%', lbl: 'Peak Accuracy' },
                        { num: '16', lbl: 'Thyroid Biomarkers' },
                    ].map(s => (
                        <div key={s.lbl} className="pub-stat">
                            <div className="pub-stat-num">{s.num}</div>
                            <div className="pub-stat-lbl">{s.lbl}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FEATURES ──────────────────────────────────────────────── */}
            <section className="pub-features">
                <div className="pub-features-inner">
                    <div className="pub-sec-eyebrow">Capabilities</div>
                    <h2 className="pub-sec-h2">Everything You Need for Thyroid Diagnostics</h2>
                    <div className="pub-feat-grid">
                        {features.map(f => (
                            <div key={f.title} className="pub-feat-card">
                                <div className="pub-feat-icon">{f.icon}</div>
                                <div className="pub-feat-title">{f.title}</div>
                                <div className="pub-feat-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── AI MODELS ─────────────────────────────────────────────── */}
            <section className="pub-models">
              <div className="pub-models-inner">
                <div className="pub-sec-eyebrow">Ensemble Intelligence</div>
                <h2 className="pub-sec-h2">Nine Models. Two Pipelines. One Verdict.</h2>

                {/* IMAGE PIPELINE */}
                <div style={{ marginTop: 48 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#1D9E75' }}>
                      Ultrasound Image Pipeline
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(29,158,117,0.2)' }} />
                    <span style={{ fontSize: 11, color: '#8A9E97', whiteSpace: 'nowrap' }}>3 Vision Models</span>
                  </div>
                  <div className="pub-models-grid">
                    {models.filter(m => m.category === 'Image').map(m => (
                      <div key={m.name} className={`pub-model-card ${m.dark ? 'pub-model-card-dark' : 'pub-model-card-light'}`}
                        style={m.dark ? { position: 'relative', overflow: 'hidden' } : {}}>
                        {m.dark && (
                          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(29,158,117,0.25) 0%, transparent 70%)',
                            top: -60, right: -60, pointerEvents: 'none', zIndex: 0 }} />
                        )}
                        {m.badge && <span className="pub-model-badge">{m.badge}</span>}
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                            color: m.dark ? 'rgba(93,202,165,0.7)' : '#8A9E97', marginBottom: 8 }}>Vision Model</div>
                          <div className={m.dark ? 'pub-model-name-dark' : 'pub-model-name-light'}>{m.name}</div>
                          <div className={m.dark ? 'pub-model-desc-dark' : 'pub-model-desc-light'}>{m.desc}</div>
                          {m.acc && (
                            <div style={{ display: 'flex', gap: 16, margin: '14px 0',
                              padding: '10px 14px', borderRadius: 8,
                              background: m.dark ? 'rgba(29,158,117,0.12)' : '#F4F9F7' }}>
                              <div>
                                <div style={{ fontSize: 18, fontFamily: 'var(--font-dm-serif, serif)',
                                  color: m.dark ? '#5DCAA5' : '#1D9E75' }}>{m.acc}</div>
                                <div style={{ fontSize: 10, color: m.dark ? 'rgba(255,255,255,0.4)' : '#8A9E97', letterSpacing: 0.5 }}>Accuracy</div>
                              </div>
                              <div style={{ width: 1, background: m.dark ? 'rgba(255,255,255,0.1)' : '#E1F5EE' }} />
                              <div>
                                <div style={{ fontSize: 18, fontFamily: 'var(--font-dm-serif, serif)',
                                  color: m.dark ? '#5DCAA5' : '#1D9E75' }}>{m.auc}</div>
                                <div style={{ fontSize: 10, color: m.dark ? 'rgba(255,255,255,0.4)' : '#8A9E97', letterSpacing: 0.5 }}>AUC Score</div>
                              </div>
                            </div>
                          )}
                          <div className={m.dark ? 'pub-model-detail-dark' : 'pub-model-detail-light'}>{m.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LAB PIPELINE */}
                <div style={{ marginTop: 48 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', color: '#1D9E75' }}>
                      Lab Results Pipeline
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(29,158,117,0.2)' }} />
                    <span style={{ fontSize: 11, color: '#8A9E97', whiteSpace: 'nowrap' }}>3 ML Models</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {models.filter(m => m.category === 'Lab').map(m => (
                      <div key={m.name} className="pub-model-card pub-model-card-light">
                        {m.badge && <span className="pub-model-badge" style={{
                          background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)',
                          color: '#0F6E56', borderRadius: 100 }}>{m.badge}</span>}
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
                          textTransform: 'uppercase', color: '#8A9E97', marginBottom: 8,
                          marginTop: m.badge ? 8 : 0 }}>Lab Model</div>
                        <div className="pub-model-name-light">{m.name}</div>
                        <div className="pub-model-desc-light">{m.desc}</div>
                        <div className="pub-model-detail-light">{m.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADDITIONAL MODELS NOTE */}
                <div style={{ marginTop: 32, padding: '16px 24px', background: '#fff',
                  border: '1px solid #E1F5EE', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['Enhancement', 'Auto-Select', 'Report'].map(tag => (
                      <span key={tag} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1,
                        textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100,
                        background: '#E1F5EE', color: '#0F6E56' }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ width: 1, height: 28, background: '#E1F5EE' }} />
                  <span style={{ fontSize: 13, color: '#8A9E97', lineHeight: 1.5 }}>
                    Plus dedicated models for image enhancement, automatic pipeline selection, and structured report generation.
                  </span>
                </div>
              </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
            <section className="pub-how">
                <div className="pub-how-inner">
                    {/* Left: steps */}
                    <div>
                        <div className="pub-sec-eyebrow" style={{ textAlign: 'left', marginBottom: 16 }}>Workflow</div>
                        <h2 className="pub-how-h2">From Scan to Verdict in Seconds</h2>
                        {steps.map(s => (
                            <div key={s.num} className="pub-step">
                                <div className="pub-step-num">{s.num}</div>
                                <div>
                                    <div className="pub-step-title">{s.title}</div>
                                    <div className="pub-step-desc">{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: animated pipeline visual */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="pub-pipeline">
                            {[
                                { label: 'Upload Scan', icon: <IconUpload />, active: true },
                                { connector: true },
                                { label: 'Preprocess', icon: <IconImage />, active: true },
                                { connector: true },
                                { label: 'Inference × 3', icon: <IconCpu />, active: true },
                                { connector: true },
                                { label: 'Report', icon: <IconBarChart />, active: true },
                            ].map((item, i) => {
                                if ('connector' in item) {
                                    return (
                                        <div key={i} className="pub-pipe-connector">
                                            <div className="pub-pipe-dot" style={{ animationDelay: `${i * 0.4}s`, top: `${20 + (i % 3) * 5}px` }} />
                                        </div>
                                    );
                                }
                                return (
                                    <div key={i} className="pub-pipe-row">
                                        <div className={`pub-pipe-node ${item.active ? 'pub-pipe-node-active' : ''}`}>
                                            {item.icon}
                                        </div>
                                        <span className="pub-pipe-label">{item.label}</span>
                                    </div>
                                );
                            })}
                            {/* Confidence badge */}
                            <div style={{ marginTop: 24, background: '#E1F5EE', border: '1px solid #C5D6D0', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D9E75', animation: 'dotBlink 1.4s ease-in-out infinite' }} />
                                <div>
                                    <div style={{ fontFamily: 'var(--font-dm-serif, serif)', fontSize: 20, color: '#0D1B17', lineHeight: 1 }}>97.4%</div>
                                    <div style={{ fontSize: 11, color: '#8A9E97', marginTop: 2 }}>Confidence · Majority Vote</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

             {/* ── FOOTER ────────────────────────────────────────────────── */}
            <footer className="pub-footer">
                <div className="pub-footer-inner">
                    {/* Col 1: Brand */}
                    <div>
                        <Link href="/" className="pub-footer-logo">
                            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                                <polygon points="18,2 32,9.5 32,26.5 18,34 4,26.5 4,9.5" fill="#1D9E75" opacity="0.15" stroke="#1D9E75" strokeWidth="1.5" />
                                <circle cx="18" cy="18" r="5" fill="#1D9E75" />
                            </svg>
                            <span style={{ fontFamily: 'var(--font-dm-serif, serif)', fontSize: 18, color: '#fff' }}>
                                Diagn<em style={{ fontStyle: 'italic', color: '#1D9E75' }}>ovate</em>
                            </span>
                        </Link>
                        <div className="pub-footer-tagline">Medical AI Diagnostics</div>
                        <div className="pub-footer-desc">Clinical-grade thyroid cancer detection powered by ensemble deep learning and CLAHE image preprocessing.</div>
                    </div>

                    {/* Col 2: Platform */}
                    <div>
                        <div className="pub-footer-col-title">Platform</div>
                        <Link href="/dashboard" className="pub-footer-link">Dashboard</Link>
                        <Link href="/ai-diagnosis" className="pub-footer-link">AI Diagnosis</Link>
                        <Link href="/image-enhancement" className="pub-footer-link">Enhancement</Link>
                        <Link href="/report" className="pub-footer-link">Reports</Link>
                    </div>

                    {/* Col 3: Company */}
                    <div>
                        <div className="pub-footer-col-title">Company</div>
                        <Link href="/about" className="pub-footer-link">About</Link>
                        <Link href="/contact" className="pub-footer-link">Contact</Link>
                        <span className="pub-footer-link" style={{ cursor: 'default' }}>Privacy Policy</span>
                        <span className="pub-footer-link" style={{ cursor: 'default' }}>Terms</span>
                    </div>

                    {/* Col 4: Contact */}
                    <div>
                        <div className="pub-footer-col-title">Contact</div>
                        <div className="pub-footer-contact">diagnovate@outlook.com</div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 12, lineHeight: 1.6 }}>Built with care for clinicians.</div>
                    </div>
                </div>

                <div className="pub-footer-bottom">
                    <span className="pub-footer-copy">© 2026 Diagnovate. All rights reserved.</span>
                    <span className="pub-footer-copy">Advanced AI for thyroid cancer diagnostics</span>
                </div>
            </footer>
        </>
    );
}
