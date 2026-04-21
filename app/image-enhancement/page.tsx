'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, Upload, Zap, ArrowLeft, Download, Info, CheckCircle2, User, Check } from 'lucide-react';
import s from './styles.module.css';
import ProgressBar from '@/components/progressBar';
import Navbar from '@/components/Navbar';
import { BASE } from '@/lib/api';

interface EnhanceResponse {
    success: boolean; original: string; enhanced: string;
    loading?: boolean; error?: string;
}

interface SavedImage {
    id: string; patientId: string; type: ScanType;
    date: string; label: string;
    originalSrc: string; enhancedSrc: string; isEnhanced: boolean;
}

type ScanType = 'Ultrasound' | 'CT Scan';

const SCAN_TYPES: { value: ScanType; color: string; bg: string; border: string }[] = [
    { value: 'Ultrasound', color: '#0D9488', bg: '#F0FDFA', border: '#99F6E4' },
    { value: 'CT Scan',    color: '#0891B2', bg: '#F0F9FF', border: '#BAE6FD' },
];

const PROCESS_STEPS = [
    { label: 'Analyzing',  threshold: 20  },
    { label: 'Upscaling',  threshold: 50  },
    { label: 'Enhancing',  threshold: 75  },
    { label: 'Sharpening', threshold: 90  },
    { label: 'Done',       threshold: 100 },
];

const fmtSize = (b: number) =>
    b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

function loadPatientImages(): Record<string, SavedImage[]> {
    try { return JSON.parse(localStorage.getItem('patient_images') || '{}'); }
    catch { return {}; }
}

function saveImageToPatient(mrn: string, image: SavedImage) {
    const all = loadPatientImages();
    all[mrn] = [image, ...(all[mrn] || [])];
    localStorage.setItem('patient_images', JSON.stringify(all));
}

export default function ImageEnhancementPage() {
    const router = useRouter();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview,      setPreview]      = useState('');
    const [originalSrc,  setOriginalSrc]  = useState('');
    const [enhancedSrc,  setEnhancedSrc]  = useState('');
    const [loading,      setLoading]      = useState(false);
    const [progress,     setProgress]     = useState(0);
    const [error,        setError]        = useState('');
    const [dragOver,     setDragOver]     = useState(false);

    const [allPatients,        setAllPatients]        = useState<{id:string; mrn:string; name:string}[]>([]);
    const [showSuggest,        setShowSuggest]        = useState(false);
    // selectedPatientRef now stores both id and mrn
    const [selectedPatientRef, setSelectedPatientRef] = useState<{id:string; mrn:string; name:string} | null>(null);

    const [patientId, setPatientId] = useState('');
    const [scanType,  setScanType]  = useState<ScanType>('Ultrasound');
    const [scanLabel, setScanLabel] = useState('');
    const [savedOk,   setSavedOk]   = useState(false);

    const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        if (!localStorage.getItem('token')) router.push('/log-in');
        try {
            const token = localStorage.getItem('token');
            fetch(`${BASE}/api/patients`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            }).then(r => r.json()).then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setAllPatients(data.data.map((p: any) => ({
                        id: p.id, mrn: p.mrn, name: `${p.firstName} ${p.lastName}`,
                    })));
                }
            }).catch(() => {});
        } catch {}
    }, []);

    const handleFile = (file: File) => {
        setSelectedFile(file); setOriginalSrc(''); setEnhancedSrc('');
        setError(''); setProgress(0); setSavedOk(false);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type.startsWith('image/')) handleFile(f);
    }, []);

    const clearTimers = () => { timerIds.current.forEach(clearTimeout); timerIds.current = []; };

    const simulateProgress = () => {
        clearTimers(); setProgress(0);
        [{ t:20, d:120 }, { t:50, d:350 }, { t:75, d:600 }, { t:90, d:900 }].forEach(({ t, d }) => {
            timerIds.current.push(setTimeout(() => setProgress(t), d));
        });
    };

    const handleEnhance = async () => {
        if (!selectedFile) return;
        setLoading(true); setError(''); setSavedOk(false); simulateProgress();

        const token = localStorage.getItem('token');
        const mrn   = selectedPatientRef?.mrn || patientId.trim();

        const fd = new FormData();
        fd.append('image', selectedFile);
        fd.append('image_type', scanType === 'Ultrasound' ? 'ultrasound' : 'ct');
        if (patientId.trim()) {
            fd.append('case_id', selectedPatientRef?.id || mrn);
        }

        try {
            const res  = await fetch(`${BASE}/api/enhance`, {
                method: 'POST',
                body: fd,
                headers: { Authorization: `Bearer ${token}` },
            });
            const data: EnhanceResponse = await res.json();
            if (res.status === 503 && data.loading) { setError('Model is loading, please try again in 30 seconds.'); return; }
            if (!res.ok) { setError(data.error || `Error ${res.status}`); return; }
            if (data.success) {
                clearTimers(); setProgress(100);
                setTimeout(async () => {
                    setOriginalSrc(data.original);
                    setEnhancedSrc(data.enhanced);
                    if (patientId.trim()) {
                        // Always use MRN as the key — fall back to whatever was typed if no patient was selected from dropdown
                        const img: SavedImage = {
                            id: `IMG-${Date.now()}`,
                            patientId: mrn,          // key is always MRN
                            type: scanType,
                            date: new Date().toISOString(),
                            label: scanLabel.trim() || `${scanType} scan`,
                            originalSrc: data.original,
                            enhancedSrc: data.enhanced,
                            isEnhanced: true,
                        };
                        saveImageToPatient(mrn, img);
                        setSavedOk(true);

                        // Save enhanced image to backend case record
                        try {
                            const patientDbId = selectedPatientRef?.id || mrn;
                            const casesRes = await fetch(
                                `${BASE}/api/cases?patient_id=${encodeURIComponent(patientDbId)}`,
                                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
                            );
                            if (casesRes.ok) {
                                const casesData = await casesRes.json();
                                const caseId = Array.isArray(casesData)
                                    ? casesData[0]?.id
                                    : (casesData?.id ?? casesData?.case_id);
                                if (caseId) {
                                    await fetch(`${BASE}/api/cases/${caseId}`, {
                                        method: 'PATCH',
                                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ enhanced_image_path: data.enhanced }),
                                    });
                                }
                            }
                        } catch {
                            // backend case update is non-fatal — localStorage save already succeeded
                        }
                    }
                }, 400);
            } else { setError(data.error || 'Enhancement failed.'); }
        } catch { setError('Failed to connect to server. Make sure Flask is running.'); }
        finally  { setLoading(false); }
    };

    const activeType = SCAN_TYPES.find(t => t.value === scanType)!;

    return (
        <div className={s.wrap}>
            <Navbar />
            <main className={s.main}>
                <div className={s.featureHeader}>
                    <Link href="/dashboard" className={s.backBtn}><ArrowLeft size={13} /> Dashboard</Link>
                    <div className={s.eyebrow}><span className={s.eyebrowDot} />AI-Powered</div>
                    <h1 className={s.pageTitle}>Image <em>Enhancement</em></h1>
                </div>

                <div className={s.contentGrid}>
                    <div>
                        {/* Patient & Scan Info */}
                        <div className={s.card} style={{ marginBottom: 16 }}>
                            <div className={s.cardHead}>
                                <div className={s.cardIcon} style={{ background: 'linear-gradient(135deg,#334155,#475569)' }}>
                                    <User size={18} color="white" />
                                </div>
                                <span className={s.cardTitle}>Patient & Scan Info</span>
                                <span className={s.optionalBadge}>Optional</span>
                            </div>
                            <div className={s.cardBody}>
                                <div className={s.fieldGroup} style={{ position:'relative' }}>
                                    <label className={s.fieldLabel}>Patient</label>
                                    <input
                                        className={s.fieldInput} type="text"
                                        placeholder="Search by name or MRN..."
                                        value={patientId} autoComplete="off"
                                        onChange={e => {
                                            setPatientId(e.target.value);
                                            setSelectedPatientRef(null);   // clear selection on manual edit
                                            setSavedOk(false);
                                            setShowSuggest(true);
                                        }}
                                        onFocus={() => setShowSuggest(true)}
                                        onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                                    />
                                    {showSuggest && patientId.trim() && (() => {
                                        const q = patientId.toLowerCase();
                                        const matches = allPatients.filter(p =>
                                            p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
                                        ).slice(0, 5);
                                        return matches.length > 0 ? (
                                            <div className={s.suggestDropdown}>
                                                {matches.map(p => (
                                                    <button key={p.id} className={s.suggestItem}
                                                            onMouseDown={() => {
                                                                // Show name in input, store full ref with mrn
                                                                setPatientId(p.mrn);
                                                                setSelectedPatientRef({ id: p.id, mrn: p.mrn, name: p.name });
                                                                setShowSuggest(false);
                                                                setSavedOk(false);
                                                            }}>
                                                        <span className={s.suggestName}>{p.name}</span>
                                                        <span className={s.suggestMrn}>{p.mrn}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null;
                                    })()}
                                    {/* Show selected patient name as confirmation */}
                                    {selectedPatientRef && (
                                        <p className={s.fieldHint}>
                                            ✓ {selectedPatientRef.name} — Image will be saved automatically after enhancement.
                                        </p>
                                    )}
                                    {!selectedPatientRef && patientId.trim() && (
                                        <p className={s.fieldHint}>Image will be saved automatically to this patient's record after enhancement.</p>
                                    )}
                                </div>

                                <div className={s.fieldGroup}>
                                    <label className={s.fieldLabel}>Scan Type</label>
                                    <div className={s.typeGrid}>
                                        {SCAN_TYPES.map(t => (
                                            <button key={t.value}
                                                    className={`${s.typeBtn} ${scanType === t.value ? s.typeBtnActive : ''}`}
                                                    style={scanType === t.value ? { background: t.bg, borderColor: t.border, color: t.color } : {}}
                                                    onClick={() => setScanType(t.value)}>
                                                {scanType === t.value && <Check size={12} />}
                                                {t.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={s.fieldGroup} style={{ marginBottom: 0 }}>
                                    <label className={s.fieldLabel}>Scan Label <span className={s.fieldOptional}>(optional)</span></label>
                                    <input className={s.fieldInput} type="text"
                                           placeholder="e.g. Right lobe longitudinal"
                                           value={scanLabel} onChange={e => setScanLabel(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Upload card */}
                        <div className={s.card}>
                            <div className={s.cardHead}>
                                <div className={s.cardIcon}><Camera size={18} color="white" /></div>
                                <span className={s.cardTitle}>Upload Scan</span>
                                <span className={s.scanTypePill} style={{ background: activeType.bg, color: activeType.color, borderColor: activeType.border }}>{scanType}</span>
                            </div>
                            <div className={s.cardBody}>
                                <div className={`${s.uploadZone} ${dragOver ? s.dragOver : ''}`}
                                     onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                     onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
                                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                                    {preview ? (
                                        <>
                                            <img src={preview} className={s.previewThumb} alt="preview" />
                                            <div className={s.fileName}>{selectedFile?.name}</div>
                                            {selectedFile && <div className={s.fileSize}>{fmtSize(selectedFile.size)}</div>}
                                        </>
                                    ) : (
                                        <>
                                            <div className={s.uploadIconWrap}><Upload size={24} /></div>
                                            <div className={s.uploadTitle}>Drop your {scanType} scan here</div>
                                            <div className={s.uploadSub}>or click to browse — PNG, JPG, DICOM</div>
                                        </>
                                    )}
                                </div>

                                <button className={s.enhanceBtn} onClick={handleEnhance} disabled={!selectedFile || loading}>
                                    {loading ? <><span className={s.btnSpinner} />Enhancing...</> : <><Zap size={15} />Enhance {scanType}</>}
                                </button>

                                {(loading || progress > 0) && (
                                    <div className={s.progressWrap}>
                                        <ProgressBar progress={progress} steps={PROCESS_STEPS} label="Processing" />
                                    </div>
                                )}

                                {error && (
                                    <div className={s.errorBox}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/>
                                            <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                {savedOk && (
                                    <div className={s.savedBox}>
                                        <Check size={14} />
                                        Saved to patient <strong>{selectedPatientRef?.name || patientId}</strong>
                                        {' '}({selectedPatientRef?.mrn || patientId})
                                        <button className={s.savedLink}
                                                onClick={() => router.push(
                                                    `/patient-management?patientId=${encodeURIComponent(selectedPatientRef?.mrn || patientId.trim())}&tab=images`
                                                )}>
                                            View →
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Results */}
                        {originalSrc && enhancedSrc && (
                            <div className={s.resultsSection}>
                                <div className={s.secHead}>
                                    <span className={s.secLabel}>Results</span>
                                    <div className={s.secLine} />
                                    <span className={s.secType} style={{ background: activeType.bg, color: activeType.color, borderColor: activeType.border }}>{scanType}</span>
                                </div>
                                <div className={s.resultsGrid}>
                                    <div className={s.imgCard}>
                                        <div className={s.imgHeader}><div className={s.imgDot} /><span className={s.imgLabel}>Original</span></div>
                                        <img src={originalSrc} alt="Original" className={s.imgResult} />
                                        <a href={originalSrc} download="original.png" className={s.downloadBtn}><Download size={12} /> Download Original</a>
                                    </div>
                                    <div className={`${s.imgCard} ${s.imgCardEnhanced}`}>
                                        <div className={s.imgHeader}>
                                            <div className={`${s.imgDot} ${s.imgDotTeal}`} />
                                            <span className={`${s.imgLabel} ${s.imgLabelTeal}`}>Enhanced</span>
                                            <span className={s.imgBadge}>AI</span>
                                        </div>
                                        <img src={enhancedSrc} alt="Enhanced" className={s.imgResult} />
                                        <a href={enhancedSrc} download="enhanced.png" className={`${s.downloadBtn} ${s.downloadBtnTeal}`}><Download size={12} /> Download Enhanced</a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className={s.sidebar}>
                        <div className={s.infoCard}>
                            <div className={s.infoCardHead}>
                                <div className={s.infoCardIcon} style={{ background:'rgba(13,148,136,.08)', border:'1px solid #CCFBF1' }}>
                                    <Zap size={14} color="var(--teal)" />
                                </div>
                                <span className={s.infoCardTitle}>How it works</span>
                            </div>
                            <div className={s.infoCardBody}>
                                <div className={s.howList}>
                                    {[
                                        { n:'1', t:'Patient Info', d:'Enter the Patient ID and select the scan type' },
                                        { n:'2', t:'Upload',       d:'Drop your Ultrasound or CT scan' },
                                        { n:'3', t:'Enhance',      d:'AI improves quality using deep learning' },
                                        { n:'4', t:'Auto-save',    d:'Image saved to patient record automatically' },
                                    ].map(st => (
                                        <div key={st.n} className={s.howItem}>
                                            <div className={s.howNum}>{st.n}</div>
                                            <div className={s.howText}><span className={s.howBold}>{st.t} — </span>{st.d}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={s.infoCard}>
                            <div className={s.infoCardHead}>
                                <div className={s.infoCardIcon} style={{ background:'rgba(8,145,178,.08)', border:'1px solid #BAE6FD' }}>
                                    <Info size={14} color="#0891B2" />
                                </div>
                                <span className={s.infoCardTitle}>Scan Types</span>
                            </div>
                            <div className={s.infoCardBody}>
                                <div className={s.scanTypeList}>
                                    {[
                                        { type:'Ultrasound', desc:'Thyroid nodule assessment & soft tissue imaging' },
                                        { type:'CT Scan',    desc:'Cross-sectional anatomy & lesion detection' },
                                    ].map(item => {
                                        const t = SCAN_TYPES.find(t => t.value === item.type)!;
                                        return (
                                            <div key={item.type} className={s.scanTypeItem}>
                                                <span className={s.scanTypeTag} style={{ background: t.bg, color: t.color, borderColor: t.border }}>{item.type}</span>
                                                <span className={s.scanTypeDesc}>{item.desc}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className={s.infoCard}>
                            <div className={s.infoCardHead}>
                                <div className={s.infoCardIcon} style={{ background:'rgba(13,148,136,.08)', border:'1px solid #CCFBF1' }}>
                                    <CheckCircle2 size={14} color="var(--teal)" />
                                </div>
                                <span className={s.infoCardTitle}>Best practices</span>
                            </div>
                            <div className={s.infoCardBody}>
                                <div className={s.tipsList}>
                                    {[
                                        'Use high-resolution scans for best results',
                                        'Ensure proper probe positioning before capture',
                                        'Avoid motion blur — hold still during imaging',
                                        'DICOM files preserve the most diagnostic detail',
                                    ].map((tip, i) => (
                                        <div key={i} className={s.tipItem}>
                                            <div className={s.tipDot} /><span className={s.tipText}>{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}