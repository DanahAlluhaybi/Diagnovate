'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Activity, Camera, FileText, TrendingUp, User, ArrowRight,
} from 'lucide-react';
import s from './styles.module.css';
import Navbar from '@/components/Navbar';

/* ─── TYPES ─────────────────────────────────────────────────────── */
interface DashboardStats { active_cases: number; urgent_cases: number; total_patients: number; }
interface RecentCase     { id: number; case_id: string; patient_name: string; nodule_size: string; location: string; tirads_score: number; bethesda_category: string; created_at: string; }
interface Doctor         { id: number; name: string; email: string; specialty: string; }

/* ─── 4 MODULES ─────────────────────────────────────────────────── */
const MODULES = [
    {
        href: '/patient-management',
        icon: <User size={22} color="white" />,
        icBg: 'linear-gradient(135deg,#10B981,#059669)',
        icShadow: '0 6px 20px rgba(16,185,129,0.32)',
        tag: 'Patient Management',
        tagBg: 'rgba(16,185,129,0.08)', tagColor: '#10B981', tagBorder: 'rgba(16,185,129,0.2)',
        title: ['Patient', 'Management'],
        desc: 'Comprehensive records, appointments, and full medical history in one unified workspace.',
        cta: '#10B981',
        glowBg: 'radial-gradient(circle at 80% 110%, rgba(16,185,129,0.1) 0%, transparent 60%)',
        hoverBorder: 'rgba(16,185,129,0.28)', hoverShadow: '0 20px 56px rgba(16,185,129,0.11)',
        pills: ['Records', 'Appointments', 'History', 'Treatment'],
        pillBg: 'rgba(16,185,129,0.07)', pillColor: '#10B981', pillBorder: 'rgba(16,185,129,0.18)',
    },
    {
        href: '/image-enhancement',
        icon: <Camera size={22} color="white" />,
        icBg: 'linear-gradient(135deg,#0D9488,#0891B2)',
        icShadow: '0 6px 20px rgba(13,148,136,0.32)',
        tag: 'AI-Powered',
        tagBg: 'rgba(13,148,136,0.08)', tagColor: '#0D9488', tagBorder: 'rgba(13,148,136,0.2)',
        title: ['Ultrasound', 'Enhancement'],
        desc: 'Transform blurry thyroid scans into crystal-clear diagnostic-grade images using deep learning.',
        cta: '#0D9488',
        glowBg: 'radial-gradient(circle at 80% 110%, rgba(13,148,136,0.1) 0%, transparent 60%)',
        hoverBorder: 'rgba(13,148,136,0.28)', hoverShadow: '0 20px 56px rgba(13,148,136,0.11)',
        pills: null,
    },
    {
        href: '/ai-diagnosis',
        icon: <Activity size={22} color="white" />,
        icBg: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
        icShadow: '0 6px 20px rgba(124,58,237,0.32)',
        tag: 'Deep Learning',
        tagBg: 'rgba(124,58,237,0.08)', tagColor: '#7C3AED', tagBorder: 'rgba(124,58,237,0.2)',
        title: ['AI Diagnosis', 'Models'],
        desc: 'Nodule classification, TI-RADS scoring, and malignancy risk assessment powered by AI.',
        cta: '#7C3AED',
        glowBg: 'radial-gradient(circle at 80% 110%, rgba(124,58,237,0.1) 0%, transparent 60%)',
        hoverBorder: 'rgba(124,58,237,0.25)', hoverShadow: '0 20px 56px rgba(124,58,237,0.1)',
        pills: null,
    },
    {
        href: '/reports',
        icon: <FileText size={22} color="white" />,
        icBg: 'linear-gradient(135deg,#F59E0B,#D97706)',
        icShadow: '0 6px 20px rgba(245,158,11,0.32)',
        tag: 'AI-Assisted',
        tagBg: 'rgba(245,158,11,0.08)', tagColor: '#D97706', tagBorder: 'rgba(245,158,11,0.2)',
        title: ['Report', 'Generation'],
        desc: 'Automated clinical reports with TI-RADS docs, Bethesda classification and instant PDF export.',
        cta: '#D97706',
        glowBg: 'radial-gradient(circle at 80% 110%, rgba(245,158,11,0.09) 0%, transparent 60%)',
        hoverBorder: 'rgba(245,158,11,0.28)', hoverShadow: '0 20px 56px rgba(245,158,11,0.1)',
        pills: null,
    },
];

/* ─── HELPERS ───────────────────────────────────────────────────── */
const getGreeting  = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night'; };
const getFirstName = (n?: string) => !n ? 'Doctor' : n.replace(/^dr\.?\s*/i,'').split(' ')[0];
const formatDate   = (d: string)  => new Date(d).toLocaleDateString('en-US',{ month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
    const router = useRouter();

    const [stats,       setStats]       = useState<DashboardStats | null>(null);
    const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
    const [doctor,      setDoctor]      = useState<Doctor | null>(null);
    const [loading,     setLoading]     = useState(true);
    const [loggingOut,  setLoggingOut]  = useState(false);

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem('token');
            const ud    = localStorage.getItem('user');
            if (!token || !ud) { router.push('/log-in'); return; }
            setDoctor(JSON.parse(ud));
            const [sR, cR] = await Promise.all([
                fetch('http://localhost:5000/api/dashboard/stats',        { headers: { Authorization: `Bearer ${token}` } }),
                fetch('http://localhost:5000/api/dashboard/recent-cases', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (sR.status === 401) { localStorage.clear(); router.push('/log-in'); return; }
            if (sR.ok) setStats(await sR.json());
            if (cR.ok) setRecentCases(await cR.json());
        } catch {}
        finally { setLoading(false); }
    };

    /* ── Screens ── */
    if (loggingOut || loading) return (
        <div className={s.screen}>
            <div className={s.screenCard}>
                <div className={s.spinner} />
                <p className={s.screenTitle}>{loggingOut ? 'Signing out…' : 'Loading dashboard…'}</p>
                <p className={s.screenSub}>{loggingOut ? `See you next time, Dr. ${getFirstName(doctor?.name)}` : 'Preparing your workspace…'}</p>
            </div>
        </div>
    );

    return (
        <div className={s.wrap}>

            {/* ══ NAVBAR الجديد ══ */}
            <Navbar />

            {/* ══ MAIN ════════════════════════════════════════════════════ */}
            <main className={s.main}>

                {/* ── HERO ── */}
                <div className={s.hero}>
                    <div className={s.heroBlob1} />
                    <div className={s.heroBlob2} />
                    <div className={s.heroBlob3} />

                    <div className={s.heroLeft}>
                        <div className={s.heroBadge}>
                            <span className={s.liveDot} />
                            AI systems online
                        </div>
                        <h1 className={s.heroH1}>
                            {getGreeting()},<br />
                            <em>Dr. {getFirstName(doctor?.name)}</em>
                        </h1>
                        <p className={s.heroDate}>
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            })}
                        </p>
                    </div>

                    <div className={s.heroStats}>
                        {[
                            { icon: <Activity size={17}/>,  label: 'Active Cases',   val: stats?.active_cases   ?? 0, hc: '#0D9488', hbg: '#F0FDFA', hb: '#CCFBF1' },
                            { icon: <TrendingUp size={17}/>, label: 'Urgent Cases',   val: stats?.urgent_cases   ?? 0, hc: '#E11D48', hbg: '#FFF1F2', hb: '#FECDD3' },
                            { icon: <User size={17}/>,       label: 'Total Patients', val: stats?.total_patients ?? 0, hc: '#7C3AED', hbg: '#F5F3FF', hb: '#EDE9FE' },
                        ].map((st, i) => (
                            <div key={i} className={s.heroStat}
                                 style={{ '--hc': st.hc, '--hbg': st.hbg, '--hb': st.hb } as React.CSSProperties}>
                                <div className={s.hstatIc}>{st.icon}</div>
                                <div className={s.hstatVal}>{st.val}</div>
                                <div className={s.hstatLbl}>{st.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── SECTION LABEL ── */}
                <div className={s.secHead}>
                    <span className={s.secLabel}>Platform Modules</span>
                    <div className={s.secLine} />
                </div>

                {/* ── MODULE CARDS ── */}
                <div className={s.modulesGrid}>
                    {MODULES.map((m) => (
                        <Link
                            key={m.href} href={m.href}
                            className={s.moduleCard}
                            onMouseEnter={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = m.hoverBorder;
                                el.style.boxShadow   = m.hoverShadow;
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = '#EBF0F5';
                                el.style.boxShadow   = '0 2px 12px rgba(15,23,42,0.04)';
                            }}
                        >
                            <div className={s.moduleGlow} style={{ background: m.glowBg }} />
                            <div className={s.moduleIc} style={{ background: m.icBg, boxShadow: m.icShadow }}>
                                {m.icon}
                            </div>
                            <div className={s.moduleTag}
                                 style={{ background: m.tagBg, color: m.tagColor, border: `1px solid ${m.tagBorder}` }}>
                                <span style={{ width:4, height:4, borderRadius:'50%', background: m.tagColor, display:'inline-block' }} />
                                {m.tag}
                            </div>
                            <div className={s.moduleTitle}>
                                {m.title[0]}<br />{m.title[1]}
                            </div>
                            <p className={s.moduleDesc}>{m.desc}</p>
                            {m.pills && (
                                <div className={s.modulePills}>
                                    {m.pills.map(p => (
                                        <span key={p} className={s.modulePill}
                                              style={{ background: m.pillBg, color: m.pillColor, border: `1px solid ${m.pillBorder}` }}>
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className={s.moduleCta} style={{ color: m.cta, borderTopColor: '#F1F5F9' }}>
                                Open module <ArrowRight size={13} />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ── RECENT CASES ── */}
                {recentCases.length > 0 && (
                    <div style={{ marginTop: 52 }}>
                        <div className={s.secHead}>
                            <span className={s.secLabel}>Recent Cases</span>
                            <div className={s.secLine} />
                            <Link href="/patient-management" className={s.seeAll}>
                                View all <ArrowRight size={11} />
                            </Link>
                        </div>
                        <div className={s.casesGrid}>
                            {recentCases.map(c => (
                                <Link href={`/cases/${c.case_id}`} key={c.id} className={s.caseCard}>
                                    <div className={s.caseHeadRow}>
                                        <span className={s.caseId}>#{c.case_id}</span>
                                        <span className={s.caseDate}>{formatDate(c.created_at)}</span>
                                    </div>
                                    <div className={s.caseRows}>
                                        <div className={s.caseRow}><span className={s.caseLbl}>Patient</span><span>{c.patient_name}</span></div>
                                        <div className={s.caseRow}><span className={s.caseLbl}>Nodule</span><span>{c.nodule_size}</span></div>
                                        <div className={s.caseRow}><span className={s.caseLbl}>Location</span><span>{c.location}</span></div>
                                    </div>
                                    <div className={s.caseScores}>
                                        <span className={s.tirads}>TI-RADS {c.tirads_score}</span>
                                        <span className={s.bethesda}>Bethesda {c.bethesda_category}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}