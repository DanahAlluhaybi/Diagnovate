'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Brain, Upload,
    AlertTriangle, CheckCircle2,
    Info, User, Check, Zap, FileText, Activity
} from 'lucide-react';
import s from './styles.module.css';
import Navbar from '@/components/Navbar';
import { BASE } from '@/lib/api';
import { saveDiagnosis } from '@/lib/diagnosisStorage';
import type { DiagnosisRecord } from '@/lib/diagnosisStorage';

type DiagStage  = 'idle' | 'uploading' | 'analyzing' | 'done';
type Severity   = 'Low' | 'Moderate' | 'High';

interface ModelResult {
    name      : string;
    result    : string;
    confidence: number;
    available : boolean;
}

interface DiagResult {
    malignancyScore : number;
    severity        : Severity;
    recommendation  : string;
    confidence      : number;
    findings        : string[];
    topModels       : ModelResult[];
    votingResult    : string;
    votingConfidence: number;
    noduleDetected? : boolean;
    bbox?           : number[];
}

// ── Typed API responses ──
interface UltrasoundApiResponse {
    success      : boolean;
    diagnosis    : 'Malignant' | 'Benign';
    severity     : string;
    confidence   : number;
    vote_summary : string;
    unanimous    : boolean;
    recommendation: string;
    models: Array<{ model: string; vote: 0 | 1; confidence?: number }>;
    disclaimer?  : string;
    error?       : string;
}

const PROCESS_STEPS = [
    { label: 'Uploading',  threshold: 15  },
    { label: 'Analyzing',  threshold: 50  },
    { label: 'Voting',     threshold: 85  },
    { label: 'Done',       threshold: 100 },
];

const SEVERITY_META: Record<Severity, { color: string; bg: string; border: string; icon: string }> = {
    Low:      { color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', icon: '●' },
    Moderate: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '◆' },
    High:     { color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3', icon: '▲' },
};

const fmtSize = (b: number) =>
    b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function AIDiagnosisPage() {
    const router = useRouter();

    const [stage,        setStage]        = useState<DiagStage>('idle');
    const [progress,     setProgress]     = useState(0);
    const [result,       setResult]       = useState<DiagResult | null>(null);
    const [error,        setError]        = useState('');
    const [imageFile,    setImageFile]    = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [dragOver,     setDragOver]     = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    // Patient autocomplete
    const [patientInput,    setPatientInput]    = useState('');
    const [selectedPatient, setSelectedPatient] = useState<{ id: string; mrn: string; name: string } | null>(null);
    const [allPatients,     setAllPatients]     = useState<{ id: string; mrn: string; name: string }[]>([]);
    const [showSuggest,     setShowSuggest]     = useState(false);
    const [savedOk,         setSavedOk]         = useState(false);

    const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

    // Fetch patients list + auth guard
    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/log-in?role=doctor'); return; }
        const token = localStorage.getItem('token');
        fetch(`${BASE}/api/patients`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
            .then(r => r.json())
            .then((data: { success: boolean; data: { id: string; mrn: string; firstName: string; lastName: string }[] }) => {
                if (data.success && Array.isArray(data.data)) {
                    setAllPatients(data.data.map(p => ({
                        id: p.id, mrn: p.mrn, name: `${p.firstName} ${p.lastName}`,
                    })));
                }
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup timers on unmount — FIXED: was missing
    useEffect(() => { return () => clearTimers(); }, []);

    const handleFile = (file: File) => {
        setImageFile(file); setImagePreview(''); setError('');
        const reader = new FileReader();
        reader.onload = e => setImagePreview(e.target?.result as string);
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
        [{ t: 15, d: 400 }, { t: 50, d: 1200 }, { t: 85, d: 2500 }]
            .forEach(({ t, d }) => { timerIds.current.push(setTimeout(() => setProgress(t), d)); });
    };

    const hasInput = !!imageFile;

    const runDiagnosis = async () => {
        if (!hasInput) return;
        setStage('uploading'); setResult(null); setError(''); setSavedOk(false);
        simulateProgress();

        try {
            const token = localStorage.getItem('token');
            await delay(400);
            setStage('analyzing');

            const formData = new FormData();
            formData.append('image', imageFile!);

            const res  = await fetch(`${BASE}/api/diagnosis/predict-image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json() as UltrasoundApiResponse;
            if (!res.ok || !data.success) throw new Error(data.error ?? 'Ultrasound analysis failed');

            console.log('IMAGE RESPONSE:', JSON.stringify(data));

            const models      = data.models || (data as any).models_detail || [];
            const effResult   = models[0];
            const swinResult  = models[1];
            const denseResult = models[2];

            const topModels: ModelResult[] = [
                {
                    name: 'EfficientNet+YOLO',
                    result: effResult ? (effResult.vote === 1 ? 'Malignant' : 'Benign') : '—',
                    confidence: effResult?.confidence ? Math.round(effResult.confidence * 100) : 0,
                    available: !!(effResult),
                },
                {
                    name: 'Swin Transformer',
                    result: swinResult ? (swinResult.vote === 1 ? 'Malignant' : 'Benign') : '—',
                    confidence: swinResult?.confidence ? Math.round(swinResult.confidence * 100) : 0,
                    available: !!(swinResult),
                },
                {
                    name: 'DenseNet-121',
                    result: denseResult ? (denseResult.vote === 1 ? 'Malignant' : 'Benign') : '—',
                    confidence: denseResult?.confidence ? Math.round(denseResult.confidence * 100) : 0,
                    available: !!(denseResult),
                },
            ];
            const votingResult     = data.diagnosis;
            const votingConfidence = Math.round(data.confidence);
            const malignancyScore  = data.diagnosis === 'Malignant'
                ? Math.round(data.confidence)
                : Math.round(100 - data.confidence);
            const severity: Severity = data.severity === 'high' ? 'High' : 'Low';

            const diagResult: DiagResult = {
                malignancyScore,
                severity,
                recommendation  : data.recommendation,
                confidence      : Math.round(data.confidence),
                findings: [
                    `Final Diagnosis: ${data.diagnosis}`,
                    `Vote Summary: ${data.vote_summary}`,
                    `Unanimous: ${data.unanimous ? 'Yes' : 'No'}`,
                    `Confidence: ${data.confidence}%`,
                ],
                topModels,
                votingResult,
                votingConfidence,
            };

            clearTimers(); setProgress(100);
            await delay(300);
            setResult(diagResult!);
            setStage('done');

            // ── Auto-save to patient IndexedDB — FIXED: actual save logic ──
            if (selectedPatient && diagResult) {
                const record: DiagnosisRecord = {
                    id             : `dx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    date           : new Date().toISOString(),
                    mode           : 'image',
                    modelName      : diagResult.topModels.find(m => m.available)?.name ?? 'Unknown',
                    votingResult   : diagResult.votingResult,
                    confidence     : diagResult.confidence,
                    severity       : diagResult.severity,
                    malignancyScore: diagResult.malignancyScore,
                    recommendation : diagResult.recommendation,
                    findings       : diagResult.findings,
                    topModels      : diagResult.topModels,
                };
                try {
                    await saveDiagnosis(selectedPatient.mrn, record);
                    setSavedOk(true);
                } catch (e) {
                    console.error('Failed to save diagnosis:', e);
                }
            }

        } catch (err: unknown) {
            clearTimers();
            setError(err instanceof Error ? err.message : 'Failed to connect to the diagnosis server.');
            setStage('idle');
        }
    };

    const reset = () => {
        setStage('idle'); setResult(null); setError('');
        setImageFile(null); setImagePreview(''); setProgress(0); setSavedOk(false);
    };

    const isRunning = stage === 'uploading' || stage === 'analyzing';
    const sev       = result ? SEVERITY_META[result.severity] : null;
    const currentStepLabel =
        stage === 'uploading' ? 'Uploading scan...' :
            stage === 'analyzing' ? 'Running AI models...' : '';

    // Filtered patient suggestions
    const patientSuggestions = (() => {
        if (!showSuggest || !patientInput.trim()) return [];
        const q = patientInput.toLowerCase();
        return allPatients.filter(p =>
            p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q)
        ).slice(0, 5);
    })();

    return (
        <div className={s.wrap}>
            <Navbar />
            <main className={s.main}>

                <div className={s.featureHeader}>
                    <Link href="/dashboard" className={s.backBtn}>
                        <ArrowLeft size={14} /><span>Back</span>
                    </Link>
                    <div className={s.eyebrow}>
                        <span className={s.eyebrowDot} />
                        AI-Powered Diagnosis
                    </div>
                    <h1 className={s.pageTitle}>
                        Thyroid Cancer<br />
                        <em>AI Diagnosis</em>
                    </h1>
                </div>

                <div className={s.contentGrid}>

                    {/* ════ LEFT ════ */}
                    <div>

                        {/* Patient */}
                        <div className={s.card} style={{ marginBottom: 16 }}>
                            <div className={s.cardHead}>
                                <div className={s.cardIcon} style={{ background: 'linear-gradient(135deg,#334155,#475569)' }}>
                                    <User size={18} color="white" />
                                </div>
                                <span className={s.cardTitle}>Patient</span>
                                <span className={s.optionalBadge}>Optional</span>
                            </div>
                            <div className={s.cardBody}>
                                <div className={s.fieldGroup} style={{ position: 'relative', marginBottom: 0 }}>
                                    <label className={s.fieldLabel}>Patient ID / MRN</label>
                                    <input
                                        className={s.fieldInput}
                                        type="text"
                                        placeholder="Search by name or MRN..."
                                        value={patientInput}
                                        autoComplete="off"
                                        onChange={e => {
                                            setPatientInput(e.target.value);
                                            setSelectedPatient(null);
                                            setShowSuggest(true);
                                            setSavedOk(false);
                                        }}
                                        onFocus={() => setShowSuggest(true)}
                                        onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                                    />
                                    {patientSuggestions.length > 0 && (
                                        <div className={s.suggestDropdown}>
                                            {patientSuggestions.map(p => (
                                                <button key={p.id} className={s.suggestItem}
                                                        onMouseDown={() => {
                                                            setPatientInput(p.name);
                                                            setSelectedPatient(p);
                                                            setShowSuggest(false);
                                                        }}>
                                                    <span className={s.suggestName}>{p.name}</span>
                                                    <span className={s.suggestMrn}>{p.mrn}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {selectedPatient && (
                                        <p className={s.fieldHint}>
                                            ✓ Diagnosis will be auto-saved to <strong>{selectedPatient.name}</strong>&apos;s record.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Scan Upload */}
                        <div className={s.card} style={{ marginBottom: 16 }}>
                            <div className={s.cardHead}>
                                <div className={s.cardIcon}>
                                    <Upload size={18} color="white" />
                                </div>
                                <span className={s.cardTitle}>Thyroid Scan</span>
                                <span className={s.scanTypePill} style={{ background: '#F0F9FF', color: '#0891B2', borderColor: '#BAE6FD' }}>
                                    Image Only
                                </span>
                            </div>
                            <div className={s.cardBody}>
                                <div className={s.fieldGroup} style={{ marginBottom: 0 }}>
                                    <label className={s.fieldLabel}>
                                        Medical Scan <span className={s.fieldOptional}>(Ultrasound / CT)</span>
                                    </label>
                                    <div
                                        className={`${s.uploadZone} ${dragOver ? s.dragOver : ''}`}
                                        style={imagePreview ? { padding: '12px' } : {}}
                                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={handleDrop}
                                        onClick={() => fileRef.current?.click()}
                                    >
                                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                                               onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                                        {imagePreview ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={imagePreview} className={s.previewThumb} alt="Scan preview" />
                                                <div className={s.fileName}>{imageFile?.name}</div>
                                                {imageFile && <div className={s.fileSize}>{fmtSize(imageFile.size)}</div>}
                                            </>
                                        ) : (
                                            <>
                                                <div className={s.uploadIconWrap}><Upload size={22} /></div>
                                                <div className={s.uploadTitle}>Drop thyroid scan here</div>
                                                <div className={s.uploadSub}>PNG, JPG, DICOM — max 20 MB</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Run button */}
                        <button
                            className={`${s.enhanceBtn} ${isRunning ? s.enhanceBtnLoading : ''}`}
                            onClick={stage === 'done' ? reset : runDiagnosis}
                            disabled={isRunning || (!hasInput && stage === 'idle')}
                        >
                            {isRunning ? (
                                <><span className={s.btnSpinner} />{currentStepLabel}</>
                            ) : stage === 'done' ? (
                                <><Brain size={15} />New Diagnosis</>
                            ) : (
                                <><Brain size={15} />Run AI Diagnosis</>
                            )}
                        </button>

                        {(isRunning || (progress > 0 && stage !== 'done')) && (
                            <div className={s.progressWrap}>
                                <div className={s.progressTrack}>
                                    <div className={s.progressFill} style={{ width: `${progress}%` }} />
                                </div>
                                <div className={s.progressSteps}>
                                    {PROCESS_STEPS.map(st => (
                                        <span key={st.label}
                                              className={`${s.progressStep} ${progress >= st.threshold ? s.progressStepDone : ''}`}>
                                            {st.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className={s.errorBox}>
                                <AlertTriangle size={14} />{error}
                            </div>
                        )}

                        {savedOk && selectedPatient && (
                            <div className={s.savedBox}>
                                <Check size={14} />
                                Saved to <strong>{selectedPatient.name}</strong>
                                <Link href={`/patient-management?patientId=${selectedPatient.mrn}&tab=diagnosis`} className={s.savedLink}>
                                    View record →
                                </Link>
                            </div>
                        )}

                        {/* ════ RESULTS ════ */}
                        {result && sev && (
                            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>

                                <div className={s.resultCard} style={{ borderColor: sev.border }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: sev.bg, borderBottom: `1px solid ${sev.border}` }}>
                                        <div>
                                            <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.6px', textTransform: 'uppercase', color: sev.color, marginBottom: 6 }}>Malignancy Score</p>
                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                                <span style={{ fontSize: 48, fontWeight: 800, color: sev.color, lineHeight: 1 }}>{result.malignancyScore}</span>
                                                <span style={{ fontSize: 16, color: '#94a3b8', fontWeight: 500 }}>/100</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 20, border: `1px solid ${sev.border}`, background: sev.color + '18', color: sev.color, fontSize: 13, fontWeight: 800, marginBottom: 8 }}>
                                                {sev.icon} {result.severity} Risk
                                            </div>
                                            <p style={{ fontSize: 13, color: '#64748b' }}>Confidence: <strong style={{ color: sev.color }}>{result.confidence}%</strong></p>
                                        </div>
                                    </div>
                                    <div style={{ padding: '12px 24px' }}>
                                        <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${result.malignancyScore}%`, background: sev.color, borderRadius: 99, transition: 'width .8s cubic-bezier(.16,1,.3,1)' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className={s.infoCard}>
                                        <div className={s.infoCardHead}>
                                            <div className={s.infoCardIcon}><Activity size={14} /></div>
                                            <span className={s.infoCardTitle}>Top Models</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {result.topModels.map((m: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 18px', borderBottom: i < result.topModels.length - 1 ? '1px solid #f1f5f9' : 'none', opacity: m.available ? 1 : 0.4 }}>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>Model {i + 1}: {m.name}</div>
                                                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{m.available ? `Result: ${m.result}` : 'Not available yet'}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        {m.available ? (
                                                            <>
                                                                <div style={{ fontSize: 15, fontWeight: 800, color: sev.color }}>{m.confidence}%</div>
                                                                <div style={{ fontSize: 11, color: '#94a3b8' }}>confidence</div>
                                                            </>
                                                        ) : (
                                                            <span style={{ fontSize: 18, color: '#cbd5e1' }}>—</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={s.infoCard} style={{ borderColor: sev.border }}>
                                        <div className={s.infoCardHead} style={{ background: sev.bg, borderBottom: `1px solid ${sev.border}` }}>
                                            <div className={s.infoCardIcon} style={{ background: sev.color + '18', border: `1px solid ${sev.border}` }}><CheckCircle2 size={14} color={sev.color} /></div>
                                            <span className={s.infoCardTitle} style={{ color: sev.color }}>Majority Voting</span>
                                        </div>
                                        <div style={{ padding: '24px 18px', background: sev.bg, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                                            <div>
                                                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: sev.color, marginBottom: 6 }}>Result</p>
                                                <p style={{ fontSize: 28, fontWeight: 800, color: sev.color, fontFamily: 'var(--font-display)' }}>{result.votingResult}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: sev.color, marginBottom: 6 }}>Confidence</p>
                                                <p style={{ fontSize: 28, fontWeight: 800, color: sev.color, fontFamily: 'var(--font-display)' }}>{result.votingConfidence}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={s.infoCard}>
                                    <div className={s.infoCardHead}>
                                        <div className={s.infoCardIcon}><FileText size={14} /></div>
                                        <span className={s.infoCardTitle}>Key Findings</span>
                                    </div>
                                    <div style={{ padding: '4px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                                        {result.findings.map((f: string, i: number) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 18px', borderBottom: i < result.findings.length - 2 ? '1px solid #f1f5f9' : 'none' }}>
                                                <div style={{ width: 7, height: 7, borderRadius: '50%', background: sev.color, flexShrink: 0, marginTop: 5 }} />
                                                <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={s.infoCard} style={{ borderColor: sev.border }}>
                                    <div className={s.infoCardHead} style={{ background: sev.bg, borderBottom: `1px solid ${sev.border}` }}>
                                        <div className={s.infoCardIcon} style={{ background: sev.color + '18', border: `1px solid ${sev.border}` }}><CheckCircle2 size={14} color={sev.color} /></div>
                                        <span className={s.infoCardTitle} style={{ color: sev.color }}>Recommendation</span>
                                    </div>
                                    <div style={{ padding: '16px 18px' }}>
                                        <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, fontWeight: 500 }}>{result.recommendation}</p>
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* ════ RIGHT SIDEBAR ════ */}
                    <div className={s.sidebar}>

                        {!result && stage === 'idle' && (
                            <div className={s.infoCard}>
                                <div className={s.emptyState}>
                                    <div className={s.emptyIcon}><Brain size={28} /></div>
                                    <p className={s.emptyText}>
                                        Submit patient data to begin AI-assisted thyroid cancer diagnosis
                                    </p>
                                </div>
                            </div>
                        )}

                        {isRunning && (
                            <div className={s.infoCard}>
                                <div className={s.analyzingState}>
                                    <div className={s.analyzingRing}>
                                        <div className={s.analyzingInner}><Brain size={20} /></div>
                                    </div>
                                    <p className={s.analyzingText}>{currentStepLabel}</p>
                                    <p className={s.analyzingSubtext}>Running AI models...</p>
                                </div>
                            </div>
                        )}

                        {/* How it works */}
                        {!result && (
                            <div className={s.infoCard}>
                                <div className={s.infoCardHead}>
                                    <div className={s.infoCardIcon} style={{ background: 'rgba(13,148,136,.08)', border: '1px solid #CCFBF1' }}>
                                        <Zap size={14} color="var(--teal)" />
                                    </div>
                                    <span className={s.infoCardTitle}>How it works</span>
                                </div>
                                <div className={s.infoCardBody}>
                                    <div className={s.howList}>
                                        {[
                                            { n: '1', t: 'Patient',       d: 'Select patient to auto-save results to their record' },
                                            { n: '2', t: 'Input',         d: 'Upload a scan, enter lab values, or both' },
                                            { n: '3', t: 'Multi-Model',   d: 'Multiple AI models analyze your input' },
                                            { n: '4', t: 'Majority Vote', d: 'Models vote to produce a final diagnosis' },
                                        ].map(st => (
                                            <div key={st.n} className={s.howItem}>
                                                <div className={s.howNum}>{st.n}</div>
                                                <div className={s.howText}>
                                                    <span className={s.howBold}>{st.t} — </span>{st.d}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={s.infoCard}>
                            <div className={s.infoCardHead}>
                                <div className={s.infoCardIcon} style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                                    <Info size={14} color="#D97706" />
                                </div>
                                <span className={s.infoCardTitle}>Clinical Disclaimer</span>
                            </div>
                            <div className={s.infoCardBody}>
                                <p className={s.disclaimerText}>
                                    This AI system is a <strong>clinical decision support tool</strong> intended
                                    to assist qualified medical professionals. Results must be interpreted by
                                    a licensed clinician and should not replace histological confirmation or
                                    specialist judgment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}