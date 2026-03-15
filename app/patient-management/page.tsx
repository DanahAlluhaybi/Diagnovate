'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './styles.module.css';
import { X, ArrowLeft, Search, UserPlus, Scan } from 'lucide-react';
import Navbar from '@/components/Navbar';

type Gender = 'Male' | 'Female';
type Status = 'Active' | 'Inactive';
type View   = 'list' | 'detail';
type Tab    = 'info' | 'images';

type ScanType = 'Ultrasound' | 'CT Scan' | 'MRI' | 'X-Ray';

const SCAN_TYPE_STYLES: Record<string, { color: string; bg: string; border: string }> = {
    'Ultrasound': { color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
    'CT Scan':    { color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD' },
    'MRI':        { color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    'X-Ray':      { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
};

interface MedicalImage {
    id: string;
    date: string;
    type: ScanType;
    label: string;
    enhanced: boolean;
    enhancedSrc?: string;
    originalSrc?: string;
}

interface Patient {
    id: string; mrn: string; firstName: string; lastName: string;
    age: number; gender: Gender; phone: string; email: string;
    lastVisit: string; status: Status; condition: string;
    images?: MedicalImage[];
}

const EMPTY_FORM = {
    firstName:'', lastName:'', mrn:'', age:'',
    gender:'Male' as Gender, phone:'', email:'',
    condition:'', status:'Active' as Status,
};

// ── Load images saved from Image Enhancement page ──
// Searches by patient.id AND patient.mrn so either key works
function loadImagesForPatient(patient: { id: string; mrn: string }): MedicalImage[] {
    try {
        const all = JSON.parse(localStorage.getItem('patient_images') || '{}');
        // Merge results from both keys, deduplicate by image id
        const fromId  = all[patient.id]  || [];
        const fromMrn = all[patient.mrn] || [];
        const merged  = [...fromId, ...fromMrn];
        const unique  = merged.filter((img, idx, arr) => arr.findIndex(x => x.id === img.id) === idx);
        return unique.map((img: any): MedicalImage => ({
            id:          img.id,
            date:        img.date,
            type:        img.type as ScanType,
            label:       img.label,
            enhanced:    img.isEnhanced ?? true,
            enhancedSrc: img.enhancedSrc,
            originalSrc: img.originalSrc,
        }));
    } catch { return []; }
}

// ── Fallback mock images (shown when no real images saved yet) ──
const mockImages = (patientId: string): MedicalImage[] => [
    { id: `IMG-${patientId}-001`, date: '2025-03-01', type: 'Ultrasound', label: 'Right lobe longitudinal', enhanced: false },
    { id: `IMG-${patientId}-002`, date: '2024-11-15', type: 'CT Scan',    label: 'Neck cross-section',      enhanced: false },
];

const getAgeGroup = (age: number) => age <= 18 ? '0-18' : age <= 40 ? '19-40' : '40+';
const formatDate  = (d: string)   => new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
const getInitials = (f: string, l: string) => `${f[0]??''}${l[0]??''}`.toUpperCase();

export default function PatientManagementPage() {
    const router       = useRouter();
    const searchParams = useSearchParams();

    const [patients,        setPatients]       = useState<Patient[]>([]);
    const [searchQuery,     setSearchQuery]    = useState('');
    const [activeFilter,    setActiveFilter]   = useState('all');
    const [currentView,     setCurrentView]    = useState<View>('list');
    const [selectedPatient, setSelectedPatient]= useState<Patient | null>(null);
    const [activeTab,       setActiveTab]      = useState<Tab>('info');
    const [form,            setForm]           = useState(EMPTY_FORM);
    const [formError,       setFormError]      = useState('');
    const [showModal,       setShowModal]      = useState(false);
    const [loading,         setLoading]        = useState(false);
    const [editingStatus,   setEditingStatus]  = useState(false);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res   = await fetch('http://localhost:5002/api/patients', {
                headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
            });
            const result = await res.json();
            if (result.success) {
                const enriched = result.data.map((p: Patient) => ({
                    ...p,
                    images: loadImagesForPatient(p).length > 0 ? loadImagesForPatient(p) : (p.images ?? mockImages(p.id)),
                }));
                setPatients(enriched);
            }
        } catch (e) { console.error('Network error:', e); }
        finally { setLoading(false); }
    };

    const addPatientToAPI = async (data: any) => {
        try {
            const token = localStorage.getItem('token');
            const res   = await fetch('http://localhost:5002/api/patients', {
                method:'POST',
                headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' },
                body: JSON.stringify(data),
            });
            return await res.json();
        } catch { return { success:false, error:'Network error' }; }
    };

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/log-in'); return; }
        fetchPatients();
    }, []);

    // ── Deep-link from dashboard: /patient-management?patientId=XXX&tab=images ──
    useEffect(() => {
        const patientId = searchParams.get('patientId');
        const tab       = (searchParams.get('tab') as Tab) || 'info';
        if (patientId && patients.length > 0) {
            const match = patients.find(p => p.id === patientId || p.mrn === patientId);
            if (match) { setSelectedPatient(match); setCurrentView('detail'); setActiveTab(tab); }
        }
    }, [searchParams, patients]);

    const filters = [
        { id:'all', label:'All' }, { id:'male', label:'Male' }, { id:'female', label:'Female' },
        { id:'0-18', label:'0–18' }, { id:'19-40', label:'19–40' }, { id:'40+', label:'40+' },
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
            const enriched = { ...result.data, images: mockImages(result.data.id) };
            setPatients(prev => [enriched, ...prev]);
            setShowModal(false); setSelectedPatient(enriched);
            setCurrentView('detail'); setActiveTab('info'); setFormError('');
        } else { setFormError(result.error || 'Failed to add patient'); }
    }

    // Update patient status locally + call API
    const updatePatientStatus = async (patientId: string, newStatus: Status) => {
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status: newStatus } : p));
        setSelectedPatient(prev => prev ? { ...prev, status: newStatus } : prev);
        setEditingStatus(false);
        try {
            const token = localStorage.getItem('token');
            await fetch(`http://localhost:5002/api/patients/${patientId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (e) { console.error('Failed to update status:', e); }
    };

    const openPatient = (p: Patient, tab: Tab = 'info') => {
        setSelectedPatient(p); setCurrentView('detail'); setActiveTab(tab);
    };

    const goBack = () => { setCurrentView('list'); setSelectedPatient(null); setActiveTab('info'); };

    /* ════════════════════════════════════════
       DETAIL VIEW
    ════════════════════════════════════════ */
    if (currentView === 'detail' && selectedPatient) {
        // Always read fresh from localStorage so newly saved images appear immediately
        const lsImages = loadImagesForPatient(selectedPatient);
        const images   = lsImages.length > 0 ? lsImages : (selectedPatient.images ?? []);

        return (
            <div className={styles.container}>
                <Navbar />
                <div className={styles.pageContent}>

                    <div className={styles.featureHeader}>
                        <button className={styles.backBtn} onClick={goBack}>
                            <ArrowLeft size={13} /> Patients
                        </button>
                        <h2 className={styles.pageTitle}>Patient Details</h2>
                    </div>

                    {/* Profile strip */}
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
                                { label:'Age',    val:`${selectedPatient.age} yrs` },
                                { label:'Gender', val:selectedPatient.gender },
                                { label:'Scans',  val:String(images.length) },
                            ].map(m => (
                                <div key={m.label} className={styles.metaChip}>
                                    <span className={styles.metaLabel}>{m.label}</span>
                                    <span className={styles.metaVal}>{m.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tab bar */}
                    <div className={styles.tabBar}>
                        {([
                            { id:'info',   label:'Personal Info',  icon:'👤' },
                            { id:'images', label:'Medical Images', icon:'🔬' },
                        ] as { id: Tab; label: string; icon: string }[]).map(t => (
                            <button
                                key={t.id}
                                className={`${styles.tabBtn} ${activeTab === t.id ? styles.tabBtnActive : ''}`}
                                onClick={() => setActiveTab(t.id)}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Personal Info ── */}
                    {activeTab === 'info' && (
                        <div className={styles.detailCard}>
                            <div className={styles.detailGrid}>
                                {[
                                    { label:'Age',        value:`${selectedPatient.age} years`        },
                                    { label:'Gender',     value:selectedPatient.gender                },
                                    { label:'Phone',      value:selectedPatient.phone                 },
                                    { label:'Email',      value:selectedPatient.email     || '—'      },
                                    { label:'Condition',  value:selectedPatient.condition || '—'      },
                                    { label:'Last Visit', value:formatDate(selectedPatient.lastVisit) },
                                ].map(item => (
                                    <div key={item.label} className={styles.detailItem}>
                                        <span className={styles.detailLabel}>{item.label}</span>
                                        <span className={styles.detailValue}>{item.value}</span>
                                    </div>
                                ))}

                                {/* Editable Status */}
                                <div className={styles.detailItem}>
                                    <span className={styles.detailLabel}>Status</span>
                                    {editingStatus ? (
                                        <div className={styles.statusEditRow}>
                                            {(['Active','Inactive'] as Status[]).map(s => (
                                                <button
                                                    key={s}
                                                    className={`${styles.statusOption} ${selectedPatient.status === s ? styles.statusOptionActive : ''}`}
                                                    style={selectedPatient.status === s ? (s === 'Active'
                                                        ? { background:'#F0FDFA', color:'#0D9488', borderColor:'#99F6E4' }
                                                        : { background:'#F8FAFC', color:'#64748B', borderColor:'#CBD5E1' }) : {}}
                                                    onClick={() => updatePatientStatus(selectedPatient.id, s)}
                                                >{s}</button>
                                            ))}
                                            <button className={styles.statusCancelBtn} onClick={() => setEditingStatus(false)}>Cancel</button>
                                        </div>
                                    ) : (
                                        <div className={styles.statusViewRow}>
                                            <span className={`${styles.badge} ${selectedPatient.status === 'Active' ? styles.active : styles.inactive}`}>
                                                {selectedPatient.status}
                                            </span>
                                            <button className={styles.statusEditBtn} onClick={() => setEditingStatus(true)}>
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Medical Images ── */}
                    {activeTab === 'images' && (
                        <div className={styles.imagesSection}>
                            {images.length === 0 ? (
                                <div className={styles.emptyTab}>
                                    <Scan size={40} strokeWidth={1.2} color="#CBD5E1" />
                                    <p>No medical images yet</p>
                                    <p style={{ fontSize:13, color:'#94A3B8', margin:0 }}>
                                        Enhance an image in Image Enhancement and assign this patient's ID
                                    </p>
                                </div>
                            ) : (
                                // Group images by scan type
                                (() => {
                                    const types = ['Ultrasound','CT Scan','MRI','X-Ray'] as const;
                                    const groups = types
                                        .map(t => ({ type: t, imgs: images.filter(i => i.type === t) }))
                                        .filter(g => g.imgs.length > 0);
                                    return (
                                        <div className={styles.imagesByType}>
                                            {groups.map(group => {
                                                const st = SCAN_TYPE_STYLES[group.type] ?? { color:'#64748B', bg:'#F8FAFC', border:'#E2E8F0' };
                                                return (
                                                    <div key={group.type} className={styles.typeGroup}>
                                                        {/* Type header */}
                                                        <div className={styles.typeGroupHead}>
                                                            <span className={styles.typeGroupBadge} style={{ background:st.bg, color:st.color, borderColor:st.border }}>
                                                                {group.type}
                                                            </span>
                                                            <span className={styles.typeGroupCount}>{group.imgs.length} scan{group.imgs.length !== 1 ? 's' : ''}</span>
                                                            <div className={styles.typeGroupLine} style={{ background:`linear-gradient(to right,${st.border},transparent)` }} />
                                                        </div>
                                                        {/* Images grid */}
                                                        <div className={styles.imagesGrid}>
                                                            {group.imgs.map(img => (
                                                                <div key={img.id} className={styles.imgCard}>
                                                                    {/* Real image or placeholder */}
                                                                    {img.enhancedSrc || img.originalSrc ? (
                                                                        <div className={styles.imgRealWrap}>
                                                                            <img
                                                                                src={img.enhancedSrc || img.originalSrc}
                                                                                alt={img.label}
                                                                                className={styles.imgReal}
                                                                            />
                                                                            {img.enhanced && <div className={styles.enhancedBadge}>✦ AI Enhanced</div>}
                                                                        </div>
                                                                    ) : (
                                                                        <div className={styles.imgCanvas}>
                                                                            <div className={styles.imgNoise} />
                                                                            <Scan size={24} color="rgba(255,255,255,0.35)" />
                                                                            {img.enhanced && <div className={styles.enhancedBadge}>✦ AI Enhanced</div>}
                                                                        </div>
                                                                    )}
                                                                    <div className={styles.imgMeta}>
                                                                        <div className={styles.imgTypeTag} style={{ background:st.bg, color:st.color, borderColor:st.border }}>{img.type}</div>
                                                                        <div className={styles.imgDesc}>{img.label}</div>
                                                                        <div className={styles.imgFooter}>
                                                                            <span className={styles.imgDate}>{formatDate(img.date)}</span>
                                                                            <span className={styles.imgId}>{img.id}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    )}

                </div>
            </div>
        );
    }

    /* ════════════════════════════════════════
       LIST VIEW
    ════════════════════════════════════════ */
    return (
        <div className={styles.container}>
            <Navbar />

            {showModal && (
                <div className={styles.overlay} onClick={() => { setShowModal(false); setFormError(''); }}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHead}>
                            <h3 className={styles.modalTitle}>Add New Patient</h3>
                            <button className={styles.modalCloseBtn} onClick={() => { setShowModal(false); setFormError(''); }}><X size={16} /></button>
                        </div>
                        {formError && <div className={styles.formErr}>{formError}</div>}
                        <div className={styles.formGrid}>
                            {[
                                { field:'firstName', label:'First Name *', placeholder:'First name',          type:'text'   },
                                { field:'lastName',  label:'Last Name *',  placeholder:'Last name',           type:'text'   },
                                { field:'mrn',       label:'MRN *',        placeholder:'e.g. MRN-10027',      type:'text'   },
                                { field:'age',       label:'Age *',        placeholder:'Age',                 type:'number' },
                                { field:'phone',     label:'Phone *',      placeholder:'+966 50 000 0000',    type:'text'   },
                                { field:'email',     label:'Email',        placeholder:'patient@email.com',   type:'email'  },
                                { field:'condition', label:'Condition',    placeholder:'e.g. Hypothyroidism', type:'text'   },
                            ].map(item => (
                                <div key={item.field} className={styles.formGroup}>
                                    <label className={styles.formLabel}>{item.label}</label>
                                    <input
                                        className={styles.formInput} type={item.type} placeholder={item.placeholder}
                                        value={(form as any)[item.field]}
                                        onChange={e => setForm(p => ({ ...p, [item.field]: e.target.value }))}
                                    />
                                </div>
                            ))}
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Gender</label>
                                <select className={styles.formInput} value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value as Gender }))}>
                                    <option value="Male">Male</option><option value="Female">Female</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Status</label>
                                <select className={styles.formInput} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as Status }))}>
                                    <option value="Active">Active</option><option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalFoot}>
                            <button className={styles.cancelBtn} onClick={() => { setShowModal(false); setFormError(''); }}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleAddPatient}>
                                <UserPlus size={15} /> Save Patient
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.pageContent}>
                <div className={styles.featureHeader}>
                    <a href="/dashboard" className={styles.backBtn}><ArrowLeft size={13} /> Dashboard</a>
                    <h1 className={styles.pageTitle}>Patient Management</h1>
                </div>

                <div className={styles.searchCard}>
                    <div className={styles.searchWrapper}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text" placeholder="Search by name, MRN, or phone..."
                            className={styles.searchInput} value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>✕</button>}
                    </div>
                    <div className={styles.filterRow}>
                        {filters.map(f => (
                            <button key={f.id}
                                    className={`${styles.filterChip} ${activeFilter === f.id ? styles.filterChipActive : ''}`}
                                    onClick={() => setActiveFilter(f.id)}
                            >{f.label}</button>
                        ))}
                    </div>
                </div>

                <div className={styles.toolbar}>
                    <span className={styles.countLabel}>Showing <strong>{filtered.length}</strong> of {patients.length} patients</span>
                    <button className={styles.addBtn} onClick={() => { setForm(EMPTY_FORM); setFormError(''); setShowModal(true); }}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                        Add New Patient
                    </button>
                </div>

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                        <tr><th>Patient</th><th>MRN</th><th>Age / Gender</th><th>Contact</th><th>Last Visit</th><th>Status</th><th></th></tr>
                        </thead>
                        <tbody>
                        {loading ? (
                            <tr><td colSpan={7}><div className={styles.empty}><p>Loading patients...</p></div></td></tr>
                        ) : filtered.length > 0 ? filtered.map(p => (
                            <tr key={p.id} className={styles.tableRow} onClick={() => openPatient(p)}>
                                <td>
                                    <div className={styles.patientCell}>
                                        <div className={`${styles.avatar} ${p.gender === 'Female' ? styles.female : styles.male}`}>{getInitials(p.firstName, p.lastName)}</div>
                                        <div>
                                            <div className={styles.pName}>{p.firstName} {p.lastName}</div>
                                            <div className={styles.pId}>{p.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.mrn}>{p.mrn}</td>
                                <td className={styles.info}>{p.age} / {p.gender}</td>
                                <td className={styles.info}>{p.phone}</td>
                                <td className={styles.info}>{formatDate(p.lastVisit)}</td>
                                <td><span className={`${styles.badge} ${p.status === 'Active' ? styles.active : styles.inactive}`}>{p.status}</span></td>
                                <td>
                                    <button className={styles.viewBtn} onClick={e => { e.stopPropagation(); openPatient(p); }}>
                                        <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                                            <path d="M2 9C2 9 4 3 9 3C14 3 16 9 16 9C16 9 14 15 9 15C4 15 2 9 2 9Z" stroke="currentColor" strokeWidth="1.5"/>
                                            <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={7}>
                                <div className={styles.empty}>
                                    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                                        <circle cx="24" cy="24" r="20" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4"/>
                                        <path d="M24 16V24M24 32H24.02" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <p>{searchQuery ? `No results for "${searchQuery}"` : 'No patients yet'}</p>
                                    <p className={styles.emptySubtitle}>Add a new patient to get started</p>
                                </div>
                            </td></tr>
                        )}
                        </tbody>
                    </table>
                    {filtered.length > 0 && <div className={styles.tableFooter}>Showing {filtered.length} of {patients.length} patients</div>}
                </div>
            </div>
        </div>
    );
}