// About page — company story, mission, tech stack, and vision. Public-facing marketing redesign.
'use client';

import Link from 'next/link';
import PublicNavbar from '../../components/PublicNavbar';

const milestones = [
    { period: '2023 Q3', event: 'Research began on thyroid cancer AI detection' },
    { period: '2024 Q1', event: 'First ensemble model achieved 94% accuracy' },
    { period: '2024 Q3', event: 'Real-time inference pipeline launched' },
    { period: '2025 Q1', event: 'Clinical trial integration phase begins' },
];

const values = [
    { title: 'Accuracy', desc: 'Every prediction backed by ensemble consensus' },
    { title: 'Privacy', desc: 'Patient data never leaves your infrastructure' },
    { title: 'Speed', desc: 'Clinical workflow requires real-time response' },
    { title: 'Transparency', desc: 'Explainable confidence scores, not black boxes' },
];

const stack = [
    { name: 'Flask', desc: 'Python REST API backend', icon: '🐍' },
    { name: 'Next.js 14', desc: 'React framework, App Router', icon: '▲' },
    { name: 'Railway', desc: 'Backend deployment & scaling', icon: '🚄' },
    { name: 'Vercel', desc: 'Frontend edge deployment', icon: '▲' },
    { name: 'scikit-learn', desc: 'XGBoost & classical ML', icon: '📊' },
    { name: 'HuggingFace', desc: 'Pretrained vision models', icon: '🤗' },
    { name: 'OpenCV', desc: 'CLAHE image preprocessing', icon: '📷' },
    { name: 'PostgreSQL', desc: 'Relational data storage', icon: '🐘' },
];

export default function AboutPage() {
    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { overflow-x: hidden; -webkit-font-smoothing: antialiased; }

                .ab-hero { background: #fff; padding: 120px 48px 80px; }
                .ab-hero-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; }

                .ab-eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #1D9E75; margin-bottom: 16px; }
                .ab-h1 { font-family: var(--font-dm-serif, 'DM Serif Display', serif); font-size: clamp(34px, 3.5vw, 44px); font-weight: 400; line-height: 1.12; letter-spacing: -0.5px; color: #0D1B17; margin-bottom: 20px; animation: fadeUp 0.7s cubic-bezier(.16,1,.3,1) both; }
                .ab-desc { font-size: 16px; color: #8A9E97; line-height: 1.75; margin-bottom: 28px; animation: fadeUp 0.7s 0.1s cubic-bezier(.16,1,.3,1) both; }
                .ab-accent-line { width: 64px; height: 3px; background: #1D9E75; border-radius: 2px; }

                /* Timeline */
                .ab-timeline { position: relative; padding-left: 24px; animation: fadeUp 0.7s 0.15s cubic-bezier(.16,1,.3,1) both; }
                .ab-timeline::before { content: ''; position: absolute; left: 0; top: 6px; bottom: 6px; width: 2px; background: linear-gradient(to bottom, #1D9E75, #C5D6D0); border-radius: 1px; }
                .ab-milestone { position: relative; margin-bottom: 28px; }
                .ab-milestone::before { content: ''; position: absolute; left: -28px; top: 6px; width: 12px; height: 12px; border-radius: 50%; background: #1D9E75; border: 2.5px solid #fff; box-shadow: 0 0 0 3px rgba(29,158,117,0.25); }
                .ab-milestone-period { font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #1D9E75; text-transform: uppercase; margin-bottom: 4px; }
                .ab-milestone-event { font-size: 14.5px; color: #2F4A40; font-weight: 500; line-height: 1.5; }

                /* Mission section */
                .ab-mission { background: #F4F9F7; padding: 96px 48px; }
                .ab-mission-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: start; }
                .ab-mission-h2 { font-family: var(--font-dm-serif, serif); font-size: clamp(28px, 3vw, 38px); color: #0D1B17; letter-spacing: -0.5px; margin-bottom: 20px; }
                .ab-mission-p { font-size: 15px; color: #8A9E97; line-height: 1.75; }
                .ab-values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .ab-value-card { background: #fff; border: 1px solid #C5D6D0; border-radius: 14px; padding: 22px; transition: all 0.22s; }
                .ab-value-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(29,158,117,0.1); border-color: #5DCAA5; }
                .ab-value-title { font-family: var(--font-dm-serif, serif); font-size: 16px; color: #0D1B17; margin-bottom: 6px; }
                .ab-value-desc { font-size: 13px; color: #8A9E97; line-height: 1.6; }
                .ab-value-dot { width: 8px; height: 8px; border-radius: 50%; background: #1D9E75; margin-bottom: 12px; }

                /* Tech Stack */
                .ab-stack { background: #fff; padding: 96px 48px; }
                .ab-stack-inner { max-width: 1200px; margin: 0 auto; }
                .ab-sec-eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #1D9E75; text-align: center; margin-bottom: 12px; }
                .ab-sec-h2 { font-family: var(--font-dm-serif, serif); font-size: clamp(28px, 3vw, 40px); font-weight: 400; text-align: center; color: #0D1B17; letter-spacing: -0.5px; margin-bottom: 52px; }
                .ab-stack-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
                .ab-stack-card { background: #fff; border: 1px solid #E1F5EE; border-radius: 14px; padding: 24px 20px; text-align: center; transition: all 0.22s; cursor: default; }
                .ab-stack-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(29,158,117,0.1); border-color: #5DCAA5; }
                .ab-stack-icon-circle { width: 48px; height: 48px; border-radius: 12px; background: #E1F5EE; display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 14px; }
                .ab-stack-name { font-family: var(--font-dm-serif, serif); font-size: 15px; color: #0D1B17; margin-bottom: 5px; }
                .ab-stack-desc { font-size: 12px; color: #8A9E97; line-height: 1.5; }

                /* Vision closing */
                .ab-vision { background: #0D1B17; padding: 96px 48px; text-align: center; }
                .ab-vision-inner { max-width: 720px; margin: 0 auto; }
                .ab-quote { font-family: var(--font-dm-serif, serif); font-size: clamp(22px, 2.5vw, 32px); font-style: italic; color: #fff; line-height: 1.4; letter-spacing: -0.3px; margin-bottom: 24px; }
                .ab-quote-mark { color: #1D9E75; }
                .ab-vision-desc { font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.75; margin-bottom: 36px; }
                .ab-vision-btn { display: inline-flex; align-items: center; gap: 8px; background: #1D9E75; color: #fff; font-family: var(--font-dm-sans, sans-serif); font-size: 15px; font-weight: 700; padding: 13px 28px; border-radius: 12px; text-decoration: none; transition: all 0.22s; }
                .ab-vision-btn:hover { background: #0F6E56; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(29,158,117,0.4); }

                /* Footer strip */
                .ab-footer { background: #0D1B17; border-top: 1px solid rgba(255,255,255,0.08); padding: 24px 48px; display: flex; align-items: center; justify-content: space-between; }
                .ab-footer-copy { font-size: 13px; color: rgba(255,255,255,0.25); }

                @media (max-width: 1024px) {
                    .ab-hero-inner { grid-template-columns: 1fr; gap: 48px; }
                    .ab-mission-inner { grid-template-columns: 1fr; gap: 40px; }
                    .ab-stack-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 768px) {
                    .ab-hero { padding: 100px 24px 60px; }
                    .ab-mission { padding: 64px 24px; }
                    .ab-stack { padding: 64px 24px; }
                    .ab-vision { padding: 64px 24px; }
                    .ab-footer { padding: 20px 24px; flex-direction: column; gap: 10px; text-align: center; }
                    .ab-values-grid { grid-template-columns: 1fr; }
                    .ab-stack-grid { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>

            <PublicNavbar />

            {/* ── HERO ─────────────────────────────────────────────────── */}
            <section className="ab-hero">
                <div className="ab-hero-inner">
                    {/* Left */}
                    <div>
                        <div className="ab-eyebrow">OUR STORY</div>
                        <h1 className="ab-h1">Built at the intersection of medicine and machine intelligence</h1>
                        <p className="ab-desc">
                            Diagnovate began as a research question: could ensemble deep learning match the diagnostic accuracy of specialist pathologists? Three models, thousands of scans, and one mission later — we believe it can.
                        </p>
                        <div className="ab-accent-line" />
                    </div>

                    {/* Right: Timeline */}
                    <div>
                        <div style={{ marginBottom: 20, fontSize: 11, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#1D9E75' }}>Milestones</div>
                        <div className="ab-timeline">
                            {milestones.map(m => (
                                <div key={m.period} className="ab-milestone">
                                    <div className="ab-milestone-period">{m.period}</div>
                                    <div className="ab-milestone-event">{m.event}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MISSION ───────────────────────────────────────────────── */}
            <section className="ab-mission">
                <div className="ab-mission-inner">
                    {/* Left */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#1D9E75', marginBottom: 14 }}>Mission</div>
                        <h2 className="ab-mission-h2">Our Mission</h2>
                        <p className="ab-mission-p">
                            We exist to democratize access to clinical-grade thyroid cancer diagnostics. By combining three deep learning models into a single majority-voted prediction engine, Diagnovate gives every clinician — regardless of institution — the confidence of a specialist consensus in under two seconds.
                        </p>
                        <p className="ab-mission-p" style={{ marginTop: 16 }}>
                            We believe AI should augment the clinician, not replace them. Every confidence score is explainable. Every model vote is transparent. Every prediction is a tool, not a verdict.
                        </p>
                    </div>

                    {/* Right: Values grid */}
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#1D9E75', marginBottom: 20 }}>Core Values</div>
                        <div className="ab-values-grid">
                            {values.map(v => (
                                <div key={v.title} className="ab-value-card">
                                    <div className="ab-value-dot" />
                                    <div className="ab-value-title">{v.title}</div>
                                    <div className="ab-value-desc">{v.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TECH STACK ────────────────────────────────────────────── */}
            <section className="ab-stack">
                <div className="ab-stack-inner">
                    <div className="ab-sec-eyebrow">Engineering</div>
                    <h2 className="ab-sec-h2">The Stack Behind the Science</h2>
                    <div className="ab-stack-grid">
                        {stack.map(s => (
                            <div key={s.name} className="ab-stack-card">
                                <div className="ab-stack-icon-circle">{s.icon}</div>
                                <div className="ab-stack-name">{s.name}</div>
                                <div className="ab-stack-desc">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── VISION ────────────────────────────────────────────────── */}
            <section className="ab-vision">
                <div className="ab-vision-inner">
                    <div style={{ fontSize: 40, color: '#1D9E75', marginBottom: 16, fontFamily: 'var(--font-dm-serif, serif)' }}>"</div>
                    <div className="ab-quote">
                        We believe AI should augment the clinician, not replace them.
                    </div>
                    <p className="ab-vision-desc">
                        Every Diagnovate prediction comes with a confidence score, an explanation, and a model-by-model breakdown. Transparency isn't a feature — it's the foundation.
                    </p>
                    <Link href="/contact" className="ab-vision-btn">Get in Touch</Link>
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────────────────────── */}
            <div className="ab-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                        <polygon points="18,2 32,9.5 32,26.5 18,34 4,26.5 4,9.5" fill="#1D9E75" opacity="0.2" stroke="#1D9E75" strokeWidth="1.5"/>
                        <circle cx="18" cy="18" r="4" fill="#1D9E75"/>
                    </svg>
                    <span style={{ fontFamily: 'var(--font-dm-serif, serif)', fontSize: 16, color: '#fff' }}>
                        Diagn<em style={{ fontStyle: 'italic', color: '#1D9E75' }}>ovate</em>
                    </span>
                </div>
                <div className="ab-footer-copy">© 2026 Diagnovate. Advanced AI for thyroid cancer diagnostics.</div>
            </div>
        </>
    );
}
