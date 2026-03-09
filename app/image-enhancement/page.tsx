'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Camera, Upload, Zap, ArrowLeft, Download, Info, CheckCircle2,
} from 'lucide-react';
import s from './styles.module.css';
import ProgressBar from '@/components/progressBar';
import Navbar from '@/components/Navbar';

interface EnhanceResponse { success: boolean; original: string; enhanced: string; loading?: boolean; error?: string; }

const PROCESS_STEPS = [
    { label: 'Analyzing',  threshold: 20  },
    { label: 'Upscaling',  threshold: 50  },
    { label: 'Enhancing',  threshold: 75  },
    { label: 'Sharpening', threshold: 90  },
    { label: 'Done',       threshold: 100 },
];

const fmtSize = (b: number) => b < 1024*1024 ? `${(b/1024).toFixed(0)} KB` : `${(b/1024/1024).toFixed(1)} MB`;

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

    const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) router.push('/log-in');
    }, []);

    const handleFile = (file: File) => {
        setSelectedFile(file);
        setOriginalSrc(''); setEnhancedSrc('');
        setError(''); setProgress(0);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]; if (f) handleFile(f);
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
        setLoading(true); setError(''); simulateProgress();
        const fd = new FormData();
        fd.append('image', selectedFile);
        try {
            const res  = await fetch('http://localhost:5000/api/enhance', { method:'POST', body:fd });
            const data: EnhanceResponse = await res.json();
            if (res.status === 503 && data.loading) { setError('Model is loading, please try again in 30 seconds.'); return; }
            if (!res.ok) { setError(data.error || `Error ${res.status}`); return; }
            if (data.success) {
                clearTimers(); setProgress(100);
                setTimeout(() => { setOriginalSrc(data.original); setEnhancedSrc(data.enhanced); }, 400);
            } else { setError(data.error || 'Enhancement failed.'); }
        } catch { setError('Failed to connect to server. Make sure Flask is running.'); }
        finally  { setLoading(false); }
    };

    return (
        <div className={s.wrap}>

            {/* ══ NAVBAR الموحد ══ */}
            <Navbar />

            {/* ══ MAIN ══ */}
            <main className={s.main}>

                {/* Page header */}
                <div className={s.pageHeader}>
                    <Link href="/dashboard" className={s.backBtn}>
                        <ArrowLeft size={13} /> Dashboard
                    </Link>
                    <div className={s.pageHeading}>
                        <div className={s.pageBadge}>
                            <span style={{ width:4, height:4, borderRadius:'50%', background:'#0D9488', display:'inline-block' }} />
                            AI-Powered
                        </div>
                        <h1 className={s.pageTitle}>Ultrasound <em>Enhancement</em></h1>
                    </div>
                </div>

                {/* Content grid */}
                <div className={s.contentGrid}>

                    {/* LEFT */}
                    <div>
                        <div className={s.card}>
                            <div className={s.cardHead}>
                                <div className={s.cardHeadIc}><Camera size={18} color="white" /></div>
                                <div className={s.cardTitle}>Upload Scan</div>
                            </div>
                            <div className={s.cardBody}>

                                <div
                                    className={`${s.uploadZone} ${dragOver ? s.dragOver : ''}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                >
                                    <input type="file" accept="image/*" onChange={handleFileChange} />
                                    {preview ? (
                                        <>
                                            <img src={preview} className={s.previewThumb} alt="preview" />
                                            <div className={s.fileName}>{selectedFile?.name}</div>
                                            {selectedFile && <div className={s.fileSize}>{fmtSize(selectedFile.size)}</div>}
                                        </>
                                    ) : (
                                        <>
                                            <div className={s.uploadIconWrap}><Upload size={24} /></div>
                                            <div className={s.uploadTitle}>Drop your ultrasound here</div>
                                            <div className={s.uploadSub}>or click to browse — PNG, JPG, DICOM</div>
                                        </>
                                    )}
                                </div>

                                <button className={s.enhanceBtn} onClick={handleEnhance} disabled={!selectedFile || loading}>
                                    {loading
                                        ? <><span className={s.btnSpinner} />Enhancing…</>
                                        : <><Zap size={15} />Enhance Image</>
                                    }
                                </button>

                                {(loading || progress > 0) && (
                                    <div className={s.progressWrap}>
                                        <ProgressBar progress={progress} steps={PROCESS_STEPS} label="Processing" />
                                    </div>
                                )}

                                {error && (
                                    <div className={s.errorBox}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="#E11D48" strokeWidth="2"/>
                                            <path d="M12 8v4M12 16h.01" stroke="#E11D48" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        {error}
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
                                </div>
                                <div className={s.resultsGrid}>
                                    <div className={s.imgCard}>
                                        <div className={s.imgHeader}>
                                            <div className={s.imgDot} />
                                            <span className={s.imgLabel}>Original</span>
                                        </div>
                                        <img src={originalSrc} alt="Original" className={s.imgResult} />
                                        <a href={originalSrc} download="original.png" className={s.downloadBtn}>
                                            <Download size={13} /> Download Original
                                        </a>
                                    </div>
                                    <div className={`${s.imgCard} ${s.imgCardEnhanced}`}>
                                        <div className={s.imgHeader}>
                                            <div className={`${s.imgDot} ${s.imgDotEnhanced}`} />
                                            <span className={`${s.imgLabel} ${s.imgLabelEnhanced}`}>Enhanced</span>
                                            <span className={s.imgBadge}>AI</span>
                                        </div>
                                        <img src={enhancedSrc} alt="Enhanced" className={s.imgResult} />
                                        <a href={enhancedSrc} download="enhanced.png" className={`${s.downloadBtn} ${s.downloadBtnEnhanced}`}>
                                            <Download size={13} /> Download Enhanced
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT — sidebar */}
                    <div className={s.sidebar}>
                        <div className={s.infoCard}>
                            <div className={s.infoCardHead}>
                                <div className={s.infoCardIc} style={{ background:'rgba(13,148,136,0.08)', border:'1px solid #CCFBF1' }}>
                                    <Zap size={14} color="#0D9488" />
                                </div>
                                <div className={s.infoCardTitle}>How it works</div>
                            </div>
                            <div className={s.infoCardBody}>
                                <div className={s.howList}>
                                    {[
                                        { n:'1', t:'Upload',   d:'Drop your thyroid ultrasound scan' },
                                        { n:'2', t:'Process',  d:'AI enhances quality using deep learning' },
                                        { n:'3', t:'Download', d:'Compare original vs enhanced and export' },
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
                                <div className={s.infoCardIc} style={{ background:'rgba(124,58,237,0.08)', border:'1px solid #EDE9FE' }}>
                                    <Info size={14} color="#7C3AED" />
                                </div>
                                <div className={s.infoCardTitle}>Supported formats</div>
                            </div>
                            <div className={s.infoCardBody}>
                                <div className={s.formatsList}>
                                    {['PNG','JPG','JPEG','WEBP','DICOM','TIFF'].map(f => (
                                        <span key={f} className={s.formatTag}>{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={s.infoCard}>
                            <div className={s.infoCardHead}>
                                <div className={s.infoCardIc} style={{ background:'rgba(13,148,136,0.08)', border:'1px solid #CCFBF1' }}>
                                    <CheckCircle2 size={14} color="#0D9488" />
                                </div>
                                <div className={s.infoCardTitle}>Best practices</div>
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
                                            <div className={s.tipDot} />
                                            <span className={s.tipText}>{tip}</span>
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