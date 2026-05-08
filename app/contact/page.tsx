// Contact page — contact info panel + message form with success state. Public-facing marketing redesign.
'use client';

import { useState } from 'react';
import PublicNavbar from '../../components/PublicNavbar';

const IconMail = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
    </svg>
);
const IconClock = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);
const IconCalendar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);
const IconCheck = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

export default function ContactPage() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const inputStyle = (name: string): React.CSSProperties => ({
        width: '100%',
        height: 48,
        padding: '0 14px',
        background: '#F4F9F7',
        border: `1.5px solid ${focusedField === name ? '#1D9E75' : '#C5D6D0'}`,
        borderRadius: 10,
        fontFamily: 'var(--font-dm-sans, sans-serif)',
        fontSize: 14,
        color: '#0D1B17',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focusedField === name ? '0 0 0 3px rgba(29,158,117,0.12)' : 'none',
    });

    const textareaStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 14px',
        background: '#F4F9F7',
        border: `1.5px solid ${focusedField === 'message' ? '#1D9E75' : '#C5D6D0'}`,
        borderRadius: 10,
        fontFamily: 'var(--font-dm-sans, sans-serif)',
        fontSize: 14,
        color: '#0D1B17',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: focusedField === 'message' ? '0 0 0 3px rgba(29,158,117,0.12)' : 'none',
        lineHeight: 1.6,
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase' as const,
        color: '#2F4A40',
        marginBottom: 6,
        fontFamily: 'var(--font-dm-sans, sans-serif)',
    };

    return (
        <>
            <style>{`
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }
                body { overflow-x: hidden; -webkit-font-smoothing: antialiased; }

                .ct-page { background: #fff; min-height: 100vh; padding: 120px 48px 80px; }
                .ct-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.4fr; gap: 48px; align-items: start; }

                /* Info panel */
                .ct-info { background: #F4F9F7; border-radius: 20px; padding: 40px; }
                .ct-info-h2 { font-family: var(--font-dm-serif, 'DM Serif Display', serif); font-size: 32px; color: #0D1B17; letter-spacing: -0.3px; margin-bottom: 14px; }
                .ct-info-p { font-size: 15px; color: #8A9E97; line-height: 1.75; margin-bottom: 32px; }
                .ct-info-cards { display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px; }
                .ct-info-card { display: flex; align-items: center; gap: 16px; background: #fff; border: 1px solid #C5D6D0; border-radius: 14px; padding: 18px; transition: all 0.2s; }
                .ct-info-card:hover { border-color: #5DCAA5; box-shadow: 0 6px 20px rgba(29,158,117,0.1); }
                .ct-info-icon { width: 44px; height: 44px; border-radius: 11px; background: #E1F5EE; border: 1px solid #C5D6D0; display: flex; align-items: center; justify-content: center; color: #1D9E75; flex-shrink: 0; }
                .ct-info-label { font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #8A9E97; margin-bottom: 3px; }
                .ct-info-value { font-size: 14px; font-weight: 600; color: #0D1B17; }
                .ct-info-note { font-size: 13px; color: #8A9E97; line-height: 1.65; border-top: 1px solid #C5D6D0; padding-top: 20px; }

                /* Form card */
                .ct-form-card { background: #fff; border: 1px solid #C5D6D0; border-radius: 20px; padding: 40px; box-shadow: 0 8px 40px rgba(13,27,23,0.06); }
                .ct-form-h2 { font-family: var(--font-dm-serif, serif); font-size: 26px; color: #0D1B17; margin-bottom: 28px; }
                .ct-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
                .ct-form-field { margin-bottom: 16px; }

                /* Success */
                .ct-success { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 48px 24px; }
                .ct-success-ring { width: 80px; height: 80px; border-radius: 50%; background: #E1F5EE; border: 2px solid #5DCAA5; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
                .ct-success-h3 { font-family: var(--font-dm-serif, serif); font-size: 26px; color: #0D1B17; margin-bottom: 10px; }
                .ct-success-p { font-size: 14px; color: #8A9E97; line-height: 1.65; max-width: 320px; }

                /* Footer strip */
                .ct-footer { background: #0D1B17; border-top: 1px solid rgba(255,255,255,0.08); padding: 24px 48px; display: flex; align-items: center; justify-content: space-between; }
                .ct-footer-copy { font-size: 13px; color: rgba(255,255,255,0.25); }

                @media (max-width: 1024px) {
                    .ct-inner { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .ct-page { padding: 100px 20px 60px; }
                    .ct-form-row { grid-template-columns: 1fr; }
                    .ct-info { padding: 28px 22px; }
                    .ct-form-card { padding: 28px 22px; }
                    .ct-footer { padding: 20px 24px; flex-direction: column; gap: 10px; text-align: center; }
                }
            `}</style>

            <PublicNavbar />

            <div className="ct-page">
                <div className="ct-inner">
                    {/* ── Info panel ────────────────────────────────────── */}
                    <div className="ct-info">
                        <h2 className="ct-info-h2">Get in Touch</h2>
                        <p className="ct-info-p">
                            Whether you're a clinician exploring AI diagnostics, a hospital evaluating integration, or a researcher interested in collaboration — we'd love to hear from you.
                        </p>

                        <div className="ct-info-cards">
                            <div className="ct-info-card">
                                <div className="ct-info-icon"><IconMail /></div>
                                <div>
                                    <div className="ct-info-label">Email</div>
                                    <div className="ct-info-value">diagnovate@outlook.com</div>
                                </div>
                            </div>
                            <div className="ct-info-card">
                                <div className="ct-info-icon"><IconClock /></div>
                                <div>
                                    <div className="ct-info-label">Response Time</div>
                                    <div className="ct-info-value">Within 24 hours</div>
                                </div>
                            </div>
                            <div className="ct-info-card">
                                <div className="ct-info-icon"><IconCalendar /></div>
                                <div>
                                    <div className="ct-info-label">Availability</div>
                                    <div className="ct-info-value">Sunday – Thursday</div>
                                </div>
                            </div>
                        </div>

                        <p className="ct-info-note">
                            For demo requests, please select "Demo Request" in the subject dropdown. Our team will schedule a live walkthrough of the Diagnovate platform within 48 hours.
                        </p>
                    </div>

                    {/* ── Form card ─────────────────────────────────────── */}
                    <div className="ct-form-card">
                        {submitted ? (
                            <div className="ct-success">
                                <div className="ct-success-ring"><IconCheck /></div>
                                <h3 className="ct-success-h3">Message Sent!</h3>
                                <p className="ct-success-p">
                                    Thank you for reaching out. Our team will review your message and get back to you within 24 hours.
                                </p>
                            </div>
                        ) : (
                            <>
                                <h2 className="ct-form-h2">Send us a Message</h2>
                                <form onSubmit={handleSubmit}>
                                    {/* Name row */}
                                    <div className="ct-form-row">
                                        <div>
                                            <label htmlFor="firstName" style={labelStyle}>First Name</label>
                                            <input
                                                id="firstName"
                                                name="firstName"
                                                type="text"
                                                required
                                                value={form.firstName}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('firstName')}
                                                onBlur={() => setFocusedField(null)}
                                                style={inputStyle('firstName')}
                                                placeholder="Danah"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" style={labelStyle}>Last Name</label>
                                            <input
                                                id="lastName"
                                                name="lastName"
                                                type="text"
                                                required
                                                value={form.lastName}
                                                onChange={handleChange}
                                                onFocus={() => setFocusedField('lastName')}
                                                onBlur={() => setFocusedField(null)}
                                                style={inputStyle('lastName')}
                                                placeholder="Alluhyabi"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="ct-form-field">
                                        <label htmlFor="email" style={labelStyle}>Email Address</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('email')}
                                            onBlur={() => setFocusedField(null)}
                                            style={inputStyle('email')}
                                            placeholder="you@hospital.org"
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div className="ct-form-field">
                                        <label htmlFor="subject" style={labelStyle}>Subject</label>
                                        <select
                                            id="subject"
                                            name="subject"
                                            value={form.subject}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('subject')}
                                            onBlur={() => setFocusedField(null)}
                                            style={{
                                                ...inputStyle('subject'),
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238A9E97' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 14px center',
                                                paddingRight: 36,
                                            }}
                                        >
                                            <option>General Inquiry</option>
                                            <option>Demo Request</option>
                                            <option>Technical Support</option>
                                            <option>Partnership</option>
                                        </select>
                                    </div>

                                    {/* Message */}
                                    <div className="ct-form-field">
                                        <label htmlFor="message" style={labelStyle}>Message</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('message')}
                                            onBlur={() => setFocusedField(null)}
                                            style={textareaStyle}
                                            placeholder="Tell us about your use case, institution, or what you'd like to discuss..."
                                        />
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        style={{
                                            width: '100%',
                                            height: 50,
                                            background: '#1D9E75',
                                            color: '#fff',
                                            fontFamily: 'var(--font-dm-sans, sans-serif)',
                                            fontSize: 15,
                                            fontWeight: 700,
                                            border: 'none',
                                            borderRadius: 12,
                                            cursor: 'pointer',
                                            transition: 'all 0.22s',
                                            letterSpacing: '0.01em',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLButtonElement).style.background = '#0F6E56';
                                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(29,158,117,0.35)';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLButtonElement).style.background = '#1D9E75';
                                            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                                        }}
                                    >
                                        Send Message
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer strip */}
            <div className="ct-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                        <polygon points="18,2 32,9.5 32,26.5 18,34 4,26.5 4,9.5" fill="#1D9E75" opacity="0.2" stroke="#1D9E75" strokeWidth="1.5"/>
                        <circle cx="18" cy="18" r="4" fill="#1D9E75"/>
                    </svg>
                    <span style={{ fontFamily: 'var(--font-dm-serif, serif)', fontSize: 16, color: '#fff' }}>
                        Diagn<em style={{ fontStyle: 'italic', color: '#1D9E75' }}>ovate</em>
                    </span>
                </div>
                <div className="ct-footer-copy">© 2026 Diagnovate. Advanced AI for thyroid cancer diagnostics.</div>
            </div>
        </>
    );
}
