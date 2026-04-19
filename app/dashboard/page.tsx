'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Scan, Brain, Users, FileText } from 'lucide-react';
import { dashboard, patients, getRecentActivity } from '@/lib/api';

const MODULES = [
    { href: '/patient-management', icon: <Users size={26} />,    label: 'Patient Management', desc: 'View, add, and manage patient records',           color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
    { href: '/image-enhancement',  icon: <Scan size={26} />,     label: 'Image Enhancement',  desc: 'AI-powered ultrasound image clarity boost',       color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD' },
    { href: '/ai-diagnosis',       icon: <Brain size={26} />,    label: 'AI Diagnosis',        desc: 'Context-aware diagnostic recommendations',        color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { href: '/report',             icon: <FileText size={26} />, label: 'Reports',             desc: 'Generate and export clinical diagnostic reports', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
];

const ACTION_STYLES: Record<string, { bg: string; color: string; border: string }> = {
    'Image Enhancement': { bg: '#F0F9FF', color: '#0891B2', border: '#BAE6FD' },
    'AI Diagnosis':      { bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
    'Report':            { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
};

export default function DoctorDashboard() {
    if (typeof window !== 'undefined') {
        const t = localStorage.getItem('theme');
        if (t) document.documentElement.setAttribute('data-theme', t.toLowerCase());
    }
    const router = useRouter();
    const [user,           setUser]           = useState<any>(null);
    const [loading,        setLoading]        = useState(true);
    const [stats,          setStats]          = useState({ active_cases: 0, urgent_cases: 0, total_patients: 0, completed_cases: 0 });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme.toLowerCase());
        }
        const fetchData = async () => {
            try {
                const userData = localStorage.getItem('user');
                if (userData) setUser(JSON.parse(userData));

                const statsData = await dashboard.getStats();
                if (statsData) setStats(statsData);

                // جيب المرضى ثم اجمع نشاطهم من IndexedDB
                const patientsData = await patients.list();
                const list = patientsData?.data ?? patientsData ?? [];
                if (Array.isArray(list) && list.length > 0) {
                    const activity = await getRecentActivity(list);
                    setRecentActivity(activity);
                }
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

    const formatDate = (d: string) => {
        const date = new Date(d);
        const now  = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
        if (diff < 60)   return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
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
                    [data-theme='dark'] .loading-screen { background: #0F172A !important; }
                    [data-theme='dark'] .loading-card { background: #1E293B !important; border-color: #334155 !important; }
                    [data-theme='dark'] .loading-title { color: #F1F5F9 !important; }
                    [data-theme='dark'] .loading-sub { color: #94A3B8 !important; }
                `}</style>
                <div className="loading-screen">
                    <div className="loading-card">
                        <div className="loading-logo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
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
                }
                [data-theme='dark'] {
                  --bg: #0F172A;
                  --surface: #1E293B;
                  --surface2: #263548;
                  --text: #F1F5F9;
                  --text2: #CBD5E1;
                  --muted: #94A3B8;
                  --border: #334155;
                  --teal-light: #134E4A;
                  --teal-ring: #0F766E;
                  --teal-muted: #0F766E;
                }
                [data-theme='dark'] body { background: #0F172A !important; }
                [data-theme='dark'] body::before { background-image: radial-gradient(circle, #1E293B 1px, transparent 1px) !important; opacity: 0.3 !important; }
                [data-theme='dark'] .hero { background: #1E293B !important; border-color: #334155 !important; }
                [data-theme='dark'] .hero::before { background: none !important; }
                [data-theme='dark'] .hero-h1 { color: #F1F5F9 !important; }
                [data-theme='dark'] .hero-sub { color: #94A3B8 !important; }
                [data-theme='dark'] .greeting { color: #14B8A6 !important; }
                [data-theme='dark'] .stat-pill { background: #263548 !important; border-color: #334155 !important; }
                [data-theme='dark'] .stat-val { color: #F1F5F9 !important; }
                [data-theme='dark'] .stat-lbl { color: #94A3B8 !important; }
                [data-theme='dark'] .module-card { background: #1E293B !important; border-color: #334155 !important; }
                [data-theme='dark'] .mc-label { color: #F1F5F9 !important; }
                [data-theme='dark'] .mc-desc { color: #94A3B8 !important; }
                [data-theme='dark'] .activity-wrap { background: #1E293B !important; border-color: #334155 !important; }
                [data-theme='dark'] table thead tr { background: #263548 !important; }
                [data-theme='dark'] th { color: #64748B !important; }
                [data-theme='dark'] td { color: #CBD5E1 !important; border-color: #263548 !important; }
                [data-theme='dark'] tr:hover { background: #1E293B !important; }
                [data-theme='dark'] .sec-label { color: #14B8A6 !important; }
                [data-theme='dark'] .p-name { color: #F1F5F9 !important; }
                [data-theme='dark'] nav { background: rgba(15,23,42,0.97) !important; border-color: #334155 !important; }
                [data-theme='dark'] .navLogo { color: #F1F5F9 !important; }
                [data-theme='dark'] .empty-state p { color: #94A3B8 !important; }
                body{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}
                body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);background-size:28px 28px;opacity:.45;pointer-events:none;z-index:0}
                .page{position:relative;z-index:1;padding:36px 48px 80px;max-width:1360px;margin:0 auto}
                @media(max-width:1024px){.page{padding:28px 24px 64px}}

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
                .module-card{background:white;border:1.5px solid var(--border);border-radius:20px;padding:26px 24px;text-decoration:none;color:var(--text);transition:all .28s;display:flex;flex-direction:column;box-shadow:0 2px 8px rgba(15,23,42,.05)}
                .module-card:hover{transform:translateY(-6px);box-shadow:0 20px 56px rgba(15,23,42,.12)}
                .mc-icon{width:52px;height:52px;border-radius:15px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;flex-shrink:0}
                .mc-label{font-family:'DM Serif Display',serif;font-size:20px;color:var(--text);margin-bottom:7px;line-height:1.2}
                .mc-desc{font-size:13px;color:var(--muted);line-height:1.55;flex:1}
                .mc-arr{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;margin-top:16px;transition:all .2s}

                .activity-wrap{background:white;border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,.05)}
                .empty-state{padding:56px 24px;text-align:center}
                .empty-state p{font-size:14px;font-weight:600;margin-top:12px;color:var(--text2)}
                .empty-state span{font-size:12px;color:var(--subtle)}

                table{width:100%;border-collapse:collapse}
                thead tr{background:var(--surface2)}
                th{padding:12px 20px;text-align:left;font-size:10.5px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border)}
                td{padding:14px 20px;border-bottom:1px solid #F1F5F9;font-size:13.5px;vertical-align:middle}
                tr:last-child td{border-bottom:none}
                .act-row{cursor:pointer;transition:background .15s}
                .act-row:hover{background:#fafffe}

                .patient-cell{display:flex;align-items:center;gap:10px}
                .p-avatar{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#0D9488,#0891B2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;flex-shrink:0}
                .p-name{font-size:13.5px;font-weight:700;color:var(--text)}

                .action-chip{display:inline-flex;align-items:center;font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:20px;border:1px solid}
                .scan-thumb{width:36px;height:36px;border-radius:8px;object-fit:cover;border:1px solid var(--border)}
                .scan-placeholder{width:36px;height:36px;border-radius:8px;background:#F1F5F9;display:flex;align-items:center;justify-content:center}

                .view-btn{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--teal);background:var(--teal-light);border:1px solid var(--teal-ring);border-radius:8px;padding:5px 11px;cursor:pointer;transition:all .18s;white-space:nowrap;font-family:inherit}
                .view-btn:hover{background:var(--teal);color:white;border-color:var(--teal)}

                @media(max-width:900px){.hero{flex-direction:column;align-items:flex-start;gap:20px}.activity-wrap{overflow-x:auto}}
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
                            { val: stats.active_cases,    lbl: 'Active Cases'      },
                            { val: stats.urgent_cases,    lbl: 'Urgent Cases'      },
                            { val: stats.total_patients,  lbl: 'Total Patients'    },
                            { val: stats.completed_cases, lbl: 'Completed (Month)' },
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
                        <Link key={m.href} href={m.href} className="module-card"
                              onMouseEnter={e => { e.currentTarget.style.borderColor = m.border; e.currentTarget.style.boxShadow = `0 20px 56px ${m.color}14`; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,.05)'; }}
                        >
                            <div className="mc-icon" style={{ background: m.bg, border: `1px solid ${m.border}`, color: m.color }}>{m.icon}</div>
                            <div className="mc-label">{m.label}</div>
                            <div className="mc-desc">{m.desc}</div>
                            <div className="mc-arr" style={{ color: m.color }}>
                                Open module
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="sec-head">
                    <span className="sec-label">Recent Activity</span>
                    <div className="sec-line" />
                </div>
                <div className="activity-wrap">
                    {recentActivity.length === 0 ? (
                        <div className="empty-state">
                            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ margin:'0 auto' }}>
                                <circle cx="24" cy="24" r="20" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4"/>
                                <path d="M24 16V24M24 32H24.02" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <p>No recent activity yet</p>
                            <span>Activity will appear here after you enhance images or run diagnoses</span>
                        </div>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th>Patient</th>
                                <th>MRN</th>
                                <th>Action</th>
                                <th>Detail</th>
                                <th>Scan</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentActivity.map((item, i) => {
                                const style    = ACTION_STYLES[item.action] ?? ACTION_STYLES['Image Enhancement'];
                                const initials = item.patientName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                                return (
                                    <tr key={i} className="act-row"
                                        onClick={() => router.push(`/patient-management?patientId=${item.patientId}&tab=images`)}>
                                        <td>
                                            <div className="patient-cell">
                                                <div className="p-avatar">{initials}</div>
                                                <div className="p-name">{item.patientName}</div>
                                            </div>
                                        </td>
                                        <td style={{ color:'var(--muted)', fontSize:13 }}>{item.patientMrn}</td>
                                        <td>
                                                <span className="action-chip" style={{ background: style.bg, color: style.color, borderColor: style.border }}>
                                                    {item.action}
                                                </span>
                                        </td>
                                        <td style={{ color:'var(--text2)', fontSize:13 }}>{item.detail}</td>
                                        <td>
                                            {item.imgSrc ? (
                                                <img src={item.imgSrc} alt="scan" className="scan-thumb" />
                                            ) : (
                                                <div className="scan-placeholder">
                                                    <Scan size={16} color="#CBD5E1" />
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ color:'var(--muted)', fontSize:13 }}>{formatDate(item.date)}</td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <button className="view-btn"
                                                    onClick={() => router.push(`/patient-management?patientId=${item.patientId}&tab=images`)}>
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
        </>
    );
}