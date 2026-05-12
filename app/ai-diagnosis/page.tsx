'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Brain, Upload, FlaskConical, Layers,
    AlertTriangle, CheckCircle2,
    Info, User, Check, Zap, FileText, Activity
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { BASE } from '@/lib/api';
import { saveDiagnosis } from '@/lib/diagnosisStorage';
import type { DiagnosisRecord } from '@/lib/diagnosisStorage';

type InputMode  = 'image' | 'lab' | 'both';
type DiagStage  = 'idle' | 'uploading' | 'analyzing' | 'done';
type Severity   = 'Low' | 'Moderate' | 'High';

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

// Response shape from /api/diagnosis/auto
interface AutoApiResponse {
    success     : boolean;
    mode        : string;
    diagnosis   : string;
    probability : number;
    risk_score  : { score: number; level: string; action: string };
    sources     : Array<{
        source    : string;
        weight    : number;
        prediction: string;
        confidence: number;
        models?   : Record<string, { result: string; confidence: number }>;
        vote_summary?: Record<string, { vote: number; confidence: number }>;
    }>;
    errors? : string[] | null;
    error?  : string;
}

const PROCESS_STEPS = [
    { label: 'Uploading',  threshold: 15  },
    { label: 'Analyzing',  threshold: 50  },
    { label: 'Voting',     threshold: 85  },
    { label: 'Done',       threshold: 100 },
];

const SEVERITY_META: Record<Severity, { color: string; bg: string; border: string }> = {
    Low:      { color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
    Moderate: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
    High:     { color: '#DC2626', bg: '#FFF1F2', border: '#FECDD3' },
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
    const modelName = selectedModel === 'majority' ? 'majority voting' : selectedModel;
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
    }, []);

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
                !!imageFile || !!(lab.tsh || lab.t3 || lab.tt4);

    const runDiagnosis = async () => {
        if (!hasInput) return;
        setStage('uploading'); setResult(null); setError(''); setSavedOk(false);
        simulateProgress();

        try {
            const token = localStorage.getItem('token');
            await delay(400);
            setStage('analyzing');

            let diagResult: DiagResult;

            // ── IMAGE ONLY ─────────────────────────────────────────────────
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
                const models      = (data as any).models_detail || data.models || [];
                const effResult   = models[0];
                const swinResult  = models[1];
                const denseResult = models[2];
                const topModels: ModelResult[] = [
                    { name: 'EfficientNet+YOLO', result: effResult   ? (effResult.vote   === 1 ? 'Malignant' : 'Benign') : '—', confidence: effResult?.confidence   ? Math.round(effResult.confidence   * 100) : 0, available: !!effResult   },
                    { name: 'Swin Transformer',  result: swinResult  ? (swinResult.vote  === 1 ? 'Malignant' : 'Benign') : '—', confidence: swinResult?.confidence  ? Math.round(swinResult.confidence  * 100) : 0, available: !!swinResult  },
                    { name: 'DenseNet-121',       result: denseResult ? (denseResult.vote === 1 ? 'Malignant' : 'Benign') : '—', confidence: denseResult?.confidence ? Math.round(denseResult.confidence * 100) : 0, available: !!denseResult },
                ];
                const isSingleImgModel = selectedModel !== 'majority';
                const chosenImgModel   = isSingleImgModel ? topModels.find(m => m.name === selectedModel) : null;
                const votingResult     = chosenImgModel?.result ?? data.diagnosis;
                const votingConfidence = chosenImgModel?.confidence ?? Math.round(data.confidence);
                const malignancyScore  = votingResult === 'Malignant' ? votingConfidence : Math.round(100 - votingConfidence);
                const severity: Severity = data.severity === 'high' ? 'High' : 'Low';
                const filteredImgModels = isSingleImgModel ? topModels.filter(m => m.name === selectedModel) : topModels;
                diagResult = {
                    malignancyScore, severity,
                    recommendation  : data.recommendation,
                    confidence      : votingConfidence,
                    findings: [`Final Diagnosis: ${votingResult}`, `Vote Summary: ${data.vote_summary}`, `Unanimous: ${data.unanimous ? 'Yes' : 'No'}`, `Confidence: ${votingConfidence}%`],
                    topModels: filteredImgModels, votingResult, votingConfidence,
                };

                // ── LAB ONLY ───────────────────────────────────────────────────
            } else if (inputMode === 'lab') {
                const res  = await fetch(`${BASE}/api/diagnosis/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(buildLabPayload(lab, selectedModel)),
                });
                const data = await res.json() as LabApiResponse;
                if (!res.ok || !data.success) throw new Error(data.error ?? 'Lab prediction failed');
                const severityMap: Record<string, Severity> = { high: 'High', medium: 'Moderate', low: 'Low' };
                const allLabModels: ModelResult[] = [
                    { name: 'XGBoost',       result: data.models?.['XGBoost']?.result       ?? data.diagnosis, confidence: Math.round(data.models?.['XGBoost']?.confidence       ?? 0), available: !!data.models?.['XGBoost']       },
                    { name: 'CatBoost',      result: data.models?.['CatBoost']?.result      ?? data.diagnosis, confidence: Math.round(data.models?.['CatBoost']?.confidence      ?? 0), available: !!data.models?.['CatBoost']      },
                    { name: 'Random Forest', result: data.models?.['Random Forest']?.result ?? data.diagnosis, confidence: Math.round(data.models?.['Random Forest']?.confidence ?? 0), available: !!data.models?.['Random Forest'] },
                ];
                const topModels        = allLabModels.filter(m => m.available);
                const votingResult     = data.majority_result ?? data.diagnosis;
                const votingConfidence = Math.round(data.confidence);
                diagResult = {
                    malignancyScore : votingResult === 'Malignant' ? votingConfidence : Math.round(100 - votingConfidence),
                    severity        : severityMap[data.severity] ?? 'Moderate',
                    recommendation  : `Diagnosis: ${votingResult}. Please consult a specialist.`,
                    confidence      : votingConfidence,
                    findings: [`Primary Diagnosis: ${votingResult}`, ...(lab.tsh ? [`TSH: ${lab.tsh} mIU/L`] : []), ...(lab.t3 ? [`T3: ${lab.t3} nmol/L`] : []), ...(lab.tt4 ? [`TT4: ${lab.tt4} nmol/L`] : []), ...(lab.t4u ? [`T4U: ${lab.t4u} ratio`] : []), ...(lab.fti ? [`FTI: ${lab.fti} index`] : []), ...Object.entries(data.probabilities || {}).map(([k, v]) => `${k}: ${v}% probability`)],
                    topModels, votingResult, votingConfidence,
                };

                // ── BOTH MODE — single call to /api/diagnosis/auto ─────────────
                // The orchestrator runs lab + image in parallel server-side,
                // applies weighted voting (image 53% / lab 47%), and returns
                // a unified response with per-model breakdowns.
            } else {
                const fd = new FormData();

                // Lab data sent as JSON string in the 'lab_data' form field
                const labPayload = {
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

                // Only attach lab_data if the user entered at least one value
                if (lab.tsh || lab.t3 || lab.tt4 || lab.t4u || lab.fti) {
                    fd.append('lab_data', JSON.stringify(labPayload));
                }

                // Attach the image if provided
                if (imageFile) {
                    fd.append('image', imageFile);
                }

                const res  = await fetch(`${BASE}/api/diagnosis/auto`, {
                    method : 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body   : fd,
                });
                const data = await res.json() as AutoApiResponse;
                if (!res.ok || !data.success) throw new Error(data.error ?? 'Auto diagnosis failed');

                // ── Parse sources returned by the orchestrator ──
                const labSource = data.sources?.find(s => s.source?.toLowerCase().includes('lab'));
                const imgSource = data.sources?.find(s => s.source?.toLowerCase().includes('ultrasound'));

                // Lab models from labSource.models
                const labModels: ModelResult[] = [
                    {
                        name      : 'XGBoost (Lab)',
                        result    : labSource?.models?.['XGBoost']?.result       ?? labSource?.prediction ?? '—',
                        confidence: Math.round(labSource?.models?.['XGBoost']?.confidence       ?? 0),
                        available : !!(labSource?.models?.['XGBoost']),
                    },
                    {
                        name      : 'CatBoost (Lab)',
                        result    : labSource?.models?.['CatBoost']?.result      ?? labSource?.prediction ?? '—',
                        confidence: Math.round(labSource?.models?.['CatBoost']?.confidence      ?? 0),
                        available : !!(labSource?.models?.['CatBoost']),
                    },
                    {
                        name      : 'Random Forest (Lab)',
                        result    : labSource?.models?.['Random Forest']?.result ?? labSource?.prediction ?? '—',
                        confidence: Math.round(labSource?.models?.['Random Forest']?.confidence ?? 0),
                        available : !!(labSource?.models?.['Random Forest']),
                    },
                ];

                // vote_summary from the orchestrator is a plain string e.g. "2/3 Malignant | 1/3 Benign"
                // The orchestrator does NOT forward per-model breakdowns for the image source.
                // We use imgSource.prediction + imgSource.confidence for all 3 image models,
                // and mark them available only when the image source is present.
                const imgAvailable  = !!imgSource;
                const imgPrediction = imgSource?.prediction ?? '—';
                const imgConf       = imgSource?.confidence != null ? Math.round(imgSource.confidence) : 0;

                const imgModels: ModelResult[] = [
                    { name: 'EfficientNet+YOLO (Image)', result: imgAvailable ? imgPrediction : '—', confidence: imgAvailable ? imgConf : 0, available: imgAvailable },
                    { name: 'Swin Transformer (Image)',  result: imgAvailable ? imgPrediction : '—', confidence: imgAvailable ? imgConf : 0, available: imgAvailable },
                    { name: 'DenseNet-121 (Image)',      result: imgAvailable ? imgPrediction : '—', confidence: imgAvailable ? imgConf : 0, available: imgAvailable },
                ];

                const topModels: ModelResult[] = [...labModels, ...imgModels];

                // ── Severity from risk_score level ──
                const severityMap: Record<string, Severity> = {
                    High   : 'High',
                    Medium : 'Moderate',
                    Low    : 'Low',
                };
                const severity: Severity = severityMap[data.risk_score?.level] ?? 'Moderate';

                const malignancyScore  = Math.round(data.probability);
                const votingResult     = data.diagnosis;
                const votingConf       = Math.round(data.probability);

                diagResult = {
                    malignancyScore,
                    severity,
                    recommendation: data.risk_score?.action ?? 'Please consult a specialist.',
                    confidence    : votingConf,
                    findings: [
                        `Final Diagnosis: ${votingResult}`,
                        ...(labSource ? [`Lab Result: ${labSource.prediction} (${Math.round(labSource.confidence)}%)`]  : []),
                        ...(imgSource ? [`Image Result: ${imgSource.prediction} (${Math.round(imgSource.confidence)}%)`] : []),
                        ...(lab.tsh  ? [`TSH: ${lab.tsh} mIU/L`]  : []),
                        ...(lab.t3   ? [`T3: ${lab.t3} nmol/L`]   : []),
                        ...(lab.tt4  ? [`TT4: ${lab.tt4} nmol/L`] : []),
                        ...(lab.t4u  ? [`T4U: ${lab.t4u} ratio`]  : []),
                        ...(lab.fti  ? [`FTI: ${lab.fti} index`]  : []),
                        ...(data.errors?.length ? [`Warnings: ${data.errors.join(', ')}`] : []),
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

    const patientSuggestions = (() => {
        if (!showSuggest || !patientInput.trim()) return [];
        const q = patientInput.toLowerCase();
        return allPatients.filter(p =>
            p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q)
        ).slice(0, 5);
    })();

    return (
        <>
            <style>{`
                @keyframes dxSpin{to{transform:rotate(360deg)}}
                @keyframes dxRing{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
                @keyframes dxShimmer{0%{left:-100%}100%{left:200%}}
                @keyframes dxBlink{0%,100%{opacity:1}50%{opacity:.3}}

                .dx-page{min-height:100vh;background:radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,158,117,0.09) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 90% 90%, rgba(8,80,65,0.05) 0%, transparent 50%), #FFFFFF;font-family:"DM Sans",sans-serif}
                .dx-main{max-width:1240px;margin:0 auto;padding:calc(64px + 28px) 40px 64px}
                @media(max-width:768px){.dx-main{padding:calc(64px + 16px) 16px 48px}}

                /* Dark Hero */
                .dx-hero{background:linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%);border-radius:20px;padding:36px 44px;margin-bottom:28px;overflow:hidden;position:relative}
                .dx-hero-dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px);background-size:20px 20px;pointer-events:none}
                .dx-hero-blob{position:absolute;top:-60px;right:-60px;width:300px;height:300px;border-radius:50%;background:rgba(29,158,117,0.15);pointer-events:none;filter:blur(40px)}
                .dx-hero-inner{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
                .dx-hero-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(29,158,117,0.15);border:1px solid rgba(29,158,117,0.3);color:#4ADE80;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:12px}
                .dx-hero-dot{width:6px;height:6px;border-radius:50%;background:#4ADE80;animation:dxBlink 2s ease-in-out infinite}
                .dx-hero-h1{font-family:"DM Serif Display",serif;font-size:38px;color:white;letter-spacing:-1px;line-height:1.1;margin-bottom:6px}
                .dx-hero-sub{font-size:13px;color:rgba(255,255,255,0.45)}
                .dx-hero-pills{display:flex;gap:10px;flex-wrap:wrap}
                .dx-hero-pill{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:12px 18px;text-align:center;min-width:100px}
                .dx-hero-pill-val{font-family:"DM Serif Display",serif;font-size:22px;color:white;line-height:1}
                .dx-hero-pill-lbl{font-size:10px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-top:4px}

                /* Layout */
                .dx-grid{display:grid;grid-template-columns:1fr 360px;gap:20px}
                @media(max-width:960px){.dx-grid{grid-template-columns:1fr}}

                /* Cards */
                .dx-card{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05);margin-bottom:16px}
                .dx-card-head{padding:16px 20px;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;align-items:center;gap:10px}
                .dx-card-icon{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;flex-shrink:0}
                .dx-card-title{font-size:13.5px;font-weight:700;color:#0F172A;flex:1}
                .dx-opt-badge{font-size:10px;font-weight:700;letter-spacing:0.5px;background:#F0FDFA;color:#0D9488;border:1px solid rgba(13,148,136,0.2);padding:3px 9px;border-radius:100px}
                .dx-mode-badge{font-size:10px;font-weight:700;padding:3px 9px;border-radius:100px;border:1px solid}
                .dx-card-body{padding:20px}

                /* Fields */
                .dx-field{margin-bottom:16px;position:relative}
                .dx-field:last-child{margin-bottom:0}
                .dx-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;margin-bottom:8px;display:block}
                .dx-input{width:100%;height:46px;background:#F9FAFB;border:1px solid rgba(0,0,0,0.1);border-radius:10px;padding:0 14px;font-family:"DM Sans",sans-serif;font-size:14px;color:#0F172A;outline:none;transition:all .2s;box-sizing:border-box}
                .dx-input:focus{border-color:rgba(29,158,117,0.5);box-shadow:0 0 0 4px rgba(29,158,117,0.08);background:white}
                .dx-hint{font-size:11.5px;color:#0D9488;margin-top:6px;display:flex;align-items:center;gap:5px}

                /* Suggest dropdown */
                .dx-suggest{position:absolute;top:calc(100% + 4px);left:0;right:0;background:white;border:1px solid rgba(0,0,0,0.08);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.1);z-index:100;overflow:hidden}
                .dx-suggest-item{width:100%;padding:11px 14px;background:none;border:none;cursor:pointer;text-align:left;display:flex;align-items:center;justify-content:space-between;transition:background .12s;font-family:"DM Sans",sans-serif}
                .dx-suggest-item:hover{background:#F0FDFA}
                .dx-suggest-name{font-size:13.5px;font-weight:600;color:#0F172A}
                .dx-suggest-mrn{font-size:11px;color:#94A3B8;background:#F1F5F9;padding:2px 7px;border-radius:6px}

                /* Mode / Model buttons */
                .dx-btn-row{display:flex;flex-wrap:wrap;gap:8px}
                .dx-btn-pill{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;border:1.5px solid rgba(0,0,0,0.1);background:#F9FAFB;font-family:"DM Sans",sans-serif;font-size:12.5px;font-weight:600;color:#64748B;cursor:pointer;transition:all .18s}
                .dx-btn-pill:hover{border-color:rgba(29,158,117,0.3);color:#0D9488;background:#F0FDFA}
                .dx-btn-pill-active{border-color:rgba(29,158,117,0.5)!important;background:#F0FDFA!important;color:#0D9488!important}

                /* Upload zone */
                .dx-upload{border:2px dashed rgba(0,0,0,0.12);border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:all .2s;background:#FAFAFA}
                .dx-upload:hover,.dx-upload-over{border-color:rgba(29,158,117,0.4);background:#F0FDFA}
                .dx-upload-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,rgba(29,158,117,0.1),rgba(13,148,136,0.1));display:flex;align-items:center;justify-content:center;color:#0D9488;margin:0 auto 12px}
                .dx-upload-title{font-size:14px;font-weight:600;color:#334155;margin-bottom:4px}
                .dx-upload-sub{font-size:12px;color:#94A3B8}
                .dx-preview{width:100%;max-height:160px;object-fit:contain;border-radius:8px;margin-bottom:8px}
                .dx-file-name{font-size:13px;font-weight:600;color:#334155}
                .dx-file-size{font-size:11.5px;color:#94A3B8;margin-top:2px}

                /* Lab grid */
                .dx-lab-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}
                .dx-lab-cell{background:#F9FAFB;border:1px solid rgba(0,0,0,0.08);border-radius:10px;padding:10px 12px}
                .dx-lab-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
                .dx-lab-lbl{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748B}
                .dx-lab-norm{font-size:9px;color:#94A3B8}
                .dx-lab-wrap{display:flex;align-items:center;gap:6px}
                .dx-lab-input{flex:1;min-width:0;height:32px;background:white;border:1px solid rgba(0,0,0,0.1);border-radius:7px;padding:0 8px;font-family:"DM Sans",sans-serif;font-size:13px;color:#0F172A;outline:none;transition:border-color .2s}
                .dx-lab-input:focus{border-color:rgba(29,158,117,0.5)}
                .dx-lab-unit{font-size:10px;color:#94A3B8;white-space:nowrap;font-weight:600}
                .dx-sex-row{display:flex;align-items:center;gap:12px;margin-top:8px}

                /* Submit button */
                .dx-run-btn{width:100%;height:48px;border-radius:11px;border:none;background:linear-gradient(135deg,#1D9E75,#0D9488,#0F6E56);color:white;font-family:"DM Sans",sans-serif;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 12px rgba(29,158,117,0.25);transition:all .2s;position:relative;overflow:hidden;margin-bottom:12px}
                .dx-run-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(29,158,117,0.35)}
                .dx-run-btn:disabled{opacity:.65;cursor:not-allowed;transform:none}
                .dx-spinner{width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.35);border-top-color:white;border-radius:50%;animation:dxSpin .7s linear infinite;flex-shrink:0}

                /* Progress */
                .dx-progress{margin-bottom:12px}
                .dx-progress-track{height:4px;background:rgba(29,158,117,0.12);border-radius:100px;overflow:hidden;margin-bottom:8px}
                .dx-progress-fill{height:100%;background:linear-gradient(90deg,#1D9E75,#0D9488);border-radius:100px;transition:width .4s ease}
                .dx-progress-steps{display:flex;gap:16px}
                .dx-progress-step{font-size:11px;color:#94A3B8;font-weight:600}
                .dx-progress-step-done{color:#0D9488}

                /* Error / saved */
                .dx-error{display:flex;align-items:center;gap:8px;background:#FFF1F2;border:1px solid #FECDD3;color:#DC2626;border-radius:10px;padding:11px 14px;font-size:13px;font-weight:600;margin-bottom:12px}
                .dx-saved{display:flex;align-items:center;gap:8px;background:#F0FDFA;border:1px solid rgba(13,148,136,0.2);color:#0D9488;border-radius:10px;padding:11px 14px;font-size:13px;font-weight:600;margin-bottom:12px;flex-wrap:wrap}
                .dx-saved-link{margin-left:auto;font-size:12px;font-weight:700;color:#0D9488;text-decoration:none;background:rgba(13,148,136,0.1);padding:4px 10px;border-radius:7px}
                .dx-saved-link:hover{background:rgba(13,148,136,0.18)}

                /* Results */
                .dx-result-card{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05);margin-bottom:14px}
                .dx-result-strip{padding:20px;display:flex;align-items:center;justify-content:space-between}
                .dx-result-lbl{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
                .dx-result-score{font-family:"DM Serif Display",serif;font-size:48px;font-weight:700;line-height:1}
                .dx-result-max{font-size:14px;color:#94A3B8;font-weight:500;margin-left:2px}
                .dx-result-conf{font-size:12px;color:#94A3B8;margin-top:4px}
                .dx-result-badge{font-size:12px;font-weight:700;padding:6px 14px;border-radius:100px;border:1px solid}
                .dx-result-bar{height:6px;background:rgba(0,0,0,0.05);position:relative;overflow:hidden}
                .dx-result-bar-fill{height:100%;border-radius:0;transition:width .6s ease}
                .dx-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
                @media(max-width:500px){.dx-result-grid{grid-template-columns:1fr}}
                .dx-models-card{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05)}
                .dx-models-head{padding:14px 18px;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;align-items:center;gap:8px}
                .dx-model-row{padding:12px 18px;border-bottom:1px solid #F8FAFC;display:flex;align-items:center;justify-content:space-between}
                .dx-model-row:last-child{border-bottom:none}
                .dx-model-name{font-size:13px;font-weight:600;color:#334155;margin-bottom:2px}
                .dx-model-sub{font-size:11px;color:#94A3B8}
                .dx-model-conf{font-size:20px;font-weight:700;font-family:"DM Serif Display",serif;line-height:1}
                .dx-model-conf-lbl{font-size:10px;color:#94A3B8;text-align:right}
                .dx-voting-card{border-radius:16px;overflow:hidden}
                .dx-voting-head{padding:12px 16px;display:flex;align-items:center;gap:7px}
                .dx-voting-title{font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase}
                .dx-voting-body{padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
                .dx-voting-lbl{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
                .dx-voting-val{font-family:"DM Serif Display",serif;font-size:22px;font-weight:700}
                .dx-findings-card{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05);margin-bottom:14px}
                .dx-findings-head{padding:14px 18px;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;align-items:center;gap:8px}
                .dx-findings-title{font-size:13.5px;font-weight:700;color:#0F172A}
                .dx-findings-grid{padding:14px 18px;display:flex;flex-direction:column;gap:8px}
                .dx-finding-item{display:flex;align-items:flex-start;gap:9px;font-size:13px;color:#334155}
                .dx-finding-dot{width:6px;height:6px;border-radius:50%;margin-top:5px;flex-shrink:0}
                .dx-rec-card{border-radius:16px;overflow:hidden;margin-bottom:14px}
                .dx-rec-head{padding:12px 16px;display:flex;align-items:center;gap:7px;border-bottom:1px solid}
                .dx-rec-title{font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase}
                .dx-rec-body{padding:14px 16px}
                .dx-rec-text{font-size:13.5px;line-height:1.65;font-weight:500}
                .dx-disclaimer{display:flex;align-items:flex-start;gap:10px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:14px 16px;margin-bottom:14px}
                .dx-disclaimer-text{font-size:12.5px;color:#92400E;line-height:1.6}

                /* Sidebar */
                .dx-info-card{background:white;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.05);margin-bottom:16px}
                .dx-info-head{padding:14px 18px;border-bottom:1px solid rgba(0,0,0,0.06);display:flex;align-items:center;gap:8px}
                .dx-info-ic{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
                .dx-info-title{font-size:13.5px;font-weight:700;color:#0F172A}
                .dx-info-body{padding:16px 18px}
                .dx-how-item{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}
                .dx-how-item:last-child{margin-bottom:0}
                .dx-how-num{width:24px;height:24px;border-radius:7px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:white;flex-shrink:0}
                .dx-how-text{font-size:13px;color:#334155;line-height:1.55}
                .dx-how-bold{font-weight:700;color:#0F172A}
                .dx-analyzing{padding:32px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
                .dx-analyzing-ring{width:60px;height:60px;border:3px solid rgba(29,158,117,0.15);border-top-color:#0D9488;border-radius:50%;animation:dxSpin .9s linear infinite;display:flex;align-items:center;justify-content:center}
                .dx-analyzing-text{font-size:14px;font-weight:700;color:#0F172A}
                .dx-analyzing-sub{font-size:12px;color:#94A3B8}
                .dx-empty{padding:36px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
                .dx-empty-ic{width:56px;height:56px;border-radius:16px;background:#F0FDFA;border:1px solid rgba(13,148,136,0.15);display:flex;align-items:center;justify-content:center;color:#0D9488}
                .dx-empty-text{font-size:13.5px;color:#64748B;line-height:1.55;max-width:220px}
            `}</style>

            <div className="dx-page">
                <Navbar />
                <main className="dx-main">

                    <div className="dx-hero">
                        <div className="dx-hero-dots"/>
                        <div className="dx-hero-blob"/>
                        <div className="dx-hero-inner">
                            <div>
                                <div className="dx-hero-badge"><span className="dx-hero-dot"/>AI-Powered Diagnosis</div>
                                <h1 className="dx-hero-h1">Thyroid Cancer<br/><em style={{ fontStyle:'italic', color:'rgba(255,255,255,0.7)' }}>AI Diagnosis</em></h1>
                                <p className="dx-hero-sub">Ensemble deep learning · Multi-modal analysis · Majority voting</p>
                            </div>
                            <div className="dx-hero-pills">
                                {[{val:'3', lbl:'AI Models'},{val:'95%', lbl:'Accuracy'},{val:'<2s', lbl:'Analysis'}].map(p => (
                                    <div key={p.lbl} className="dx-hero-pill">
                                        <div className="dx-hero-pill-val">{p.val}</div>
                                        <div className="dx-hero-pill-lbl">{p.lbl}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dx-grid">
                        <div>
                            <div className="dx-card">
                                <div className="dx-card-head">
                                    <div className="dx-card-icon"><User size={16} color="white"/></div>
                                    <span className="dx-card-title">Patient</span>
                                    <span className="dx-opt-badge">Optional</span>
                                </div>
                                <div className="dx-card-body">
                                    <div className="dx-field">
                                        <label className="dx-label">Patient ID / MRN</label>
                                        <input className="dx-input" type="text" placeholder="Search by name or MRN..."
                                               value={patientInput} autoComplete="off"
                                               onChange={e => { setPatientInput(e.target.value); setSelectedPatient(null); setShowSuggest(true); setSavedOk(false); }}
                                               onFocus={() => setShowSuggest(true)}
                                               onBlur={() => setTimeout(() => setShowSuggest(false), 150)} />
                                        {patientSuggestions.length > 0 && (
                                            <div className="dx-suggest">
                                                {patientSuggestions.map(p => (
                                                    <button key={p.id} className="dx-suggest-item"
                                                            onMouseDown={() => { setPatientInput(p.name); setSelectedPatient(p); setShowSuggest(false); }}>
                                                        <span className="dx-suggest-name">{p.name}</span>
                                                        <span className="dx-suggest-mrn">{p.mrn}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {selectedPatient && (
                                            <p className="dx-hint"><Check size={12}/>Diagnosis will be saved to <strong>{selectedPatient.name}</strong></p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="dx-card">
                                <div className="dx-card-head">
                                    <div className="dx-card-icon"><Layers size={16} color="white"/></div>
                                    <span className="dx-card-title">Input Data</span>
                                    <span className="dx-mode-badge" style={
                                        inputMode === 'both'  ? { background:'#EEF2FF', color:'#4F46E5', borderColor:'#C7D2FE' } :
                                            inputMode === 'image' ? { background:'#F0F9FF', color:'#0891B2', borderColor:'#BAE6FD' } :
                                                { background:'#F0FDFA', color:'#0D9488', borderColor:'#99F6E4' }
                                    }>
                                        {inputMode === 'both' ? 'Multi-Modal' : inputMode === 'image' ? 'Image Only' : 'Lab Only'}
                                    </span>
                                </div>
                                <div className="dx-card-body">
                                    <div className="dx-field">
                                        <label className="dx-label">Diagnosis Mode</label>
                                        <div className="dx-btn-row">
                                            {([
                                                { v: 'image', icon: <Upload size={12}/>,      label: 'Image Only'  },
                                                { v: 'lab',   icon: <FlaskConical size={12}/>, label: 'Lab Only'    },
                                                { v: 'both',  icon: <Zap size={12}/>,          label: 'Both (Best)' },
                                            ] as const).map(m => (
                                                <button key={m.v}
                                                        className={`dx-btn-pill${inputMode === m.v ? ' dx-btn-pill-active' : ''}`}
                                                        onClick={() => { setInputMode(m.v); setSelectedModel('majority'); }}>
                                                    {inputMode === m.v && <Check size={10}/>}
                                                    {m.icon}{m.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {inputMode !== 'both' && (
                                        <div className="dx-field">
                                            <label className="dx-label">Model Selection</label>
                                            <div className="dx-btn-row">
                                                <button className={`dx-btn-pill${selectedModel === 'majority' ? ' dx-btn-pill-active' : ''}`}
                                                        onClick={() => setSelectedModel('majority')}>
                                                    {selectedModel === 'majority' && <Check size={10}/>}
                                                    <Zap size={11}/>Majority Voting
                                                </button>
                                                {modelOptions.map(opt => (
                                                    <button key={opt.value}
                                                            className={`dx-btn-pill${selectedModel === opt.value ? ' dx-btn-pill-active' : ''}`}
                                                            onClick={() => setSelectedModel(opt.value)}>
                                                        {selectedModel === opt.value && <Check size={10}/>}
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {(inputMode === 'image' || inputMode === 'both') && (
                                        <div className="dx-field">
                                            <label className="dx-label">Medical Scan <span style={{ color:'#94A3B8', textTransform:'none', letterSpacing:0, fontWeight:500, fontSize:11 }}>(Ultrasound)</span></label>
                                            <div className={`dx-upload${dragOver ? ' dx-upload-over' : ''}`}
                                                 onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                                 onDragLeave={() => setDragOver(false)}
                                                 onDrop={handleDrop}
                                                 onClick={() => fileRef.current?.click()}>
                                                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
                                                       onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                                                {imagePreview ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={imagePreview} className="dx-preview" alt="Scan preview"/>
                                                        <div className="dx-file-name">{imageFile?.name}</div>
                                                        {imageFile && <div className="dx-file-size">{fmtSize(imageFile.size)}</div>}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="dx-upload-icon"><Upload size={20}/></div>
                                                        <div className="dx-upload-title">Drop thyroid scan here</div>
                                                        <div className="dx-upload-sub">PNG, JPG, DICOM — max 20 MB</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {(inputMode === 'lab' || inputMode === 'both') && (
                                        <div className="dx-field">
                                            <label className="dx-label">Lab Results</label>
                                            <div className="dx-lab-grid">
                                                {([
                                                    { k:'tsh', label:'TSH', unit:'mIU/L',  normal:'0.4–4.0' },
                                                    { k:'t3',  label:'T3',  unit:'nmol/L', normal:'1.2–2.8' },
                                                    { k:'tt4', label:'TT4', unit:'nmol/L', normal:'60–150'  },
                                                    { k:'t4u', label:'T4U', unit:'ratio',  normal:'0.8–1.1' },
                                                    { k:'fti', label:'FTI', unit:'index',  normal:'55–160'  },
                                                    { k:'age', label:'Age', unit:'yrs',    normal:''        },
                                                ] as const).map(({ k, label, unit, normal }) => (
                                                    <div key={k} className="dx-lab-cell">
                                                        <div className="dx-lab-hd">
                                                            <span className="dx-lab-lbl">{label}</span>
                                                            {normal && <span className="dx-lab-norm">{normal}</span>}
                                                        </div>
                                                        <div className="dx-lab-wrap">
                                                            <input type="number" placeholder="—" value={lab[k]}
                                                                   onChange={e => setLab(prev => ({ ...prev, [k]: e.target.value }))}
                                                                   className="dx-lab-input"/>
                                                            <span className="dx-lab-unit">{unit}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="dx-sex-row">
                                                <span className="dx-label" style={{ margin:0 }}>Sex</span>
                                                <div className="dx-btn-row">
                                                    {(['female','male'] as const).map(sx => (
                                                        <button key={sx}
                                                                className={`dx-btn-pill${lab.sex === sx ? ' dx-btn-pill-active' : ''}`}
                                                                onClick={() => setLab(p => ({ ...p, sex: sx }))}>
                                                            {lab.sex === sx && <Check size={10}/>}
                                                            {sx === 'female' ? '♀ Female' : '♂ Male'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button className="dx-run-btn"
                                    onClick={stage === 'done' ? reset : runDiagnosis}
                                    disabled={isRunning || (!hasInput && stage === 'idle')}>
                                {isRunning ? (
                                    <><span className="dx-spinner"/>{currentStepLabel}</>
                                ) : stage === 'done' ? (
                                    <><Brain size={15}/>New Diagnosis</>
                                ) : (
                                    <><Brain size={15}/>Run AI Diagnosis</>
                                )}
                            </button>

                            {(isRunning || (progress > 0 && stage !== 'done')) && (
                                <div className="dx-progress">
                                    <div className="dx-progress-track">
                                        <div className="dx-progress-fill" style={{ width:`${progress}%` }}/>
                                    </div>
                                    <div className="dx-progress-steps">
                                        {PROCESS_STEPS.map(st => (
                                            <span key={st.label} className={`dx-progress-step${progress >= st.threshold ? ' dx-progress-step-done' : ''}`}>{st.label}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {error && <div className="dx-error"><AlertTriangle size={13}/>{error}</div>}

                            {savedOk && selectedPatient && (
                                <div className="dx-saved">
                                    <Check size={13}/>
                                    Saved to <strong>{selectedPatient.name}</strong>
                                    <Link href={`/patient-management?patientId=${selectedPatient.mrn}&tab=diagnosis`} className="dx-saved-link">View record →</Link>
                                </div>
                            )}

                            {result && sev && (
                                <div style={{ marginTop:20 }}>
                                    <div className="dx-result-card">
                                        <div className="dx-result-strip" style={{ borderBottom:`1px solid ${sev.border}`, background:sev.bg }}>
                                            <div>
                                                <p className="dx-result-lbl" style={{ color:sev.color }}>Malignancy Score</p>
                                                <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
                                                    <span className="dx-result-score" style={{ color:sev.color }}>{result.malignancyScore}</span>
                                                    <span className="dx-result-max">/100</span>
                                                </div>
                                                <p className="dx-result-conf">Confidence: <span style={{ color:sev.color, fontWeight:700 }}>{result.confidence}%</span></p>
                                            </div>
                                            <div style={{ textAlign:'right' }}>
                                                <div className="dx-result-badge" style={{ color:sev.color, borderColor:sev.border, background:sev.color+'14' }}>{result.severity} Risk</div>
                                            </div>
                                        </div>
                                        <div className="dx-result-bar">
                                            <div className="dx-result-bar-fill" style={{ width:`${result.malignancyScore}%`, background:sev.color }}/>
                                        </div>
                                    </div>

                                    <div className="dx-result-grid">
                                        <div className="dx-models-card">
                                            <div className="dx-models-head">
                                                <div className="dx-info-ic" style={{ background:'#F0FDFA', border:'1px solid rgba(13,148,136,0.2)' }}><Activity size={12} color="#0D9488"/></div>
                                                <span style={{ fontSize:13.5, fontWeight:700, color:'#0F172A' }}>Model Results</span>
                                            </div>
                                            {result.topModels.map((m, i) => (
                                                <div key={i} className="dx-model-row" style={{ opacity:m.available?1:0.35 }}>
                                                    <div>
                                                        <div className="dx-model-name">{m.name}</div>
                                                        <div className="dx-model-sub">{m.available ? m.result : 'Not run'}</div>
                                                    </div>
                                                    <div style={{ textAlign:'right' }}>
                                                        <div className="dx-model-conf" style={{ color:m.available?sev.color:'#94A3B8' }}>{m.available?`${m.confidence}%`:'—'}</div>
                                                        {m.available && <div className="dx-model-conf-lbl">confidence</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="dx-voting-card" style={{ background:sev.bg, border:`1px solid ${sev.border}` }}>
                                            <div className="dx-voting-head" style={{ background:sev.color+'12', borderBottom:`1px solid ${sev.border}` }}>
                                                <CheckCircle2 size={13} color={sev.color}/>
                                                <span className="dx-voting-title" style={{ color:sev.color }}>Final Result</span>
                                            </div>
                                            <div className="dx-voting-body">
                                                <div>
                                                    <p className="dx-voting-lbl" style={{ color:sev.color }}>Diagnosis</p>
                                                    <p className="dx-voting-val" style={{ color:sev.color }}>{result.votingResult}</p>
                                                </div>
                                                <div>
                                                    <p className="dx-voting-lbl" style={{ color:sev.color }}>Confidence</p>
                                                    <p className="dx-voting-val" style={{ color:sev.color }}>{result.votingConfidence}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dx-findings-card">
                                        <div className="dx-findings-head">
                                            <div className="dx-info-ic" style={{ background:'#F0FDFA', border:'1px solid rgba(13,148,136,0.2)' }}><FileText size={12} color="#0D9488"/></div>
                                            <span className="dx-findings-title">Key Findings</span>
                                        </div>
                                        <div className="dx-findings-grid">
                                            {result.findings.map((f, i) => (
                                                <div key={i} className="dx-finding-item">
                                                    <div className="dx-finding-dot" style={{ background:sev.color }}/>
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="dx-rec-card" style={{ background:sev.bg, border:`1px solid ${sev.border}` }}>
                                        <div className="dx-rec-head" style={{ borderColor:sev.border, background:sev.color+'10' }}>
                                            <CheckCircle2 size={13} color={sev.color}/>
                                            <span className="dx-rec-title" style={{ color:sev.color }}>Recommendation</span>
                                        </div>
                                        <div className="dx-rec-body">
                                            <p className="dx-rec-text" style={{ color:sev.color==='#059669'?'#065F46':'#7F1D1D' }}>{result.recommendation}</p>
                                        </div>
                                    </div>

                                    <div className="dx-disclaimer">
                                        <Info size={14} color="#F59E0B" style={{ flexShrink:0, marginTop:1 }}/>
                                        <p className="dx-disclaimer-text"><strong>Clinical Decision Support Only.</strong> This AI result is intended to assist qualified medical professionals and must be interpreted by a licensed clinician.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            {!result && stage === 'idle' && (
                                <div className="dx-info-card">
                                    <div className="dx-empty">
                                        <div className="dx-empty-ic"><Brain size={26}/></div>
                                        <p className="dx-empty-text">Submit patient data to begin AI-assisted thyroid cancer diagnosis</p>
                                    </div>
                                </div>
                            )}

                            {isRunning && (
                                <div className="dx-info-card">
                                    <div className="dx-analyzing">
                                        <div className="dx-analyzing-ring"/>
                                        <p className="dx-analyzing-text">{currentStepLabel}</p>
                                        <p className="dx-analyzing-sub">Running AI models...</p>
                                    </div>
                                </div>
                            )}

                            {!result && (
                                <div className="dx-info-card">
                                    <div className="dx-info-head">
                                        <div className="dx-info-ic" style={{ background:'rgba(29,158,117,0.08)', border:'1px solid #CCFBF1' }}><Zap size={13} color="#0D9488"/></div>
                                        <span className="dx-info-title">How it works</span>
                                    </div>
                                    <div className="dx-info-body">
                                        {[
                                            { n:'1', t:'Patient',       d:'Select patient to auto-save results' },
                                            { n:'2', t:'Input',         d:'Upload scan, enter lab values, or both' },
                                            { n:'3', t:'Multi-Model',   d:'Multiple AI models analyze your input' },
                                            { n:'4', t:'Majority Vote', d:'Models vote to produce a final diagnosis' },
                                        ].map(st => (
                                            <div key={st.n} className="dx-how-item">
                                                <div className="dx-how-num">{st.n}</div>
                                                <div className="dx-how-text"><span className="dx-how-bold">{st.t} — </span>{st.d}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="dx-info-card">
                                <div className="dx-info-head">
                                    <div className="dx-info-ic" style={{ background:'#FFFBEB', border:'1px solid #FDE68A' }}><Info size={13} color="#D97706"/></div>
                                    <span className="dx-info-title">Clinical Disclaimer</span>
                                </div>
                                <div className="dx-info-body">
                                    <p style={{ fontSize:13, color:'#64748B', lineHeight:1.65, margin:0 }}>
                                        This AI system is a <strong>clinical decision support tool</strong> intended to assist qualified medical professionals. Results must be interpreted by a licensed clinician.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}