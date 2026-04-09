'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Brain, Upload, FlaskConical, Layers,
    Download, AlertTriangle, CheckCircle2,
    Info, User, Check, Zap, FileText
} from 'lucide-react';
import s from './styles.module.css';
import Navbar from '@/components/Navbar';

type InputMode  = 'image' | 'lab' | 'both';
type AIModel    = 'Auto' | 'CNN' | 'RandomForest' | 'DecisionTree';
type DiagStage  = 'idle' | 'uploading' | 'enhancing' | 'analyzing' | 'done';
type Severity   = 'Low' | 'Moderate' | 'High';

interface LabValues {
    tsh: string; t3: string; tt4: string;
    t4u: string; fti: string; age: string; sex: 'female' | 'male';
}

interface DiagResult {
    malignancyScore : number;
    severity        : Severity;
    recommendation  : string;
    modelUsed       : string;
    confidence      : number;
    findings        : string[];
}

const MODELS: { value: AIModel; desc: string }[] = [
    { value: 'Auto',         desc: 'Selects the best model based on available inputs' },
    { value: 'CNN',          desc: 'Deep learning — optimized for scan image analysis' },
    { value: 'RandomForest', desc: 'Ensemble method — best for structured lab data'   },
    { value: 'DecisionTree', desc: 'Interpretable rule-based clinical decision tree'  },
];

const PROCESS_STEPS = [
    { label: 'Uploading',  threshold: 15  },
    { label: 'Enhancing',  threshold: 40  },
    { label: 'Extracting', threshold: 65  },
    { label: 'Analyzing',  threshold: 85  },
    { label: 'Done',       threshold: 100 },
];

const SEVERITY_META: Record<Severity, { color: string; bg: string; border: string; icon: string }> = {
    Low:      { color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', icon: '●' },
    Moderate: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '◆' },
    High:     { color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3', icon: '▲' },
};

const REC_MAP: Record<string, string> = {
    'Hypothyroidism':  'Hypothyroidism detected. Thyroid hormone replacement therapy may be indicated. Consult an endocrinologist.',
    'Hyperthyroidism': 'Hyperthyroidism detected. Anti-thyroid medication or radioiodine therapy may be required. Specialist referral recommended.',
    'Normal':          'Thyroid function appears normal. Routine annual follow-up is recommended.',
};

const fmtSize = (b: number) =>
    b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function AIDiagnosisPage() {
    const router = useRouter();

    const [inputMode,     setInputMode]     = useState<InputMode>('both');
    const [selectedModel, setSelectedModel] = useState<AIModel>('Auto');
    const [stage,         setStage]         = useState<DiagStage>('idle');
    const [progress,      setProgress]      = useState(0);
    const [result,        setResult]        = useState<DiagResult | null>(null);
    const [error,         setError]         = useState('');
    const [imageFile,     setImageFile]     = useState<File | null>(null);
    const [imagePreview,  setImagePreview]  = useState('');
    const [dragOver,      setDragOver]      = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [patientId,     setPatientId]     = useState('');
    const [allPatients,   setAllPatients]   = useState<{ id: string; mrn: string; name: string }[]>([]);
    const [showSuggest,   setShowSuggest]   = useState(false);
    const [savedOk,       setSavedOk]       = useState(false);
    const [lab, setLab] = useState<LabValues>({
        tsh: '', t3: '', tt4: '', t4u: '', fti: '', age: '', sex: 'female',
    });
    const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        if (!localStorage.getItem('token')) router.push('/log-in');
        try {
            const token = localStorage.getItem('token');
            fetch('http://localhost:5002/api/patients', {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success && Array.isArray(data.data)) {
                        setAllPatients(data.data.map((p: any) => ({
                            id: p.id, mrn: p.mrn, name: `${p.firstName} ${p.lastName}`,
                        })));
                    }
                })
                .catch(() => {});
        } catch {}
    }, []);

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
        [{ t: 15, d: 300 }, { t: 40, d: 700 }, { t: 65, d: 1400 }, { t: 85, d: 2200 }]
            .forEach(({ t, d }) => { timerIds.current.push(setTimeout(() => setProgress(t), d)); });
    };

    const hasInput =
        (inputMode !== 'lab'   && !!imageFile) ||
        (inputMode !== 'image' && (!!lab.tsh || !!lab.t3 || !!lab.tt4));


    //  الباك اند ي

    const runDiagnosis = async () => {
        if (!hasInput) return;
        setStage('uploading'); setResult(null); setError(''); setSavedOk(false);
        simulateProgress();

        try {
            const token = localStorage.getItem('token');

            await delay(600);  setStage('enhancing');
            await delay(900);  setStage('analyzing');

            // ──
            const payload = {
                age:                 lab.age  ? Number(lab.age)  : null,
                sex:                 lab.sex === 'female' ? 'F' : 'M',

                // قيم اللاب + measured flags
                TSH_measured:        lab.tsh  ? 't' : 'f',
                TSH:                 lab.tsh  ? Number(lab.tsh)  : null,
                T3_measured:         lab.t3   ? 't' : 'f',
                T3:                  lab.t3   ? Number(lab.t3)   : null,
                TT4_measured:        lab.tt4  ? 't' : 'f',
                TT4:                 lab.tt4  ? Number(lab.tt4)  : null,
                T4U_measured:        lab.t4u  ? 't' : 'f',
                T4U:                 lab.t4u  ? Number(lab.t4u)  : null,
                FTI_measured:        lab.fti  ? 't' : 'f',
                FTI:                 lab.fti  ? Number(lab.fti)  : null,
                TBG_measured:        'f',
                TBG:                 null,

                //الأعمدة الطبيه
                on_thyroxine:        'f',
                query_on_thyroxine:  'f',
                on_antithyroid_meds: 'f',
                sick:                'f',
                pregnant:            'f',
                thyroid_surgery:     'f',
                I131_treatment:      'f',
                query_hypothyroid:   'f',
                query_hyperthyroid:  'f',
                lithium:             'f',
                goitre:              'f',
                tumor:               'f',
                hypopituitary:       'f',
                psych:               'f',
            };

            const res = await fetch('http://localhost:5002/api/diagnosis/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:  `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Prediction failed');
            }

            // ── تحويل severity من الباك اند  ──
            const severityMap: Record<string, Severity> = {
                high:   'High',
                medium: 'Moderate',
                low:    'Low',
            };

            // ─findings
            const findings: string[] = [
                `Primary Diagnosis: ${data.diagnosis}`,
                ...(lab.tsh  ? [`TSH: ${lab.tsh} mIU/L`]  : []),
                ...(lab.t3   ? [`T3: ${lab.t3} nmol/L`]   : []),
                ...(lab.tt4  ? [`TT4: ${lab.tt4} nmol/L`] : []),
                ...(lab.t4u  ? [`T4U: ${lab.t4u} ratio`]  : []),
                ...(lab.fti  ? [`FTI: ${lab.fti} index`]  : []),
                ...Object.entries(data.probabilities || {}).map(
                    ([k, v]) => `${k}: ${v}% probability`
                ),
            ];

            clearTimers(); setProgress(100);
            await delay(300);

            setResult({
                malignancyScore: Math.round(data.confidence),
                severity:        severityMap[data.severity] ?? 'Moderate',
                recommendation:  REC_MAP[data.diagnosis] ?? `Diagnosis: ${data.diagnosis}. Please consult a specialist.`,
                modelUsed:       'XGBoost',
                confidence:      data.confidence,
                findings,
            });

            setStage('done');
            if (patientId.trim()) setSavedOk(true);

        } catch (err: any) {
            clearTimers();
            setError(err.message || 'Failed to connect to the diagnosis server. Make sure the backend is running.');
            setStage('idle');
        }
    };

    const reset = () => {
        setStage('idle'); setResult(null); setError('');
        setImageFile(null); setImagePreview(''); setProgress(0); setSavedOk(false);
        setLab({ tsh: '', t3: '', tt4: '', t4u: '', fti: '', age: '', sex: 'female' });
    };

    const isRunning = stage === 'uploading' || stage === 'enhancing' || stage === 'analyzing';
    const sev       = result ? SEVERITY_META[result.severity] : null;
    const currentStepLabel =
        stage === 'uploading' ? 'Uploading scan...'    :
            stage === 'enhancing' ? 'Enhancing image...'   :
                stage === 'analyzing' ? 'Running AI models...' : '';

    return (
        <div className={s.wrap}>
            <Navbar />
            <main className={s.main}>

                <div className={s.featureHeader}>
                    <Link href="/dashboard" className={s.backBtn}>
                        <ArrowLeft size={13} /> Dashboard
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
                                        value={patientId}
                                        autoComplete="off"
                                        onChange={e => { setPatientId(e.target.value); setShowSuggest(true); setSavedOk(false); }}
                                        onFocus={() => setShowSuggest(true)}
                                        onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                                    />
                                    {showSuggest && patientId.trim() && (() => {
                                        const q = patientId.toLowerCase();
                                        const matches = allPatients.filter(p =>
                                            p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q)
                                        ).slice(0, 5);
                                        return matches.length > 0 ? (
                                            <div className={s.suggestDropdown}>
                                                {matches.map(p => (
                                                    <button key={p.id} className={s.suggestItem}
                                                            onMouseDown={() => { setPatientId(p.mrn); setShowSuggest(false); }}>
                                                        <span className={s.suggestName}>{p.name}</span>
                                                        <span className={s.suggestMrn}>{p.mrn}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null;
                                    })()}
                                    {patientId.trim() && (
                                        <p className={s.fieldHint}>Diagnosis result will be saved to this patient's record.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Input Data */}
                        <div className={s.card} style={{ marginBottom: 16 }}>
                            <div className={s.cardHead}>
                                <div className={s.cardIcon}>
                                    <Layers size={18} color="white" />
                                </div>
                                <span className={s.cardTitle}>Input Data</span>
                                <span className={s.scanTypePill} style={
                                    inputMode === 'both'  ? { background: '#EEF2FF', color: '#4F46E5', borderColor: '#C7D2FE' } :
                                        inputMode === 'image' ? { background: '#F0F9FF', color: '#0891B2', borderColor: '#BAE6FD' } :
                                            { background: '#F0FDFA', color: '#0D9488', borderColor: '#99F6E4' }
                                }>
                                    {inputMode === 'both' ? 'Multi-Modal' : inputMode === 'image' ? 'Image Only' : 'Lab Only'}
                                </span>
                            </div>
                            <div className={s.cardBody}>
                                <div className={s.fieldGroup}>
                                    <label className={s.fieldLabel}>Diagnosis Mode</label>
                                    <div className={s.modeGrid}>
                                        {([
                                            { v: 'image', icon: <Upload size={13} />,      label: 'Image Only'  },
                                            { v: 'lab',   icon: <FlaskConical size={13} />, label: 'Lab Only'    },
                                            { v: 'both',  icon: <Zap size={13} />,          label: 'Both (Best)' },
                                        ] as const).map(m => (
                                            <button key={m.v}
                                                    className={`${s.typeBtn} ${inputMode === m.v ? s.typeBtnActive : ''}`}
                                                    style={inputMode === m.v ? (
                                                        m.v === 'both'  ? { background: '#EEF2FF', borderColor: '#C7D2FE', color: '#4F46E5' } :
                                                            m.v === 'image' ? { background: '#F0F9FF', borderColor: '#BAE6FD', color: '#0891B2' } :
                                                                { background: '#F0FDFA', borderColor: '#99F6E4', color: '#0D9488' }
                                                    ) : {}}
                                                    onClick={() => setInputMode(m.v)}
                                            >
                                                {inputMode === m.v && <Check size={11} />}
                                                {m.icon}{m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(inputMode === 'image' || inputMode === 'both') && (
                                    <div className={s.fieldGroup}>
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
                                )}

                                {(inputMode === 'lab' || inputMode === 'both') && (
                                    <div className={s.fieldGroup} style={{ marginBottom: 0 }}>
                                        <label className={s.fieldLabel}>Lab Results</label>
                                        <div className={s.labGrid}>
                                            {([
                                                { k: 'tsh', label: 'TSH', unit: 'mIU/L', normal: '0.4–4.0' },
                                                { k: 't3',  label: 'T3',  unit: 'nmol/L',normal: '1.2–2.8' },
                                                { k: 'tt4', label: 'TT4', unit: 'nmol/L',normal: '60–150'  },
                                                { k: 't4u', label: 'T4U', unit: 'ratio', normal: '0.8–1.1' },
                                                { k: 'fti', label: 'FTI', unit: 'index', normal: '55–160'  },
                                                { k: 'age', label: 'Age', unit: 'yrs',   normal: ''        },
                                            ] as const).map(({ k, label, unit, normal }) => (
                                                <div key={k} className={s.labCell}>
                                                    <div className={s.labCellHeader}>
                                                        <span className={s.labCellLabel}>{label}</span>
                                                        {normal && <span className={s.labCellNormal}>{normal}</span>}
                                                    </div>
                                                    <div className={s.labCellInputWrap}>
                                                        <input
                                                            type="number" placeholder="—"
                                                            value={lab[k]}
                                                            onChange={e => setLab(prev => ({ ...prev, [k]: e.target.value }))}
                                                            className={s.labCellInput}
                                                        />
                                                        <span className={s.labCellUnit}>{unit}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className={s.sexRow}>
                                            <span className={s.fieldLabel} style={{ margin: 0 }}>Sex</span>
                                            <div className={s.sexBtns}>
                                                {(['female', 'male'] as const).map(sx => (
                                                    <button key={sx}
                                                            className={`${s.typeBtn} ${lab.sex === sx ? s.typeBtnActive : ''}`}
                                                            style={lab.sex === sx
                                                                ? { background: '#F0FDFA', borderColor: '#99F6E4', color: '#0D9488' }
                                                                : {}}
                                                            onClick={() => setLab(p => ({ ...p, sex: sx }))}
                                                    >
                                                        {lab.sex === sx && <Check size={11} />}
                                                        {sx === 'female' ? '♀ Female' : '♂ Male'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Model */}
                        <div className={s.card} style={{ marginBottom: 16 }}>
                            <div className={s.cardHead}>
                                <div className={s.cardIcon} style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)' }}>
                                    <Brain size={18} color="white" />
                                </div>
                                <span className={s.cardTitle}>AI Model</span>
                                <span className={s.optionalBadge}>
                                    {selectedModel === 'Auto' ? 'Auto-selected' : selectedModel}
                                </span>
                            </div>
                            <div className={s.cardBody} style={{ paddingBottom: 20 }}>
                                <div className={s.modelGrid}>
                                    {MODELS.map(m => (
                                        <button key={m.value}
                                                className={`${s.modelBtn} ${selectedModel === m.value ? s.modelBtnActive : ''}`}
                                                onClick={() => setSelectedModel(m.value)}
                                        >
                                            <div className={s.modelBtnTop}>
                                                {selectedModel === m.value
                                                    ? <Check size={12} className={s.modelCheck} />
                                                    : <div className={s.modelRadio} />
                                                }
                                                <span className={s.modelName}>
                                                    {m.value === 'Auto' ? '✦ Auto Select' : m.value}
                                                </span>
                                            </div>
                                            <p className={s.modelDesc}>{m.desc}</p>
                                        </button>
                                    ))}
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

                        {savedOk && (
                            <div className={s.savedBox}>
                                <Check size={14} />
                                Result saved to patient <strong>{patientId}</strong>
                                <Link href={`/patient-management?patientId=${patientId}&tab=diagnosis`} className={s.savedLink}>
                                    View →
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ════ RIGHT ════ */}
                    <div className={s.sidebar}>

                        {stage === 'idle' && !result && (
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
                                    <p className={s.analyzingSubtext}>
                                        Processing with {selectedModel === 'Auto' ? 'auto-selected model' : selectedModel}
                                    </p>
                                </div>
                            </div>
                        )}

                        {result && sev && (
                            <>
                                <div className={s.resultCard} style={{ borderColor: sev.border }}>
                                    <div className={s.resultCardHead} style={{ background: sev.bg }}>
                                        <div>
                                            <p className={s.resultCardLabel}>Malignancy Score</p>
                                            <div className={s.resultScoreRow}>
                                                <span className={s.resultScore} style={{ color: sev.color }}>
                                                    {result.malignancyScore}
                                                </span>
                                                <span className={s.resultScoreMax}>/100</span>
                                            </div>
                                        </div>
                                        <div className={s.resultSeverityBadge}
                                             style={{ background: sev.color + '18', color: sev.color, borderColor: sev.border }}>
                                            {sev.icon} {result.severity} Risk
                                        </div>
                                    </div>
                                    <div className={s.resultScoreBar}>
                                        <div className={s.resultScoreTrack}>
                                            <div className={s.resultScoreFill}
                                                 style={{ width: `${result.malignancyScore}%`, background: sev.color }} />
                                        </div>
                                    </div>
                                    <div className={s.resultMeta}>
                                        <span>Model: <strong>{result.modelUsed}</strong></span>
                                        <span className={s.resultConf}>{result.confidence}% confidence</span>
                                    </div>
                                </div>

                                <div className={s.infoCard}>
                                    <div className={s.infoCardHead}>
                                        <div className={s.infoCardIcon}
                                             style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                                            <FileText size={14} color={sev.color} />
                                        </div>
                                        <span className={s.infoCardTitle}>Key Findings</span>
                                    </div>
                                    <div className={s.infoCardBody}>
                                        <div className={s.findingsList}>
                                            {result.findings.map((f, i) => (
                                                <div key={i} className={s.findingItem}>
                                                    <div className={s.findingDot} style={{ background: sev.color }} />
                                                    <span className={s.findingText}>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={s.infoCard} style={{ borderColor: sev.border }}>
                                    <div className={s.infoCardHead}>
                                        <div className={s.infoCardIcon}
                                             style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                                            <CheckCircle2 size={14} color={sev.color} />
                                        </div>
                                        <span className={s.infoCardTitle}>Recommendation</span>
                                    </div>
                                    <div className={s.infoCardBody}>
                                        <p className={s.recommendText}>{result.recommendation}</p>
                                    </div>
                                </div>

                                <button className={s.downloadReportBtn}>
                                    <Download size={14} /> Download PDF Report
                                </button>
                            </>
                        )}

                        {!result && (
                            <div className={s.infoCard}>
                                <div className={s.infoCardHead}>
                                    <div className={s.infoCardIcon}
                                         style={{ background: 'rgba(13,148,136,.08)', border: '1px solid #CCFBF1' }}>
                                        <Zap size={14} color="var(--teal)" />
                                    </div>
                                    <span className={s.infoCardTitle}>How it works</span>
                                </div>
                                <div className={s.infoCardBody}>
                                    <div className={s.howList}>
                                        {[
                                            { n: '1', t: 'Patient', d: 'Enter Patient ID to auto-save results to their record' },
                                            { n: '2', t: 'Input',   d: 'Upload a scan, enter lab values, or both' },
                                            { n: '3', t: 'Model',   d: 'AI selects the best diagnostic model for your inputs' },
                                            { n: '4', t: 'Results', d: 'Get malignancy score, findings & clinical recommendations' },
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