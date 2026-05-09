'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera, Upload, Zap, ArrowLeft, Download, Info, CheckCircle2, User, Check } from 'lucide-react';
import ProgressBar from '@/components/progressBar';
import Navbar from '@/components/Navbar';
import { BASE } from '@/lib/api';
import { uploadToCloudinary, saveImageRecord } from '@/lib/imageStorage';

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
    const [selectedPatientRef, setSelectedPatientRef] = useState<{id:string; mrn:string; name:string} | null>(null);

    const [patientId, setPatientId] = useState('');
    const [scanType,  setScanType]  = useState<ScanType>('Ultrasound');
    const [scanLabel, setScanLabel] = useState('');
    const [savedOk,   setSavedOk]   = useState(false);

    const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        if (!localStorage.getItem('token')) { router.push('/log-in?role=doctor'); return; }
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
                    console.log('API response:', data);
                    const finalOriginal = data.original_image;
                    const finalEnhanced = data.enhanced_image;
                    setOriginalSrc(finalOriginal);
                    setEnhancedSrc(finalEnhanced);
                    if (patientId.trim()) {
                        saveImageRecord(mrn, {
                            id          : `IMG-${Date.now()}`,
                            patientId   : mrn,
                            type        : scanType,
                            date        : new Date().toISOString(),
                            label       : scanLabel.trim() || `${scanType} scan`,
                            originalSrc : finalOriginal,
                            enhancedSrc : finalEnhanced,
                            isEnhanced  : true,
                        });
                        setSavedOk(true);

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
                            // backend case update is non-fatal
                        }
                    }
                }, 400);
            } else { setError(data.error || 'Enhancement failed.'); }
        } catch { setError('Failed to connect to server. Make sure Flask is running.'); }
        finally  { setLoading(false); }
    };

    const activeType = SCAN_TYPES.find(t => t.value === scanType)!;

    return (
        <>
        <style>{`
            @keyframes ie-fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
            @keyframes ie-spin   { to{transform:rotate(360deg)} }
            @keyframes ie-pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }

            .ie-wrap { min-height:100vh; font-family:"DM Sans",sans-serif;
                background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,158,117,0.09) 0%, transparent 60%),
                            radial-gradient(ellipse 50% 40% at 90% 90%, rgba(8,80,65,0.05) 0%, transparent 50%), #FFFFFF; }

            /* Hero */
            .ie-hero {
                background: linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%);
                padding: 52px 52px 48px;
                position: relative; overflow: hidden;
            }
            .ie-hero-dots {
                position:absolute; inset:0; pointer-events:none;
                background-image: radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
                background-size: 20px 20px;
            }
            .ie-hero-blob {
                position:absolute; width:300px; height:300px; border-radius:50%;
                background:rgba(29,158,117,0.15); filter:blur(40px);
                right:-60px; top:-60px; pointer-events:none;
            }
            .ie-hero-inner { position:relative; z-index:1; max-width:1280px; margin:0 auto; }
            .ie-hero-back {
                display:inline-flex; align-items:center; gap:6px;
                padding:7px 14px; border-radius:8px;
                border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06);
                color:rgba(255,255,255,0.7); font-size:12.5px; font-weight:500;
                text-decoration:none; margin-bottom:22px;
                transition:all .18s; cursor:pointer;
            }
            .ie-hero-back:hover { background:rgba(255,255,255,0.1); color:#fff; }
            .ie-hero-badge {
                display:inline-flex; align-items:center; gap:6px;
                padding:5px 12px; border-radius:100px;
                border:1px solid rgba(29,158,117,0.4); background:rgba(29,158,117,0.12);
                font-size:10px; font-weight:800; letter-spacing:2px; text-transform:uppercase;
                color:#6EE7B7; margin-bottom:14px;
            }
            .ie-hero-badge-dot { width:5px; height:5px; border-radius:50%; background:#1D9E75; animation:ie-pulse 2s ease-in-out infinite; }
            .ie-hero-title {
                font-family:"DM Serif Display",serif; font-size:clamp(28px,3.5vw,44px);
                color:#fff; letter-spacing:-0.8px; line-height:1.1; margin:0 0 22px;
            }
            .ie-hero-title em { font-style:italic; color:#6EE7B7; }
            .ie-hero-pills { display:flex; gap:10px; flex-wrap:wrap; }
            .ie-hero-pill {
                display:flex; align-items:center; gap:8px;
                padding:8px 16px; border-radius:10px;
                background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1);
            }
            .ie-pill-val { font-size:15px; font-weight:800; color:#fff; }
            .ie-pill-lbl { font-size:11px; color:rgba(255,255,255,0.55); font-weight:500; }

            /* Main content */
            .ie-main { max-width:1280px; margin:0 auto; padding:44px 52px 100px; }

            /* Grid */
            .ie-grid { display:grid; grid-template-columns:1fr 340px; gap:24px; align-items:start; }

            /* Card */
            .ie-card {
                background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:16px;
                overflow:hidden; margin-bottom:16px;
                box-shadow:0 1px 3px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.05),0 0 40px rgba(13,148,136,0.05);
                animation:ie-fadeUp .5s cubic-bezier(.16,1,.3,1) both;
                transition:box-shadow .25s;
            }
            .ie-card:last-child { margin-bottom:0; }
            .ie-card:hover { box-shadow:0 1px 3px rgba(0,0,0,0.08),0 12px 32px rgba(0,0,0,0.08),0 0 50px rgba(13,148,136,0.08); }
            .ie-card-head {
                display:flex; align-items:center; gap:12px;
                padding:18px 24px; border-bottom:1px solid rgba(0,0,0,0.06);
                background:linear-gradient(to right,#f8fffe,#fff);
            }
            .ie-card-icon {
                width:36px; height:36px; border-radius:10px;
                background:linear-gradient(135deg,#1D9E75,#0D9488);
                display:flex; align-items:center; justify-content:center;
                box-shadow:0 4px 12px rgba(13,148,136,0.3); flex-shrink:0;
            }
            .ie-card-title { font-size:14px; font-weight:700; color:#111827; letter-spacing:-0.1px; }
            .ie-card-body { padding:24px; }

            /* Badges */
            .ie-optional-badge {
                margin-left:auto; font-size:10.5px; font-weight:700; color:#9CA3AF;
                background:#F9FAFB; border:1px solid rgba(0,0,0,0.08);
                padding:3px 9px; border-radius:20px;
            }
            .ie-scan-pill {
                margin-left:auto; font-size:11px; font-weight:800; letter-spacing:.3px;
                padding:4px 11px; border-radius:20px; border:1px solid;
            }

            /* Fields */
            .ie-field { margin-bottom:18px; position:relative; }
            .ie-field:last-child { margin-bottom:0; }
            .ie-label {
                display:block; font-size:11px; font-weight:800; letter-spacing:.6px;
                text-transform:uppercase; color:#6B7280; margin-bottom:8px;
            }
            .ie-label-opt { font-weight:500; text-transform:none; color:#9CA3AF; letter-spacing:0; }
            .ie-input {
                width:100%; height:46px; padding:0 14px; box-sizing:border-box;
                border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
                font-family:"DM Sans",sans-serif; font-size:13.5px; color:#111827;
                background:#F9FAFB; outline:none; transition:all .2s;
            }
            .ie-input::placeholder { color:#9CA3AF; }
            .ie-input:focus { border-color:#0D9488; background:#fff; box-shadow:0 0 0 4px rgba(13,148,136,0.08); }
            .ie-hint { margin:6px 0 0; font-size:12px; color:#0D9488; font-weight:500; line-height:1.5; }

            /* Suggest dropdown */
            .ie-suggest {
                position:absolute; top:calc(100% - 2px); left:0; right:0;
                background:#fff; border:1.5px solid rgba(13,148,136,0.3);
                border-top:none; border-radius:0 0 10px 10px;
                box-shadow:0 8px 24px rgba(15,23,42,.12); z-index:50; overflow:hidden;
            }
            .ie-suggest-item {
                display:flex; align-items:center; justify-content:space-between;
                width:100%; padding:10px 14px; border:none; background:#fff;
                cursor:pointer; transition:background .12s; text-align:left;
                border-bottom:1px solid rgba(0,0,0,0.04);
            }
            .ie-suggest-item:last-child { border-bottom:none; }
            .ie-suggest-item:hover { background:#F0FDFA; }
            .ie-suggest-name { font-size:13.5px; font-weight:600; color:#111827; }
            .ie-suggest-mrn  { font-size:11.5px; color:#9CA3AF; font-variant-numeric:tabular-nums; }

            /* Type grid */
            .ie-type-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
            .ie-type-btn {
                display:flex; align-items:center; justify-content:center; gap:5px;
                height:40px; border:1.5px solid rgba(0,0,0,0.1); border-radius:10px;
                background:#F9FAFB; font-family:"DM Sans",sans-serif;
                font-size:12.5px; font-weight:700; color:#6B7280;
                cursor:pointer; transition:all .18s; white-space:nowrap;
            }
            .ie-type-btn:hover { border-color:rgba(13,148,136,0.4); color:#0D9488; background:#F0FDFA; }

            /* Upload zone */
            .ie-upload {
                position:relative; border:2px dashed #0D9488; border-radius:14px;
                padding:44px 24px; text-align:center; cursor:pointer;
                transition:all .25s cubic-bezier(.16,1,.3,1); background:#fafcfe;
                overflow:hidden; margin-bottom:18px;
            }
            .ie-upload::before {
                content:''; position:absolute; inset:0;
                background:radial-gradient(ellipse at 50% 50%, rgba(13,148,136,.04), transparent 70%);
                pointer-events:none;
            }
            .ie-upload:hover,.ie-upload-over {
                border-color:#0D9488; background:#F0FDFA;
                transform:scale(1.008); box-shadow:0 8px 32px rgba(13,148,136,.12);
            }
            .ie-upload input[type="file"] { position:absolute; inset:0; opacity:0; cursor:pointer; z-index:2; }
            .ie-upload-icon {
                width:60px; height:60px; border-radius:18px; background:#fff;
                border:1.5px solid rgba(0,0,0,0.08); display:flex; align-items:center;
                justify-content:center; margin:0 auto 16px; color:#0D9488;
                box-shadow:0 2px 8px rgba(0,0,0,0.06);
                transition:transform .3s cubic-bezier(.16,1,.3,1); position:relative; z-index:1;
            }
            .ie-upload:hover .ie-upload-icon { transform:translateY(-4px) scale(1.04); }
            .ie-upload-title { font-size:15px; font-weight:700; color:#111827; margin-bottom:5px; position:relative; z-index:1; }
            .ie-upload-sub   { font-size:13px; color:#9CA3AF; position:relative; z-index:1; }
            .ie-preview-img  { width:100%; max-height:200px; object-fit:contain; border-radius:10px; margin-bottom:12px; position:relative; z-index:1; }
            .ie-file-name    { font-size:13.5px; font-weight:700; color:#111827; margin-bottom:2px; z-index:1; position:relative; }
            .ie-file-size    { font-size:12px; color:#9CA3AF; z-index:1; position:relative; }

            /* Enhance button */
            .ie-enhance-btn {
                width:100%; height:48px;
                background:linear-gradient(135deg,#1D9E75 0%,#0D9488 50%,#0F6E56 100%);
                color:#fff; border:none; border-radius:11px;
                font-family:"DM Sans",sans-serif; font-size:14px; font-weight:700;
                display:flex; align-items:center; justify-content:center; gap:9px;
                cursor:pointer; transition:all .22s cubic-bezier(.16,1,.3,1);
                box-shadow:0 4px 16px rgba(29,158,117,.28),inset 0 1px 0 rgba(255,255,255,.15);
                margin-bottom:18px; letter-spacing:0.1px;
            }
            .ie-enhance-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(13,148,136,.4); }
            .ie-enhance-btn:active:not(:disabled) { transform:translateY(0); }
            .ie-enhance-btn:disabled { opacity:.45; cursor:not-allowed; transform:none; box-shadow:none; }
            .ie-spinner {
                width:18px; height:18px; border:2.5px solid rgba(255,255,255,.3);
                border-top-color:#fff; border-radius:50%; animation:ie-spin .7s linear infinite; flex-shrink:0;
            }
            .ie-progress-wrap { margin-top:2px; animation:ie-fadeUp .3s ease both; }

            /* Error / saved */
            .ie-error {
                display:flex; align-items:center; gap:9px;
                padding:13px 16px; background:#FFF1F2; border:1px solid #FECDD3;
                border-radius:10px; color:#EF4444; font-size:13px; font-weight:600;
                margin-top:14px; animation:ie-fadeUp .25s ease both;
            }
            .ie-saved {
                display:flex; align-items:center; gap:9px; flex-wrap:wrap;
                padding:13px 16px; background:#F0FDFA; border:1px solid #99F6E4;
                border-radius:10px; color:#0D9488; font-size:13px; font-weight:600;
                margin-top:14px; animation:ie-fadeUp .3s cubic-bezier(.16,1,.3,1) both;
            }
            .ie-saved strong { color:#0F172A; }
            .ie-saved-link {
                margin-left:auto; font-size:12.5px; font-weight:700; color:#0D9488;
                text-decoration:none; background:#fff; border:1px solid rgba(13,148,136,0.3);
                padding:4px 12px; border-radius:8px; transition:all .18s; white-space:nowrap;
                cursor:pointer;
            }
            .ie-saved-link:hover { background:#0D9488; color:#fff; }

            /* Results */
            .ie-results { margin-top:28px; animation:ie-fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
            .ie-sec-head { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
            .ie-sec-label { font-size:10px; font-weight:800; letter-spacing:2.5px; text-transform:uppercase; color:#1D9E75; white-space:nowrap; }
            .ie-sec-line  { flex:1; height:1px; background:linear-gradient(to right,rgba(13,148,136,0.3),transparent); }
            .ie-sec-type  { font-size:11px; font-weight:800; padding:3px 10px; border-radius:20px; border:1px solid; white-space:nowrap; }
            .ie-res-grid  { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
            .ie-img-card  { background:#fff; border:1.5px solid rgba(0,0,0,0.08); border-radius:14px; overflow:hidden; transition:all .2s; }
            .ie-img-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.1); transform:translateY(-2px); }
            .ie-img-card-enh { border-color:rgba(13,148,136,0.3); box-shadow:0 0 0 1px rgba(13,148,136,0.1); }
            .ie-img-hdr { display:flex; align-items:center; gap:8px; padding:11px 14px; background:#F9FAFB; border-bottom:1px solid rgba(0,0,0,0.06); }
            .ie-img-dot { width:7px; height:7px; border-radius:50%; background:rgba(0,0,0,0.15); }
            .ie-img-dot-teal { background:#0D9488; box-shadow:0 0 0 3px rgba(13,148,136,.2); }
            .ie-img-lbl { font-size:12px; font-weight:700; color:#9CA3AF; }
            .ie-img-lbl-teal { color:#0D9488; }
            .ie-img-badge { margin-left:auto; background:linear-gradient(135deg,#1D9E75,#0D9488); color:#fff; font-size:9px; font-weight:800; letter-spacing:1px; padding:2px 7px; border-radius:5px; }
            .ie-img-result { width:100%; display:block; aspect-ratio:4/3; object-fit:contain; background:#f8fafc; }
            .ie-dl-btn { display:flex; align-items:center; justify-content:center; gap:7px; padding:11px; font-size:12px; font-weight:600; color:#9CA3AF; text-decoration:none; border-top:1px solid rgba(0,0,0,0.06); background:#fff; transition:all .18s; }
            .ie-dl-btn:hover { color:#111827; background:#F9FAFB; }
            .ie-dl-btn-teal:hover { color:#0D9488; background:#F0FDFA; }

            /* Sidebar */
            .ie-sidebar { display:flex; flex-direction:column; gap:14px; animation:ie-fadeUp .55s cubic-bezier(.16,1,.3,1) .1s both; }
            .ie-info-card {
                background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius:14px;
                overflow:hidden;
                box-shadow:0 1px 3px rgba(0,0,0,0.07),0 8px 24px rgba(0,0,0,0.05),0 0 40px rgba(13,148,136,0.05);
                transition:all .2s;
            }
            .ie-info-card:hover { box-shadow:0 1px 3px rgba(0,0,0,0.08),0 12px 32px rgba(0,0,0,0.08); transform:translateY(-1px); }
            .ie-info-head { display:flex; align-items:center; gap:10px; padding:14px 18px; border-bottom:1px solid rgba(0,0,0,0.06); background:#F9FAFB; }
            .ie-info-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
            .ie-info-title { font-size:13px; font-weight:700; color:#111827; }
            .ie-info-body  { padding:16px 18px; }

            /* How steps */
            .ie-how-list { display:flex; flex-direction:column; gap:11px; }
            .ie-how-item { display:flex; align-items:flex-start; gap:11px; }
            .ie-how-num  { width:22px; height:22px; border-radius:50%; background:linear-gradient(135deg,#1D9E75,#0D9488); color:#fff; font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; box-shadow:0 2px 8px rgba(13,148,136,.3); }
            .ie-how-text { font-size:12.5px; color:#4B5563; line-height:1.55; }
            .ie-how-bold { font-weight:700; color:#111827; }

            /* Scan type list */
            .ie-scan-list { display:flex; flex-direction:column; gap:10px; }
            .ie-scan-item { display:flex; align-items:flex-start; gap:10px; }
            .ie-scan-tag  { font-size:11px; font-weight:800; padding:3px 10px; border-radius:20px; border:1px solid; white-space:nowrap; flex-shrink:0; margin-top:1px; }
            .ie-scan-desc { font-size:12.5px; color:#4B5563; line-height:1.5; }

            /* Tips */
            .ie-tips-list { display:flex; flex-direction:column; gap:9px; }
            .ie-tip-item  { display:flex; align-items:flex-start; gap:8px; }
            .ie-tip-dot   { width:5px; height:5px; border-radius:50%; background:#1D9E75; flex-shrink:0; margin-top:6px; }
            .ie-tip-text  { font-size:12.5px; color:#4B5563; line-height:1.5; }

            @media (max-width:1024px) {
                .ie-hero { padding:40px 28px 36px; }
                .ie-main { padding:36px 28px 80px; }
                .ie-grid { grid-template-columns:1fr; }
                .ie-sidebar { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); }
                .ie-type-grid { grid-template-columns:repeat(2,1fr); }
            }
            @media (max-width:640px) {
                .ie-hero { padding:32px 16px 28px; }
                .ie-main { padding:28px 16px 60px; }
                .ie-res-grid { grid-template-columns:1fr; }
                .ie-sidebar { grid-template-columns:1fr; }
                .ie-type-grid { grid-template-columns:repeat(2,1fr); }
            }
        `}</style>
        <div className="ie-wrap">
            <Navbar />

            {/* Dark hero */}
            <div className="ie-hero">
                <div className="ie-hero-dots" />
                <div className="ie-hero-blob" />
                <div className="ie-hero-inner">
                    <Link href="/dashboard" className="ie-hero-back">
                        <ArrowLeft size={13} /> Dashboard
                    </Link>
                    <div className="ie-hero-badge">
                        <span className="ie-hero-badge-dot" />
                        AI-Powered
                    </div>
                    <h1 className="ie-hero-title">Image <em>Enhancement</em></h1>
                    <div className="ie-hero-pills">
                        {[
                            { val:'Deep Learning', lbl:'Technology' },
                            { val:'2 Scan Types',  lbl:'Supported' },
                            { val:'Auto-Saved',    lbl:'To Patient' },
                        ].map(p => (
                            <div key={p.val} className="ie-hero-pill">
                                <span className="ie-pill-val">{p.val}</span>
                                <span className="ie-pill-lbl">{p.lbl}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <main className="ie-main">
                <div className="ie-grid">
                    <div>
                        {/* Patient & Scan Info */}
                        <div className="ie-card">
                            <div className="ie-card-head">
                                <div className="ie-card-icon" style={{ background:'linear-gradient(135deg,#0F766E,#0D9488)' }}>
                                    <User size={18} color="white" />
                                </div>
                                <span className="ie-card-title">Patient &amp; Scan Info</span>
                                <span className="ie-optional-badge">Optional</span>
                            </div>
                            <div className="ie-card-body">
                                <div className="ie-field">
                                    <label className="ie-label">Patient</label>
                                    <input
                                        className="ie-input" type="text"
                                        placeholder="Search by name or MRN..."
                                        value={patientId} autoComplete="off"
                                        onChange={e => {
                                            setPatientId(e.target.value);
                                            setSelectedPatientRef(null);
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
                                            <div className="ie-suggest">
                                                {matches.map(p => (
                                                    <button key={p.id} className="ie-suggest-item"
                                                            onMouseDown={() => {
                                                                setPatientId(p.mrn);
                                                                setSelectedPatientRef({ id: p.id, mrn: p.mrn, name: p.name });
                                                                setShowSuggest(false);
                                                                setSavedOk(false);
                                                            }}>
                                                        <span className="ie-suggest-name">{p.name}</span>
                                                        <span className="ie-suggest-mrn">{p.mrn}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null;
                                    })()}
                                    {selectedPatientRef && (
                                        <p className="ie-hint">✓ {selectedPatientRef.name} — Image will be saved automatically after enhancement.</p>
                                    )}
                                    {!selectedPatientRef && patientId.trim() && (
                                        <p className="ie-hint">Image will be saved automatically to this patient's record after enhancement.</p>
                                    )}
                                </div>

                                <div className="ie-field">
                                    <label className="ie-label">Scan Type</label>
                                    <div className="ie-type-grid">
                                        {SCAN_TYPES.map(t => (
                                            <button key={t.value}
                                                    className="ie-type-btn"
                                                    style={scanType === t.value ? { background:'#fff', borderColor:'#0D9488', borderWidth:'2px', color:'#0D9488' } : {}}
                                                    onClick={() => setScanType(t.value)}>
                                                {scanType === t.value && <Check size={12} />}
                                                {t.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="ie-field">
                                    <label className="ie-label">Scan Label <span className="ie-label-opt">(optional)</span></label>
                                    <input className="ie-input" type="text"
                                           placeholder="e.g. Right lobe longitudinal"
                                           value={scanLabel} onChange={e => setScanLabel(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Upload card */}
                        <div className="ie-card">
                            <div className="ie-card-head">
                                <div className="ie-card-icon"><Camera size={18} color="white" /></div>
                                <span className="ie-card-title">Upload Scan</span>
                                <span className="ie-scan-pill" style={{ background:activeType.bg, color:activeType.color, borderColor:activeType.border }}>{scanType}</span>
                            </div>
                            <div className="ie-card-body">
                                <div className={`ie-upload${dragOver ? ' ie-upload-over' : ''}`}
                                     onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                     onDragLeave={() => setDragOver(false)} onDrop={handleDrop}>
                                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                                    {preview ? (
                                        <>
                                            <img src={preview} className="ie-preview-img" alt="preview" />
                                            <div className="ie-file-name">{selectedFile?.name}</div>
                                            {selectedFile && <div className="ie-file-size">{fmtSize(selectedFile.size)}</div>}
                                        </>
                                    ) : (
                                        <>
                                            <div className="ie-upload-icon"><Upload size={24} /></div>
                                            <div className="ie-upload-title">Drop your {scanType} scan here</div>
                                            <div className="ie-upload-sub">or click to browse — PNG, JPG, DICOM</div>
                                        </>
                                    )}
                                </div>

                                <button className="ie-enhance-btn" onClick={handleEnhance} disabled={!selectedFile || loading}>
                                    {loading ? <><span className="ie-spinner" />Enhancing...</> : <><Zap size={15} />Enhance {scanType}</>}
                                </button>

                                {(loading || progress > 0) && (
                                    <div className="ie-progress-wrap">
                                        <ProgressBar progress={progress} steps={PROCESS_STEPS} label="Processing" />
                                    </div>
                                )}

                                {error && (
                                    <div className="ie-error">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2"/>
                                            <path d="M12 8v4M12 16h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                {savedOk && (
                                    <div className="ie-saved">
                                        <Check size={14} />
                                        Saved to patient <strong>{selectedPatientRef?.name || patientId}</strong>
                                        {' '}({selectedPatientRef?.mrn || patientId})
                                        <button className="ie-saved-link"
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
                            <div className="ie-results">
                                <div className="ie-sec-head">
                                    <span className="ie-sec-label">Results</span>
                                    <div className="ie-sec-line" />
                                    <span className="ie-sec-type" style={{ background:activeType.bg, color:activeType.color, borderColor:activeType.border }}>{scanType}</span>
                                </div>
                                <div className="ie-res-grid">
                                    <div className="ie-img-card">
                                        <div className="ie-img-hdr">
                                            <div className="ie-img-dot" />
                                            <span className="ie-img-lbl">Original</span>
                                        </div>
                                        <img src={originalSrc} alt="Original" className="ie-img-result" />
                                        <a href={originalSrc} download="original.png" className="ie-dl-btn"><Download size={12} /> Download Original</a>
                                    </div>
                                    <div className="ie-img-card ie-img-card-enh">
                                        <div className="ie-img-hdr">
                                            <div className="ie-img-dot ie-img-dot-teal" />
                                            <span className="ie-img-lbl ie-img-lbl-teal">Enhanced</span>
                                            <span className="ie-img-badge">AI</span>
                                        </div>
                                        <img src={enhancedSrc} alt="Enhanced" className="ie-img-result" />
                                        <a href={enhancedSrc} download="enhanced.png" className="ie-dl-btn ie-dl-btn-teal"><Download size={12} /> Download Enhanced</a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="ie-sidebar">
                        <div className="ie-info-card">
                            <div className="ie-info-head">
                                <div className="ie-info-icon" style={{ background:'rgba(13,148,136,.08)', border:'1px solid #CCFBF1' }}>
                                    <Zap size={14} color="#0D9488" />
                                </div>
                                <span className="ie-info-title">How it works</span>
                            </div>
                            <div className="ie-info-body">
                                <div className="ie-how-list">
                                    {[
                                        { n:'1', t:'Patient Info', d:'Enter the Patient ID and select the scan type' },
                                        { n:'2', t:'Upload',       d:'Drop your Ultrasound or CT scan' },
                                        { n:'3', t:'Enhance',      d:'AI improves quality using deep learning' },
                                        { n:'4', t:'Auto-save',    d:'Image saved to patient record automatically' },
                                    ].map(st => (
                                        <div key={st.n} className="ie-how-item">
                                            <div className="ie-how-num">{st.n}</div>
                                            <div className="ie-how-text"><span className="ie-how-bold">{st.t} — </span>{st.d}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="ie-info-card">
                            <div className="ie-info-head">
                                <div className="ie-info-icon" style={{ background:'rgba(8,145,178,.08)', border:'1px solid #BAE6FD' }}>
                                    <Info size={14} color="#0891B2" />
                                </div>
                                <span className="ie-info-title">Scan Types</span>
                            </div>
                            <div className="ie-info-body">
                                <div className="ie-scan-list">
                                    {[
                                        { type:'Ultrasound', desc:'Thyroid nodule assessment & soft tissue imaging' },
                                        { type:'CT Scan',    desc:'Cross-sectional anatomy & lesion detection' },
                                    ].map(item => {
                                        const t = SCAN_TYPES.find(t => t.value === item.type)!;
                                        return (
                                            <div key={item.type} className="ie-scan-item">
                                                <span className="ie-scan-tag" style={{ background:t.bg, color:t.color, borderColor:t.border }}>{item.type}</span>
                                                <span className="ie-scan-desc">{item.desc}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="ie-info-card">
                            <div className="ie-info-head">
                                <div className="ie-info-icon" style={{ background:'rgba(13,148,136,.08)', border:'1px solid #CCFBF1' }}>
                                    <CheckCircle2 size={14} color="#0D9488" />
                                </div>
                                <span className="ie-info-title">Best practices</span>
                            </div>
                            <div className="ie-info-body">
                                <div className="ie-tips-list">
                                    {[
                                        'Use high-resolution scans for best results',
                                        'Ensure proper probe positioning before capture',
                                        'Avoid motion blur — hold still during imaging',
                                        'DICOM files preserve the most diagnostic detail',
                                    ].map((tip, i) => (
                                        <div key={i} className="ie-tip-item">
                                            <div className="ie-tip-dot" />
                                            <span className="ie-tip-text">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        </>
    );
}
