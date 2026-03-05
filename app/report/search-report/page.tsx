'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    ChevronDown,
    FileText,
    Filter,
    Search,
    X,
    Eye,
    Download,
    Printer,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import styles from './styles.module.css';

type ReportStatus = 'Finalized' | 'Draft' | 'Pending';

interface Report {
    id: string;
    patientName: string;
    patientId: string;
    age: number;
    gender: 'Male' | 'Female';
    diagnosisDate: string;
    histType: string;
    stage: string;
    ataRisk: 'Low Risk' | 'Intermediate Risk' | 'High Risk';
    status: ReportStatus;
    doctor: string;
}

const MOCK_REPORTS: Report[] = [
    { id: 'RPT-001', patientName: 'Ahmed Al-Rashid', patientId: 'P-10023', age: 45, gender: 'Male', diagnosisDate: '2025-11-10', histType: 'PTC', stage: 'Stage II', ataRisk: 'Intermediate Risk', status: 'Finalized', doctor: 'Dr. Sara Khalid' },
    { id: 'RPT-002', patientName: 'Fatima Al-Zahrani', patientId: 'P-10045', age: 38, gender: 'Female', diagnosisDate: '2025-12-01', histType: 'FTC', stage: 'Stage I', ataRisk: 'Low Risk', status: 'Draft', doctor: 'Dr. Omar Nasser' },
    { id: 'RPT-004', patientName: 'Noura Al-Shamrani', patientId: 'P-10089', age: 29, gender: 'Female', diagnosisDate: '2025-01-28', histType: 'PTC', stage: 'Stage I', ataRisk: 'Low Risk', status: 'Pending', doctor: 'Dr. Omar Nasser' },
];

const statusColors: Record<ReportStatus, string> = {
    Finalized: styles.statusFinalized,
    Draft: styles.statusDraft,
    Pending: styles.statusPending,
};

const riskColors: Record<string, string> = {
    'Low Risk': styles.riskLow,
    'Intermediate Risk': styles.riskIntermediate,
    'High Risk': styles.riskHigh,
};

const SearchReportPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterHistType, setFilterHistType] = useState('All');
    const [filterRisk, setFilterRisk] = useState('All');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    const filtered = useMemo(() => {
        return MOCK_REPORTS.filter((r) => {
            const q = searchQuery.toLowerCase();
            const matchesQuery = !q || r.patientName.toLowerCase().includes(q) || r.patientId.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.doctor.toLowerCase().includes(q);
            const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
            const matchesHist = filterHistType === 'All' || r.histType === filterHistType;
            const matchesRisk = filterRisk === 'All' || r.ataRisk === filterRisk;
            const reportDate = new Date(r.diagnosisDate);
            const matchesFrom = !dateFrom || reportDate >= new Date(dateFrom);
            const matchesTo = !dateTo || reportDate <= new Date(dateTo);
            return matchesQuery && matchesStatus && matchesHist && matchesRisk && matchesFrom && matchesTo;
        });
    }, [searchQuery, filterStatus, filterHistType, filterRisk, dateFrom, dateTo]);

    const clearFilters = () => {
        setFilterStatus('All');
        setFilterHistType('All');
        setFilterRisk('All');
        setDateFrom('');
        setDateTo('');
        setSearchQuery('');
    };

    const hasActiveFilters = filterStatus !== 'All' || filterHistType !== 'All' || filterRisk !== 'All' || !!dateFrom || !!dateTo;

    const stats = {
        total: MOCK_REPORTS.length,
        finalized: MOCK_REPORTS.filter(r => r.status === 'Finalized').length,
        draft: MOCK_REPORTS.filter(r => r.status === 'Draft').length,
        pending: MOCK_REPORTS.filter(r => r.status === 'Pending').length,
    };

    return (
        <div className={styles.container}>

            {/* ── Header ── */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerLeft}>
                        <button className={styles.backBtn} onClick={() => router.push('/report')}>
                            <ArrowLeft size={16} />
                            Back to Report
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
                        <button className={styles.actionButton}>
                            <Download size={16} /> Export
                        </button>
                        <button className={styles.actionButton}>
                            <Printer size={16} /> Print
                        </button>
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
                            <X size={15} />
                        </button>
                    )}
                </div>
                <button
                    className={`${styles.filterToggle} ${showFilters ? styles.filterToggleActive : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={15} />
                    Filters
                    {hasActiveFilters && <span className={styles.filterBadge} />}
                </button>
            </div>

            {/* ── Filters ── */}
            {showFilters && (
                <div className={styles.filtersPanel}>
                    <div className={styles.filtersPanelHeader}>
                        <span className={styles.filtersPanelTitle}><Filter size={14} /> Advanced Filters</span>
                        {hasActiveFilters && (
                            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                                <X size={13} /> Clear All
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
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Date To</label>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

            {/* ── Results Bar ── */}
            <div className={styles.resultsBar}>
                <span className={styles.resultsCount}>
                    <TrendingUp size={14} />
                    Showing <strong>{filtered.length}</strong> of {MOCK_REPORTS.length} reports
                </span>
            </div>

            {/* ── Table ── */}
            <div className={styles.tableWrapper}>
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}><Search size={34} /></div>
                        <p className={styles.emptyTitle}>No reports found</p>
                        <p className={styles.emptyText}>Try adjusting your search or filters</p>
                        <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                            <X size={13} /> Clear filters
                        </button>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Report ID</th>
                            <th>Patient</th>
                            <th>Age / Gender</th>
                            <th>Diagnosis Date</th>
                            <th>Hist. Type</th>
                            <th>Stage</th>
                            <th>ATA Risk</th>
                            <th>Status</th>
                            <th>Doctor</th>
                            <th>Actions</th>
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
                                        <Calendar size={13} />
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
                                        <button className={`${styles.actionBtn} ${styles.viewBtn}`} title="View" onClick={() => setSelectedReport(report)}><Eye size={14} /></button>
                                        <button className={styles.actionBtn} title="Download"><Download size={14} /></button>
                                        <button className={styles.actionBtn} title="Print"><Printer size={14} /></button>
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
                            <button className={styles.modalClose} onClick={() => setSelectedReport(null)}><X size={18} /></button>
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
};

export default SearchReportPage;