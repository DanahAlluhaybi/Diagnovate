'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
    Activity, ArrowLeft, Calendar, ChevronDown, ChevronLeft, ChevronRight,
    FlaskConical, Microscope, Pill, Scan, Stethoscope, Target, Check,
} from 'lucide-react';
import { BASE } from '@/lib/api';

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

interface DatePickerProps {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}

function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
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
    for (let i = 1; i <= daysInMonth; i++)  cells.push({ day: i,            cur: true  });
    while (cells.length % 7 !== 0)          cells.push({ day: cells.length - firstDay - daysInMonth + 1, cur: false });

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11){ setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };

    const select = (day: number) => {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        onChange(`${year}-${mm}-${dd}`);
        setOpen(false);
    };

    const isSelected = (day: number) =>
        !!selected && selected.getFullYear() === year && selected.getMonth() === month && selected.getDate() === day;
    const isToday = (day: number) =>
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    return (
        <div style={{ position: 'relative', width: '100%' }} ref={ref}>
            <button type="button" onClick={() => setOpen(o => !o)} style={{
                display:'flex', alignItems:'center', gap:8, width:'100%', height:46, padding:'0 14px',
                border:`1.5px solid ${open ? '#0D9488' : 'rgba(0,0,0,0.1)'}`, borderRadius:10,
                background: open ? '#fff' : '#F9FAFB',
                boxShadow: open ? '0 0 0 4px rgba(13,148,136,0.08)' : 'none',
                cursor:'pointer', transition:'all .2s', fontFamily:'"DM Sans",sans-serif', fontSize:13.5,
                color: value ? '#111827' : '#9CA3AF', textAlign:'left', boxSizing:'border-box',
            }}>
                <Calendar size={14} style={{ color:'#0D9488', flexShrink:0 }} />
                <span style={{ flex:1 }}>{value ? formatDisplay(value) : placeholder}</span>
                <ChevronDown size={13} style={{ color:'#9CA3AF', transform: open ? 'rotate(180deg)' : 'none', transition:'transform .2s' }} />
            </button>

            {open && (
                <div style={{
                    position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:9999,
                    background:'#fff', border:'1.5px solid rgba(0,0,0,0.1)',
                    borderRadius:14, boxShadow:'0 20px 60px rgba(0,0,0,0.15)', padding:16, width:280,
                    animation:'rp-fadeUp .18s cubic-bezier(.16,1,.3,1) both',
                }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                        <button type="button" onClick={prevMonth} style={{
                            width:28, height:28, border:'1.5px solid rgba(0,0,0,0.1)', borderRadius:8,
                            background:'#F9FAFB', cursor:'pointer', display:'flex', alignItems:'center',
                            justifyContent:'center', color:'#9CA3AF', transition:'all .15s',
                        }}
                                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background='#F0FDFA'; b.style.color='#0D9488'; }}
                                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background='#F9FAFB'; b.style.color='#9CA3AF'; }}
                        ><ChevronLeft size={14}/></button>
                        <span style={{ fontFamily:'"DM Sans",sans-serif', fontWeight:700, fontSize:14, color:'#111827' }}>
                            {MONTHS[month]} {year}
                        </span>
                        <button type="button" onClick={nextMonth} style={{
                            width:28, height:28, border:'1.5px solid rgba(0,0,0,0.1)', borderRadius:8,
                            background:'#F9FAFB', cursor:'pointer', display:'flex', alignItems:'center',
                            justifyContent:'center', color:'#9CA3AF', transition:'all .15s',
                        }}
                                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background='#F0FDFA'; b.style.color='#0D9488'; }}
                                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background='#F9FAFB'; b.style.color='#9CA3AF'; }}
                        ><ChevronRight size={14}/></button>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
                        {DAYS.map(d => (
                            <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'#9CA3AF', padding:'4px 0', fontFamily:'"DM Sans",sans-serif' }}>{d}</div>
                        ))}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
                        {cells.map((cell, i) => {
                            const sel = cell.cur && isSelected(cell.day);
                            const tod = cell.cur && isToday(cell.day);
                            return (
                                <button key={i} type="button" onClick={() => cell.cur && select(cell.day)} style={{
                                    height:32, borderRadius:8, border:'none',
                                    background: sel ? '#0D9488' : tod ? '#F0FDFA' : 'transparent',
                                    color: sel ? '#fff' : tod ? '#0D9488' : cell.cur ? '#111827' : '#D1D5DB',
                                    fontFamily:'"DM Sans",sans-serif', fontSize:13,
                                    fontWeight: sel || tod ? 700 : 500,
                                    cursor: cell.cur ? 'pointer' : 'default', transition:'all .12s',
                                    outline: tod && !sel ? '1.5px solid rgba(13,148,136,0.3)' : 'none',
                                    outlineOffset:'-1px',
                                }}
                                        onMouseEnter={e => { if (cell.cur && !sel) { const b = e.currentTarget as HTMLButtonElement; b.style.background='#F0FDFA'; b.style.color='#0D9488'; } }}
                                        onMouseLeave={e => { if (cell.cur && !sel) { const b = e.currentTarget as HTMLButtonElement; b.style.background=tod?'#F0FDFA':'transparent'; b.style.color=tod?'#0D9488':'#111827'; } }}
                                >{cell.day}</button>
                            );
                        })}
                    </div>
                    <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid rgba(0,0,0,0.06)' }}>
                        <button type="button" onClick={() => {
                            const mm = String(today.getMonth()+1).padStart(2,'0');
                            const dd = String(today.getDate()).padStart(2,'0');
                            onChange(`${today.getFullYear()}-${mm}-${dd}`);
                            setOpen(false);
                        }} style={{
                            width:'100%', height:30, border:'1.5px solid rgba(0,0,0,0.1)',
                            borderRadius:8, background:'#F9FAFB', fontFamily:'"DM Sans",sans-serif',
                            fontSize:12, fontWeight:600, color:'#9CA3AF', cursor:'pointer', transition:'all .15s',
                        }}
                                onMouseEnter={e => { const b=e.currentTarget as HTMLButtonElement; b.style.background='#F0FDFA'; b.style.color='#0D9488'; b.style.borderColor='rgba(13,148,136,0.3)'; }}
                                onMouseLeave={e => { const b=e.currentTarget as HTMLButtonElement; b.style.background='#F9FAFB'; b.style.color='#9CA3AF'; b.style.borderColor='rgba(0,0,0,0.1)'; }}
                        >Today</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const ThyroidIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4c-2.5 0-5 1.5-7 4-2 2.5-3 5.5-3 8 0 2.5 1 5 3 7 2 2 4.5 3 7 3s5-1 7-3c2-2 3-4.5 3-7 0-2.5-1-5.5-3-8-2-2.5-4.5-4-7-4z"/>
        <circle cx="12" cy="12" r="2"/>
    </svg>
);
const DropletsIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2.5c-2.5 3-5 6-5 10 0 3 2 5 5 5s5-2 5-5c0-4-2.5-7-5-10z"/>
        <path d="M8 12c1.5-1 3-1 4 0"/>
    </svg>
);

const TABS = [
    { id: 'tumor',     label: 'Tumor Details', Icon: ThyroidIcon },
    { id: 'pathology', label: 'Pathology',      Icon: () => <Microscope   size={15} /> },
    { id: 'staging',   label: 'Staging (TNM)',  Icon: () => <Target       size={15} /> },
    { id: 'molecular', label: 'Molecular',      Icon: () => <FlaskConical size={15} /> },
    { id: 'treatment', label: 'Treatment',      Icon: () => <Pill         size={15} /> },
];

type ToastType = 'success' | 'error' | 'info';
interface ToastState { msg: string; type: ToastType; }
interface PatientRef { id: string; mrn: string; name: string; age: string; gender: string; }

export default function ThyroidCancerReport() {
    const router = useRouter();

    // ── Auth + patient list ──
    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/log-in?role=doctor'); return; }
        const token = localStorage.getItem('token');
        fetch(`${BASE}/api/patients`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }).then(r => r.json()).then(data => {
            if (data.success && Array.isArray(data.data)) {
                setAllPatients(data.data.map((p: any) => ({
                    id: p.id, mrn: p.mrn,
                    name: `${p.firstName} ${p.lastName}`,
                    age: String(p.age ?? ''),
                    gender: p.gender ?? '',
                })));
            }
        }).catch(() => {});
    }, []);

    const [activeTab, setActiveTab] = useState('tumor');
    const [loading,   setLoading]   = useState(false);
    const [toast,     setToast]     = useState<ToastState | null>(null);
    const [reportId,  setReportId]  = useState<string | null>(null);

    // ── Patient search (enhancement-style) ──
    const [allPatients,        setAllPatients]        = useState<PatientRef[]>([]);
    const [selectedPatientRef, setSelectedPatientRef] = useState<PatientRef | null>(null);
    const [showSuggest,        setShowSuggest]        = useState(false);
    const [patientSearch,      setPatientSearch]      = useState('');

    // ── Patient fields ──
    const [patientName,   setPatientName]   = useState('');
    const [patientId,     setPatientId]     = useState('');
    const [age,           setAge]           = useState('');
    const [gender,        setGender]        = useState('');
    const [diagnosisDate, setDiagnosisDate] = useState('');

    // ── Tumor ──
    const [lobeInvolvement, setLobeInvolvement] = useState('');
    const [tumorSize,       setTumorSize]       = useState('');
    const [noduleCount,     setNoduleCount]     = useState('');
    const [usComposition,   setUsComposition]   = useState('Cystic');
    const [usEchogenicity,  setUsEchogenicity]  = useState('Anechoic');
    const [usShape,         setUsShape]         = useState('Wider-than-tall');
    const [usMargin,        setUsMargin]        = useState('Smooth');
    const [tiradsScore,     setTiradsScore]     = useState('');

    // ── Pathology ──
    const [histologicalType,  setHistologicalType]  = useState('');
    const [capsularInvasion,  setCapsularInvasion]  = useState(false);
    const [vascularInvasion,  setVascularInvasion]  = useState(false);
    const [lymphaticInvasion, setLymphaticInvasion] = useState(false);
    const [extrathyroidalExt, setExtrathyroidalExt] = useState(false);
    const [multifocality,     setMultifocality]     = useState(false);

    // ── Staging ──
    const [tCategory,       setTCategory]       = useState('');
    const [nCategory,       setNCategory]       = useState('');
    const [mCategory,       setMCategory]       = useState('');
    const [metastasisSites, setMetastasisSites] = useState<string[]>([]);
    const [stageGroup,      setStageGroup]      = useState('');
    const [ataRisk,         setAtaRisk]         = useState('');

    // ── Molecular ──
    const [brafV600e,    setBrafV600e]    = useState('Not tested');
    const [rasMutation,  setRasMutation]  = useState('Not tested');
    const [retPtc,       setRetPtc]       = useState('Not tested');
    const [tertPromoter, setTertPromoter] = useState('Not tested');
    const [tgLevel,      setTgLevel]      = useState('');
    const [antiTg,       setAntiTg]       = useState('');
    const [calcitonin,   setCalcitonin]   = useState('');

    // ── Treatment ──
    const [surgeryProcedure,  setSurgeryProcedure]  = useState('');
    const [raiDose,           setRaiDose]           = useState('');
    const [raiDate,           setRaiDate]           = useState('');
    const [levothyroxineDose, setLevothyroxineDose] = useState('');
    const [nextVisit,         setNextVisit]         = useState('');
    const [nextTg,            setNextTg]            = useState('');

    const showToast = (msg: string, type: ToastType = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const buildPayload = (status: 'draft' | 'submitted') => ({
        patient_id: patientId, status, diagnosis_date: diagnosisDate,
        lobe_involvement: lobeInvolvement,
        tumor_size:    tumorSize    ? parseFloat(tumorSize)         : null,
        nodule_count:  noduleCount  ? parseInt(noduleCount)         : null,
        us_composition: usComposition, us_echogenicity: usEchogenicity,
        us_shape: usShape, us_margin: usMargin, tirads_score: tiradsScore,
        histological_type: histologicalType,
        capsular_invasion: capsularInvasion, vascular_invasion: vascularInvasion,
        lymphatic_invasion: lymphaticInvasion, extrathyroidal_ext: extrathyroidalExt,
        multifocality,
        t_category: tCategory, n_category: nCategory, m_category: mCategory,
        metastasis_sites: JSON.stringify(metastasisSites),
        stage_group: stageGroup, ata_risk: ataRisk,
        braf_v600e: brafV600e, ras_mutation: rasMutation, ret_ptc: retPtc,
        tert_promoter: tertPromoter,
        tg_level:   tgLevel    ? parseFloat(tgLevel)             : null,
        anti_tg:    antiTg     ? parseFloat(antiTg)              : null,
        calcitonin: calcitonin ? parseFloat(calcitonin)          : null,
        surgery_procedure: surgeryProcedure,
        rai_dose:           raiDose           ? parseFloat(raiDose)           : null,
        rai_date: raiDate,
        levothyroxine_dose: levothyroxineDose ? parseFloat(levothyroxineDose) : null,
        next_visit: nextVisit, next_tg_check: nextTg,
    });

    const getToken = () => localStorage.getItem('token') || '';

    const handleSaveDraft = async () => {
        if (!patientId) { showToast('Please select a patient first', 'error'); return; }
        try {
            setLoading(true);
            const method = reportId ? 'PUT' : 'POST';
            const url    = reportId ? `${BASE}/api/reports/${reportId}` : `${BASE}/api/reports`;
            const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(buildPayload('draft')) });
            const data   = await res.json();
            if (data.success) { if (!reportId && data.data?.report_id) setReportId(data.data.report_id); showToast('Draft saved successfully ✓'); }
            else showToast(data.error || 'Failed to save draft', 'error');
        } catch { showToast('Network error. Please try again.', 'error'); }
        finally  { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!patientId)     { showToast('Patient ID is required', 'error');        return; }
        if (!diagnosisDate) { showToast('Date of Diagnosis is required', 'error'); return; }
        try {
            setLoading(true);
            const method = reportId ? 'PUT' : 'POST';
            const url    = reportId ? `${BASE}/api/reports/${reportId}` : `${BASE}/api/reports`;
            const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }, body: JSON.stringify(buildPayload('submitted')) });
            const data   = await res.json();
            if (data.success) { showToast('Report submitted successfully ✓'); setTimeout(() => router.back(), 1500); }
            else showToast(data.error || 'Failed to submit report', 'error');
        } catch { showToast('Network error. Please try again.', 'error'); }
        finally  { setLoading(false); }
    };

    const toggleSite = (site: string) =>
        setMetastasisSites(prev => prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site]);

    // ── Patient suggestion list ──
    const patientSuggestions = (() => {
        if (!showSuggest || !patientSearch.trim()) return [];
        const q = patientSearch.toLowerCase();
        return allPatients.filter(p =>
            p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q)
        ).slice(0, 5);
    })();

    return (
        <>
            <style>{`
            @keyframes rp-fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
            @keyframes rp-spin   { to{transform:rotate(360deg)} }
            @keyframes rp-pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
            @keyframes rp-toast  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }

            .rp-wrap { min-height:100vh; font-family:"DM Sans",sans-serif;
                background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(29,158,117,0.09) 0%,transparent 60%),
                           radial-gradient(ellipse 50% 40% at 90% 90%,rgba(8,80,65,0.05) 0%,transparent 50%),#FFFFFF; }

            /* ── Hero ── */
            .rp-hero { background:linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%); padding:52px 52px 48px; position:relative; overflow:hidden; }
            .rp-hero-dots { position:absolute;inset:0;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px);background-size:20px 20px; }
            .rp-hero-blob { position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(29,158,117,0.15);filter:blur(40px);right:-60px;top:-60px;pointer-events:none; }
            .rp-hero-inner { position:relative;z-index:1;max-width:900px;margin:0 auto; }
            .rp-hero-back { display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.7);font-size:12.5px;font-weight:500;cursor:pointer;text-decoration:none;margin-bottom:22px;transition:all .18s;font-family:"DM Sans",sans-serif; }
            .rp-hero-back:hover { background:rgba(255,255,255,0.1);color:#fff; }
            .rp-hero-badge { display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:100px;border:1px solid rgba(29,158,117,0.4);background:rgba(29,158,117,0.12);font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#6EE7B7;margin-bottom:14px; }
            .rp-badge-dot { width:5px;height:5px;border-radius:50%;background:#1D9E75;animation:rp-pulse 2s ease-in-out infinite; }
            .rp-hero-title { font-family:"DM Serif Display",serif;font-size:clamp(28px,3.5vw,44px);color:#fff;letter-spacing:-0.8px;line-height:1.1;margin:0 0 22px; }
            .rp-hero-title em { font-style:italic;color:#6EE7B7; }
            .rp-hero-pills { display:flex;gap:10px;flex-wrap:wrap; }
            .rp-hero-pill { display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1); }
            .rp-pill-val { font-size:15px;font-weight:800;color:#fff; }
            .rp-pill-lbl { font-size:11px;color:rgba(255,255,255,0.55);font-weight:500; }

            /* ── Main ── */
            .rp-main { max-width:900px;margin:0 auto;padding:44px 52px 120px; }

            /* ── Card ── */
            .rp-card { background:#fff;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;margin-bottom:16px;box-shadow:0 1px 3px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.05),0 0 40px rgba(13,148,136,0.05);animation:rp-fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
            .rp-card-head { display:flex;align-items:center;gap:12px;padding:18px 24px;border-bottom:1px solid rgba(0,0,0,0.06);background:linear-gradient(to right,#f8fffe,#fff); }
            .rp-card-icon { width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 4px 12px rgba(13,148,136,0.3);flex-shrink:0; }
            .rp-card-icon-sm { width:28px;height:28px;border-radius:8px;background:rgba(13,148,136,0.08);border:1px solid rgba(13,148,136,0.15);display:flex;align-items:center;justify-content:center;color:#0D9488;flex-shrink:0; }
            .rp-card-title { font-size:14px;font-weight:700;color:#111827;letter-spacing:-0.1px; }

            /* ── Patient grid ── */
            .rp-patient-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:24px; }

            /* ── Tab bar ── */
            .rp-tabs { display:flex;gap:4px;padding:6px;background:#F1F5F9;border-radius:14px;margin-bottom:20px;overflow-x:auto;box-shadow:inset 0 1px 3px rgba(0,0,0,0.06); }
            .rp-tab { display:flex;align-items:center;gap:7px;padding:9px 16px;border:none;border-radius:10px;background:transparent;font-family:"DM Sans",sans-serif;font-size:13px;font-weight:600;color:#6B7280;cursor:pointer;transition:all .18s;white-space:nowrap; }
            .rp-tab:hover { color:#0D9488;background:rgba(13,148,136,0.06); }
            .rp-tab-active { background:#fff;color:#0D9488;font-weight:700;box-shadow:0 2px 8px rgba(0,0,0,0.1),0 1px 2px rgba(0,0,0,0.06); }

            /* ── Section ── */
            .rp-section { display:flex;flex-direction:column;gap:16px;animation:rp-fadeUp .4s cubic-bezier(.16,1,.3,1) both; }

            /* ── Form ── */
            .rp-fgroup { display:flex;flex-direction:column;gap:6px;position:relative; }
            .rp-label  { font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#6B7280; }
            .rp-input, .rp-select {
                height:46px;padding:0 14px;box-sizing:border-box;
                border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;
                font-family:"DM Sans",sans-serif;font-size:13.5px;color:#111827;
                background:#F9FAFB;outline:none;transition:all .2s;width:100%;
                appearance:none;-webkit-appearance:none;
            }
            .rp-input::placeholder { color:#9CA3AF; }
            .rp-input:focus,.rp-select:focus { border-color:#0D9488;background:#fff;box-shadow:0 0 0 4px rgba(13,148,136,0.08); }

            /* ── Patient suggest dropdown (same as enhancement) ── */
            .rp-suggest {
                position:absolute;top:calc(100% - 2px);left:0;right:0;
                background:#fff;border:1.5px solid rgba(13,148,136,0.3);
                border-top:none;border-radius:0 0 10px 10px;
                box-shadow:0 8px 24px rgba(15,23,42,.12);z-index:50;overflow:hidden;
            }
            .rp-suggest-item {
                display:flex;align-items:center;justify-content:space-between;
                width:100%;padding:10px 14px;border:none;background:#fff;
                cursor:pointer;transition:background .12s;text-align:left;
                border-bottom:1px solid rgba(0,0,0,0.04);
                font-family:"DM Sans",sans-serif;
            }
            .rp-suggest-item:last-child { border-bottom:none; }
            .rp-suggest-item:hover { background:#F0FDFA; }
            .rp-suggest-name { font-size:13.5px;font-weight:600;color:#111827; }
            .rp-suggest-mrn  { font-size:11.5px;color:#9CA3AF;font-variant-numeric:tabular-nums; }
            .rp-hint { font-size:12px;color:#0D9488;font-weight:600;margin-top:6px;display:flex;align-items:center;gap:5px; }

            /* ── Grids ── */
            .rp-grid3    { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:24px; }
            .rp-grid5    { display:grid;grid-template-columns:repeat(5,1fr);gap:16px;padding:24px; }
            .rp-grid2    { display:grid;grid-template-columns:repeat(2,1fr);gap:16px;padding:24px; }
            .rp-grid1    { padding:24px; }
            .rp-grid-tnm { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:24px; }
            .rp-grid-mol { display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:24px; }

            /* ── TNM ── */
            .rp-tnm-cat-label { font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#6B7280;margin:0 0 8px; }

            /* ── Molecular card ── */
            .rp-mut-card  { background:#F9FAFB;border:1px solid rgba(0,0,0,0.07);border-radius:12px;padding:16px; }
            .rp-mut-label { font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#6B7280;margin:0 0 8px; }

            /* ── Radio / Checkbox ── */
            .rp-radio-group,.rp-check-group { display:flex;flex-direction:column;gap:10px; }
            .rp-radio-opt,.rp-check-opt { display:flex;align-items:center;gap:10px;cursor:pointer;font-size:13.5px;color:#374151;font-weight:500;padding:10px 14px;border-radius:10px;border:1px solid rgba(0,0,0,0.07);background:#F9FAFB;transition:all .15s; }
            .rp-radio-opt:hover,.rp-check-opt:hover { border-color:rgba(13,148,136,0.3);background:#F0FDFA;color:#0D9488; }
            .rp-radio-opt input,.rp-check-opt input { accent-color:#0D9488;width:16px;height:16px;flex-shrink:0; }

            /* ── Action bar ── */
            .rp-actions { position:fixed;bottom:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.95);backdrop-filter:blur(16px);border-top:1px solid rgba(0,0,0,0.08);padding:14px 52px;display:flex;align-items:center;justify-content:flex-end;gap:10px;box-shadow:0 -4px 24px rgba(0,0,0,0.08); }
            .rp-btn-cancel { height:44px;padding:0 22px;border:1.5px solid rgba(0,0,0,0.1);border-radius:10px;background:#F9FAFB;font-family:"DM Sans",sans-serif;font-size:13.5px;font-weight:600;color:#6B7280;cursor:pointer;transition:all .18s; }
            .rp-btn-cancel:hover { background:#F1F5F9;color:#374151; }
            .rp-btn-draft { height:44px;padding:0 22px;border:1.5px solid rgba(13,148,136,0.3);border-radius:10px;background:#F0FDFA;font-family:"DM Sans",sans-serif;font-size:13.5px;font-weight:700;color:#0D9488;cursor:pointer;transition:all .18s; }
            .rp-btn-draft:hover:not(:disabled) { background:#CCFBF1; }
            .rp-btn-draft:disabled { opacity:.5;cursor:not-allowed; }
            .rp-btn-submit { height:44px;padding:0 28px;background:linear-gradient(135deg,#1D9E75,#0D9488,#0F6E56);border:none;border-radius:10px;font-family:"DM Sans",sans-serif;font-size:13.5px;font-weight:700;color:#fff;cursor:pointer;transition:all .22s;box-shadow:0 4px 16px rgba(29,158,117,.28); }
            .rp-btn-submit:hover:not(:disabled) { transform:translateY(-1px);box-shadow:0 8px 24px rgba(13,148,136,.4); }
            .rp-btn-submit:disabled { opacity:.5;cursor:not-allowed;transform:none;box-shadow:none; }

            /* ── Toast ── */
            .rp-toast { position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:13px 22px;border-radius:12px;font-size:13.5px;font-weight:700;font-family:"DM Sans",sans-serif;z-index:9999;white-space:nowrap;animation:rp-toast .3s cubic-bezier(.16,1,.3,1) both;box-shadow:0 8px 32px rgba(0,0,0,0.15); }
            .rp-toast-success { background:#0D9488;color:#fff; }
            .rp-toast-error   { background:#EF4444;color:#fff; }
            .rp-toast-info    { background:#0891B2;color:#fff; }

            @media(max-width:900px) {
                .rp-hero { padding:40px 24px 36px; }
                .rp-main { padding:32px 24px 120px; }
                .rp-patient-grid,.rp-grid3,.rp-grid5 { grid-template-columns:repeat(2,1fr); }
                .rp-grid-mol { grid-template-columns:repeat(2,1fr); }
                .rp-grid-tnm { grid-template-columns:1fr; }
                .rp-actions  { padding:14px 24px; }
            }
            @media(max-width:600px) {
                .rp-hero { padding:28px 16px 24px; }
                .rp-main { padding:24px 16px 120px; }
                .rp-patient-grid,.rp-grid3,.rp-grid2,.rp-grid5,.rp-grid-mol { grid-template-columns:1fr; }
                .rp-tabs { gap:2px; }
                .rp-tab  { padding:8px 12px;font-size:12px; }
            }
        `}</style>

            <div className="rp-wrap">
                <Navbar />

                {/* ── Dark hero ── */}
                <div className="rp-hero">
                    <div className="rp-hero-dots" />
                    <div className="rp-hero-blob" />
                    <div className="rp-hero-inner">
                        <button className="rp-hero-back" onClick={() => router.push('/dashboard')}>
                            <ArrowLeft size={13} /> Dashboard
                        </button>
                        <div className="rp-hero-badge"><span className="rp-badge-dot" />Oncology</div>
                        <h1 className="rp-hero-title">Thyroid Cancer <em>Report</em></h1>
                        <div className="rp-hero-pills">
                            {[{val:'5 Clinical Tabs',lbl:'Sections'},{val:'TNM Staging',lbl:'AJCC 8th Ed'},{val:'Auto Draft',lbl:'Save Anytime'}].map(p => (
                                <div key={p.val} className="rp-hero-pill">
                                    <span className="rp-pill-val">{p.val}</span>
                                    <span className="rp-pill-lbl">{p.lbl}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <main className="rp-main">

                    {/* ── Patient info card ── */}
                    <div className="rp-card">
                        <div className="rp-card-head">
                            <div className="rp-card-icon"><ThyroidIcon /></div>
                            <span className="rp-card-title">Patient Information</span>
                        </div>
                        <div className="rp-patient-grid">

                            {/* Search field with autocomplete — enhancement style */}
                            <div className="rp-fgroup">
                                <label className="rp-label">Patient Name *</label>
                                <input
                                    className="rp-input" type="text"
                                    placeholder="Search by name or MRN..."
                                    value={patientSearch} autoComplete="off"
                                    onChange={e => {
                                        setPatientSearch(e.target.value);
                                        setSelectedPatientRef(null);
                                        setPatientName(''); setPatientId(''); setAge(''); setGender('');
                                        setShowSuggest(true);
                                    }}
                                    onFocus={() => setShowSuggest(true)}
                                    onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                                />
                                {/* Dropdown */}
                                {patientSuggestions.length > 0 && (
                                    <div className="rp-suggest">
                                        {patientSuggestions.map(p => (
                                            <button key={p.id} className="rp-suggest-item"
                                                    onMouseDown={() => {
                                                        setPatientSearch(p.name);
                                                        setPatientName(p.name);
                                                        setPatientId(p.mrn);
                                                        setAge(p.age);
                                                        setGender(p.gender);
                                                        setSelectedPatientRef(p);
                                                        setShowSuggest(false);
                                                    }}>
                                                <span className="rp-suggest-name">{p.name}</span>
                                                <span className="rp-suggest-mrn">{p.mrn}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedPatientRef && (
                                    <p className="rp-hint"><Check size={12}/> {selectedPatientRef.name} — MRN: {selectedPatientRef.mrn}</p>
                                )}
                            </div>

                            <div className="rp-fgroup">
                                <label className="rp-label">Patient ID *</label>
                                <input className="rp-input" type="text" placeholder="Auto-filled from search" value={patientId} onChange={e => setPatientId(e.target.value)} />
                            </div>
                            <div className="rp-fgroup">
                                <label className="rp-label">Age</label>
                                <input className="rp-input" type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
                            </div>
                            <div className="rp-fgroup">
                                <label className="rp-label">Gender</label>
                                <select className="rp-select" value={gender} onChange={e => setGender(e.target.value)}>
                                    <option value="">Select gender</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select>
                            </div>
                            <div className="rp-fgroup">
                                <label className="rp-label">Date of Diagnosis</label>
                                <DatePicker value={diagnosisDate} onChange={setDiagnosisDate} placeholder="Select date" />
                            </div>
                        </div>
                    </div>

                    {/* ── Tab bar ── */}
                    <div className="rp-tabs">
                        {TABS.map(({ id, label, Icon }) => (
                            <button key={id} className={`rp-tab${activeTab === id ? ' rp-tab-active' : ''}`} onClick={() => setActiveTab(id)}>
                                <Icon /> {label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tumor ── */}
                    {activeTab === 'tumor' && (
                        <div className="rp-section">
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><ThyroidIcon /></div><span className="rp-card-title">Primary Tumor Characteristics</span></div>
                                <div className="rp-grid3">
                                    <div className="rp-fgroup"><label className="rp-label">Lobe Involvement *</label><select className="rp-select" value={lobeInvolvement} onChange={e => setLobeInvolvement(e.target.value)}><option value="">Select lobe</option><option>Right lobe only</option><option>Left lobe only</option><option>Isthmus only</option><option>Bilateral</option><option>Multifocal</option></select></div>
                                    <div className="rp-fgroup"><label className="rp-label">Tumor Size (cm) *</label><input className="rp-input" type="number" step="0.1" placeholder="e.g., 2.5" value={tumorSize} onChange={e => setTumorSize(e.target.value)} /></div>
                                    <div className="rp-fgroup"><label className="rp-label">Number of Nodules</label><input className="rp-input" type="number" placeholder="e.g., 1, 2, 3" value={noduleCount} onChange={e => setNoduleCount(e.target.value)} /></div>
                                </div>
                            </div>
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><Scan size={16}/></div><span className="rp-card-title">Ultrasound Features</span></div>
                                <div className="rp-grid5">
                                    <div className="rp-fgroup"><label className="rp-label">Composition</label><select className="rp-select" value={usComposition} onChange={e => setUsComposition(e.target.value)}><option>Cystic</option><option>Spongiform</option><option>Mixed</option><option>Solid</option></select></div>
                                    <div className="rp-fgroup"><label className="rp-label">Echogenicity</label><select className="rp-select" value={usEchogenicity} onChange={e => setUsEchogenicity(e.target.value)}><option>Anechoic</option><option>Hyperechoic</option><option>Isoechoic</option><option>Hypoechoic</option></select></div>
                                    <div className="rp-fgroup"><label className="rp-label">Shape</label><select className="rp-select" value={usShape} onChange={e => setUsShape(e.target.value)}><option>Wider-than-tall</option><option>Taller-than-wide</option></select></div>
                                    <div className="rp-fgroup"><label className="rp-label">Margin</label><select className="rp-select" value={usMargin} onChange={e => setUsMargin(e.target.value)}><option>Smooth</option><option>Ill-defined</option><option>Lobulated</option><option>Irregular</option></select></div>
                                    <div className="rp-fgroup"><label className="rp-label">TI-RADS Score</label><input className="rp-input" type="text" placeholder="e.g., TR3, TR4" value={tiradsScore} onChange={e => setTiradsScore(e.target.value)} /></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Pathology ── */}
                    {activeTab === 'pathology' && (
                        <div className="rp-section">
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><Microscope size={16}/></div><span className="rp-card-title">Histopathological Type</span></div>
                                <div className="rp-grid1">
                                    <div className="rp-radio-group">
                                        {['Papillary Thyroid Carcinoma (PTC)','Follicular Thyroid Carcinoma (FTC)','Medullary Thyroid Carcinoma (MTC)','Anaplastic Thyroid Carcinoma (ATC)'].map(opt => (
                                            <label key={opt} className="rp-radio-opt"><input type="radio" name="histType" checked={histologicalType===opt} onChange={() => setHistologicalType(opt)}/> {opt}</label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><Activity size={16}/></div><span className="rp-card-title">Pathological Features</span></div>
                                <div className="rp-grid1">
                                    <div className="rp-check-group">
                                        {[{label:'Capsular invasion',state:capsularInvasion,set:setCapsularInvasion},{label:'Vascular invasion',state:vascularInvasion,set:setVascularInvasion},{label:'Lymphatic invasion',state:lymphaticInvasion,set:setLymphaticInvasion},{label:'Extrathyroidal extension',state:extrathyroidalExt,set:setExtrathyroidalExt},{label:'Multifocality',state:multifocality,set:setMultifocality}].map(({label,state,set}) => (
                                            <label key={label} className="rp-check-opt"><input type="checkbox" checked={state} onChange={e => set(e.target.checked)}/> {label}</label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Staging ── */}
                    {activeTab === 'staging' && (
                        <div className="rp-section">
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><Target size={16}/></div><span className="rp-card-title">TNM Staging (AJCC 8th Edition)</span></div>
                                <div className="rp-grid-tnm">
                                    <div className="rp-fgroup"><p className="rp-tnm-cat-label">T — Primary Tumor</p><select className="rp-select" value={tCategory} onChange={e => setTCategory(e.target.value)}><option value="">Select T category</option><option>T1a — ≤1 cm</option><option>T1b — &gt;1–2 cm</option><option>T2 — &gt;2–4 cm</option><option>T3a — &gt;4 cm</option><option>T3b — Gross ETE</option><option>T4a — Invades nearby structures</option></select></div>
                                    <div className="rp-fgroup"><p className="rp-tnm-cat-label">N — Lymph Nodes</p><select className="rp-select" value={nCategory} onChange={e => setNCategory(e.target.value)}><option value="">Select N category</option><option>N0 — No metastasis</option><option>N1a — Level VI</option><option>N1b — Other cervical levels</option></select></div>
                                    <div className="rp-fgroup"><p className="rp-tnm-cat-label">M — Metastasis</p><select className="rp-select" value={mCategory} onChange={e => setMCategory(e.target.value)}><option value="">Select M category</option><option>M0 — No distant metastasis</option><option>M1 — Distant metastasis</option></select></div>
                                    <div className="rp-fgroup"><p className="rp-tnm-cat-label">Metastasis Sites</p><div className="rp-check-group">{['Lung','Bone','Brain','Liver'].map(s => (<label key={s} className="rp-check-opt"><input type="checkbox" checked={metastasisSites.includes(s)} onChange={() => toggleSite(s)}/> {s}</label>))}</div></div>
                                    <div className="rp-fgroup"><p className="rp-tnm-cat-label">Stage Group</p><select className="rp-select" value={stageGroup} onChange={e => setStageGroup(e.target.value)}><option value="">Select stage</option><option>Stage I</option><option>Stage II</option><option>Stage III</option><option>Stage IVA</option><option>Stage IVB</option></select></div>
                                    <div className="rp-fgroup"><p className="rp-tnm-cat-label">ATA Risk</p><select className="rp-select" value={ataRisk} onChange={e => setAtaRisk(e.target.value)}><option value="">Select risk</option><option>Low Risk</option><option>Intermediate Risk</option><option>High Risk</option></select></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Molecular ── */}
                    {activeTab === 'molecular' && (
                        <div className="rp-section">
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><FlaskConical size={16}/></div><span className="rp-card-title">Molecular Markers</span></div>
                                <div className="rp-grid-mol">
                                    {[{label:'BRAF V600E',value:brafV600e,set:setBrafV600e},{label:'RAS Mutation',value:rasMutation,set:setRasMutation},{label:'RET/PTC',value:retPtc,set:setRetPtc},{label:'TERT Promoter',value:tertPromoter,set:setTertPromoter}].map(({label,value,set}) => (
                                        <div key={label} className="rp-mut-card"><p className="rp-mut-label">{label}</p><select className="rp-select" value={value} onChange={e => set(e.target.value)}><option>Not tested</option><option>Positive</option><option>Negative</option></select></div>
                                    ))}
                                </div>
                            </div>
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><DropletsIcon /></div><span className="rp-card-title">Serum Markers</span></div>
                                <div className="rp-grid3">
                                    <div className="rp-fgroup"><label className="rp-label">Tg (Thyroglobulin)</label><input className="rp-input" type="number" placeholder="ng/mL" value={tgLevel} onChange={e => setTgLevel(e.target.value)}/></div>
                                    <div className="rp-fgroup"><label className="rp-label">Anti-Tg Antibodies</label><input className="rp-input" type="number" placeholder="IU/mL" value={antiTg} onChange={e => setAntiTg(e.target.value)}/></div>
                                    <div className="rp-fgroup"><label className="rp-label">Calcitonin</label><input className="rp-input" type="number" placeholder="pg/mL" value={calcitonin} onChange={e => setCalcitonin(e.target.value)}/></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Treatment ── */}
                    {activeTab === 'treatment' && (
                        <div className="rp-section">
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><Stethoscope size={16}/></div><span className="rp-card-title">Surgery</span></div>
                                <div className="rp-grid1"><select className="rp-select" style={{maxWidth:380}} value={surgeryProcedure} onChange={e => setSurgeryProcedure(e.target.value)}><option value="">Select procedure</option><option>Total Thyroidectomy</option><option>Near-total Thyroidectomy</option><option>Lobectomy + Isthmusectomy</option><option>Lobectomy only</option></select></div>
                            </div>
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><Activity size={16}/></div><span className="rp-card-title">RAI Therapy</span></div>
                                <div className="rp-grid2">
                                    <div className="rp-fgroup"><label className="rp-label">RAI Dose (mCi)</label><input className="rp-input" type="number" placeholder="e.g., 30, 100" value={raiDose} onChange={e => setRaiDose(e.target.value)}/></div>
                                    <div className="rp-fgroup"><label className="rp-label">Date of RAI</label><DatePicker value={raiDate} onChange={setRaiDate} placeholder="Select date"/></div>
                                </div>
                            </div>
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><Pill size={16}/></div><span className="rp-card-title">TSH Suppression</span></div>
                                <div className="rp-grid1"><div className="rp-fgroup" style={{maxWidth:260}}><label className="rp-label">Levothyroxine Dose</label><input className="rp-input" type="number" placeholder="mcg/day" value={levothyroxineDose} onChange={e => setLevothyroxineDose(e.target.value)}/></div></div>
                            </div>
                            <div className="rp-card">
                                <div className="rp-card-head"><div className="rp-card-icon-sm"><Calendar size={16}/></div><span className="rp-card-title">Follow-up Plan</span></div>
                                <div className="rp-grid2">
                                    <div className="rp-fgroup"><label className="rp-label">Next visit</label><DatePicker value={nextVisit} onChange={setNextVisit} placeholder="Select date"/></div>
                                    <div className="rp-fgroup"><label className="rp-label">Next Tg check</label><DatePicker value={nextTg} onChange={setNextTg} placeholder="Select date"/></div>
                                </div>
                            </div>
                        </div>
                    )}

                </main>

                {/* ── Fixed action bar ── */}
                <div className="rp-actions">
                    <button className="rp-btn-cancel" onClick={() => router.back()}>Cancel</button>
                    <button className="rp-btn-draft" onClick={handleSaveDraft} disabled={loading}>{loading ? 'Saving...' : 'Save as Draft'}</button>
                    <button className="rp-btn-submit" onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Finalize Report'}</button>
                </div>

                {/* ── Toast ── */}
                {toast && (
                    <div className={`rp-toast rp-toast-${toast.type}`}>
                        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'i'} {toast.msg}
                    </div>
                )}
            </div>
        </>
    );
}