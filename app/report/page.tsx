'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import Navbar from '@/components/Navbar';
import {
    Activity, ArrowLeft, Calendar, ChevronDown, ChevronLeft, ChevronRight,
    FlaskConical, Microscope, Pill, Scan, Stethoscope, Target,
} from 'lucide-react';

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
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', height: 42, padding: '0 12px',
                    border: `1.5px solid ${open ? 'var(--teal)' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)',
                    background: open ? 'var(--surface)' : 'var(--surface2)',
                    boxShadow: open ? '0 0 0 3px rgba(13,148,136,0.12)' : 'none',
                    cursor: 'pointer', transition: 'all .2s',
                    fontFamily: 'var(--font-body)', fontSize: 14,
                    color: value ? 'var(--text)' : 'var(--subtle)',
                    textAlign: 'left', boxSizing: 'border-box',
                }}
            >
                <Calendar size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{value ? formatDisplay(value) : placeholder}</span>
                <ChevronDown size={13} style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 9999,
                    background: 'var(--surface)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-lg)',
                    padding: 16, width: 280,
                    animation: 'fadeUp .18s cubic-bezier(.16,1,.3,1) both',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <button type="button" onClick={prevMonth} style={{
                            width: 28, height: 28, border: '1.5px solid var(--border)', borderRadius: 8,
                            background: 'var(--surface2)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--muted)', transition: 'all .15s',
                        }}
                                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--teal-light)'; b.style.color = 'var(--teal)'; }}
                                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--surface2)'; b.style.color = 'var(--muted)'; }}
                        ><ChevronLeft size={14} /></button>

                        <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                            {MONTHS[month]} {year}
                        </span>

                        <button type="button" onClick={nextMonth} style={{
                            width: 28, height: 28, border: '1.5px solid var(--border)', borderRadius: 8,
                            background: 'var(--surface2)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--muted)', transition: 'all .15s',
                        }}
                                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--teal-light)'; b.style.color = 'var(--teal)'; }}
                                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--surface2)'; b.style.color = 'var(--muted)'; }}
                        ><ChevronRight size={14} /></button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
                        {DAYS.map(d => (
                            <div key={d} style={{
                                textAlign: 'center', fontSize: 11, fontWeight: 700,
                                color: 'var(--muted)', padding: '4px 0',
                                fontFamily: 'var(--font-body)',
                            }}>{d}</div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                        {cells.map((cell, i) => {
                            const sel = cell.cur && isSelected(cell.day);
                            const tod = cell.cur && isToday(cell.day);
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => cell.cur && select(cell.day)}
                                    style={{
                                        height: 32, borderRadius: 8, border: 'none',
                                        background: sel ? 'var(--teal)' : tod ? 'var(--teal-light)' : 'transparent',
                                        color: sel ? '#fff' : tod ? 'var(--teal)' : cell.cur ? 'var(--text)' : 'var(--faint)',
                                        fontFamily: 'var(--font-body)', fontSize: 13,
                                        fontWeight: sel || tod ? 700 : 500,
                                        cursor: cell.cur ? 'pointer' : 'default',
                                        transition: 'all .12s',
                                        outline: tod && !sel ? '1.5px solid var(--teal-ring)' : 'none',
                                        outlineOffset: '-1px',
                                    }}
                                    onMouseEnter={e => {
                                        if (cell.cur && !sel) {
                                            const b = e.currentTarget as HTMLButtonElement;
                                            b.style.background = 'var(--teal-light)';
                                            b.style.color = 'var(--teal)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (cell.cur && !sel) {
                                            const b = e.currentTarget as HTMLButtonElement;
                                            b.style.background = tod ? 'var(--teal-light)' : 'transparent';
                                            b.style.color = tod ? 'var(--teal)' : 'var(--text)';
                                        }
                                    }}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border3)' }}>
                        <button
                            type="button"
                            onClick={() => {
                                const mm = String(today.getMonth() + 1).padStart(2, '0');
                                const dd = String(today.getDate()).padStart(2, '0');
                                onChange(`${today.getFullYear()}-${mm}-${dd}`);
                                setOpen(false);
                            }}
                            style={{
                                width: '100%', height: 30, border: '1.5px solid var(--border)',
                                borderRadius: 8, background: 'var(--surface2)',
                                fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                                color: 'var(--muted)', cursor: 'pointer', transition: 'all .15s',
                            }}
                            onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--teal-light)'; b.style.color = 'var(--teal)'; b.style.borderColor = 'var(--teal-ring)'; }}
                            onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'var(--surface2)'; b.style.color = 'var(--muted)'; b.style.borderColor = 'var(--border)'; }}
                        >
                            Today
                        </button>
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
    { id: 'pathology', label: 'Pathology',      Icon: () => <Microscope  size={15} /> },
    { id: 'staging',   label: 'Staging (TNM)',  Icon: () => <Target      size={15} /> },
    { id: 'molecular', label: 'Molecular',      Icon: () => <FlaskConical size={15} /> },
    { id: 'treatment', label: 'Treatment',      Icon: () => <Pill        size={15} /> },
];

type ToastType = 'success' | 'error' | 'info';
interface ToastState { msg: string; type: ToastType; }

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ThyroidCancerReport() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('tumor');
    const [loading,   setLoading]   = useState(false);
    const [toast,     setToast]     = useState<ToastState | null>(null);
    const [reportId,  setReportId]  = useState<string | null>(null);

    const [patientName,   setPatientName]   = useState('');
    const [patientId,     setPatientId]     = useState('');
    const [age,           setAge]           = useState('');
    const [gender,        setGender]        = useState('');
    const [diagnosisDate, setDiagnosisDate] = useState('');

    const [lobeInvolvement, setLobeInvolvement] = useState('');
    const [tumorSize,        setTumorSize]       = useState('');
    const [noduleCount,      setNoduleCount]     = useState('');
    const [usComposition,    setUsComposition]   = useState('Cystic');
    const [usEchogenicity,   setUsEchogenicity]  = useState('Anechoic');
    const [usShape,          setUsShape]         = useState('Wider-than-tall');
    const [usMargin,         setUsMargin]        = useState('Smooth');
    const [tiradsScore,      setTiradsScore]     = useState('');

    const [histologicalType,  setHistologicalType]  = useState('');
    const [capsularInvasion,  setCapsularInvasion]  = useState(false);
    const [vascularInvasion,  setVascularInvasion]  = useState(false);
    const [lymphaticInvasion, setLymphaticInvasion] = useState(false);
    const [extrathyroidalExt, setExtrathyroidalExt] = useState(false);
    const [multifocality,     setMultifocality]     = useState(false);

    const [tCategory,       setTCategory]       = useState('');
    const [nCategory,       setNCategory]       = useState('');
    const [mCategory,       setMCategory]       = useState('');
    const [metastasisSites, setMetastasisSites] = useState<string[]>([]);
    const [stageGroup,      setStageGroup]      = useState('');
    const [ataRisk,         setAtaRisk]         = useState('');

    const [brafV600e,    setBrafV600e]    = useState('Not tested');
    const [rasMutation,  setRasMutation]  = useState('Not tested');
    const [retPtc,       setRetPtc]       = useState('Not tested');
    const [tertPromoter, setTertPromoter] = useState('Not tested');
    const [tgLevel,      setTgLevel]      = useState('');
    const [antiTg,       setAntiTg]       = useState('');
    const [calcitonin,   setCalcitonin]   = useState('');

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
        patient_id:         patientId,
        status,
        diagnosis_date:     diagnosisDate,
        lobe_involvement:   lobeInvolvement,
        tumor_size:         tumorSize    ? parseFloat(tumorSize)         : null,
        nodule_count:       noduleCount  ? parseInt(noduleCount)         : null,
        us_composition:     usComposition,
        us_echogenicity:    usEchogenicity,
        us_shape:           usShape,
        us_margin:          usMargin,
        tirads_score:       tiradsScore,
        histological_type:  histologicalType,
        capsular_invasion:  capsularInvasion,
        vascular_invasion:  vascularInvasion,
        lymphatic_invasion: lymphaticInvasion,
        extrathyroidal_ext: extrathyroidalExt,
        multifocality:      multifocality,
        t_category:         tCategory,
        n_category:         nCategory,
        m_category:         mCategory,
        metastasis_sites:   JSON.stringify(metastasisSites),
        stage_group:        stageGroup,
        ata_risk:           ataRisk,
        braf_v600e:         brafV600e,
        ras_mutation:       rasMutation,
        ret_ptc:            retPtc,
        tert_promoter:      tertPromoter,
        tg_level:           tgLevel    ? parseFloat(tgLevel)             : null,
        anti_tg:            antiTg     ? parseFloat(antiTg)              : null,
        calcitonin:         calcitonin ? parseFloat(calcitonin)          : null,
        surgery_procedure:  surgeryProcedure,
        rai_dose:           raiDose    ? parseFloat(raiDose)             : null,
        rai_date:           raiDate,
        levothyroxine_dose: levothyroxineDose ? parseFloat(levothyroxineDose) : null,
        next_visit:         nextVisit,
        next_tg_check:      nextTg,
    });

    const getToken = () =>
        localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '';

    const handleSaveDraft = async () => {
        if (!patientId) { showToast('Please enter Patient ID first', 'error'); return; }
        try {
            setLoading(true);
            const method = reportId ? 'PUT' : 'POST';
            const url    = reportId ? `${BASE_URL}/api/reports/${reportId}` : `${BASE_URL}/api/reports`;
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(buildPayload('draft')),
            });
            const data = await res.json();
            if (data.success) {
                if (!reportId && data.data?.report_id) setReportId(data.data.report_id);
                showToast('Draft saved successfully ✓', 'success');
            } else {
                showToast(data.error || 'Failed to save draft', 'error');
            }
        } catch { showToast('Network error. Please try again.', 'error'); }
        finally  { setLoading(false); }
    };

    const handleSubmit = async () => {
        if (!patientId)     { showToast('Patient ID is required', 'error');        return; }
        if (!diagnosisDate) { showToast('Date of Diagnosis is required', 'error'); return; }
        try {
            setLoading(true);
            const method = reportId ? 'PUT' : 'POST';
            const url    = reportId ? `${BASE_URL}/api/reports/${reportId}` : `${BASE_URL}/api/reports`;
            const res    = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(buildPayload('submitted')),
            });
            const data = await res.json();
            if (data.success) {
                showToast('Report submitted successfully ✓', 'success');
                setTimeout(() => router.back(), 1500);
            } else {
                showToast(data.error || 'Failed to submit report', 'error');
            }
        } catch { showToast('Network error. Please try again.', 'error'); }
        finally  { setLoading(false); }
    };

    const toggleSite = (site: string) =>
        setMetastasisSites(prev => prev.includes(site) ? prev.filter(s => s !== site) : [...prev, site]);

    return (
        <div className={styles.wrap}>
            <Navbar />
            <main className={styles.main}>

                {/* ════ HEADER ════ */}
                <div className={styles.featureHeader}>
                    <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>
                        <ArrowLeft size={13} /> Dashboard
                    </button>

                    <div className={styles.eyebrow}>
                        <span className={styles.eyebrowDot} />
                        Oncology
                    </div>
                    <div className={styles.headerRow}>
                        <div className={styles.titleGroup}>
                            <h1 className={styles.pageTitle}>Thyroid Cancer <em>Report</em></h1>
                        </div>
                    </div>
                </div>

                {/* ════ PATIENT INFO ════ */}
                <div className={styles.card} style={{ marginBottom: 20 }}>
                    <div className={styles.cardHead}>
                        <div className={styles.cardIcon}><ThyroidIcon /></div>
                        <span className={styles.cardTitle}>Patient Information</span>
                    </div>
                    <div className={styles.patientGrid}>
                        <div className={styles.fGroup}>
                            <label className={styles.fLabel}>Patient Name *</label>
                            <input className={styles.fInput} type="text" placeholder="Enter patient name" value={patientName} onChange={e => setPatientName(e.target.value)} />
                        </div>
                        <div className={styles.fGroup}>
                            <label className={styles.fLabel}>Patient ID *</label>
                            <input className={styles.fInput} type="text" placeholder="Enter patient ID" value={patientId} onChange={e => setPatientId(e.target.value)} />
                        </div>
                        <div className={styles.fGroup}>
                            <label className={styles.fLabel}>Age</label>
                            <input className={styles.fInput} type="number" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
                        </div>
                        <div className={styles.fGroup}>
                            <label className={styles.fLabel}>Gender</label>
                            <select className={styles.fSelect} value={gender} onChange={e => setGender(e.target.value)}>
                                <option value="">Select gender</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>
                        <div className={styles.fGroup}>
                            <label className={styles.fLabel}>Date of Diagnosis</label>
                            <DatePicker value={diagnosisDate} onChange={setDiagnosisDate} placeholder="Select date" />
                        </div>
                    </div>
                </div>

                {/* ════ TABS ════ */}
                <div className={styles.tabBar}>
                    {TABS.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon /> {label}
                        </button>
                    ))}
                </div>

                {/* ════ TUMOR ════ */}
                {activeTab === 'tumor' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <div className={styles.cardIconSm}><ThyroidIcon /></div>
                                <span className={styles.cardTitle}>Primary Tumor Characteristics</span>
                            </div>
                            <div className={styles.grid3}>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Lobe Involvement *</label>
                                    <select className={styles.fSelect} value={lobeInvolvement} onChange={e => setLobeInvolvement(e.target.value)}>
                                        <option value="">Select lobe</option>
                                        <option>Right lobe only</option>
                                        <option>Left lobe only</option>
                                        <option>Isthmus only</option>
                                        <option>Bilateral</option>
                                        <option>Multifocal</option>
                                    </select>
                                </div>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Tumor Size (cm) *</label>
                                    <input className={styles.fInput} type="number" step="0.1" placeholder="e.g., 2.5" value={tumorSize} onChange={e => setTumorSize(e.target.value)} />
                                </div>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Number of Nodules</label>
                                    <input className={styles.fInput} type="number" placeholder="e.g., 1, 2, 3" value={noduleCount} onChange={e => setNoduleCount(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <div className={styles.cardIconSm}><Scan size={16} /></div>
                                <span className={styles.cardTitle}>Ultrasound Features</span>
                            </div>
                            <div className={styles.grid5}>
                                <div className={styles.fGroup}><label className={styles.fLabel}>Composition</label><select className={styles.fSelect} value={usComposition} onChange={e => setUsComposition(e.target.value)}><option>Cystic</option><option>Spongiform</option><option>Mixed</option><option>Solid</option></select></div>
                                <div className={styles.fGroup}><label className={styles.fLabel}>Echogenicity</label><select className={styles.fSelect} value={usEchogenicity} onChange={e => setUsEchogenicity(e.target.value)}><option>Anechoic</option><option>Hyperechoic</option><option>Isoechoic</option><option>Hypoechoic</option></select></div>
                                <div className={styles.fGroup}><label className={styles.fLabel}>Shape</label><select className={styles.fSelect} value={usShape} onChange={e => setUsShape(e.target.value)}><option>Wider-than-tall</option><option>Taller-than-wide</option></select></div>
                                <div className={styles.fGroup}><label className={styles.fLabel}>Margin</label><select className={styles.fSelect} value={usMargin} onChange={e => setUsMargin(e.target.value)}><option>Smooth</option><option>Ill-defined</option><option>Lobulated</option><option>Irregular</option></select></div>
                                <div className={styles.fGroup}><label className={styles.fLabel}>TI-RADS Score</label><input className={styles.fInput} type="text" placeholder="e.g., TR3, TR4, TR5" value={tiradsScore} onChange={e => setTiradsScore(e.target.value)} /></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ PATHOLOGY ════ */}
                {activeTab === 'pathology' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <div className={styles.cardIconSm}><Microscope size={16} /></div>
                                <span className={styles.cardTitle}>Histopathological Type</span>
                            </div>
                            <div className={styles.grid1}>
                                <div className={styles.radioGroup}>
                                    {['Papillary Thyroid Carcinoma (PTC)','Follicular Thyroid Carcinoma (FTC)','Medullary Thyroid Carcinoma (MTC)','Anaplastic Thyroid Carcinoma (ATC)'].map(opt => (
                                        <label key={opt} className={styles.radioOpt}>
                                            <input type="radio" name="histType" checked={histologicalType === opt} onChange={() => setHistologicalType(opt)} /> {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <div className={styles.cardIconSm}><Activity size={16} /></div>
                                <span className={styles.cardTitle}>Pathological Features</span>
                            </div>
                            <div className={styles.grid1}>
                                <div className={styles.checkGroup}>
                                    {[
                                        { label: 'Capsular invasion',        state: capsularInvasion,  set: setCapsularInvasion  },
                                        { label: 'Vascular invasion',        state: vascularInvasion,  set: setVascularInvasion  },
                                        { label: 'Lymphatic invasion',       state: lymphaticInvasion, set: setLymphaticInvasion },
                                        { label: 'Extrathyroidal extension', state: extrathyroidalExt, set: setExtrathyroidalExt },
                                        { label: 'Multifocality',            state: multifocality,     set: setMultifocality     },
                                    ].map(({ label, state, set }) => (
                                        <label key={label} className={styles.checkOpt}>
                                            <input type="checkbox" checked={state} onChange={e => set(e.target.checked)} /> {label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ STAGING ════ */}
                {activeTab === 'staging' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <div className={styles.cardIconSm}><Target size={16} /></div>
                                <span className={styles.cardTitle}>TNM Staging (AJCC 8th Edition)</span>
                            </div>
                            <div className={styles.gridTNM}>
                                <div className={styles.tnmCat}>
                                    <p className={styles.tnmLabel}>T — Primary Tumor</p>
                                    <select className={styles.fSelect} value={tCategory} onChange={e => setTCategory(e.target.value)}>
                                        <option value="">Select T category</option>
                                        <option>T1a — ≤1 cm</option>
                                        <option>T1b — &gt;1–2 cm</option>
                                        <option>T2 — &gt;2–4 cm</option>
                                        <option>T3a — &gt;4 cm</option>
                                        <option>T3b — Gross ETE</option>
                                        <option>T4a — Invades nearby structures</option>
                                    </select>
                                </div>
                                <div className={styles.tnmCat}>
                                    <p className={styles.tnmLabel}>N — Lymph Nodes</p>
                                    <select className={styles.fSelect} value={nCategory} onChange={e => setNCategory(e.target.value)}>
                                        <option value="">Select N category</option>
                                        <option>N0 — No metastasis</option>
                                        <option>N1a — Level VI</option>
                                        <option>N1b — Other cervical levels</option>
                                    </select>
                                </div>
                                <div className={styles.tnmCat}>
                                    <p className={styles.tnmLabel}>M — Metastasis</p>
                                    <select className={styles.fSelect} value={mCategory} onChange={e => setMCategory(e.target.value)}>
                                        <option value="">Select M category</option>
                                        <option>M0 — No distant metastasis</option>
                                        <option>M1 — Distant metastasis</option>
                                    </select>
                                </div>
                                <div className={styles.tnmCat}>
                                    <p className={styles.tnmLabel}>Metastasis Sites</p>
                                    <div className={styles.checkGroup}>
                                        {['Lung','Bone','Brain','Liver'].map(s => (
                                            <label key={s} className={styles.checkOpt}>
                                                <input type="checkbox" checked={metastasisSites.includes(s)} onChange={() => toggleSite(s)} /> {s}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.tnmCat}>
                                    <p className={styles.tnmLabel}>Stage Group</p>
                                    <select className={styles.fSelect} value={stageGroup} onChange={e => setStageGroup(e.target.value)}>
                                        <option value="">Select stage</option>
                                        <option>Stage I</option><option>Stage II</option><option>Stage III</option><option>Stage IVA</option><option>Stage IVB</option>
                                    </select>
                                </div>
                                <div className={styles.tnmCat}>
                                    <p className={styles.tnmLabel}>ATA Risk</p>
                                    <select className={styles.fSelect} value={ataRisk} onChange={e => setAtaRisk(e.target.value)}>
                                        <option value="">Select risk</option>
                                        <option>Low Risk</option><option>Intermediate Risk</option><option>High Risk</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ MOLECULAR ════ */}
                {activeTab === 'molecular' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <div className={styles.cardIconSm}><FlaskConical size={16} /></div>
                                <span className={styles.cardTitle}>Molecular Markers</span>
                            </div>
                            <div className={styles.gridMolecular}>
                                {[
                                    { label: 'BRAF V600E',    value: brafV600e,    set: setBrafV600e    },
                                    { label: 'RAS Mutation',  value: rasMutation,  set: setRasMutation  },
                                    { label: 'RET/PTC',       value: retPtc,       set: setRetPtc       },
                                    { label: 'TERT Promoter', value: tertPromoter, set: setTertPromoter },
                                ].map(({ label, value, set }) => (
                                    <div key={label} className={styles.mutCard}>
                                        <p className={styles.mutCardLabel}>{label}</p>
                                        <select className={styles.fSelect} value={value} onChange={e => set(e.target.value)}>
                                            <option>Not tested</option><option>Positive</option><option>Negative</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardHead}>
                                <div className={styles.cardIconSm}><DropletsIcon /></div>
                                <span className={styles.cardTitle}>Serum Markers</span>
                            </div>
                            <div className={styles.grid3}>
                                <div className={styles.fGroup}><label className={styles.fLabel}>Tg (Thyroglobulin)</label><input className={styles.fInput} type="number" placeholder="ng/mL" value={tgLevel} onChange={e => setTgLevel(e.target.value)} /></div>
                                <div className={styles.fGroup}><label className={styles.fLabel}>Anti-Tg Antibodies</label><input className={styles.fInput} type="number" placeholder="IU/mL" value={antiTg} onChange={e => setAntiTg(e.target.value)} /></div>
                                <div className={styles.fGroup}><label className={styles.fLabel}>Calcitonin</label><input className={styles.fInput} type="number" placeholder="pg/mL" value={calcitonin} onChange={e => setCalcitonin(e.target.value)} /></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ TREATMENT ════ */}
                {activeTab === 'treatment' && (
                    <div className={styles.section}>
                        <div className={styles.card}>
                            <div className={styles.cardHead}><div className={styles.cardIconSm}><Stethoscope size={16} /></div><span className={styles.cardTitle}>Surgery</span></div>
                            <div className={styles.grid1}>
                                <select className={styles.fSelect} style={{ maxWidth: 380 }} value={surgeryProcedure} onChange={e => setSurgeryProcedure(e.target.value)}>
                                    <option value="">Select procedure</option>
                                    <option>Total Thyroidectomy</option>
                                    <option>Near-total Thyroidectomy</option>
                                    <option>Lobectomy + Isthmusectomy</option>
                                    <option>Lobectomy only</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardHead}><div className={styles.cardIconSm}><Activity size={16} /></div><span className={styles.cardTitle}>RAI Therapy</span></div>
                            <div className={styles.grid2}>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>RAI Dose (mCi)</label>
                                    <input className={styles.fInput} type="number" placeholder="e.g., 30, 100" value={raiDose} onChange={e => setRaiDose(e.target.value)} />
                                </div>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Date of RAI</label>
                                    <DatePicker value={raiDate} onChange={setRaiDate} placeholder="Select date" />
                                </div>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardHead}><div className={styles.cardIconSm}><Pill size={16} /></div><span className={styles.cardTitle}>TSH Suppression</span></div>
                            <div className={styles.grid1}>
                                <div className={styles.fGroup} style={{ maxWidth: 260 }}>
                                    <label className={styles.fLabel}>Levothyroxine Dose</label>
                                    <input className={styles.fInput} type="number" placeholder="mcg/day" value={levothyroxineDose} onChange={e => setLevothyroxineDose(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className={styles.card}>
                            <div className={styles.cardHead}><div className={styles.cardIconSm}><Calendar size={16} /></div><span className={styles.cardTitle}>Follow-up Plan</span></div>
                            <div className={styles.grid2}>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Next visit</label>
                                    <DatePicker value={nextVisit} onChange={setNextVisit} placeholder="Select date" />
                                </div>
                                <div className={styles.fGroup}>
                                    <label className={styles.fLabel}>Next Tg check</label>
                                    <DatePicker value={nextTg} onChange={setNextTg} placeholder="Select date" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ════ FINAL ACTIONS ════ */}
                <div className={styles.finalActions}>
                    <button className={styles.cancelFinal} onClick={() => router.back()}>Cancel</button>
                    <button className={styles.saveFinal} onClick={handleSaveDraft} disabled={loading}>
                        {loading ? 'Saving...' : 'Save as Draft'}
                    </button>
                    <button className={styles.finalizeFinal} onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Finalize Report'}
                    </button>
                </div>

                {/* ════ TOAST ════ */}
                {toast && (
                    <div className={`${styles.toast} ${
                        toast.type === 'success' ? styles.toastSuccess :
                            toast.type === 'error'   ? styles.toastError   :
                                styles.toastInfo
                    }`}>
                        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'i'} {toast.msg}
                    </div>
                )}

            </main>
        </div>
    );
}