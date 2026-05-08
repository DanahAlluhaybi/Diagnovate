'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Brain, Upload, FlaskConical, Layers,
    AlertTriangle, CheckCircle2,
    Info, User, Check, Zap, FileText, Activity
} from 'lucide-react';
import s from './styles.module.css';
import Navbar from '@/components/Navbar';
import { BASE } from '@/lib/api';
import { saveDiagnosis } from '@/lib/diagnosisStorage';
import type { DiagnosisRecord } from '@/lib/diagnosisStorage';

type InputMode  = 'image' | 'lab' | 'both';
type DiagStage  = 'idle' | 'uploading' | 'analyzing' | 'done';
type Severity   = 'Low' | 'Moderate' | 'High';
type RiskLevel  = 'low' | 'intermediate' | 'high';

interface LabValues {
    tsh: string; t3: string; tt4: string;
    t4u: string; fti: string; age: string; sex: 'female' | 'male';
}

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
interface LabApiResponse {
    success      : boolean;
    diagnosis    : string;
    majority_result?: string;
    confidence   : number;
    severity     : string;
    probabilities: Record<string, number>;
    models?      : Record<string, { result: string; confidence: number }>;
    error?       : string;
}

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

function majorityVote(models: ModelResult[]): { result: string; confidence: number } {
    const available = models.filter(m => m.available);
    if (available.length === 0) return { result: 'Inconclusive', confidence: 0 };
    const votes: Record<string, number[]> = {};
    for (const m of available) {
        if (!votes[m.result]) votes[m.result] = [];
        votes[m.result].push(m.confidence);
    }
    let winner = '', maxScore = -1;
    for (const [res, confs] of Object.entries(votes)) {
        const score = confs.length * 1000 + confs.reduce((a, b) => a + b, 0) / confs.length;
        if (score > maxScore) { maxScore = score; winner = res; }
    }
    const avgConf = votes[winner].reduce((a, b) => a + b, 0) / votes[winner].length;
    return { result: winner, confidence: Math.round(avgConf) };
}

function buildLabPayload(lab: LabValues, selectedModel: string) {
    const modelName =
        selectedModel === 'majority' ? 'majority voting' : selectedModel;

    return {
        model:             modelName,
        age:               lab.age  ? Number(lab.age)  : null,
        sex:               lab.sex === 'female' ? 'F' : 'M',
        TSH_measured:      lab.tsh  ? 't' : 'f', TSH:  lab.tsh  ? Number(lab.tsh)  : null,
        T3_measured:       lab.t3   ? 't' : 'f', T3:   lab.t3   ? Number(lab.t3)   : null,
        TT4_measured:      lab.tt4  ? 't' : 'f', TT4:  lab.tt4  ? Number(lab.tt4)  : null,
        T4U_measured:      lab.t4u  ? 't' : 'f', T4U:  lab.t4u  ? Number(lab.t4u)  : null,
        FTI_measured:      lab.fti  ? 't' : 'f', FTI:  lab.fti  ? Number(lab.fti)  : null,
        TBG_measured: 'f', TBG: null,
        on_thyroxine: 'f', query_on_thyroxine: 'f', on_antithyroid_meds: 'f',
        sick: 'f', pregnant: 'f', thyroid_surgery: 'f', I131_treatment: 'f',
        query_hypothyroid: 'f', query_hyperthyroid: 'f', lithium: 'f',
        goitre: 'f', tumor: 'f', hypopituitary: 'f', psych: 'f',
    };
}

export default function AIDiagnosisPage() {
    const router = useRouter();

    const [inputMode,    setInputMode]    = useState<InputMode>('image');
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

    const [lab, setLab] = useState<LabValues>({
        tsh: '', t3: '', tt4: '', t4u: '', fti: '', age: '', sex: 'female',
    });

    const [selectedModel, setSelectedModel] = useState<string>('majority');

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

    const modelOptions: { value: string; label: string }[] =
        inputMode === 'image'
            ? [{ value: 'EfficientNet+YOLO', label: 'EfficientNet' }, { value: 'Swin Transformer', label: 'Swin' }, { value: 'DenseNet-121', label: 'DenseNet' }]
            : inputMode === 'lab'
            ? [{ value: 'XGBoost', label: 'XGBoost' }, { value: 'CatBoost', label: 'CatBoost' }, { value: 'Random Forest', label: 'Rand Forest' }]
            : [];

    const hasInput =
        inputMode === 'image' ? !!imageFile :
            inputMode === 'lab'   ? !!(lab.tsh || lab.t3 || lab.tt4) :
                /* both */              !!imageFile || !!(lab.tsh || lab.t3 || lab.tt4);

    const runDiagnosis = async () => {
        if (!hasInput) return;
        setStage('uploading'); setResult(null); setError(''); setSavedOk(false);
        simulateProgress();

        try {
            const token = localStorage.getItem('token');
            await delay(400);
            setStage('analyzing');

            let diagResult: DiagResult;

            // ── IMAGE ONLY ──
            if (inputMode === 'image') {
                const formData = new FormData();
                formData.append('image', imageFile!);
                formData.append('model', selectedModel === 'majority' ? 'majority' : selectedModel);

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
                const isSingleImgModel = selectedModel !== 'majority';
                const chosenImgModel   = isSingleImgModel ? topModels.find(m => m.name === selectedModel) : null;
                const votingResult     = chosenImgModel?.result ?? data.diagnosis;
                const votingConfidence = chosenImgModel?.confidence ?? Math.round(data.confidence);
                const malignancyScore  = votingResult === 'Malignant' ? votingConfidence : Math.round(100 - votingConfidence);
                const severity: Severity = data.severity === 'high' ? 'High' : 'Low';

                const filteredImgModels = isSingleImgModel
                    ? topModels.filter(m => m.name === selectedModel)
                    : topModels;

                diagResult = {
                    malignancyScore,
                    severity,
                    recommendation  : data.recommendation,
                    confidence      : votingConfidence,
                    findings: [
                        `Final Diagnosis: ${votingResult}`,
                        `Vote Summary: ${data.vote_summary}`,
                        `Unanimous: ${data.unanimous ? 'Yes' : 'No'}`,
                        `Confidence: ${votingConfidence}%`,
                    ],
                    topModels       : filteredImgModels,
                    votingResult,
                    votingConfidence,
                };

            // ── LAB ONLY ──
            } else if (inputMode === 'lab') {
                const res  = await fetch(`${BASE}/api/diagnosis/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(buildLabPayload(lab, selectedModel)),
                });
                const data = await res.json() as LabApiResponse;
                if (!res.ok || !data.success) throw new Error(data.error ?? 'Lab prediction failed');

                console.log('LAB RESPONSE:', JSON.stringify(data));
                console.log('LAB DATA:', JSON.stringify(data));

                const severityMap: Record<string, Severity> = { high: 'High', medium: 'Moderate', low: 'Low' };
                const allLabModels: ModelResult[] = [
                    {
                        name: 'XGBoost',
                        result: data.models?.['XGBoost']?.result ?? data.diagnosis,
                        confidence: Math.round(data.models?.['XGBoost']?.confidence ?? 0),
                        available: !!data.models?.['XGBoost'],
                    },
                    {
                        name: 'CatBoost',
                        result: data.models?.['CatBoost']?.result ?? data.diagnosis,
                        confidence: Math.round(data.models?.['CatBoost']?.confidence ?? 0),
                        available: !!data.models?.['CatBoost'],
                    },
                    {
                        name: 'Random Forest',
                        result: data.models?.['Random Forest']?.result ?? data.diagnosis,
                        confidence: Math.round(data.models?.['Random Forest']?.confidence ?? 0),
                        available: !!data.models?.['Random Forest'],
                    },
                ];
                const topModels = allLabModels.filter(m => m.available);
                const votingResult     = data.majority_result ?? data.diagnosis;
                const votingConfidence = Math.round(data.confidence);

                diagResult = {
                    malignancyScore : votingResult === 'Malignant' ? votingConfidence : Math.round(100 - votingConfidence),
                    severity        : severityMap[data.severity] ?? 'Moderate',
                    recommendation  : `Diagnosis: ${votingResult}. Please consult a specialist.`,
                    confidence      : votingConfidence,
                    findings: [
                        `Primary Diagnosis: ${votingResult}`,
                        ...(lab.tsh  ? [`TSH: ${lab.tsh} mIU/L`]  : []),
                        ...(lab.t3   ? [`T3: ${lab.t3} nmol/L`]   : []),
                        ...(lab.tt4  ? [`TT4: ${lab.tt4} nmol/L`] : []),
                        ...(lab.t4u  ? [`T4U: ${lab.t4u} ratio`]  : []),
                        ...(lab.fti  ? [`FTI: ${lab.fti} index`]  : []),
                        ...Object.entries(data.probabilities || {}).map(([k, v]) => `${k}: ${v}% probability`),
                    ],
                    topModels,
                    votingResult,
                    votingConfidence,
                };

            // ── BOTH ──
            } else {
                const fetchLab = async (): Promise<LabApiResponse> => {
                    const r = await fetch(`${BASE}/api/diagnosis/predict`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(buildLabPayload(lab, selectedModel)),
                    });
                    return r.json() as Promise<LabApiResponse>;
                };
                const fetchImg = async (): Promise<UltrasoundApiResponse | null> => {
                    if (!imageFile) return null;
                    const fd = new FormData();
                    fd.append('image', imageFile);
                    const r = await fetch(`${BASE}/api/diagnosis/predict-image`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                        body: fd,
                    });
                    return r.json() as Promise<UltrasoundApiResponse>;
                };

                const [labData, imgData] = await Promise.all([fetchLab(), fetchImg()]);
                if (!labData.success) throw new Error(labData.error ?? 'Lab prediction failed');

                const severityMap: Record<string, Severity> = { high: 'High', medium: 'Moderate', low: 'Low' };
                const labConfidence = Math.round(labData.confidence);
                const imgOk = !!(imgData?.success && imgData?.models);

                const topModels: ModelResult[] = [
                    { name: 'XGBoost (Lab)',              result: labData.models?.XGBoost?.result ?? labData.diagnosis,        confidence: Math.round(labData.models?.XGBoost?.confidence ?? labData.confidence), available: true },
                    imgOk
                        ? { name: 'EfficientNet+YOLO (Image)', result: imgData!.models[0].vote === 1 ? 'Malignant' : 'Benign', confidence: Math.round((imgData!.models[0].confidence ?? 0) * 100), available: true }
                        : { name: 'EfficientNet+YOLO (Image)', result: '—', confidence: 0, available: false },
                    imgOk
                        ? { name: 'Swin Transformer (Image)',   result: imgData!.models[1].vote === 1 ? 'Malignant' : 'Benign', confidence: Math.round((imgData!.models[1].confidence ?? 0) * 100), available: true }
                        : { name: 'Swin Transformer (Image)',   result: '—', confidence: 0, available: false },
                    imgOk
                        ? { name: 'DenseNet-121 (Image)',       result: imgData!.models[2].vote === 1 ? 'Malignant' : 'Benign', confidence: Math.round((imgData!.models[2].confidence ?? 0) * 100), available: true }
                        : { name: 'DenseNet-121 (Image)',       result: '—', confidence: 0, available: false },
                ];

                const { result: votingResult, confidence: votingConf } = majorityVote(topModels);

                diagResult = {
                    malignancyScore : labConfidence,
                    severity        : severityMap[labData.severity] ?? 'Moderate',
                    recommendation  : `Lab Diagnosis: ${labData.majority_result ?? labData.diagnosis}. ${imgData?.recommendation ?? ''} Please consult a specialist.`.trim(),
                    confidence      : labConfidence,
                    findings: [
                        `Primary Diagnosis: ${labData.majority_result ?? labData.diagnosis}`,
                        ...(lab.tsh  ? [`TSH: ${lab.tsh} mIU/L`]  : []),
                        ...(lab.t3   ? [`T3: ${lab.t3} nmol/L`]   : []),
                        ...(lab.tt4  ? [`TT4: ${lab.tt4} nmol/L`] : []),
                        ...(imgOk    ? [`Image Diagnosis: ${imgData!.diagnosis}`, `Vote Summary: ${imgData!.vote_summary}`] : []),
                    ],
                    topModels,
                    votingResult,
                    votingConfidence: votingConf,
                };
            }

            clearTimers(); setProgress(100);
            await delay(300);
            setResult(diagResult!);
            setStage('done');

            // ── Auto-save to patient IndexedDB — FIXED: actual save logic ──
            if (selectedPatient && diagResult) {
                const record: DiagnosisRecord = {
                    id             : `dx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    date           : new Date().toISOString(),
                    mode           : inputMode,
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
        setLab({ tsh: '', t3: '', tt4: '', t4u: '', fti: '', age: '', sex: 'female' });
        setSelectedModel('majority');
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
                                <div className={s.cardIcon} style={{ background: 'linear-gradient(135deg,#0F766E,#0D9488)' }}>
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
                                                    style={inputMode === m.v ? { background: 'white', borderColor: '#0D9488', color: '#0D9488', borderWidth: '2px' } : {}}
                                                    onClick={() => { setInputMode(m.v); setSelectedModel('majority'); }}
                                            >
                                                {inputMode === m.v && <Check size={11} />}
                                                {m.icon}{m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {inputMode !== 'both' && (
                                    <div className={s.fieldGroup}>
                                        <label className={s.fieldLabel}>Model Selection</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            <button
                                                className={`${s.typeBtn} ${selectedModel === 'majority' ? s.typeBtnActive : ''}`}
                                                style={selectedModel === 'majority' ? { background: 'rgba(13,148,136,0.1)', borderColor: '#0D9488', color: '#0D9488' } : {}}
                                                onClick={() => setSelectedModel('majority')}
                                            >
                                                {selectedModel === 'majority' && <Check size={11} />}
                                                <Zap size={12} />Majority Voting
                                            </button>
                                            {modelOptions.map(opt => (
                                                <button key={opt.value}
                                                    className={`${s.typeBtn} ${selectedModel === opt.value ? s.typeBtnActive : ''}`}
                                                    style={selectedModel === opt.value ? { background: 'rgba(13,148,136,0.1)', borderColor: '#0D9488', color: '#0D9488' } : {}}
                                                    onClick={() => setSelectedModel(opt.value)}
                                                >
                                                    {selectedModel === opt.value && <Check size={11} />}
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                )}

                                {(inputMode === 'lab' || inputMode === 'both') && (
                                    <div className={s.fieldGroup} style={{ marginBottom: 0 }}>
                                        <label className={s.fieldLabel}>Lab Results</label>
                                        <div className={s.labGrid}>
                                            {([
                                                { k: 'tsh', label: 'TSH', unit: 'mIU/L',  normal: '0.4–4.0' },
                                                { k: 't3',  label: 'T3',  unit: 'nmol/L', normal: '1.2–2.8' },
                                                { k: 'tt4', label: 'TT4', unit: 'nmol/L', normal: '60–150'  },
                                                { k: 't4u', label: 'T4U', unit: 'ratio',  normal: '0.8–1.1' },
                                                { k: 'fti', label: 'FTI', unit: 'index',  normal: '55–160'  },
                                                { k: 'age', label: 'Age', unit: 'yrs',    normal: ''        },
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
                            <div style={{ marginTop: 20 }}>

                                {/* Score */}
                                <div className={s.resultCard}>
                                    <div className={s.resultStrip} style={{ borderBottom: `1px solid ${sev.border}`, background: sev.bg }}>
                                        <div>
                                            <p className={s.resultStripLabel} style={{ color: sev.color }}>Malignancy Score</p>
                                            <div className={s.resultScoreRow}>
                                                <span className={s.resultScore} style={{ color: sev.color }}>{result.malignancyScore}</span>
                                                <span className={s.resultScoreMax}>/100</span>
                                            </div>
                                            <p className={s.resultConfRow}>Confidence: <span className={s.resultConfVal} style={{ color: sev.color }}>{result.confidence}%</span></p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className={s.resultBadge} style={{ color: sev.color, borderColor: sev.border, background: sev.color + '14' }}>
                                                {result.severity} Risk
                                            </div>
                                        </div>
                                    </div>
                                    <div className={s.resultBar}>
                                        <div className={s.resultBarTrack}>
                                            <div className={s.resultBarFill} style={{ width: `${result.malignancyScore}%`, background: sev.color }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Models + Voting */}
                                <div className={s.resultGrid}>
                                    <div className={s.modelsCard}>
                                        <div className={s.modelsCardHead}>
                                            <div className={s.infoCardIcon} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                                <Activity size={13} color="var(--teal)" />
                                            </div>
                                            <span className={s.modelsCardTitle}>Model Results</span>
                                        </div>
                                        {result.topModels.map((m: any, i: number) => (
                                            <div key={i} className={s.modelRow} style={{ opacity: m.available ? 1 : 0.35 }}>
                                                <div>
                                                    <div className={s.modelRowName}>{m.name}</div>
                                                    <div className={s.modelRowSub}>{m.available ? m.result : 'Not run'}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div className={s.modelRowConf} style={{ color: m.available ? sev.color : 'var(--muted)' }}>
                                                        {m.available ? `${m.confidence}%` : '—'}
                                                    </div>
                                                    {m.available && <div className={s.modelRowLabel}>confidence</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={s.votingCard} style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                                        <div className={s.votingCardHead} style={{ background: sev.color + '12', borderColor: sev.border }}>
                                            <CheckCircle2 size={13} color={sev.color} />
                                            <span className={s.votingCardTitle} style={{ color: sev.color }}>Final Result</span>
                                        </div>
                                        <div className={s.votingCardBody}>
                                            <div>
                                                <p className={s.votingLabel} style={{ color: sev.color }}>Diagnosis</p>
                                                <p className={s.votingValue} style={{ color: sev.color }}>{result.votingResult}</p>
                                            </div>
                                            <div>
                                                <p className={s.votingLabel} style={{ color: sev.color }}>Confidence</p>
                                                <p className={s.votingValue} style={{ color: sev.color }}>{result.votingConfidence}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Findings */}
                                <div className={s.findingsCard}>
                                    <div className={s.findingsHead}>
                                        <div className={s.infoCardIcon} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                                            <FileText size={13} color="var(--teal)" />
                                        </div>
                                        <span className={s.findingsTitle}>Key Findings</span>
                                    </div>
                                    <div className={s.findingsGrid}>
                                        {result.findings.map((f: string, i: number) => (
                                            <div key={i} className={s.findingItem}>
                                                <div className={s.findingDot} style={{ background: sev.color }} />
                                                <span className={s.findingText}>{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className={s.recCard} style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                                    <div className={s.recHead} style={{ borderColor: sev.border, background: sev.color + '10' }}>
                                        <CheckCircle2 size={13} color={sev.color} />
                                        <span className={s.recTitle} style={{ color: sev.color }}>Recommendation</span>
                                    </div>
                                    <div className={s.recBody}>
                                        <p className={s.recText} style={{ color: sev.color === '#059669' ? '#065F46' : '#7F1D1D' }}>{result.recommendation}</p>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className={s.disclaimerStrip}>
                                    <Info size={15} className={s.disclaimerIcon} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
                                    <p className={s.disclaimerText}>
                                        <strong>Clinical Decision Support Only.</strong> This AI result is intended to assist qualified medical professionals and must be interpreted by a licensed clinician. It does not replace histological confirmation or specialist judgment.
                                    </p>
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