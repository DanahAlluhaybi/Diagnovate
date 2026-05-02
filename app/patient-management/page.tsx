'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './styles.module.css';
import { X, ArrowLeft, Search, UserPlus, Scan, Trash2, Brain, CheckCircle2, AlertTriangle, Minus, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { BASE } from '@/lib/api';

type Gender   = 'Male' | 'Female';
type Status   = 'Active' | 'Inactive';
type View     = 'list' | 'detail';
type Tab      = 'info' | 'images' | 'diagnosis' | 'reports';
type ScanType = 'Ultrasound';

const SCAN_TYPE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
    'Ultrasound': { color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
};

const SEVERITY_META = {
    Low:      { color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', icon: '●' },
    Moderate: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '◆' },
    High:     { color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3', icon: '▲' },
} as const;

const MODE_LABELS: Record<string, string> = {
    image: 'Image Only',
    lab:   'Lab Only',
    both:  'Multi-Modal',
};

interface MedicalImage {
    id: string; date: string; type: ScanType; label: string;
    enhanced: boolean; enhancedSrc?: string; originalSrc?: string;
}

interface DiagnosisRecord {
    id             : string;
    date           : string;
    mode           : 'image' | 'lab' | 'both';
    modelName      : string;
    votingResult   : string;
    confidence     : number;
    severity       : 'Low' | 'Moderate' | 'High';
    malignancyScore: number;
    recommendation : string;
    findings       : string[];
    topModels      : { name: string; result: string; confidence: number; available: boolean }[];
}

interface Patient {
    id: string; mrn: string; firstName: string; lastName: string;
    age: number; gender: Gender; phone: string; email: string;
    lastVisit: string; status: Status; condition: string; images?: MedicalImage[];
}

const EMPTY_FORM = {
    firstName:'', lastName:'', mrn:'', age:'',
    gender:'Male' as Gender, phone:'', email:'',
    condition:'', status:'Active' as Status,
};

import { loadImages, deleteImage } from '@/lib/imageStorage';
import { loadDiagnoses, deleteDiagnosis } from '@/lib/diagnosisStorage';

async function loadImagesForPatient(patient: { id: string; mrn: string }): Promise<MedicalImage[]> {
    try {
        const raw = await loadImages(patient.mrn, patient.id);
        return raw.map((img: any): MedicalImage => ({
            id: img.id, date: img.date, type: 'Ultrasound' as ScanType,
            label: img.label, enhanced: img.isEnhanced ?? true,
            enhancedSrc: img.enhancedSrc, originalSrc: img.originalSrc,
        }));
    } catch { return []; }
}

async function loadDiagnosesForPatient(patient: { id: string; mrn: string }): Promise<DiagnosisRecord[]> {
    try {
        return await loadDiagnoses(patient.mrn, patient.id);
    } catch { return []; }
}

async function deleteImageFromStorage(patient: { id: string; mrn: string }, imageId: string) {
    await deleteImage(patient.mrn, patient.id, imageId);
}

const getAgeGroup  = (age: number) => age <= 18 ? '0-18' : age <= 40 ? '19-40' : '40+';
const formatDate   = (d: string)   => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatTime   = (d: string)   => d ? new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '';
const getInitials  = (f: string, l: string) => `${f[0] ?? ''}${l[0] ?? ''}`.toUpperCase();

// ── Inner component (uses useSearchParams) ─────────────────────────────────
function PatientManagementPage() {
    const router       = useRouter();
    const searchParams = useSearchParams();

    const [patients,        setPatients]        = useState<Patient[]>([]);
    const [loading,         setLoading]         = useState(true);
    const [currentView,     setCurrentView]     = useState<View>('list');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [activeTab,       setActiveTab]       = useState<Tab>('info');
    const [searchQuery,     setSearchQuery]     = useState('');
    const [activeFilter,    setActiveFilter]    = useState('all');
    const [showModal,       setShowModal]       = useState(false);
    const [form,            setForm]            = useState(EMPTY_FORM);
    const [formError,       setFormError]       = useState('');
    const [localImages,     setLocalImages]     = useState<MedicalImage[]>([]);
    const [localDiagnoses,  setLocalDiagnoses]  = useState<DiagnosisRecord[]>([]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [editingStatus,   setEditingStatus]   = useState(false);
    const [confirmDxDelete, setConfirmDxDelete] = useState<string | null>(null);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`${BASE}/api/patients`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            const result = await res.json();
            if (result.success) setPatients(result.data);
        } catch (e) { console.error('Network error:', e); }
        finally { setLoading(false); }
    };

    const addPatientToAPI = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch(`${BASE}/api/patients`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await res.json();
        } catch { return { success: false, error: 'Network error' }; }
    };

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/log-in'); return; }
        fetchPatients();
    }, []);

    useEffect(() => {
        if (selectedPatient) {
            loadImagesForPatient(selectedPatient).then(setLocalImages);
            loadDiagnosesForPatient(selectedPatient).then(setLocalDiagnoses);
        } else {
            setLocalImages([]);
            setLocalDiagnoses([]);
        }
    }, [selectedPatient]);

    useEffect(() => {
        const patientId = searchParams.get('patientId');
        const tab       = (searchParams.get('tab') as Tab) || 'info';
        if (patientId && patients.length > 0) {
            const match = patients.find(p => p.id === patientId || p.mrn === patientId);
            if (match) { setSelectedPatient(match); setCurrentView('detail'); setActiveTab(tab); }
        }
    }, [searchParams, patients]);

    const filters = [
        { id: 'all',    label: 'All'    },
        { id: 'male',   label: 'Male'   },
        { id: 'female', label: 'Female' },
        { id: '0-18',   label: '0–18'   },
        { id: '19-40',  label: '19–40'  },
        { id: '40+',    label: '40+'    },
    ];

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return patients.filter(p => {
            const matchSearch = !q ||
                `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
                p.mrn.toLowerCase().includes(q) || p.phone.includes(q);
            const matchFilter =
                activeFilter === 'all' ||
                (activeFilter === 'male'   && p.gender === 'Male')   ||
                (activeFilter === 'female' && p.gender === 'Female') ||
                getAgeGroup(p.age) === activeFilter;
            return matchSearch && matchFilter;
        });
    }, [patients, searchQuery, activeFilter]);

    async function handleAddPatient() {
        if (!form.firstName || !form.lastName || !form.mrn || !form.age || !form.phone) {
            setFormError('Please fill in all required fields.'); return;
        }
        const result = await addPatientToAPI(form);
        if (result.success) {
            setPatients(prev => [result.data, ...prev]);
            setShowModal(false); setSelectedPatient(result.data);
            setCurrentView('detail'); setActiveTab('info'); setFormError('');
        } else { setFormError(result.error || 'Failed to add patient'); }
    }

    const updatePatientStatus = async (patientId: string, newStatus: Status) => {
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: newStatus } : p));
        setSelectedPatient(prev => prev ? { ...prev, status: newStatus } : prev);
        setEditingStatus(false);
        try {
            const token = localStorage.getItem('token');
            await fetch(`${BASE}/api/patients/${patientId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (e) { console.error('Failed to update status:', e); }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!selectedPatient) return;
        await deleteImageFromStorage(selectedPatient, imageId);
        setLocalImages(prev => prev.filter(i => i.id !== imageId));
        setConfirmDeleteId(null);
    };

    const handleDeleteDiagnosis = async (diagId: string) => {
        if (!selectedPatient) return;
        await deleteDiagnosis(selectedPatient.mrn, selectedPatient.id, diagId);
        setLocalDiagnoses(prev => prev.filter(d => d.id !== diagId));
        setConfirmDxDelete(null);
    };

    const openPatient = (p: Patient, tab: Tab = 'info') => {
        setSelectedPatient(p); setCurrentView('detail'); setActiveTab(tab);
    };
    const goBack = () => {
        setCurrentView('list'); setSelectedPatient(null);
        setActiveTab('info'); setConfirmDeleteId(null); setConfirmDxDelete(null);
    };

    /* ── DETAIL VIEW ── */
    if (currentView === 'detail' && selectedPatient) {
        const images = localImages;
        return (
            <div className={styles.container}>
                <Navbar />
                <div className={styles.pageContent}>
                    <div className={styles.featureHeader}>
                        <button className={styles.backBtn} onClick={goBack}>
                            <ArrowLeft size={13} /> Patients
                        </button>
                        <div className={styles.eyebrow}><span className={styles.eyebrowDot} />Patient Records</div>
                        <h2 className={styles.pageTitle}>Patient <em>Details</em></h2>
                    </div>

                    <div className={styles.profileStrip}>
                        <div className={`${styles.avatarLg} ${selectedPatient.gender === 'Female' ? styles.female : styles.male}`}>
                            {getInitials(selectedPatient.firstName, selectedPatient.lastName)}
                        </div>
                        <div className={styles.profileInfo}>
                            <h2 className={styles.detailName}>{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                            <p className={styles.detailMrn}>{selectedPatient.mrn} · {selectedPatient.id}</p>
                            <span className={`${styles.badge} ${selectedPatient.status === 'Active' ? styles.active : styles.inactive}`}>
                                {selectedPatient.status}
                            </span>
                        </div>
                        <div className={styles.profileMeta}>
                            {[
                                { label: 'Age',       val: `${selectedPatient.age} yrs`     },
                                { label: 'Gender',    val: selectedPatient.gender            },
                                { label: 'Scans',     val: String(images.length)             },
                                { label: 'Diagnoses', val: String(localDiagnoses.length)     },
                            ].map(m => (
                                <div key={m.label} className={styles.metaChip}>
                                    <span className={styles.metaLabel}>{m.label}</span>
                                    <span className={styles.metaVal}>{m.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.tabBar}>
                        {([
                            { id: 'info',      label: 'Personal Info'  },
                            { id: 'images',    label: 'Medical Images' },
                            { id: 'diagnosis', label: 'AI Diagnoses'   },
                            { id: 'reports',   label: 'Reports'        },
                        ] as { id: Tab; label: string }[]).map(t => (
                            <button key={t.id}
                                    className={`${styles.tabBtn} ${activeTab === t.id ? styles.tabBtnActive : ''}`}
                                    onClick={() => setActiveTab(t.id)}>
                                {t.label}
                                {t.id === 'diagnosis' && localDiagnoses.length > 0 && (
                                    <span className={styles.tabCount}>{localDiagnoses.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* INFO TAB */}
                    {activeTab === 'info' && (
                        <div className={styles.detailCard}>
                            <div className={styles.detailGrid}>
                                {[
                                    { label: 'Age',        value: `${selectedPatient.age} years`        },
                                    { label: 'Gender',     value: selectedPatient.gender                },
                                    { label: 'Phone',      value: selectedPatient.phone                 },
                                    { label: 'Email',      value: selectedPatient.email     || '—'      },
                                    { label: 'Condition',  value: selectedPatient.condition || '—'      },
                                    { label: 'Last Visit', value: formatDate(selectedPatient.lastVisit) },
                                ].map(item => (
                                    <div key={item.label} className={styles.detailItem}>
                                        <span className={styles.detailLabel}>{item.label}</span>
                                        <span className={styles.detailValue}>{item.value}</span>
                                    </div>
                                ))}
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Status</span>
                                    {editingStatus ? (
                                        <div className={styles.statusEditRow}>
                                            {(['Active', 'Inactive'] as Status[]).map(s => (
                                                <button key={s}
                                                        className={`${styles.statusOption} ${selectedPatient.status === s ? styles.statusOptionActive : ''}`}
                                                        style={selectedPatient.status === s ? (s === 'Active'
                                                            ? { background: '#F0FDF4', borderColor: '#86EFAC', color: '#15803D' }
                                                            : { background: '#FFF1F2', borderColor: '#FECDD3', color: '#DC2626' }) : {}}
                                                        onClick={() => updatePatientStatus(selectedPatient.id, s)}>
                                                    {s}
                                                </button>
                                            ))}
                                            <button className={styles.statusCancelBtn} onClick={() => setEditingStatus(false)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className={styles.statusViewRow}>
                                            <span className={`${styles.badge} ${selectedPatient.status === 'Active' ? styles.active : styles.inactive}`}>
                                                {selectedPatient.status}
                                            </span>
                                            <button className={styles.statusEditBtn} onClick={() => setEditingStatus(true)}>Change</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* IMAGES TAB — Ultrasound only */}
                    {activeTab === 'images' && (
                        <div className={styles.imagesSection}>
                            {images.length === 0 ? (
                                <div className={styles.emptyTab}>
                                    <Scan size={32} color="#CBD5E1" />
                                    <p>No ultrasound images yet</p>
                                    <span style={{ fontSize: 13, color: '#94a3b8' }}>
                                        Go to Image Enhancement to upload and enhance ultrasound scans
                                    </span>
                                </div>
                            ) : (
                                <div className={styles.imagesByType}>
                                    {(() => {
                                        const st = SCAN_TYPE_STYLES['Ultrasound'];
                                        return (
                                            <div className={styles.typeGroup}>
                                                <div className={styles.typeGroupHead}>
                                                    <span className={styles.typeGroupBadge}
                                                          style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                                                        Ultrasound
                                                    </span>
                                                    <span className={styles.typeGroupCount}>{images.length} scan{images.length > 1 ? 's' : ''}</span>
                                                    <div className={styles.typeGroupLine} style={{ background: st.border }} />
                                                </div>
                                                <div className={styles.imagesGrid}>
                                                    {images.map(img => (
                                                        <div key={img.id} className={styles.imgCard}>
                                                            <div className={styles.imgRealWrap}>
                                                                {img.enhancedSrc || img.originalSrc ? (
                                                                    <img src={img.enhancedSrc || img.originalSrc}
                                                                         className={styles.imgReal} alt={img.label} />
                                                                ) : (
                                                                    <div className={styles.imgNoise} />
                                                                )}
                                                                {img.enhanced && (
                                                                    <div className={styles.enhancedBadge}>Enhanced</div>
                                                                )}
                                                            </div>
                                                            <div className={styles.imgMeta}>
                                                                <span className={styles.imgTypeTag}
                                                                      style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                                                                    Ultrasound
                                                                </span>
                                                                <div className={styles.imgDesc}>{img.label}</div>
                                                                <div className={styles.imgFooter}>
                                                                    <span className={styles.imgDate}>{formatDate(img.date)}</span>
                                                                    {confirmDeleteId === img.id ? (
                                                                        <div className={styles.deleteConfirm}>
                                                                            <span className={styles.deleteConfirmText}>Delete?</span>
                                                                            <div className={styles.deleteConfirmBtns}>
                                                                                <button className={styles.deleteConfirmYes} onClick={() => handleDeleteImage(img.id)}>Yes</button>
                                                                                <button className={styles.deleteConfirmNo} onClick={() => setConfirmDeleteId(null)}>No</button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <button className={styles.deleteImgBtn} onClick={() => setConfirmDeleteId(img.id)}>
                                                                            <Trash2 size={13} /> Delete
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DIAGNOSIS TAB */}
                    {activeTab === 'diagnosis' && (
                        <div className={styles.diagnosisSection}>
                            {localDiagnoses.length === 0 ? (
                                <div className={styles.emptyTab}>
                                    <Brain size={32} color="#CBD5E1" />
                                    <p>No AI diagnoses yet</p>
                                    <span style={{ fontSize: 13, color: '#94a3b8' }}>
                                        Run a diagnosis from the AI Diagnosis page and select this patient
                                    </span>
                                    <button className={styles.goToDxBtn} onClick={() => router.push('/ai-diagnosis')}>
                                        <Brain size={14} /> Go to AI Diagnosis
                                    </button>
                                </div>
                            ) : (
                                <div className={styles.dxList}>
                                    {localDiagnoses.map((dx) => {
                                        const sev = SEVERITY_META[dx.severity] ?? SEVERITY_META.Moderate;
                                        const SevIcon = dx.severity === 'High' ? AlertTriangle : dx.severity === 'Moderate' ? Minus : CheckCircle2;
                                        return (
                                            <div key={dx.id} className={styles.dxCard}>
                                                <div className={styles.dxCardHead} style={{ borderColor: sev.border, background: sev.bg }}>
                                                    <div className={styles.dxCardHeadLeft}>
                                                        <div className={styles.dxSevIcon} style={{ background: sev.color + '18', border: `1px solid ${sev.border}` }}>
                                                            <SevIcon size={14} color={sev.color} />
                                                        </div>
                                                        <div>
                                                            <div className={styles.dxVoting} style={{ color: sev.color }}>{dx.votingResult}</div>
                                                            <div className={styles.dxDate}>{formatDate(dx.date)} · {formatTime(dx.date)}</div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.dxCardHeadRight}>
                                                        <div className={styles.dxSeverityBadge} style={{ background: sev.color + '18', color: sev.color, borderColor: sev.border }}>
                                                            {sev.icon} {dx.severity} Risk
                                                        </div>
                                                        <div className={styles.dxScore} style={{ color: sev.color }}>
                                                            {dx.malignancyScore}<span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>/100</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={styles.dxCardBody}>
                                                    <div className={styles.dxMetaRow}>
                                                        <div className={styles.dxMeta}><span className={styles.dxMetaLabel}>Mode</span><span className={styles.dxMetaVal}>{MODE_LABELS[dx.mode] ?? dx.mode}</span></div>
                                                        <div className={styles.dxMeta}><span className={styles.dxMetaLabel}>Model</span><span className={styles.dxMetaVal}>{dx.modelName}</span></div>
                                                        <div className={styles.dxMeta}><span className={styles.dxMetaLabel}>Confidence</span><span className={styles.dxMetaVal} style={{ color: sev.color }}>{dx.confidence}%</span></div>
                                                    </div>
                                                    <div className={styles.dxScoreBar}>
                                                        <div className={styles.dxScoreTrack}>
                                                            <div className={styles.dxScoreFill} style={{ width: `${dx.malignancyScore}%`, background: sev.color }} />
                                                        </div>
                                                        <span className={styles.dxScoreLabel}>Malignancy Score</span>
                                                    </div>
                                                    <div className={styles.dxModelsRow}>
                                                        {dx.topModels.map((m, i) => (
                                                            <div key={i} className={styles.dxModelChip} style={{ opacity: m.available ? 1 : 0.45 }}>
                                                                <span className={styles.dxModelName}>{m.name}</span>
                                                                <span className={styles.dxModelResult} style={{ color: m.available ? sev.color : '#94a3b8' }}>
                                                                    {m.available ? `${m.result} · ${m.confidence}%` : 'N/A'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className={styles.dxFindings}>
                                                        <div className={styles.dxFindingsLabel}>Key Findings</div>
                                                        <div className={styles.dxFindingsList}>
                                                            {dx.findings.slice(0, 4).map((f, i) => (
                                                                <div key={i} className={styles.dxFindingItem}>
                                                                    <div className={styles.dxFindingDot} style={{ background: sev.color }} />
                                                                    <span>{f}</span>
                                                                </div>
                                                            ))}
                                                            {dx.findings.length > 4 && (
                                                                <div className={styles.dxFindingItem} style={{ color: '#94a3b8' }}>+{dx.findings.length - 4} more findings</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles.dxRec} style={{ borderColor: sev.border, background: sev.bg }}>
                                                        <CheckCircle2 size={13} color={sev.color} style={{ flexShrink: 0, marginTop: 2 }} />
                                                        <span>{dx.recommendation}</span>
                                                    </div>
                                                    <div className={styles.dxActions}>
                                                        {confirmDxDelete === dx.id ? (
                                                            <div className={styles.deleteConfirm}>
                                                                <span className={styles.deleteConfirmText}>Delete this diagnosis?</span>
                                                                <div className={styles.deleteConfirmBtns}>
                                                                    <button className={styles.deleteConfirmYes} onClick={() => handleDeleteDiagnosis(dx.id)}>Yes, delete</button>
                                                                    <button className={styles.deleteConfirmNo} onClick={() => setConfirmDxDelete(null)}>Cancel</button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button className={styles.deleteImgBtn} onClick={() => setConfirmDxDelete(dx.id)}>
                                                                <Trash2 size={13} /> Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div className={styles.emptyTab}>
                            <FileText size={32} color="#CBD5E1" />
                            <p>No reports yet</p>
                            <span style={{ fontSize: 13, color: '#94a3b8' }}>
                                Reports will appear here after AI diagnosis is complete
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ── LIST VIEW ── */
    return (
        <div className={styles.container}>
            <Navbar />
            <div className={styles.pageContent}>
                <div className={styles.featureHeader}>
                    <div className={styles.eyebrow}><span className={styles.eyebrowDot} />Patient Records</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                        <h1 className={styles.pageTitle}>Patient <em>Management</em></h1>
                        <button className={styles.addBtn} onClick={() => { setForm(EMPTY_FORM); setShowModal(true); setFormError(''); }}>
                            <UserPlus size={15} /> Add Patient
                        </button>
                    </div>
                </div>

                <div className={styles.searchCard}>
                    <div className={styles.searchWrapper}>
                        <Search size={15} className={styles.searchIcon} />
                        <input className={styles.searchInput} placeholder="Search by name, MRN, or phone..."
                               value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                    </div>
                    <div className={styles.filterRow}>
                        {filters.map(f => (
                            <button key={f.id}
                                    className={`${styles.filterBtn} ${activeFilter === f.id ? styles.filterBtnActive : ''}`}
                                    onClick={() => setActiveFilter(f.id)}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.tableCard}>
                    <div className={styles.tableHead}>
                        <span className={styles.tableCount}>{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                    {loading ? (
                        <div className={styles.empty}><p>Loading patients...</p></div>
                    ) : filtered.length === 0 ? (
                        <div className={styles.empty}>
                            <p>No patients found</p>
                            <p className={styles.emptySubtitle}>Try a different search or add a new patient</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Patient</th><th>MRN</th><th>Age</th><th>Gender</th>
                                <th>Condition</th><th>Status</th><th>Last Visit</th><th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className={styles.tableRow} onClick={() => openPatient(p)}>
                                    <td>
                                        <div className={styles.patientCell}>
                                            <div className={`${styles.avatarSm} ${p.gender === 'Female' ? styles.female : styles.male}`}>
                                                {getInitials(p.firstName, p.lastName)}
                                            </div>
                                            <span className={styles.patientName}>{p.firstName} {p.lastName}</span>
                                        </div>
                                    </td>
                                    <td className={styles.muted}>{p.mrn}</td>
                                    <td className={styles.muted}>{p.age}</td>
                                    <td className={styles.muted}>{p.gender}</td>
                                    <td className={styles.muted}>{p.condition || '—'}</td>
                                    <td>
                                            <span className={`${styles.badge} ${p.status === 'Active' ? styles.active : styles.inactive}`}>
                                                {p.status}
                                            </span>
                                    </td>
                                    <td className={styles.muted}>{p.lastVisit ? formatDate(p.lastVisit) : '—'}</td>
                                    <td>
                                        <button className={styles.viewBtn} onClick={e => { e.stopPropagation(); openPatient(p); }}>
                                            View →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                    <div className={styles.tableFooter}>
                        Showing {filtered.length} of {patients.length} patients
                    </div>
                </div>
            </div>

            {showModal && (
                <div className={styles.overlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <div className={styles.modalTitle}><UserPlus size={18} /> Add New Patient</div>
                            <button className={styles.modalClose} onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGrid}>
                                {([
                                    { k: 'firstName', label: 'First Name', placeholder: 'John',         type: 'text'   },
                                    { k: 'lastName',  label: 'Last Name',  placeholder: 'Doe',          type: 'text'   },
                                    { k: 'mrn',       label: 'MRN',        placeholder: 'MRN-001',      type: 'text'   },
                                    { k: 'age',       label: 'Age',        placeholder: '35',           type: 'number' },
                                    { k: 'phone',     label: 'Phone',      placeholder: '+966 5xx xxx', type: 'text'   },
                                    { k: 'email',     label: 'Email',      placeholder: 'optional',     type: 'email'  },
                                ] as const).map(f => (
                                    <div key={f.k} className={styles.formField}>
                                        <label className={styles.formLabel}>{f.label}</label>
                                        <input className={styles.formInput} type={f.type} placeholder={f.placeholder}
                                               value={(form as any)[f.k]}
                                               onChange={e => setForm(prev => ({ ...prev, [f.k]: e.target.value }))} />
                                    </div>
                                ))}
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Gender</label>
                                    <select className={styles.formInput} value={form.gender}
                                            onChange={e => setForm(prev => ({ ...prev, gender: e.target.value as Gender }))}>
                                        <option>Male</option><option>Female</option>
                                    </select>
                                </div>
                                <div className={styles.formField}>
                                    <label className={styles.formLabel}>Condition</label>
                                    <input className={styles.formInput} type="text" placeholder="e.g. Thyroid Nodule"
                                           value={form.condition}
                                           onChange={e => setForm(prev => ({ ...prev, condition: e.target.value }))} />
                                </div>
                            </div>
                            {formError && <p className={styles.formError}>{formError}</p>}
                        </div>
                        <div className={styles.modalFoot}>
                            <button className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                            <button className={styles.submitBtn} onClick={handleAddPatient}>Add Patient</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Wrapper with Suspense (required for useSearchParams in Next.js) ──────────
export default function Page() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
            <PatientManagementPage />
        </Suspense>
    );
}