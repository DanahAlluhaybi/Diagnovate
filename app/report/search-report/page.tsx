'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Calendar, ChevronDown, ChevronLeft, ChevronRight,
    FileText, Filter, Search, X, Eye, Download, Printer,
    TrendingUp, Clock, CheckCircle, AlertCircle,
} from 'lucide-react';

const SR_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}

.sr-wrap{min-height:100vh;background:#fff;background-image:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(29,158,117,0.09) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 90% 90%,rgba(8,80,65,0.05) 0%,transparent 50%)}

/* HERO */
.sr-hero{background:linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%);padding:48px 48px 44px;position:relative;overflow:hidden}
.sr-hero-dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px);background-size:20px 20px;pointer-events:none}
.sr-hero-blob{position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(29,158,117,0.15);filter:blur(40px);top:-60px;right:80px;pointer-events:none}
.sr-hero-inner{position:relative;z-index:1;max-width:1200px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.sr-hero-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);text-decoration:none;margin-bottom:20px;padding:6px 12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:8px;transition:all .15s;cursor:pointer;border-style:solid}
.sr-hero-back:hover{color:rgba(255,255,255,0.85);background:rgba(255,255,255,0.1)}
.sr-hero-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;margin-bottom:10px}
.sr-hero-title{font-family:'DM Serif Display',serif;font-size:36px;color:#fff;letter-spacing:-0.5px;line-height:1.1;margin-bottom:6px}
.sr-hero-sub{font-size:14px;color:rgba(255,255,255,0.5)}
.sr-hero-actions{display:flex;align-items:center;gap:8px}
.sr-hero-action{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 16px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:9px;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:600;color:rgba(255,255,255,0.75);cursor:pointer;transition:all .15s}
.sr-hero-action:hover{background:rgba(255,255,255,0.14);color:#fff}

/* STATS */
.sr-stats{max-width:1200px;margin:0 auto;padding:0 48px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:-22px;position:relative;z-index:10}
.sr-stat-card{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:14px;padding:16px 18px;display:flex;align-items:center;gap:14px;box-shadow:0 2px 16px rgba(15,23,42,0.07)}
.sr-stat-ic{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sr-stat-ic-blue{background:#EFF6FF;color:#2563EB}
.sr-stat-ic-green{background:#F0FDFA;color:#0D9488}
.sr-stat-ic-yellow{background:#FFFBEB;color:#D97706}
.sr-stat-ic-red{background:#FFF1F2;color:#E11D48}
.sr-stat-val{font-size:22px;font-weight:800;color:#0F172A;letter-spacing:-0.5px;line-height:1}
.sr-stat-lbl{font-size:11px;color:#94A3B8;margin-top:2px;font-weight:600}

/* BODY */
.sr-body{max-width:1200px;margin:0 auto;padding:28px 48px 80px}

/* SEARCH ROW */
.sr-search-row{display:flex;gap:12px;margin-bottom:16px;align-items:center}
.sr-search-wrap{flex:1;position:relative}
.sr-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94A3B8;pointer-events:none}
.sr-search{width:100%;height:46px;background:white;border:1.5px solid rgba(0,0,0,0.08);border-radius:12px;padding:0 40px 0 42px;font-family:'DM Sans',sans-serif;font-size:14px;color:#0F172A;outline:none;transition:all .2s;box-shadow:0 1px 4px rgba(15,23,42,0.04)}
.sr-search::placeholder{color:#94A3B8}
.sr-search:focus{border-color:#0D9488;box-shadow:0 0 0 3px rgba(13,148,136,0.1)}
.sr-search-clear{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94A3B8;display:flex;padding:4px;transition:color .15s}
.sr-search-clear:hover{color:#0F172A}
.sr-filter-btn{display:inline-flex;align-items:center;gap:7px;height:46px;padding:0 18px;background:white;border:1.5px solid rgba(0,0,0,0.08);border-radius:12px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;color:#64748B;cursor:pointer;transition:all .15s;position:relative;flex-shrink:0}
.sr-filter-btn:hover{background:#F0FDFA;color:#0D9488;border-color:#CCFBF1}
.sr-filter-btn-active{background:#F0FDFA!important;color:#0D9488!important;border-color:#99F6E4!important}
.sr-filter-badge{position:absolute;top:8px;right:8px;width:7px;height:7px;border-radius:50%;background:#1D9E75;border:2px solid white}

/* FILTERS PANEL */
.sr-filters-panel{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:14px;padding:20px;margin-bottom:16px;box-shadow:0 2px 16px rgba(15,23,42,0.05)}
.sr-filters-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.sr-filters-title{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#0D9488}
.sr-clear-btn{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:#E11D48;background:#FFF1F2;border:1px solid #FECDD3;border-radius:7px;padding:5px 10px;cursor:pointer;transition:all .15s}
.sr-clear-btn:hover{background:#FECDD3}
.sr-filters-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.sr-fgroup label{font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#334155;display:block;margin-bottom:6px}
.sr-fgroup select{width:100%;height:40px;background:#F8FAFC;border:1.5px solid rgba(0,0,0,0.08);border-radius:9px;padding:0 10px;font-family:'DM Sans',sans-serif;font-size:13px;color:#0F172A;outline:none;cursor:pointer}
.sr-fgroup select:focus{border-color:#0D9488}

/* RESULTS BAR */
.sr-results-bar{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:13px;color:#64748B}

/* TABLE */
.sr-table-wrap{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(15,23,42,0.05)}
.sr-table{width:100%;border-collapse:collapse}
.sr-table thead tr{background:#F8FAFC}
.sr-table th{padding:12px 16px;text-align:left;font-size:10.5px;font-weight:800;letter-spacing:1px;color:#94A3B8;text-transform:uppercase;border-bottom:1px solid rgba(0,0,0,0.07);white-space:nowrap}
.sr-table td{padding:14px 16px;border-bottom:1px solid #F8FAFC;font-size:13.5px;vertical-align:middle}
.sr-table tbody tr{transition:background .15s}
.sr-table tbody tr:hover{background:#FAFAFA}
.sr-table tbody tr:last-child td{border-bottom:none}

.sr-report-id{font-family:monospace;font-size:12px;font-weight:700;color:#0D9488;background:#F0FDFA;padding:3px 8px;border-radius:6px}
.sr-patient-cell{display:flex;align-items:center;gap:10px}
.sr-patient-avatar{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;flex-shrink:0}
.sr-patient-name{font-size:13px;font-weight:700;color:#0F172A}
.sr-patient-subid{font-size:11px;color:#94A3B8;font-family:monospace}
.sr-date-cell{display:flex;align-items:center;gap:5px;color:#64748B}
.sr-hist-badge{display:inline-block;font-size:11px;font-weight:700;background:#EFF6FF;color:#2563EB;border:1px solid #BFDBFE;padding:3px 8px;border-radius:6px}
.sr-stage-cell{font-size:13px;color:#334155;font-weight:500}
.sr-doctor-cell{font-size:13px;color:#64748B}

.sr-risk-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:4px 9px;border-radius:100px}
.sr-risk-low{background:#F0FDFA;color:#0D9488;border:1px solid #99F6E4}
.sr-risk-intermediate{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A}
.sr-risk-high{background:#FFF1F2;color:#E11D48;border:1px solid #FECDD3}

.sr-status-badge{display:inline-flex;align-items:center;font-size:11px;font-weight:700;padding:4px 9px;border-radius:100px}
.sr-status-finalized{background:#F0FDFA;color:#0D9488;border:1px solid #99F6E4}
.sr-status-draft{background:#F8FAFC;color:#64748B;border:1px solid rgba(0,0,0,0.1)}
.sr-status-pending{background:#FFFBEB;color:#D97706;border:1px solid #FDE68A}

.sr-actions{display:flex;align-items:center;gap:6px}
.sr-action-btn{width:30px;height:30px;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#F8FAFC;color:#64748B;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.sr-action-btn:hover{background:#F0FDFA;color:#0D9488;border-color:#CCFBF1}
.sr-action-btn-view:hover{background:#F0FDFA;color:#0D9488}

/* EMPTY */
.sr-empty{padding:64px 24px;text-align:center}
.sr-empty-icon{width:56px;height:56px;border-radius:16px;background:#F0FDFA;border:1px solid #CCFBF1;color:#0D9488;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.sr-empty-title{font-size:15px;font-weight:700;color:#0F172A;margin-bottom:6px}
.sr-empty-text{font-size:13px;color:#94A3B8;margin-bottom:16px}

/* MODAL */
.sr-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.4);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px}
.sr-modal{background:white;border-radius:24px;width:100%;max-width:540px;border:1px solid rgba(0,0,0,0.07);box-shadow:0 24px 80px rgba(15,23,42,0.18);animation:srModalIn .25s cubic-bezier(.16,1,.3,1) both;overflow:hidden}
@keyframes srModalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.sr-modal-head{padding:20px 24px 16px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#F0FDFA,#F8FAFC)}
.sr-modal-head-left{display:flex;align-items:center;gap:12px}
.sr-modal-avatar{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:white}
.sr-modal-title{font-family:'DM Serif Display',serif;font-size:18px;color:#0F172A;letter-spacing:-0.3px}
.sr-modal-subtitle{font-size:12px;color:#94A3B8;margin-top:1px}
.sr-modal-close{width:30px;height:30px;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#F8FAFC;color:#64748B;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.sr-modal-close:hover{background:#FFF1F2;color:#E11D48;border-color:#FECDD3}
.sr-modal-body{padding:24px}
.sr-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sr-modal-item{display:flex;flex-direction:column;gap:5px}
.sr-modal-label{font-size:10.5px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#94A3B8}
.sr-modal-value{font-size:14px;font-weight:600;color:#0F172A}
.sr-modal-foot{padding:16px 24px;border-top:1px solid #F1F5F9;display:flex;justify-content:flex-end;gap:10px}
.sr-cancel-btn{height:40px;padding:0 20px;border:1.5px solid rgba(0,0,0,0.08);background:#F8FAFC;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:600;color:#64748B;cursor:pointer;transition:all .15s}
.sr-cancel-btn:hover{background:#F0FDFA;color:#0D9488;border-color:#CCFBF1}
.sr-submit-btn{height:40px;padding:0 20px;border:none;border-radius:10px;background:linear-gradient(135deg,#1D9E75,#0D9488);font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:700;color:white;cursor:pointer;box-shadow:0 4px 12px rgba(13,148,136,0.25);transition:all .15s}
.sr-submit-btn:hover{transform:translateY(-1px);box-shadow:0 6px 16px rgba(13,148,136,0.35)}

@media(max-width:900px){.sr-body{padding:24px 20px 60px}.sr-stats{padding:0 20px;grid-template-columns:repeat(2,1fr)}.sr-hero{padding:36px 24px 32px}}
@media(max-width:600px){.sr-stats{grid-template-columns:1fr}.sr-filters-grid{grid-template-columns:1fr}.sr-modal-grid{grid-template-columns:1fr}}
`;

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function parseDate(val: string) {
    if (!val) return null;
    const d = new Date(val + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
}
function formatDisplay(val: string) {
    const d = parseDate(val);
    if (!d) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function DatePicker({ value, onChange, placeholder = 'Select date' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    const today    = new Date();
    const selected = parseDate(value);
    const [open,  setOpen]  = useState(false);
    const [month, setMonth] = useState(selected ? selected.getMonth()    : today.getMonth());
    const [year,  setYear]  = useState(selected ? selected.getFullYear() : today.getFullYear());
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => {
        if (selected) { setMonth(selected.getMonth()); setYear(selected.getFullYear()); }
    }, [value]);

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays    = new Date(year, month, 0).getDate();
    const cells: { day: number; cur: boolean }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, cur: false });
    for (let i = 1; i <= daysInMonth; i++)  cells.push({ day: i, cur: true });
    while (cells.length % 7 !== 0)          cells.push({ day: cells.length - firstDay - daysInMonth + 1, cur: false });

    const prevM = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextM = () => { if (month === 11){ setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };
    const select = (day: number) => {
        onChange(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        setOpen(false);
    };
    const isSel = (day: number) => !!selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
    const isTod = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    return (
        <div style={{ position: 'relative', width: '100%' }} ref={ref}>
            <button type="button" onClick={() => setOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', height: 40, padding: '0 12px',
                border: `1.5px solid ${open ? '#0D9488' : 'rgba(0,0,0,0.08)'}`, borderRadius: 9,
                background: open ? '#fff' : '#F9FAFB',
                boxShadow: open ? '0 0 0 3px rgba(13,148,136,0.08)' : 'none',
                cursor: 'pointer', transition: 'all .2s', fontFamily: "'DM Sans',sans-serif", fontSize: 13,
                color: value ? '#0F172A' : '#94A3B8', textAlign: 'left', boxSizing: 'border-box',
            }}>
                <Calendar size={13} style={{ color: '#0D9488', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{value ? formatDisplay(value) : placeholder}</span>
                <ChevronDown size={12} style={{ color: '#94A3B8', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 9999,
                    background: '#fff', border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 14,
                    boxShadow: '0 16px 48px rgba(15,23,42,0.12)', padding: 14, width: 268,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <button type="button" onClick={prevM} style={{ width: 28, height: 28, border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 7, background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F0FDFA'; (e.currentTarget as HTMLButtonElement).style.color = '#0D9488'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; }}
                        ><ChevronLeft size={13} /></button>
                        <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{MONTHS[month]} {year}</span>
                        <button type="button" onClick={nextM} style={{ width: 28, height: 28, border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 7, background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F0FDFA'; (e.currentTarget as HTMLButtonElement).style.color = '#0D9488'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#F8FAFC'; (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; }}
                        ><ChevronRight size={13} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
                        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#94A3B8', padding: '3px 0', fontFamily: "'DM Sans',sans-serif" }}>{d}</div>)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                        {cells.map((cell, i) => {
                            const sel = cell.cur && isSel(cell.day);
                            const tod = cell.cur && isTod(cell.day);
                            return (
                                <button key={i} type="button" onClick={() => cell.cur && select(cell.day)} style={{
                                    height: 30, borderRadius: 7, border: 'none',
                                    background: sel ? '#0D9488' : tod ? '#F0FDFA' : 'transparent',
                                    color: sel ? '#fff' : tod ? '#0D9488' : cell.cur ? '#0F172A' : '#CBD5E1',
                                    fontFamily: "'DM Sans',sans-serif", fontSize: 12,
                                    fontWeight: sel || tod ? 700 : 400, cursor: cell.cur ? 'pointer' : 'default', transition: 'all .12s',
                                    outline: tod && !sel ? '1.5px solid #99F6E4' : 'none', outlineOffset: '-1px',
                                }}
                                    onMouseEnter={e => { if (cell.cur && !sel) { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#F0FDFA'; b.style.color = '#0D9488'; } }}
                                    onMouseLeave={e => { if (cell.cur && !sel) { const b = e.currentTarget as HTMLButtonElement; b.style.background = tod ? '#F0FDFA' : 'transparent'; b.style.color = tod ? '#0D9488' : '#0F172A'; } }}
                                >{cell.day}</button>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <button type="button" onClick={() => { onChange(`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`); setOpen(false); }}
                            style={{ width: '100%', height: 28, border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: 7, background: '#F8FAFC', fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: '#64748B', cursor: 'pointer', transition: 'all .15s' }}
                            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#F0FDFA'; b.style.color = '#0D9488'; b.style.borderColor = '#99F6E4'; }}
                            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#F8FAFC'; b.style.color = '#64748B'; b.style.borderColor = 'rgba(0,0,0,0.08)'; }}
                        >Today</button>
                    </div>
                </div>
            )}
        </div>
    );
}

type ReportStatus = 'Finalized' | 'Draft' | 'Pending';
interface Report {
    id: string; patientName: string; patientId: string;
    age: number; gender: 'Male' | 'Female'; diagnosisDate: string;
    histType: string; stage: string;
    ataRisk: 'Low Risk' | 'Intermediate Risk' | 'High Risk';
    status: ReportStatus; doctor: string;
}

const MOCK_REPORTS: Report[] = [
    { id: 'RPT-001', patientName: 'Ahmed Al-Rashid',   patientId: 'P-10023', age: 45, gender: 'Male',   diagnosisDate: '2025-11-10', histType: 'PTC', stage: 'Stage II', ataRisk: 'Intermediate Risk', status: 'Finalized', doctor: 'Dr. Sara Khalid'  },
    { id: 'RPT-002', patientName: 'Fatima Al-Zahrani', patientId: 'P-10045', age: 38, gender: 'Female', diagnosisDate: '2025-12-01', histType: 'FTC', stage: 'Stage I',  ataRisk: 'Low Risk',          status: 'Draft',     doctor: 'Dr. Omar Nasser' },
    { id: 'RPT-004', patientName: 'Noura Al-Shamrani', patientId: 'P-10089', age: 29, gender: 'Female', diagnosisDate: '2025-01-28', histType: 'PTC', stage: 'Stage I',  ataRisk: 'Low Risk',          status: 'Pending',   doctor: 'Dr. Omar Nasser' },
];

const RISK_CLASS: Record<string, string> = {
    'Low Risk': 'sr-risk-low', 'Intermediate Risk': 'sr-risk-intermediate', 'High Risk': 'sr-risk-high',
};
const STATUS_CLASS: Record<ReportStatus, string> = {
    Finalized: 'sr-status-finalized', Draft: 'sr-status-draft', Pending: 'sr-status-pending',
};

export default function SearchReportPage() {
    const router = useRouter();
    const [searchQuery,    setSearchQuery]    = useState('');
    const [filterStatus,   setFilterStatus]   = useState('All');
    const [filterHistType, setFilterHistType] = useState('All');
    const [filterRisk,     setFilterRisk]     = useState('All');
    const [dateFrom,       setDateFrom]       = useState('');
    const [dateTo,         setDateTo]         = useState('');
    const [showFilters,    setShowFilters]    = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const filtered = useMemo(() => MOCK_REPORTS.filter(r => {
        const q = searchQuery.toLowerCase();
        const matchQuery = !q || r.patientName.toLowerCase().includes(q) || r.patientId.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.doctor.toLowerCase().includes(q);
        const matchStatus   = filterStatus   === 'All' || r.status   === filterStatus;
        const matchHist     = filterHistType === 'All' || r.histType === filterHistType;
        const matchRisk     = filterRisk     === 'All' || r.ataRisk  === filterRisk;
        const reportDate    = new Date(r.diagnosisDate);
        const matchFrom     = !dateFrom || reportDate >= new Date(dateFrom);
        const matchTo       = !dateTo   || reportDate <= new Date(dateTo);
        return matchQuery && matchStatus && matchHist && matchRisk && matchFrom && matchTo;
    }), [searchQuery, filterStatus, filterHistType, filterRisk, dateFrom, dateTo]);

    const clearFilters = () => {
        setFilterStatus('All'); setFilterHistType('All');
        setFilterRisk('All'); setDateFrom(''); setDateTo(''); setSearchQuery('');
    };

    const hasActiveFilters = filterStatus !== 'All' || filterHistType !== 'All' || filterRisk !== 'All' || !!dateFrom || !!dateTo;

    const stats = {
        total:     MOCK_REPORTS.length,
        finalized: MOCK_REPORTS.filter(r => r.status === 'Finalized').length,
        draft:     MOCK_REPORTS.filter(r => r.status === 'Draft').length,
        pending:   MOCK_REPORTS.filter(r => r.status === 'Pending').length,
    };

    return (
        <>
            <style>{SR_STYLES}</style>
            <div className="sr-wrap">

                {/* HERO */}
                <div className="sr-hero">
                    <div className="sr-hero-dots" />
                    <div className="sr-hero-blob" />
                    <div className="sr-hero-inner">
                        <div>
                            <button className="sr-hero-back" onClick={() => router.push('/report')}>
                                <ArrowLeft size={13} /> Back to Report
                            </button>
                            <div className="sr-hero-label">Clinical Reports</div>
                            <h1 className="sr-hero-title">Search Reports</h1>
                            <p className="sr-hero-sub">Search and filter thyroid oncology reports across all patients</p>
                        </div>
                        <div className="sr-hero-actions">
                            <button className="sr-hero-action"><Download size={14} /> Export</button>
                            <button className="sr-hero-action"><Printer size={14} /> Print</button>
                        </div>
                    </div>
                </div>

                {/* STATS */}
                <div className="sr-stats">
                    <div className="sr-stat-card"><div className="sr-stat-ic sr-stat-ic-blue"><FileText size={18} /></div><div><div className="sr-stat-val">{stats.total}</div><div className="sr-stat-lbl">Total Reports</div></div></div>
                    <div className="sr-stat-card"><div className="sr-stat-ic sr-stat-ic-green"><CheckCircle size={18} /></div><div><div className="sr-stat-val">{stats.finalized}</div><div className="sr-stat-lbl">Finalized</div></div></div>
                    <div className="sr-stat-card"><div className="sr-stat-ic sr-stat-ic-yellow"><Clock size={18} /></div><div><div className="sr-stat-val">{stats.draft}</div><div className="sr-stat-lbl">Drafts</div></div></div>
                    <div className="sr-stat-card"><div className="sr-stat-ic sr-stat-ic-red"><AlertCircle size={18} /></div><div><div className="sr-stat-val">{stats.pending}</div><div className="sr-stat-lbl">Pending</div></div></div>
                </div>

                {/* BODY */}
                <div className="sr-body">

                    {/* SEARCH */}
                    <div className="sr-search-row">
                        <div className="sr-search-wrap">
                            <Search size={16} className="sr-search-icon" />
                            <input type="text" className="sr-search" placeholder="Search by patient name, ID, report number, or doctor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            {searchQuery && <button className="sr-search-clear" onClick={() => setSearchQuery('')}><X size={14} /></button>}
                        </div>
                        <button className={`sr-filter-btn${showFilters || hasActiveFilters ? ' sr-filter-btn-active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                            <Filter size={14} /> Filters
                            {hasActiveFilters && <span className="sr-filter-badge" />}
                        </button>
                    </div>

                    {/* FILTERS PANEL */}
                    {showFilters && (
                        <div className="sr-filters-panel">
                            <div className="sr-filters-head">
                                <span className="sr-filters-title"><Filter size={12} /> Advanced Filters</span>
                                {hasActiveFilters && <button className="sr-clear-btn" onClick={clearFilters}><X size={11} /> Clear All</button>}
                            </div>
                            <div className="sr-filters-grid">
                                <div className="sr-fgroup">
                                    <label>Status</label>
                                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                        <option value="All">All Statuses</option>
                                        <option value="Finalized">Finalized</option>
                                        <option value="Draft">Draft</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div className="sr-fgroup">
                                    <label>Histological Type</label>
                                    <select value={filterHistType} onChange={e => setFilterHistType(e.target.value)}>
                                        <option value="All">All Types</option>
                                        <option value="PTC">PTC</option>
                                        <option value="FTC">FTC</option>
                                        <option value="MTC">MTC</option>
                                        <option value="ATC">ATC</option>
                                    </select>
                                </div>
                                <div className="sr-fgroup">
                                    <label>ATA Risk</label>
                                    <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
                                        <option value="All">All Risk Levels</option>
                                        <option value="Low Risk">Low Risk</option>
                                        <option value="Intermediate Risk">Intermediate Risk</option>
                                        <option value="High Risk">High Risk</option>
                                    </select>
                                </div>
                                <div className="sr-fgroup">
                                    <label>Date From</label>
                                    <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Select date" />
                                </div>
                                <div className="sr-fgroup">
                                    <label>Date To</label>
                                    <DatePicker value={dateTo} onChange={setDateTo} placeholder="Select date" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RESULTS BAR */}
                    <div className="sr-results-bar">
                        <TrendingUp size={13} />
                        Showing <strong style={{ color: '#0F172A', margin: '0 4px' }}>{filtered.length}</strong> of {MOCK_REPORTS.length} reports
                    </div>

                    {/* TABLE */}
                    <div className="sr-table-wrap">
                        {filtered.length === 0 ? (
                            <div className="sr-empty">
                                <div className="sr-empty-icon"><Search size={24} /></div>
                                <p className="sr-empty-title">No reports found</p>
                                <p className="sr-empty-text">Try adjusting your search or filters</p>
                                <button className="sr-clear-btn" onClick={clearFilters}><X size={11} /> Clear filters</button>
                            </div>
                        ) : (
                            <table className="sr-table">
                                <thead>
                                    <tr>
                                        <th>Report ID</th><th>Patient</th><th>Age / Gender</th>
                                        <th>Date</th><th>Hist. Type</th><th>Stage</th>
                                        <th>ATA Risk</th><th>Status</th><th>Doctor</th><th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(report => (
                                        <tr key={report.id}>
                                            <td><span className="sr-report-id">{report.id}</span></td>
                                            <td>
                                                <div className="sr-patient-cell">
                                                    <div className="sr-patient-avatar">{report.patientName.charAt(0)}</div>
                                                    <div>
                                                        <div className="sr-patient-name">{report.patientName}</div>
                                                        <div className="sr-patient-subid">{report.patientId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ color: '#64748B', fontSize: 13 }}>{report.age} / {report.gender}</td>
                                            <td>
                                                <div className="sr-date-cell">
                                                    <Calendar size={11} />
                                                    {new Date(report.diagnosisDate).toLocaleDateString('en-GB')}
                                                </div>
                                            </td>
                                            <td><span className="sr-hist-badge">{report.histType}</span></td>
                                            <td className="sr-stage-cell">{report.stage}</td>
                                            <td><span className={`sr-risk-badge ${RISK_CLASS[report.ataRisk]}`}>{report.ataRisk}</span></td>
                                            <td><span className={`sr-status-badge ${STATUS_CLASS[report.status]}`}>{report.status}</span></td>
                                            <td className="sr-doctor-cell">{report.doctor}</td>
                                            <td>
                                                <div className="sr-actions">
                                                    <button className="sr-action-btn sr-action-btn-view" title="View" onClick={() => setSelectedReport(report)}><Eye size={13} /></button>
                                                    <button className="sr-action-btn" title="Download"><Download size={13} /></button>
                                                    <button className="sr-action-btn" title="Print"><Printer size={13} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {selectedReport && (
                <div className="sr-modal-overlay" onClick={() => setSelectedReport(null)}>
                    <div className="sr-modal" onClick={e => e.stopPropagation()}>
                        <div className="sr-modal-head">
                            <div className="sr-modal-head-left">
                                <div className="sr-modal-avatar">{selectedReport.patientName.charAt(0)}</div>
                                <div>
                                    <h2 className="sr-modal-title">{selectedReport.patientName}</h2>
                                    <p className="sr-modal-subtitle">{selectedReport.id} · {selectedReport.patientId}</p>
                                </div>
                            </div>
                            <button className="sr-modal-close" onClick={() => setSelectedReport(null)}><X size={15} /></button>
                        </div>
                        <div className="sr-modal-body">
                            <div className="sr-modal-grid">
                                <div className="sr-modal-item"><span className="sr-modal-label">Age / Gender</span><span className="sr-modal-value">{selectedReport.age} / {selectedReport.gender}</span></div>
                                <div className="sr-modal-item"><span className="sr-modal-label">Diagnosis Date</span><span className="sr-modal-value">{new Date(selectedReport.diagnosisDate).toLocaleDateString('en-GB')}</span></div>
                                <div className="sr-modal-item"><span className="sr-modal-label">Histological Type</span><span className="sr-modal-value">{selectedReport.histType}</span></div>
                                <div className="sr-modal-item"><span className="sr-modal-label">Stage</span><span className="sr-modal-value">{selectedReport.stage}</span></div>
                                <div className="sr-modal-item"><span className="sr-modal-label">ATA Risk</span><span className={`sr-risk-badge ${RISK_CLASS[selectedReport.ataRisk]}`}>{selectedReport.ataRisk}</span></div>
                                <div className="sr-modal-item"><span className="sr-modal-label">Status</span><span className={`sr-status-badge ${STATUS_CLASS[selectedReport.status]}`}>{selectedReport.status}</span></div>
                                <div className="sr-modal-item" style={{ gridColumn: '1 / -1' }}><span className="sr-modal-label">Doctor</span><span className="sr-modal-value">{selectedReport.doctor}</span></div>
                            </div>
                        </div>
                        <div className="sr-modal-foot">
                            <button className="sr-cancel-btn" onClick={() => setSelectedReport(null)}>Close</button>
                            <button className="sr-submit-btn" onClick={() => router.push('/report')}>Open Full Report</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
