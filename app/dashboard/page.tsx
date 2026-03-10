// ═══════════════════════════════════════════════════════════
// DOCTOR DASHBOARD  —  app/dashboard/page.tsx
// ═══════════════════════════════════════════════════════════
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Scan, Brain, Users, FileText, ExternalLink } from 'lucide-react';
import { dashboard } from '@/lib/api';

const MODULES = [
    { href: '/patient-management', icon: <Users size={26} />, label: 'Patient Management', desc: 'View, add, and manage patient records', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
    { href: '/image-enhancement',  icon: <Scan size={26} />,  label: 'Image Enhancement',  desc: 'AI-powered ultrasound image clarity boost', color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD' },
    { href: '/ai-diagnosis',        icon: <Brain size={26} />, label: 'AI Diagnosis',        desc: 'Context-aware diagnostic recommendations',  color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { href: '/report',              icon: <FileText size={26} />, label: 'Reports',          desc: 'Generate and export clinical diagnostic reports', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
];

export default function DoctorDashboard() {
    const router = useRouter();
    const [user,        setUser]        = useState<any>(null);
    const [loading,     setLoading]     = useState(true);
    const [stats,       setStats]       = useState({ active_cases: 0, urgent_cases: 0, total_patients: 0, completed_cases: 0 });
    const [recentCases, setRecentCases] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (userData) setUser(JSON.parse(userData));

                const statsData = await dashboard.getStats();
                if (statsData) setStats(statsData);

                const casesData = await dashboard.getRecentCases();
                if (casesData && Array.isArray(casesData)) setRecentCases(casesData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const firstName = user?.name?.replace(/^dr\.?\s*/i, '').split(' ')[0] ?? 'Doctor';
    const hour      = new Date().getHours();
    const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Navigate to patient detail page with diagnosis tab open
    const openCase = (c: any) => {
        const patientId = c?.patient_id || c?.id || c?.case_id;
        if (patientId) {
            router.push(`/patient-management?patientId=${patientId}&tab=diagnosis`);
        }
    };

    if (loading) {
        return (
            <>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
                    body{background:#F0F4F8;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}
                    body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);background-size:28px 28px;opacity:.45;pointer-events:none;z-index:0}
                    .loading-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;z-index:1}
                    .loading-card{background:white;border:1px solid #E2E8F0;border-radius:28px;padding:52px 64px;text-align:center;box-shadow:0 32px 80px rgba(15,23,42,.12);display:flex;flex-direction:column;align-items:center}
                    .loading-logo{width:52px;height:52px;background:linear-gradient(145deg,#0D9488,#0891B2);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(13,148,136,.3);margin-bottom:24px}
                    .loading-spinner{width:36px;height:36px;border:3px solid #F0FDFA;border-top-color:#0D9488;border-radius:50%;animation:spin .75s linear infinite;margin-bottom:20px}
                    .loading-title{font-family:'DM Serif Display',serif;font-size:22px;color:#0F172A;margin:0 0 6px}
                    .loading-sub{font-size:13px;color:#64748B;margin:0}
                    @keyframes spin{to{transform:rotate(360deg)}}
                `}</style>
                <div className="loading-screen">
                    <div className="loading-card">
                        <div className="loading-logo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white" />
                            </svg>
                        </div>
                        <div className="loading-spinner" />
                        <p className="loading-title">Loading Dashboard</p>
                        <p className="loading-sub">Preparing your workspace...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
                :root{
                    --teal:#0D9488;--teal-light:#F0FDFA;--teal-ring:#99F6E4;--teal-muted:#CCFBF1;
                    --bg:#F0F4F8;--surface:#fff;--surface2:#F8FAFC;
                    --text:#0F172A;--text2:#334155;--muted:#64748B;--subtle:#94A3B8;--border:#E2E8F0;
                    --grad:linear-gradient(135deg,#0D9488,#0891B2);
                }
                body{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}
                body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);background-size:28px 28px;opacity:.45;pointer-events:none;z-index:0}
                .page{position:relative;z-index:1;padding:36px 48px 80px;max-width:1360px;margin:0 auto}
                @media(max-width:1024px){.page{padding:28px 24px 64px}}
                @media(max-width:600px){.page{padding:20px 16px 56px}}
                .hero{background:white;border:1px solid var(--border);border-radius:24px;padding:36px 40px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(15,23,42,.07);position:relative;overflow:hidden}
                .hero::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(13,148,136,.04) 0%,transparent 60%);pointer-events:none}
                .hero-left{position:relative;z-index:1}
                .greeting{font-size:13px;font-weight:600;color:var(--teal);letter-spacing:.5px;margin-bottom:8px}
                .hero-h1{font-family:'DM Serif Display',serif;font-size:clamp(26px,3vw,36px);color:var(--text);letter-spacing:-.5px;margin-bottom:8px}
                .hero-sub{font-size:14.5px;color:var(--muted)}
                .hero-right{display:flex;gap:14px;flex-shrink:0;position:relative;z-index:1}
                .stat-pill{background:var(--surface2);border:1.5px solid var(--border);border-radius:14px;padding:16px 20px;text-align:center;min-width:96px}
                .stat-val{font-family:'DM Serif Display',serif;font-size:26px;color:var(--text);letter-spacing:-1px;line-height:1;margin-bottom:4px}
                .stat-lbl{font-size:11px;color:var(--muted);font-weight:600}
                .sec-head{display:flex;align-items:center;gap:14px;margin-bottom:20px}
                .sec-label{font-size:10.5px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;color:var(--teal);white-space:nowrap}
                .sec-line{flex:1;height:1px;background:linear-gradient(to right,var(--teal-muted),transparent)}
                .modules{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
                @media(max-width:900px){.modules{grid-template-columns:repeat(2,1fr)}}
                @media(max-width:480px){.modules{grid-template-columns:1fr}}
                .module-card{background:white;border:1.5px solid var(--border);border-radius:20px;padding:26px 24px;text-decoration:none;color:var(--text);transition:all .28s;display:block;box-shadow:0 2px 8px rgba(15,23,42,.05)}
                .module-card:hover{transform:translateY(-6px);box-shadow:0 20px 56px rgba(15,23,42,.12)}
                .mc-icon{width:52px;height:52px;border-radius:15px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;transition:all .25s}
                .mc-label{font-family:'DM Serif Display',serif;font-size:20px;color:var(--text);margin-bottom:7px;line-height:1.2}
                .mc-desc{font-size:13px;color:var(--muted);line-height:1.55}
                .mc-arr{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;margin-top:16px;transition:all .2s}
                .recent-wrap{background:white;border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,.05)}
                table{width:100%;border-collapse:collapse}
                thead tr{background:var(--surface2)}
                th{padding:12px 20px;text-align:left;font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border)}
                td{padding:14px 20px;border-bottom:1px solid #F1F5F9;font-size:13.5px;vertical-align:middle}
                tr:last-child td{border-bottom:none}
                /* FIX: clickable rows */
                .case-row{cursor:pointer;transition:background .15s}
                .case-row:hover{background:#fafffe}
                .status-chip{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px}
                .status-dot{width:5px;height:5px;border-radius:50%}
                .score-badge{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9px;font-size:13px;font-weight:800;border:1px solid transparent}
                .open-btn{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--teal);background:var(--teal-light);border:1px solid var(--teal-ring);border-radius:8px;padding:5px 11px;cursor:pointer;transition:all .18s;white-space:nowrap}
                .open-btn:hover{background:var(--teal);color:white;border-color:var(--teal)}
                @media(max-width:900px){.hero{flex-direction:column;align-items:flex-start;gap:20px}.recent-wrap{overflow-x:auto}}
            `}</style>

            <Navbar />

            <main className="page">
                {/* Hero */}
                <div className="hero">
                    <div className="hero-left">
                        <div className="greeting">{greeting}</div>
                        <h1 className="hero-h1">Dr. {firstName}</h1>
                        <p className="hero-sub">{user?.specialty ?? 'Clinician'} · Diagnovate Clinical Platform</p>
                    </div>
                    <div className="hero-right">
                        {[
                            { val: stats.active_cases,    lbl: 'Active Cases' },
                            { val: stats.urgent_cases,    lbl: 'Urgent Cases' },
                            { val: stats.total_patients,  lbl: 'Total Patients' },
                            { val: stats.completed_cases, lbl: 'Completed (Month)' }
                        ].map(s => (
                            <div key={s.lbl} className="stat-pill">
                                <div className="stat-val">{s.val}</div>
                                <div className="stat-lbl">{s.lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modules */}
                <div className="sec-head">
                    <span className="sec-label">Modules</span>
                    <div className="sec-line" />
                </div>
                <div className="modules">
                    {MODULES.map(m => (
                        <Link
                            key={m.href} href={m.href} className="module-card"
                            onMouseEnter={e => {
                                const el = e.currentTarget;
                                el.style.borderColor = m.border;
                                el.style.boxShadow = `0 20px 56px ${m.color}14`;
                            }}
                            onMouseLeave={e => {
                                const el = e.currentTarget;
                                el.style.borderColor = 'var(--border)';
                                el.style.boxShadow = '0 2px 8px rgba(15,23,42,.05)';
                            }}
                        >
                            <div className="mc-icon" style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}>{m.icon}</div>
                            <div className="mc-label">{m.label}</div>
                            <div className="mc-desc">{m.desc}</div>
                            <div className="mc-arr" style={{ color: m.color }}>
                                Open module
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Cases */}
                <div className="sec-head">
                    <span className="sec-label">Recent Cases</span>
                    <div className="sec-line" />
                </div>
                <div className="recent-wrap">
                    <table>
                        <thead>
                        <tr>
                            <th>Case ID</th><th>Patient</th><th>Type</th>
                            <th>TI-RADS</th><th>Risk</th><th>Status</th><th>Date</th><th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentCases.map((c, index) => {
                            const caseItem = {
                                id:        c?.case_id || c?.id || `Case-${index + 1}`,
                                patient:   c?.patient_name || c?.patient || 'Unknown Patient',
                                patientId: c?.patient_id || c?.id || c?.case_id,
                                type:      c?.type || 'Thyroid Scan',
                                score:     String(c?.tirads ?? '3'),
                                risk:      c?.risk || '0%',
                                status:    c?.status || 'pending',
                                date:      c?.created_at
                                    ? new Date(c.created_at).toLocaleDateString('en-US', { month:'short', day:'numeric' })
                                    : 'Today'
                            };

                            const sc = caseItem.status === 'urgent' ? { bg:'#FFF1F2', col:'#EF4444', dot:'#EF4444', border:'#FECDD3' }
                                : caseItem.status === 'pending' ? { bg:'#FFFBEB', col:'#D97706', dot:'#F59E0B', border:'#FDE68A' }
                                    : { bg:'#F0FDFA', col:'#0D9488', dot:'#0D9488', border:'#99F6E4' };

                            const scoreNum   = parseInt(caseItem.score, 10);
                            const safeScore  = isNaN(scoreNum) ? 0 : scoreNum;
                            const sr = safeScore >= 4 ? { bg:'#FFF1F2', col:'#EF4444', border:'#FECDD3' }
                                : safeScore === 3 ? { bg:'#FFFBEB', col:'#D97706', border:'#FDE68A' }
                                    : { bg:'#F0FDFA', col:'#0D9488', border:'#99F6E4' };

                            const statusLabel = caseItem.status
                                ? caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)
                                : 'Pending';

                            return (
                                <tr
                                    key={caseItem.id}
                                    className="case-row"
                                    onClick={() => router.push(`/patient-management?patientId=${caseItem.patientId}&tab=diagnosis`)}
                                    title="View patient details"
                                >
                                    <td style={{ fontFamily:"'DM Serif Display',serif", fontSize:15, color:'var(--text)' }}>
                                        {caseItem.id}
                                    </td>
                                    <td style={{ fontWeight:600, color:'var(--text2)' }}>
                                        {caseItem.patient}
                                    </td>
                                    <td style={{ color:'var(--muted)', fontSize:13 }}>
                                        {caseItem.type}
                                    </td>
                                    <td>
                                        <div className="score-badge" style={{ background:sr.bg, color:sr.col, border:`1px solid ${sr.border}` }}>
                                            {caseItem.score}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight:700, color:'var(--text2)' }}>
                                        {caseItem.risk}
                                    </td>
                                    <td>
                                        <span className="status-chip" style={{ background:sc.bg, color:sc.col, border:`1px solid ${sc.border}` }}>
                                            <span className="status-dot" style={{ background:sc.dot }} />
                                            {statusLabel}
                                        </span>
                                    </td>
                                    <td style={{ color:'var(--muted)', fontSize:13 }}>{caseItem.date}</td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <button
                                            className="open-btn"
                                            onClick={() => router.push(`/patient-management?patientId=${caseItem.patientId}&tab=diagnosis`)}
                                        >
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
                </div>
            </main>
        </>
    );
}