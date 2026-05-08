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


const team = [
    { initials: 'DA', name: 'Danah Alluhaybi', role: 'Lead ML Engineer & Project Lead', email: 'danah@diagnovate.com' },
    { initials: 'JA', name: 'Jana Alghamdi',   role: 'Frontend Engineer & UI/UX Designer', email: 'jana@diagnovate.com' },
    { initials: 'RA', name: 'Renad Almazroi',  role: 'Backend Engineer & API Architect', email: 'renad@diagnovate.com' },
    { initials: 'RJ', name: 'Reena Aljahdli',  role: 'AI Research Engineer & Model Training', email: 'reena@diagnovate.com' },
];

function StackIcon({ name }: { name: string }) {
    const teal = '#1D9E75';
    const ink  = '#0D1B17';
    switch (name) {
        case 'Flask':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={teal} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4h8M11 4v9l-6 11h20l-6-11V4"/>
                    <path d="M8 20h14" strokeOpacity="0.4"/>
                    <circle cx="12" cy="24" r="1.2" fill={teal} stroke="none"/>
                    <circle cx="17" cy="22" r="0.9" fill={teal} stroke="none" opacity="0.6"/>
                </svg>
            );
        case 'Next.js 14':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <path d="M7 24V6l12 18V6" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 6v18" stroke={ink} strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
            );
        case 'Railway':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={teal} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 24V6h9a5 5 0 0 1 0 10H8"/>
                    <path d="M14 16l7 8"/>
                </svg>
            );
        case 'Vercel':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <path d="M15 5L27 25H3L15 5Z" fill={ink}/>
                </svg>
            );
        case 'scikit-learn':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <rect x="3"  y="18" width="6" height="9" rx="1.5" fill={teal}/>
                    <rect x="12" y="12" width="6" height="15" rx="1.5" fill={teal} opacity="0.85"/>
                    <rect x="21" y="6"  width="6" height="21" rx="1.5" fill={teal} opacity="0.6"/>
                    <path d="M3 27h24" stroke={teal} strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
            );
        case 'HuggingFace':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                    <circle cx="6"  cy="11" r="2.5" fill={teal} opacity="0.55"/>
                    <circle cx="6"  cy="21" r="2.5" fill={teal} opacity="0.55"/>
                    <circle cx="15" cy="6"  r="2.5" fill={teal}/>
                    <circle cx="15" cy="15" r="2.5" fill={teal}/>
                    <circle cx="15" cy="24" r="2.5" fill={teal}/>
                    <circle cx="24" cy="11" r="2.5" fill={teal} opacity="0.55"/>
                    <circle cx="24" cy="21" r="2.5" fill={teal} opacity="0.55"/>
                    <path d="M8.2 11.8 12.6 7.2M8.2 20.2 12.6 15.8M8.2 21.8 12.6 23.2M17.5 6.8 21.6 10.2M17.5 15 21.6 12M17.5 23.2 21.6 20.8" stroke={teal} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
                </svg>
            );
        case 'OpenCV':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={teal} strokeWidth="1.7" strokeLinecap="round">
                    <path d="M3 15s4-8 12-8 12 8 12 8-4 8-12 8S3 15 3 15Z"/>
                    <circle cx="15" cy="15" r="4"/>
                    <circle cx="15" cy="15" r="1.5" fill={teal} stroke="none"/>
                </svg>
            );
        case 'PostgreSQL':
            return (
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke={teal} strokeWidth="1.7" strokeLinecap="round">
                    <ellipse cx="15" cy="8" rx="9" ry="3.5"/>
                    <path d="M6 8v14c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5V8"/>
                    <path d="M6 15c0 1.9 4 3.5 9 3.5s9-1.6 9-3.5" opacity="0.45"/>
                </svg>
            );
        default:
            return null;
    }
}

export default function AboutPage() {
    const stack = [
        { name: 'Flask',        desc: 'Python REST API backend' },
        { name: 'Next.js 14',   desc: 'React framework, App Router' },
        { name: 'Railway',      desc: 'Backend deployment & scaling' },
        { name: 'Vercel',       desc: 'Frontend edge deployment' },
        { name: 'scikit-learn', desc: 'XGBoost & classical ML' },
        { name: 'HuggingFace',  desc: 'Pretrained vision models' },
        { name: 'OpenCV',       desc: 'CLAHE image preprocessing' },
        { name: 'PostgreSQL',   desc: 'Relational data storage' },
    ];

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
                .ab-stack-card { background: #fff; border: 1px solid rgba(29,158,117,0.12); border-radius: 16px; padding: 24px 20px; text-align: center; transition: all 0.22s cubic-bezier(.16,1,.3,1); cursor: default; }
                .ab-stack-card:hover { transform: translateY(-4px); box-shadow: 0 14px 40px rgba(29,158,117,0.1); border-color: #1D9E75; }
                .ab-stack-icon-wrap { width: 56px; height: 56px; border-radius: 14px; background: #E1F5EE; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
                .ab-stack-name { font-family: var(--font-dm-serif, serif); font-size: 15px; color: #0D1B17; margin-bottom: 5px; }
                .ab-stack-desc { font-size: 12px; color: #8A9E97; line-height: 1.5; }

                /* Team */
                .ab-team { background: #F4F9F7; padding: 96px 48px; }
                .ab-team-inner { max-width: 1200px; margin: 0 auto; }
                .ab-team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 0; }
                .ab-team-card { background: #fff; border: 1px solid #D1E5DC; border-radius: 20px; padding: 32px 20px 24px; text-align: center; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); cursor: default; }
                .ab-team-card:hover { transform: translateY(-6px); border-color: #1D9E75; box-shadow: 0 16px 48px rgba(29,158,117,0.12); }
                .ab-team-avatar { width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #1D9E75, #085041); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 8px 24px rgba(29,158,117,0.25); }
                .ab-team-initials { font-family: var(--font-dm-serif, serif); font-size: 22px; color: #fff; letter-spacing: -0.5px; }
                .ab-team-name { font-family: var(--font-dm-serif, serif); font-size: 17px; color: #0D1B17; margin-bottom: 6px; line-height: 1.2; }
                .ab-team-role { font-size: 12.5px; color: #8A9E97; font-style: italic; line-height: 1.5; margin-bottom: 14px; }
                .ab-team-email { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: #1D9E75; text-decoration: none; font-weight: 600; transition: opacity 0.15s; }
                .ab-team-email:hover { opacity: 0.7; }

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
                    .ab-team-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 768px) {
                    .ab-hero { padding: 100px 24px 60px; }
                    .ab-mission { padding: 64px 24px; }
                    .ab-stack { padding: 64px 24px; }
                    .ab-team { padding: 64px 24px; }
                    .ab-vision { padding: 64px 24px; }
                    .ab-footer { padding: 20px 24px; flex-direction: column; gap: 10px; text-align: center; }
                    .ab-values-grid { grid-template-columns: 1fr; }
                    .ab-stack-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .ab-team-grid { grid-template-columns: 1fr; }
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
                                <div className="ab-stack-icon-wrap">
                                    <StackIcon name={s.name} />
                                </div>
                                <div className="ab-stack-name">{s.name}</div>
                                <div className="ab-stack-desc">{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TEAM ──────────────────────────────────────────────────── */}
            <section className="ab-team">
                <div className="ab-team-inner">
                    <div className="ab-sec-eyebrow">Our Team</div>
                    <h2 className="ab-sec-h2">The minds behind Diagnovate</h2>
                    <div className="ab-team-grid">
                        {team.map(m => (
                            <div key={m.initials} className="ab-team-card">
                                <div className="ab-team-avatar">
                                    <span className="ab-team-initials">{m.initials}</span>
                                </div>
                                <div className="ab-team-name">{m.name}</div>
                                <div className="ab-team-role">{m.role}</div>
                                <a href={`mailto:${m.email}`} className="ab-team-email">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <rect x="2" y="4" width="20" height="16" rx="2"/>
                                        <polyline points="2,4 12,13 22,4"/>
                                    </svg>
                                    {m.email}
                                </a>
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
