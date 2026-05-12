'use client';

import { useState, useEffect, type ReactElement } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Scan, Brain, Users, FileText, Mail, AlertTriangle } from 'lucide-react';
import { dashboard } from '@/lib/api';

interface Stats {
    active_cases: number;
    urgent_cases: number;
    total_patients: number;
    completed_cases: number;
}

const MODULES = [
    { href: '/patient-management', icon: <Users size={22} />,    label: 'Patient Management', desc: 'View, add, and manage patient records'                  },
    { href: '/image-enhancement',  icon: <Scan size={22} />,     label: 'Image Enhancement',  desc: 'AI-powered CLAHE ultrasound image clarity'              },
    { href: '/ai-diagnosis',       icon: <Brain size={22} />,    label: 'AI Diagnosis',        desc: 'Ensemble deep learning thyroid analysis'               },
    { href: '/report',             icon: <FileText size={22} />, label: 'Reports',             desc: 'Generate and export clinical diagnostic reports'       },
];

const STAT_ICONS: Record<string, ReactElement> = {
    'Active Cases': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    'Urgent Cases': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    'Total Patients': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    'Completed': <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

export default function DoctorDashboard() {
    const router = useRouter();
    const [user,        setUser]        = useState<any>(null);
    const [loading,     setLoading]     = useState(true);
    const [stats,        setStats]        = useState<Stats>({ active_cases: 0, urgent_cases: 0, total_patients: 0, completed_cases: 0 });
    const [displayStats, setDisplayStats] = useState<Stats>({ active_cases: 0, urgent_cases: 0, total_patients: 0, completed_cases: 0 });
    const [recentCases,  setRecentCases]  = useState<any[]>([]);

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/log-in?role=doctor'); return; }
        const fetchData = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (userData) setUser(JSON.parse(userData));
                const statsData = await dashboard.getStats();
                if (statsData) setStats(statsData as unknown as Stats);
                const casesData = await dashboard.getRecentCases() as any[];
                if (casesData && Array.isArray(casesData)) setRecentCases(casesData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (loading) return;
        let rafId: number;
        const start    = Date.now();
        const duration = 800;
        const animate  = () => {
            const t    = Math.min((Date.now() - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            setDisplayStats({
                active_cases:    Math.round(stats.active_cases    * ease),
                urgent_cases:    Math.round(stats.urgent_cases    * ease),
                total_patients:  Math.round(stats.total_patients  * ease),
                completed_cases: Math.round(stats.completed_cases * ease),
            });
            if (t < 1) rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [loading, stats]);

    const firstName = user?.name?.replace(/^dr\.?\s*/i, '').split(' ')[0] ?? 'Doctor';
    const hour      = new Date().getHours();
    const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const dateStr   = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    if (loading) {
        return (
            <>
                <style>{`
                    @keyframes dbSpin{to{transform:rotate(360deg)}}
                `}</style>
                <div style={{ minHeight:'100vh', background:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,158,117,0.09) 0%, transparent 60%), #fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ background:'white', border:'1px solid rgba(0,0,0,0.06)', borderRadius:28, padding:'52px 64px', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <div style={{ width:52, height:52, background:'linear-gradient(145deg,#1D9E75,#0D9488)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(13,148,136,0.3)', marginBottom:24 }}>
                            <svg width="24" height="24" viewBox="0 0 40 40" fill="none"><polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/><line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/><line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/><circle cx="20" cy="20" r="3.5" fill="white"/></svg>
                        </div>
                        <div style={{ width:36, height:36, border:'3px solid #CCFBF1', borderTopColor:'#0D9488', borderRadius:'50%', animation:'dbSpin .75s linear infinite', marginBottom:20 }}/>
                        <p style={{ fontFamily:'"DM Serif Display",serif', fontSize:22, color:'#0F172A', margin:'0 0 6px' }}>Loading Dashboard</p>
                        <p style={{ fontFamily:'"DM Sans",sans-serif', fontSize:13, color:'#64748B', margin:0 }}>Preparing your workspace...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{`
                @keyframes dbBlink{0%,100%{opacity:1}50%{opacity:.35}}
                @keyframes dbShimmer{0%{left:-100%}100%{left:200%}}

                .db-page{min-height:100vh;background:radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,158,117,0.09) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 90% 90%, rgba(8,80,65,0.05) 0%, transparent 50%), #FFFFFF}
                .db-main{position:relative;z-index:1;padding:calc(64px + 32px) 48px 80px;max-width:1360px;margin:0 auto}
                @media(max-width:1024px){.db-main{padding:calc(64px + 24px) 24px 64px}}
                @media(max-width:600px){.db-main{padding:calc(64px + 16px) 16px 56px}}

                /* Dark hero card */
                .db-hero{background:linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%);border-radius:20px;padding:36px 44px;margin-bottom:28px;overflow:hidden;position:relative;display:flex;align-items:center;justify-content:space-between;gap:32px}
                .db-hero-dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px);background-size:20px 20px;pointer-events:none}
                .db-hero-blob{position:absolute;top:-60px;right:-60px;width:300px;height:300px;border-radius:50%;background:rgba(29,158,117,0.15);pointer-events:none;filter:blur(40px)}
                .db-hero-left{position:relative;z-index:1;flex:1;min-width:0}
                .db-hero-right{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;flex-shrink:0;width:380px;position:relative;z-index:1}
                @media(max-width:1100px){.db-hero-right{width:300px}}
                @media(max-width:900px){.db-hero{flex-direction:column;align-items:stretch;padding:28px 24px}.db-hero-right{width:100%;grid-template-columns:repeat(4,1fr)}}
                @media(max-width:600px){.db-hero-right{grid-template-columns:repeat(2,1fr)}}

                .db-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(29,158,117,0.15);border:1px solid rgba(29,158,117,0.3);color:#4ADE80;font-family:"DM Sans",sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:14px}
                .db-badge-dot{width:6px;height:6px;border-radius:50%;background:#4ADE80;animation:dbBlink 2s ease-in-out infinite;box-shadow:0 0 6px rgba(74,222,128,0.5)}
                .db-greeting{font-family:"DM Sans",sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.5);margin-bottom:6px}
                .db-hero-h1{font-family:"DM Serif Display",serif;font-size:clamp(26px,3vw,40px);color:white;letter-spacing:-1px;margin-bottom:6px;line-height:1.1}
                .db-hero-sub{font-family:"DM Sans",sans-serif;font-size:13px;color:rgba(255,255,255,0.4);margin-bottom:10px}
                .db-hero-date{font-family:"DM Sans",sans-serif;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.5px}

                .db-stat-pill{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:16px;transition:background .2s}
                .db-stat-pill:hover{background:rgba(255,255,255,0.09)}
                .db-stat-icon{width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.55);margin-bottom:10px}
                .db-stat-val{font-family:"DM Serif Display",serif;font-size:28px;color:white;line-height:1;margin-bottom:4px}
                .db-stat-lbl{font-family:"DM Sans",sans-serif;font-size:10px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:0.5px;text-transform:uppercase}

                /* Section header */
                .db-sec{display:flex;align-items:center;gap:14px;margin-bottom:16px}
                .db-sec-label{font-family:"DM Sans",sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;white-space:nowrap}
                .db-sec-line{flex:1;height:1px;background:linear-gradient(to right,rgba(29,158,117,0.2),transparent)}

                /* Module cards */
                .db-modules{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
                @media(max-width:900px){.db-modules{grid-template-columns:repeat(2,1fr)}}
                @media(max-width:480px){.db-modules{grid-template-columns:1fr}}
                .db-mod{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;padding:24px 20px;text-decoration:none;color:#0F172A;transition:all .25s;display:block;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05);position:relative;overflow:hidden}
                .db-mod::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#1D9E75,#0D9488);transform:scaleX(0);transform-origin:left;transition:transform .28s ease}
                .db-mod:hover::after{transform:scaleX(1)}
                .db-mod:hover{transform:translateY(-4px);border-color:rgba(29,158,117,0.2);box-shadow:0 12px 32px rgba(0,0,0,0.08)}
                .db-mod-icon{width:52px;height:52px;border-radius:14px;background:#F0FDFA;border:1px solid rgba(13,148,136,0.15);color:#0D9488;display:flex;align-items:center;justify-content:center;margin-bottom:16px;transition:all .25s}
                .db-mod:hover .db-mod-icon{background:linear-gradient(135deg,#1D9E75,#0D9488);color:white;border-color:transparent;box-shadow:0 6px 18px rgba(29,158,117,0.3)}
                .db-mod-label{font-family:"DM Serif Display",serif;font-size:17px;color:#0F172A;margin-bottom:6px;line-height:1.2}
                .db-mod-desc{font-family:"DM Sans",sans-serif;font-size:12.5px;color:#94A3B8;line-height:1.55;margin-bottom:14px}
                .db-mod-arr{display:flex;align-items:center;gap:5px;font-family:"DM Sans",sans-serif;font-size:12px;font-weight:700;color:#0D9488;transition:gap .2s}
                .db-mod:hover .db-mod-arr{gap:8px}

                /* Recent cases */
                .db-recent{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05)}
                .db-table{width:100%;border-collapse:collapse}
                .db-table thead tr{background:#FAFAFA;border-bottom:1px solid rgba(0,0,0,0.06)}
                .db-table th{padding:12px 20px;text-align:left;font-family:"DM Sans",sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#94A3B8}
                .db-table td{padding:14px 20px;border-bottom:1px solid #F8FAFC;font-family:"DM Sans",sans-serif;font-size:13.5px;vertical-align:middle}
                .db-table tr:last-child td{border-bottom:none}
                .db-row{cursor:pointer;transition:background .15s}
                .db-row:hover{background:#FAFAFA}
                .db-chip{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px}
                .db-dot{width:5px;height:5px;border-radius:50%}
                .db-score-badge{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;font-size:13px;font-weight:800;border:1px solid transparent}
                .db-open-btn{display:inline-flex;align-items:center;gap:5px;font-family:"DM Sans",sans-serif;font-size:12px;font-weight:700;color:#0D9488;background:#F0FDFA;border:1px solid rgba(13,148,136,0.2);border-radius:8px;padding:5px 11px;cursor:pointer;transition:all .18s;white-space:nowrap}
                .db-open-btn:hover{background:linear-gradient(135deg,#1D9E75,#0D9488);color:white;border-color:transparent}

                /* Empty state */
                .db-empty{padding:52px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}
                .db-empty-icon{width:56px;height:56px;border-radius:16px;background:#F0FDFA;border:1px solid rgba(13,148,136,0.18);display:flex;align-items:center;justify-content:center;color:#0D9488}
                .db-empty-title{font-family:"DM Serif Display",serif;font-size:20px;color:#0F172A;letter-spacing:-.3px;margin:0}
                .db-empty-sub{font-family:"DM Sans",sans-serif;font-size:13px;color:#64748B;margin:0;max-width:300px}
                .db-empty-cta{display:inline-flex;align-items:center;gap:7px;font-family:"DM Sans",sans-serif;font-size:13px;font-weight:700;color:white;background:linear-gradient(135deg,#1D9E75,#0D9488,#0F6E56);padding:11px 22px;border-radius:11px;text-decoration:none;border:none;cursor:pointer;box-shadow:0 4px 12px rgba(29,158,117,0.25);transition:all .2s}
                .db-empty-cta:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(29,158,117,0.35)}

                /* Support cards */
                .db-support{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
                @media(max-width:900px){.db-support{grid-template-columns:repeat(2,1fr)}}
                @media(max-width:480px){.db-support{grid-template-columns:1fr}}
                .db-sup-card{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;padding:24px 20px;text-decoration:none;color:#0F172A;display:flex;flex-direction:column;gap:10px;transition:all .25s;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05)}
                .db-sup-card:hover{transform:translateY(-3px);border-color:rgba(29,158,117,0.2);box-shadow:0 12px 32px rgba(0,0,0,0.08)}
                .db-sup-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center}
                .db-sup-title{font-family:"DM Serif Display",serif;font-size:17px;color:#0F172A}
                .db-sup-desc{font-family:"DM Sans",sans-serif;font-size:12.5px;color:#94A3B8;line-height:1.55}
                .db-sup-warn:hover{border-color:rgba(245,158,11,0.3)!important;box-shadow:0 12px 32px rgba(245,158,11,0.08)!important}
            `}</style>

            <div className="db-page">
                <Navbar />
                <main className="db-main">

                    {/* ── DARK HERO ── */}
                    <div className="db-hero">
                        <div className="db-hero-dots"/>
                        <div className="db-hero-blob"/>
                        <div className="db-hero-left">
                            <div className="db-badge"><span className="db-badge-dot"/>AI Systems Online</div>
                            <div className="db-greeting">{greeting},</div>
                            <h1 className="db-hero-h1">Dr. {firstName}</h1>
                            <p className="db-hero-sub">{user?.specialty ?? 'Clinician'} · Diagnovate Clinical Platform</p>
                            <p className="db-hero-date">{dateStr}</p>
                        </div>
                        <div className="db-hero-right">
                            {[
                                { val: displayStats.active_cases,    lbl: 'Active Cases',    icon: STAT_ICONS['Active Cases']   },
                                { val: displayStats.urgent_cases,    lbl: 'Urgent Cases',    icon: STAT_ICONS['Urgent Cases']   },
                                { val: displayStats.total_patients,  lbl: 'Total Patients',  icon: STAT_ICONS['Total Patients'] },
                                { val: displayStats.completed_cases, lbl: 'Completed',       icon: STAT_ICONS['Completed']      },
                            ].map(s => (
                                <div key={s.lbl} className="db-stat-pill">
                                    <div className="db-stat-icon">{s.icon}</div>
                                    <div className="db-stat-val">{s.val}</div>
                                    <div className="db-stat-lbl">{s.lbl}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── MODULES ── */}
                    <div className="db-sec">
                        <span className="db-sec-label">Clinical Modules</span>
                        <div className="db-sec-line"/>
                    </div>
                    <div className="db-modules">
                        {MODULES.map(m => (
                            <Link key={m.href} href={m.href} className="db-mod">
                                <div className="db-mod-icon">{m.icon}</div>
                                <div className="db-mod-label">{m.label}</div>
                                <div className="db-mod-desc">{m.desc}</div>
                                <div className="db-mod-arr">
                                    Open module
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* ── RECENT CASES ── */}
                    <div className="db-sec">
                        <span className="db-sec-label">Recent Cases</span>
                        <div className="db-sec-line"/>
                    </div>
                    <div className="db-recent">
                        {recentCases.length === 0 ? (
                            <div className="db-empty">
                                <div className="db-empty-icon"><Brain size={24}/></div>
                                <p className="db-empty-title">No recent cases yet</p>
                                <p className="db-empty-sub">Upload an ultrasound image and run AI ensemble diagnostics to get started.</p>
                                <Link href="/ai-diagnosis" className="db-empty-cta">
                                    Run AI Diagnosis
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                </Link>
                            </div>
                        ) : (
                            <table className="db-table">
                                <thead>
                                <tr>
                                    <th>Case ID</th><th>Patient</th><th>TI-RADS</th>
                                    <th>Bethesda</th><th>Status</th><th>Date</th><th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {recentCases.map((c, index) => {
                                    const caseItem = {
                                        id:        c?.case_id || `Case-${index + 1}`,
                                        patient:   c?.patient_name || 'Unknown Patient',
                                        patientId: c?.patient_id || c?.case_id,
                                        score:     String(c?.tirads_score ?? '-'),
                                        bethesda:  c?.bethesda_category || '-',
                                        status:    c?.status || 'active',
                                        date:      c?.created_at
                                            ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            : 'Today',
                                    };
                                    const sc = caseItem.status === 'completed'
                                        ? { bg: '#F0FDFA', col: '#0D9488', dot: '#0D9488', border: 'rgba(13,148,136,.2)' }
                                        : caseItem.status === 'follow-up'
                                            ? { bg: '#FFFBEB', col: '#D97706', dot: '#F59E0B', border: '#FDE68A' }
                                            : { bg: '#F0FDFA', col: '#0F766E', dot: '#0D9488', border: 'rgba(13,148,136,.15)' };
                                    const scoreNum  = parseInt(caseItem.score, 10);
                                    const safeScore = isNaN(scoreNum) ? 0 : scoreNum;
                                    const sr = safeScore >= 4
                                        ? { bg: '#FFF1F2', col: '#EF4444', border: '#FECDD3' }
                                        : safeScore === 3
                                            ? { bg: '#FFFBEB', col: '#D97706', border: '#FDE68A' }
                                            : { bg: '#F0FDFA', col: '#0D9488', border: 'rgba(13,148,136,.2)' };
                                    const statusLabel = caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1);
                                    return (
                                        <tr key={caseItem.id} className="db-row"
                                            onClick={() => router.push(`/patient-management?patientId=${caseItem.patientId}&tab=diagnosis`)}>
                                            <td style={{ fontFamily:'"DM Serif Display",serif', fontSize:15, color:'#0F172A' }}>{caseItem.id}</td>
                                            <td style={{ fontWeight:600, color:'#334155' }}>{caseItem.patient}</td>
                                            <td>
                                                <div className="db-score-badge" style={{ background:sr.bg, color:sr.col, border:`1px solid ${sr.border}` }}>{caseItem.score}</div>
                                            </td>
                                            <td style={{ color:'#94A3B8', fontSize:13 }}>{caseItem.bethesda}</td>
                                            <td>
                                                <span className="db-chip" style={{ background:sc.bg, color:sc.col, border:`1px solid ${sc.border}` }}>
                                                    <span className="db-dot" style={{ background:sc.dot }}/>{statusLabel}
                                                </span>
                                            </td>
                                            <td style={{ color:'#94A3B8', fontSize:13 }}>{caseItem.date}</td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <button className="db-open-btn"
                                                        onClick={() => router.push(`/patient-management?patientId=${caseItem.patientId}&tab=diagnosis`)}>
                                                    View
                                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* ── SUPPORT ── */}
                    <div className="db-sec" style={{ marginTop: 28 }}>
                        <span className="db-sec-label">Support &amp; Help</span>
                        <div className="db-sec-line"/>
                    </div>
                    <div className="db-support">
                        <a href="https://diagnovate.com/docs" target="_blank" rel="noreferrer" className="db-sup-card">
                            <div className="db-sup-icon" style={{ background:'#F0FDFA', color:'#0D9488' }}><FileText size={20}/></div>
                            <div className="db-sup-title">Documentation</div>
                            <div className="db-sup-desc">Platform guides, API references, and clinical workflow documentation.</div>
                        </a>
                        <a href="mailto:diagnovate@outlook.com" className="db-sup-card">
                            <div className="db-sup-icon" style={{ background:'#F0FDFA', color:'#0D9488' }}><Mail size={20}/></div>
                            <div className="db-sup-title">Contact Support</div>
                            <div className="db-sup-desc">Reach our clinical support team for assistance with the platform.</div>
                        </a>
                        <a href="mailto:diagnovate@outlook.com?subject=Issue%20Report" className="db-sup-card db-sup-warn">
                            <div className="db-sup-icon" style={{ background:'#FFFBEB', color:'#F59E0B' }}><AlertTriangle size={20}/></div>
                            <div className="db-sup-title">Report Issue</div>
                            <div className="db-sup-desc">Found a bug or unexpected behaviour? Let us know so we can fix it.</div>
                        </a>
                    </div>

                </main>
            </div>
        </>
    );
}
