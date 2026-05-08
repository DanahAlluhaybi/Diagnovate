// Doctor dashboard — shows greeting, live stats from the API, quick-access module cards, and a recent cases table with clickable rows.
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Scan, Brain, Users, FileText } from 'lucide-react';
import { dashboard } from '@/lib/api';

interface Stats {
    active_cases: number;
    urgent_cases: number;
    total_patients: number;
    completed_cases: number;
}

const MODULES = [
    { href: '/patient-management', icon: <Users size={24} />,    label: 'Patient Management', desc: 'View, add, and manage patient records'                  },
    { href: '/image-enhancement',  icon: <Scan size={24} />,     label: 'Image Enhancement',  desc: 'AI-powered CLAHE ultrasound image clarity'              },
    { href: '/ai-diagnosis',       icon: <Brain size={24} />,    label: 'AI Diagnosis',        desc: 'Ensemble deep learning thyroid analysis'               },
    { href: '/report',             icon: <FileText size={24} />, label: 'Reports',             desc: 'Generate and export clinical diagnostic reports'       },
];

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

    if (loading) {
        return (
            <>
                <style>{`
                    .db-load{min-height:100vh;background:#F0F7F4;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
                    .db-load-hex{position:absolute;inset:0;opacity:.035;pointer-events:none}
                    .db-load-card{background:white;border:1px solid rgba(29,158,117,.12);border-radius:28px;padding:52px 64px;text-align:center;box-shadow:0 32px 80px rgba(13,27,23,.08);display:flex;flex-direction:column;align-items:center;position:relative;z-index:1}
                    .db-load-logo{width:52px;height:52px;background:linear-gradient(145deg,#1D9E75,#0D9488);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(29,158,117,.3);margin-bottom:24px}
                    .db-load-spin{width:36px;height:36px;border:3px solid #E1F5EE;border-top-color:#1D9E75;border-radius:50%;animation:dbSpin .75s linear infinite;margin-bottom:20px}
                    .db-load-title{font-family:'DM Serif Display',serif;font-size:22px;color:#0D1B17;margin:0 0 6px;letter-spacing:-.3px}
                    .db-load-sub{font-family:'DM Sans',sans-serif;font-size:13px;color:#8A9E97;margin:0}
                    @keyframes dbSpin{to{transform:rotate(360deg)}}
                `}</style>
                <div className="db-load">
                    <svg className="db-load-hex" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="dbHexLoad" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                            <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                        </pattern></defs>
                        <rect width="100%" height="100%" fill="url(#dbHexLoad)"/>
                    </svg>
                    <div className="db-load-card">
                        <div className="db-load-logo">
                            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <div className="db-load-spin"/>
                        <p className="db-load-title">Loading Dashboard</p>
                        <p className="db-load-sub">Preparing your workspace...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{`
                .db-page{position:relative;z-index:1;min-height:100vh;background:#F0F7F4}
                .db-hex{position:fixed;inset:0;width:100%;height:100%;opacity:.035;pointer-events:none;z-index:0}

                .db-main{position:relative;z-index:1;padding:calc(68px + 32px) 48px 80px;max-width:1360px;margin:0 auto}
                @media(max-width:1024px){.db-main{padding:calc(68px + 24px) 24px 64px}}
                @media(max-width:600px){.db-main{padding:calc(68px + 16px) 16px 56px}}

                /* Hero */
                .db-hero{background:white;border:1.5px solid #D1E5DC;border-left:4px solid #1D9E75;border-radius:24px;padding:36px 40px;margin-bottom:28px;box-shadow:0 4px 20px rgba(13,27,23,.05);position:relative;overflow:hidden;display:flex;align-items:center;gap:32px}
                .db-hero::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(29,158,117,.04) 0%,transparent 60%);pointer-events:none}
                .db-hero-left{position:relative;z-index:1;flex:1;min-width:0}
                .db-hero-right{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;flex-shrink:0;width:420px;position:relative;z-index:1}
                @media(max-width:1100px){.db-hero-right{width:340px}}
                @media(max-width:900px){.db-hero{flex-direction:column;align-items:stretch}.db-hero-right{width:100%;grid-template-columns:repeat(4,1fr)}}
                @media(max-width:600px){.db-hero-right{grid-template-columns:repeat(2,1fr)}}
                .db-hero-stat{background:#F4F9F7;border-radius:14px;padding:20px 24px}
                .db-hero-stat-val{font-family:'DM Serif Display',serif;font-size:40px;color:#1D9E75;letter-spacing:-1px;line-height:1;margin-bottom:5px}
                .db-hero-stat-lbl{font-family:'DM Sans',sans-serif;font-size:11px;color:#8A9E97;font-weight:600;letter-spacing:.5px;text-transform:uppercase}
                .db-hero-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(29,158,117,.07);border:1px solid rgba(29,158,117,.18);color:#0F6E56;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:14px}
                .db-hero-dot{width:6px;height:6px;border-radius:50%;background:#1D9E75;animation:dbBlink 2s ease-in-out infinite;box-shadow:0 0 0 3px rgba(29,158,117,.15)}
                .db-greeting{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:#1D9E75;letter-spacing:.5px;margin-bottom:6px}
                .db-hero-h1{font-family:'DM Serif Display',serif;font-size:clamp(24px,3vw,48px);color:#0D1B17;letter-spacing:-1px;margin-bottom:6px}
                .db-hero-sub{font-family:'DM Sans',sans-serif;font-size:15px;color:#8A9E97}

                /* Section header */
                .db-sec{display:flex;align-items:center;gap:14px;margin-bottom:16px}
                .db-sec-label{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;white-space:nowrap}
                .db-sec-line{flex:1;height:1px;background:linear-gradient(to right,rgba(29,158,117,.2),transparent)}

                /* Module cards */
                .db-modules{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
                @media(max-width:900px){.db-modules{grid-template-columns:repeat(2,1fr)}}
                @media(max-width:480px){.db-modules{grid-template-columns:1fr}}
                .db-mod{background:white;border:1.5px solid #D1E5DC;border-radius:20px;padding:26px 22px;text-decoration:none;color:#0D1B17;transition:all .28s;display:block;box-shadow:0 2px 8px rgba(13,27,23,.04);position:relative;overflow:hidden}
                .db-mod::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#1D9E75,#0D9488);transform:scaleX(0);transform-origin:left;transition:transform .28s ease}
                .db-mod:hover::after{transform:scaleX(1)}
                .db-mod:hover{transform:translateY(-4px);border-color:rgba(29,158,117,.35);box-shadow:0 16px 40px rgba(13,27,23,.08)}
                .db-mod-icon{width:56px;height:56px;border-radius:50%;background:#E1F5EE;border:1px solid rgba(29,158,117,.2);color:#1D9E75;display:flex;align-items:center;justify-content:center;margin-bottom:18px;transition:all .25s}
                .db-mod:hover .db-mod-icon{background:#1D9E75;color:white;border-color:#1D9E75;box-shadow:0 6px 18px rgba(29,158,117,.3)}
                .db-mod-label{font-family:'DM Serif Display',serif;font-size:18px;color:#0D1B17;margin-bottom:7px;line-height:1.2}
                .db-mod-desc{font-family:'DM Sans',sans-serif;font-size:13px;color:#8A9E97;line-height:1.55}
                .db-mod-arr{display:flex;align-items:center;gap:5px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;margin-top:16px;color:#1D9E75;transition:gap .2s}
                .db-mod:hover .db-mod-arr{gap:8px}

                /* Recent cases table */
                .db-recent{background:white;border:1.5px solid #D1E5DC;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(13,27,23,.04)}
                .db-table{width:100%;border-collapse:collapse}
                .db-table thead tr{background:#F0F7F4}
                .db-table th{padding:12px 20px;text-align:left;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#8A9E97;border-bottom:1px solid #D1E5DC}
                .db-table td{padding:14px 20px;border-bottom:1px solid #E1F5EE;font-family:'DM Sans',sans-serif;font-size:13.5px;vertical-align:middle}
                .db-table tr:last-child td{border-bottom:none}
                .db-row{cursor:pointer;transition:background .15s}
                .db-row:hover{background:#F0F7F4}
                .db-chip{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px}
                .db-dot{width:5px;height:5px;border-radius:50%}
                .db-score-badge{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;font-size:13px;font-weight:800;border:1px solid transparent}
                .db-open-btn{display:inline-flex;align-items:center;gap:5px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:700;color:#1D9E75;background:#E1F5EE;border:1px solid rgba(29,158,117,.2);border-radius:8px;padding:5px 11px;cursor:pointer;transition:all .18s;white-space:nowrap}
                .db-open-btn:hover{background:#1D9E75;color:white;border-color:#1D9E75}

                /* Empty state */
                .db-empty{padding:52px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px}
                .db-empty-icon{width:56px;height:56px;border-radius:16px;background:#E1F5EE;border:1px solid rgba(29,158,117,.2);display:flex;align-items:center;justify-content:center;color:#1D9E75;margin-bottom:4px}
                .db-empty-title{font-family:'DM Serif Display',serif;font-size:20px;color:#0D1B17;letter-spacing:-.3px;margin:0}
                .db-empty-sub{font-family:'DM Sans',sans-serif;font-size:13px;color:#8A9E97;margin:0;max-width:300px}
                .db-empty-cta{display:inline-flex;align-items:center;gap:7px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:white;background:linear-gradient(135deg,#1D9E75,#0D9488);padding:11px 22px;border-radius:12px;text-decoration:none;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(29,158,117,.28);transition:all .2s;margin-top:4px}
                .db-empty-cta:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(29,158,117,.35)}

                @media(max-width:900px){.db-recent{overflow-x:auto}}
                @keyframes dbBlink{0%,100%{opacity:1}50%{opacity:.4}}
            `}</style>

            <div className="db-page">
                <svg className="db-hex" xmlns="http://www.w3.org/2000/svg">
                    <defs><pattern id="dbMainHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                        <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#dbMainHex)"/>
                </svg>

                <Navbar />

                <main className="db-main">

                    {/* Hero */}
                    <div className="db-hero">
                        <div className="db-hero-left">
                            <div className="db-hero-badge">
                                <span className="db-hero-dot"/>
                                AI Systems Online
                            </div>
                            <div className="db-greeting">{greeting}</div>
                            <h1 className="db-hero-h1">Dr. {firstName}</h1>
                            <p className="db-hero-sub">{user?.specialty ?? 'Clinician'} · Diagnovate Clinical Platform</p>
                        </div>
                        <div className="db-hero-right">
                            {[
                                { val: displayStats.active_cases,    lbl: 'Active Cases'      },
                                { val: displayStats.urgent_cases,    lbl: 'Urgent Cases'      },
                                { val: displayStats.total_patients,  lbl: 'Total Patients'    },
                                { val: displayStats.completed_cases, lbl: 'Completed (Month)' },
                            ].map(s => (
                                <div key={s.lbl} className="db-hero-stat">
                                    <div className="db-hero-stat-val">{s.val}</div>
                                    <div className="db-hero-stat-lbl">{s.lbl}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Modules */}
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
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Recent Cases */}
                    <div className="db-sec">
                        <span className="db-sec-label">Recent Cases</span>
                        <div className="db-sec-line"/>
                    </div>
                    <div className="db-recent">
                        {recentCases.length === 0 ? (
                            <div className="db-empty">
                                <div className="db-empty-icon">
                                    <Brain size={24}/>
                                </div>
                                <p className="db-empty-title">No recent cases yet</p>
                                <p className="db-empty-sub">Upload an ultrasound image and run AI ensemble diagnostics to get started.</p>
                                <Link href="/ai-diagnosis" className="db-empty-cta">
                                    Run AI Diagnosis
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                                    </svg>
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
                                        ? { bg: '#E1F5EE', col: '#1D9E75', dot: '#1D9E75', border: 'rgba(29,158,117,.2)' }
                                        : caseItem.status === 'follow-up'
                                            ? { bg: '#FFFBEB', col: '#D97706', dot: '#F59E0B', border: '#FDE68A' }
                                            : { bg: '#F0F7F4', col: '#0F6E56', dot: '#1D9E75', border: 'rgba(29,158,117,.15)' };

                                    const scoreNum  = parseInt(caseItem.score, 10);
                                    const safeScore = isNaN(scoreNum) ? 0 : scoreNum;
                                    const sr = safeScore >= 4
                                        ? { bg: '#FFF1F2', col: '#EF4444', border: '#FECDD3' }
                                        : safeScore === 3
                                            ? { bg: '#FFFBEB', col: '#D97706', border: '#FDE68A' }
                                            : { bg: '#E1F5EE', col: '#1D9E75', border: 'rgba(29,158,117,.2)' };

                                    const statusLabel = caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1);

                                    return (
                                        <tr key={caseItem.id} className="db-row"
                                            onClick={() => router.push(`/patient-management?patientId=${caseItem.patientId}&tab=diagnosis`)}>
                                            <td style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, color: '#0D1B17' }}>{caseItem.id}</td>
                                            <td style={{ fontWeight: 600, color: '#2F4A40' }}>{caseItem.patient}</td>
                                            <td>
                                                <div className="db-score-badge" style={{ background: sr.bg, color: sr.col, border: `1px solid ${sr.border}` }}>
                                                    {caseItem.score}
                                                </div>
                                            </td>
                                            <td style={{ color: '#8A9E97', fontSize: 13 }}>{caseItem.bethesda}</td>
                                            <td>
                                                <span className="db-chip" style={{ background: sc.bg, color: sc.col, border: `1px solid ${sc.border}` }}>
                                                    <span className="db-dot" style={{ background: sc.dot }}/>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                            <td style={{ color: '#8A9E97', fontSize: 13 }}>{caseItem.date}</td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <button className="db-open-btn"
                                                        onClick={() => router.push(`/patient-management?patientId=${caseItem.patientId}&tab=diagnosis`)}>
                                                    View
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>

                </main>
            </div>
        </>
    );
}
