'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Calendar, ChevronDown, ChevronLeft, ChevronRight,
    FileText, Filter, Search, X, Eye, Download, Printer,
    TrendingUp, Clock, CheckCircle, AlertCircle,
} from 'lucide-react';
import styles from './styles.module.css';

/* ═══════════════════════════════════════════════════════
   INLINE CALENDAR DATE PICKER
═══════════════════════════════════════════════════════ */
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
            {/* ── Trigger ── */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', height: 42, padding: '0 12px',
                    border: `1.5px solid ${open ? 'var(--teal)' : 'var(--border)'}`,
                    borderRadius: 9,
                    background: open ? 'white' : 'var(--surface2)',
                    boxShadow: open ? '0 0 0 3px rgba(13,148,136,0.08)' : 'none',
                    cursor: 'pointer', transition: 'all .2s',
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    color: value ? 'var(--text)' : 'var(--subtle)',
                    textAlign: 'left', boxSizing: 'border-box',
                }}
            >
                <Calendar size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{value ? formatDisplay(value) : placeholder}</span>
                <ChevronDown size={13} style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>

            {/* ── Dropdown ── */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 9999,
                    background: 'var(--surface)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-lg)',
                    padding: 16, width: 280,
                    animation: 'fadeUp .18s cubic-bezier(.16,1,.3,1) both',
                }}>
                    {/* Month nav */}
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

                    {/* Day headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
                        {DAYS.map(d => (
                            <div key={d} style={{
                                textAlign: 'center', fontSize: 11, fontWeight: 700,
                                color: 'var(--muted)', padding: '4px 0',
                                fontFamily: 'var(--font-body)',
                            }}>{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
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

                    {/* Today shortcut */}
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

/* ═══════════════════════════════════════════════════════
   TYPES & DATA
═══════════════════════════════════════════════════════ */
type ReportStatus = 'Finalized' | 'Draft' | 'Pending';

interface Report {
    id: string; patientName: string; patientId: string;
    age: number; gender: 'Male' | 'Female'; diagnosisDate: string;
    histType: string; stage: string;
    ataRisk: 'Low Risk' | 'Intermediate Risk' | 'High Risk';
    status: ReportStatus; doctor: string;
}

const MOCK_REPORTS: Report[] = [
    { id: 'RPT-001', patientName: 'Ahmed Al-Rashid',   patientId: 'P-10023', age: 45, gender: 'Male',   diagnosisDate: '2025-11-10', histType: 'PTC', stage: 'Stage II', ataRisk: 'Intermediate Risk', status: 'Finalized', doctor: 'Dr. Sara Khalid' },
    { id: 'RPT-002', patientName: 'Fatima Al-Zahrani', patientId: 'P-10045', age: 38, gender: 'Female', diagnosisDate: '2025-12-01', histType: 'FTC', stage: 'Stage I',  ataRisk: 'Low Risk',          status: 'Draft',     doctor: 'Dr. Omar Nasser' },
    { id: 'RPT-004', patientName: 'Noura Al-Shamrani', patientId: 'P-10089', age: 29, gender: 'Female', diagnosisDate: '2025-01-28', histType: 'PTC', stage: 'Stage I',  ataRisk: 'Low Risk',          status: 'Pending',   doctor: 'Dr. Omar Nasser' },
];

const statusColors: Record<ReportStatus, string> = {
    Finalized: styles.statusFinalized,
    Draft:     styles.statusDraft,
    Pending:   styles.statusPending,
};

const riskColors: Record<string, string> = {
    'Low Risk':          styles.riskLow,
    'Intermediate Risk': styles.riskIntermediate,
    'High Risk':         styles.riskHigh,
};

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
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

    const filtered = useMemo(() => {
        return MOCK_REPORTS.filter((r) => {
            const q = searchQuery.toLowerCase();
            const matchesQuery =
                !q ||
                r.patientName.toLowerCase().includes(q) ||
                r.patientId.toLowerCase().includes(q) ||
                r.id.toLowerCase().includes(q) ||
                r.doctor.toLowerCase().includes(q);
            const matchesStatus = filterStatus   === 'All' || r.status   === filterStatus;
            const matchesHist   = filterHistType === 'All' || r.histType === filterHistType;
            const matchesRisk   = filterRisk     === 'All' || r.ataRisk  === filterRisk;
            const reportDate    = new Date(r.diagnosisDate);
            const matchesFrom   = !dateFrom || reportDate >= new Date(dateFrom);
            const matchesTo     = !dateTo   || reportDate <= new Date(dateTo);
            return matchesQuery && matchesStatus && matchesHist && matchesRisk && matchesFrom && matchesTo;
        });
    }, [searchQuery, filterStatus, filterHistType, filterRisk, dateFrom, dateTo]);

    const clearFilters = () => {
        setFilterStatus('All'); setFilterHistType('All');
        setFilterRisk('All'); setDateFrom(''); setDateTo(''); setSearchQuery('');
    };

    const hasActiveFilters =
        filterStatus !== 'All' || filterHistType !== 'All' ||
        filterRisk !== 'All' || !!dateFrom || !!dateTo;

    const stats = {
        total:     MOCK_REPORTS.length,
        finalized: MOCK_REPORTS.filter(r => r.status === 'Finalized').length,
        draft:     MOCK_REPORTS.filter(r => r.status === 'Draft').length,
        pending:   MOCK_REPORTS.filter(r => r.status === 'Pending').length,
    };

    return (
        <div className={styles.container}>

            {/* ── Header ── */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerLeft}>
                        <button className={styles.backBtn} onClick={() => router.push('/report')}>
                            <ArrowLeft size={14} /> Back to Report
                        </button>
                        <div className={styles.titleGroup}>
                            <h1 className={styles.title}>Search Reports</h1>
                            <div className={styles.breadcrumb}>
                                <span>Oncology</span>
                                <ChevronDown size={13} />
                                <span className={styles.breadcrumbActive}>Report Search</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.actionButton}><Download size={14} /> Export</button>
                        <button className={styles.actionButton}><Printer size={14} /> Print</button>
                    </div>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statBlue}`}><FileText size={20} /></div>
                    <div><div className={styles.statValue}>{stats.total}</div><div className={styles.statLabel}>Total Reports</div></div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statGreen}`}><CheckCircle size={20} /></div>
                    <div><div className={styles.statValue}>{stats.finalized}</div><div className={styles.statLabel}>Finalized</div></div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statYellow}`}><Clock size={20} /></div>
                    <div><div className={styles.statValue}>{stats.draft}</div><div className={styles.statLabel}>Drafts</div></div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statRed}`}><AlertCircle size={20} /></div>
                    <div><div className={styles.statValue}>{stats.pending}</div><div className={styles.statLabel}>Pending</div></div>
                </div>
            </div>

            {/* ── Search ── */}
            <div className={styles.searchSection}>
                <div className={styles.searchWrapper}>
                    <Search size={17} className={styles.searchIcon} />
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by patient name, ID, report number, or doctor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className={styles.clearSearch} onClick={() => setSearchQuery('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>
                <button
                    className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={14} />
                    Filters
                    {hasActiveFilters && <span className={styles.filterBadge} />}
                </button>
            </div>

            {/* ── Filters panel ── */}
            {showFilters && (
                <div className={styles.filtersPanel}>
                    <div className={styles.filtersPanelHeader}>
                        <span className={styles.filtersPanelTitle}><Filter size={13} /> Advanced Filters</span>
                        {hasActiveFilters && (
                            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                                <X size={12} /> Clear All
                            </button>
                        )}
                    </div>
                    <div className={styles.filtersGrid}>
                        <div className={styles.inputGroup}>
                            <label>Status</label>
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="All">All Statuses</option>
                                <option value="Finalized">Finalized</option>
                                <option value="Draft">Draft</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Histological Type</label>
                            <select value={filterHistType} onChange={(e) => setFilterHistType(e.target.value)}>
                                <option value="All">All Types</option>
                                <option value="PTC">PTC</option>
                                <option value="FTC">FTC</option>
                                <option value="MTC">MTC</option>
                                <option value="ATC">ATC</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>ATA Risk</label>
                            <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
                                <option value="All">All Risk Levels</option>
                                <option value="Low Risk">Low Risk</option>
                                <option value="Intermediate Risk">Intermediate Risk</option>
                                <option value="High Risk">High Risk</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Date From</label>
                            <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Select date" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Date To</label>
                            <DatePicker value={dateTo} onChange={setDateTo} placeholder="Select date" />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Results bar ── */}
            <div className={styles.resultsBar}>
                <span className={styles.resultsCount}>
                    <TrendingUp size={13} />
                    Showing <strong>{filtered.length}</strong> of {MOCK_REPORTS.length} reports
                </span>
            </div>

            {/* ── Table ── */}
            <div className={styles.tableWrapper}>
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Search size={30} /></div>
                        <p className={styles.emptyTitle}>No reports found</p>
                        <p className={styles.emptyText}>Try adjusting your search or filters</p>
                        <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                            <X size={12} /> Clear filters
                        </button>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Report ID</th><th>Patient</th><th>Age / Gender</th>
                            <th>Diagnosis Date</th><th>Hist. Type</th><th>Stage</th>
                            <th>ATA Risk</th><th>Status</th><th>Doctor</th><th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((report) => (
                            <tr key={report.id} className={styles.tableRow}>
                                <td><span className={styles.reportId}>{report.id}</span></td>
                                <td>
                                    <div className={styles.patientCell}>
                                        <div className={styles.patientAvatar}>{report.patientName.charAt(0)}</div>
                                        <div>
                                            <div className={styles.patientName}>{report.patientName}</div>
                                            <div className={styles.patientSubId}>{report.patientId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.ageCell}>{report.age} / {report.gender}</td>
                                <td>
                                    <div className={styles.dateCell}>
                                        <Calendar size={12} />
                                        {new Date(report.diagnosisDate).toLocaleDateString('en-GB')}
                                    </div>
                                </td>
                                <td><span className={styles.histBadge}>{report.histType}</span></td>
                                <td className={styles.stageCell}>{report.stage}</td>
                                <td><span className={`${styles.riskBadge} ${riskColors[report.ataRisk]}`}>{report.ataRisk}</span></td>
                                <td><span className={`${styles.statusBadge} ${statusColors[report.status]}`}>{report.status}</span></td>
                                <td className={styles.doctorCell}>{report.doctor}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <button className={`${styles.actionBtn} ${styles.viewBtn}`} title="View" onClick={() => setSelectedReport(report)}><Eye size={13} /></button>
                                        <button className={styles.actionBtn} title="Download"><Download size={13} /></button>
                                        <button className={styles.actionBtn} title="Print"><Printer size={13} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Modal ── */}
            {selectedReport && (
                <div className={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalHeaderLeft}>
                                <div className={styles.modalAvatar}>{selectedReport.patientName.charAt(0)}</div>
                                <div>
                                    <h2 className={styles.modalTitle}>{selectedReport.patientName}</h2>
                                    <p className={styles.modalSubtitle}>{selectedReport.id} · {selectedReport.patientId}</p>
                                </div>
                            </div>
                            <button className={styles.modalClose} onClick={() => setSelectedReport(null)}><X size={16} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalGrid}>
                                <div className={styles.modalItem}><span className={styles.modalLabel}>Age / Gender</span><span className={styles.modalValue}>{selectedReport.age} / {selectedReport.gender}</span></div>
                                <div className={styles.modalItem}><span className={styles.modalLabel}>Diagnosis Date</span><span className={styles.modalValue}>{new Date(selectedReport.diagnosisDate).toLocaleDateString('en-GB')}</span></div>
                                <div className={styles.modalItem}><span className={styles.modalLabel}>Histological Type</span><span className={styles.modalValue}>{selectedReport.histType}</span></div>
                                <div className={styles.modalItem}><span className={styles.modalLabel}>Stage</span><span className={styles.modalValue}>{selectedReport.stage}</span></div>
                                <div className={styles.modalItem}><span className={styles.modalLabel}>ATA Risk</span><span className={`${styles.riskBadge} ${riskColors[selectedReport.ataRisk]}`}>{selectedReport.ataRisk}</span></div>
                                <div className={styles.modalItem}><span className={styles.modalLabel}>Status</span><span className={`${styles.statusBadge} ${statusColors[selectedReport.status]}`}>{selectedReport.status}</span></div>
                                <div className={styles.modalItem} style={{ gridColumn: '1 / -1' }}><span className={styles.modalLabel}>Doctor</span><span className={styles.modalValue}>{selectedReport.doctor}</span></div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.cancelBtn} onClick={() => setSelectedReport(null)}>Close</button>
                            <button className={styles.submitBtn} onClick={() => router.push('/report')}>Open Full Report</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}