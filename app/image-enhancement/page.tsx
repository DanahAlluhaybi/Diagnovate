'use client';

import { Merriweather } from 'next/font/google';
const merriweather = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700', '900'] });

import { useState, useCallback, useRef } from 'react';
import styles from './styles.module.css';

interface EnhanceResponse {
    success: boolean;
    original: string;
    enhanced: string;
    loading?: boolean;
    error?: string;
}

export default function ImageEnhancementPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [originalSrc, setOriginalSrc] = useState<string>('');
    const [enhancedSrc, setEnhancedSrc] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const [dragOver, setDragOver] = useState<boolean>(false);
    const timerIds = useRef<ReturnType<typeof setTimeout>[]>([]);

    const handleFile = (file: File) => {
        setSelectedFile(file);
        setOriginalSrc('');
        setEnhancedSrc('');
        setError('');
        setProgress(0);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) handleFile(file);
    }, []);

    const clearTimers = () => {
        timerIds.current.forEach(clearTimeout);
        timerIds.current = [];
    };

    const simulateProgress = () => {
        clearTimers();
        setProgress(0);
        const stages = [
            { target: 20, delay: 100 },
            { target: 50, delay: 300 },
            { target: 75, delay: 500 },
            { target: 90, delay: 700 },
        ];
        stages.forEach(({ target, delay }) => {
            const id = setTimeout(() => setProgress(target), delay);
            timerIds.current.push(id);
        });
    };

    const handleEnhance = async () => {
        if (!selectedFile) return;
        setLoading(true);
        setError('');
        simulateProgress();

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('http://localhost:5000/api/enhance', {
                method: 'POST',
                body: formData,
            });

            const data: EnhanceResponse = await response.json();

            if (response.status === 503 && data.loading) {
                setError('Model is loading, please try again in 30 seconds');
                return;
            }

            if (!response.ok) {
                setError(data.error || 'Error: ' + response.status);
                return;
            }

            if (data.success) {
                clearTimers();
                setProgress(100);
                setTimeout(() => {
                    setOriginalSrc(data.original);
                    setEnhancedSrc(data.enhanced);
                }, 400);
            } else {
                setError(data.error || 'Unknown error');
            }
        } catch (err) {
            setError('Failed to connect to server. Make sure Flask is running.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { label: 'Analyzing', threshold: 20 },
        { label: 'Upscaling', threshold: 50 },
        { label: 'Enhancing', threshold: 75 },
        { label: 'Sharpening', threshold: 90 },
        { label: 'Done', threshold: 100 },
    ];

    return (
        <div className={`${styles.page} ${merriweather.className}`}>

            {/* Navbar */}
            <header className={styles.navbar}>
                <a href="/dashboard" className={styles.backBtn}>
                    ← Back to Dashboard
                </a>
            </header>

            {/* Main */}
            <div className={styles.main}>

                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.badge}>
                        <div className={styles.badgeDot} />
                        AI-Powered
                    </div>
                    <h1 className={styles.pageTitle}>Ultrasound Enhancement</h1>
                    <p className={styles.pageSub}>Transform medical scans into crystal-clear diagnostic quality</p>
                </div>

                {/* Upload Card */}
                <div className={styles.card}>
                    <div className={styles.cardTitle}>
                        Upload Image
                    </div>

                    <div
                        className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {preview ? (
                            <>
                                <img src={preview} className={styles.previewThumb} alt="preview" />
                                <div className={styles.fileName}>{selectedFile?.name}</div>
                            </>
                        ) : (
                            <>
                                <div className={styles.uploadIcon}>📂</div>
                                <div className={styles.uploadTitle}>Drop your image here</div>
                                <div className={styles.uploadSub}>or click to browse — PNG, JPG</div>
                            </>
                        )}
                    </div>

                    <button
                        className={styles.enhanceBtn}
                        onClick={handleEnhance}
                        disabled={!selectedFile || loading}
                    >
                        {loading ? 'Enhancing...' : 'Enhance Image'}
                    </button>

                    {(loading || progress > 0) && (
                        <div className={styles.progress}>
                            <div className={styles.progressHeader}>
                                <span className={styles.progressLabel}>Processing</span>
                                <span className={styles.progressPct}>{progress}%</span>
                            </div>
                            <div className={styles.progressTrack}>
                                <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                            </div>
                            <div className={styles.steps}>
                                {steps.map(({ label, threshold }) => (
                                    <span
                                        key={label}
                                        className={`${styles.step} ${progress >= threshold ? styles.done : progress >= threshold - 25 ? styles.active : ''}`}
                                    >
                                        {progress >= threshold ? '✓ ' : ''}{label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && <div className={styles.errorBox}>⚠ {error}</div>}
                </div>

                {/* Results */}
                {originalSrc && enhancedSrc && (
                    <div className={styles.results}>
                        <div className={styles.resultsLabel}>Results</div>
                        <div className={styles.resultsGrid}>
                            <div className={styles.imgCard}>
                                <div className={styles.imgHeader}>
                                    <div className={styles.imgDot} />
                                    <span className={styles.imgLabel}>Original</span>
                                </div>
                                <img src={originalSrc} alt="Original" className={styles.imgResult} />
                                <a href={originalSrc} download="original.png" className={styles.downloadBtn}>
                                    ⬇ Download Original
                                </a>
                            </div>
                            <div className={`${styles.imgCard} ${styles.enhanced}`}>
                                <div className={styles.imgHeader}>
                                    <div className={styles.imgDot} />
                                    <span className={styles.imgLabel}>Enhanced</span>
                                </div>
                                <img src={enhancedSrc} alt="Enhanced" className={styles.imgResult} />
                                <a href={enhancedSrc} download="enhanced.png" className={styles.downloadBtn}>
                                    ⬇ Download Enhanced
                                </a>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}