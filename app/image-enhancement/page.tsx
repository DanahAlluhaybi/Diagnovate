'use client';

import { useState, useCallback, useRef } from 'react';

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
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                .ei-page {
                    min-height: 100vh;
                    background: #f0f4f8;
                    font-family: 'Inter', sans-serif;
                    color: #1a202c;
                    padding: 32px 24px;
                }
                .ei-container { max-width: 1100px; margin: 0 auto; }
                .ei-header { margin-bottom: 32px; }
                .ei-header-title { font-size: 28px; font-weight: 700; color: #1a202c; margin-bottom: 4px; }
                .ei-header-sub { font-size: 14px; color: #718096; }
                .ei-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    background: #e6f7f5; border: 1px solid #b2e8e2;
                    border-radius: 100px; padding: 4px 12px;
                    font-size: 11px; font-weight: 600; color: #0d9488;
                    letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 12px;
                }
                .ei-badge-dot {
                    width: 6px; height: 6px; background: #14b8a6; border-radius: 50%;
                    animation: ei-pulse 2s ease-in-out infinite;
                }
                @keyframes ei-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.7); }
                }
                .ei-card-wrap {
                    background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;
                    padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 20px;
                }
                .ei-card-title {
                    font-size: 15px; font-weight: 600; color: #2d3748; margin-bottom: 16px;
                    display: flex; align-items: center; gap: 8px;
                }
                .ei-card-title-icon {
                    width: 32px; height: 32px; background: #e6f7f5;
                    border-radius: 8px; display: flex; align-items: center;
                    justify-content: center; font-size: 16px;
                }
                .ei-upload {
                    border: 2px dashed #cbd5e0; border-radius: 12px;
                    padding: 40px 24px; text-align: center; cursor: pointer;
                    transition: all 0.25s ease; background: #f7fafc;
                    position: relative; overflow: hidden;
                }
                .ei-upload:hover, .ei-upload.drag { border-color: #14b8a6; background: #f0fdfa; }
                .ei-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
                .ei-upload-icon {
                    width: 52px; height: 52px; background: #e6f7f5; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 14px; font-size: 22px;
                }
                .ei-upload-title { font-size: 15px; font-weight: 600; color: #2d3748; margin-bottom: 4px; }
                .ei-upload-sub { font-size: 13px; color: #a0aec0; }
                .ei-thumb {
                    width: 72px; height: 72px; object-fit: cover; border-radius: 10px;
                    margin: 0 auto 10px; display: block; border: 2px solid #b2e8e2;
                }
                .ei-filename { font-size: 13px; color: #0d9488; font-weight: 500; }
                .ei-btn {
                    width: 100%; margin-top: 16px; padding: 14px 32px;
                    background: linear-gradient(135deg, #14b8a6, #0d9488);
                    color: #fff; border: none; border-radius: 12px;
                    font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 600;
                    cursor: pointer; transition: all 0.25s ease;
                    box-shadow: 0 4px 14px rgba(20,184,166,0.3);
                }
                .ei-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(20,184,166,0.4); }
                .ei-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
                .ei-progress { margin-top: 18px; }
                .ei-progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                .ei-progress-label { font-size: 12px; font-weight: 500; color: #718096; text-transform: uppercase; letter-spacing: 0.05em; }
                .ei-progress-pct { font-size: 14px; font-weight: 700; color: #0d9488; }
                .ei-track { height: 6px; background: #e2e8f0; border-radius: 100px; overflow: hidden; }
                .ei-bar {
                    height: 100%; background: linear-gradient(90deg, #14b8a6, #06b6d4);
                    border-radius: 100px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
                }
                .ei-steps { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
                .ei-step {
                    font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 100px;
                    border: 1px solid #e2e8f0; color: #a0aec0; transition: all 0.35s ease; background: #fff;
                }
                .ei-step.active { border-color: #b2e8e2; color: #0d9488; background: #f0fdfa; }
                .ei-step.done { border-color: #b2e8e2; color: #0d9488; background: #e6f7f5; }
                .ei-error {
                    margin-top: 14px; padding: 12px 16px; background: #fff5f5;
                    border: 1px solid #fed7d7; border-radius: 10px; font-size: 13px; color: #e53e3e;
                }
                .ei-results { animation: ei-fadeup 0.5s ease forwards; }
                @keyframes ei-fadeup { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                .ei-results-label { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #a0aec0; margin-bottom: 16px; }
                .ei-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                @media (max-width: 640px) { .ei-grid { grid-template-columns: 1fr; } }
                .ei-img-card {
                    background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06); transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .ei-img-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
                .ei-img-card.enh { border-color: #b2e8e2; box-shadow: 0 2px 12px rgba(20,184,166,0.12); }
                .ei-img-header { padding: 12px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #f0f4f8; }
                .ei-img-dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e0; }
                .ei-img-card.enh .ei-img-dot { background: #14b8a6; box-shadow: 0 0 6px rgba(20,184,166,0.5); }
                .ei-img-lbl { font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #a0aec0; }
                .ei-img-card.enh .ei-img-lbl { color: #0d9488; }
                .ei-img { width: 100%; display: block; max-height: 400px; object-fit: contain; background: #f7fafc; }
                .ei-dl {
                    display: block; width: calc(100% - 28px); margin: 12px 14px; padding: 9px; text-align: center;
                    background: #f0fdfa; border: 1px solid #b2e8e2; border-radius: 8px;
                    color: #0d9488; font-size: 13px; font-weight: 500; text-decoration: none; transition: all 0.2s ease;
                }
                .ei-dl:hover { background: #e6f7f5; color: #0a7c73; }
            `}</style>

            <div className="ei-page">
                <div className="ei-container">
                    <div className="ei-header">
                        <div className="ei-badge"><div className="ei-badge-dot" />AI-Powered</div>
                        <h1 className="ei-header-title">Ultrasound Enhancement</h1>
                        <p className="ei-header-sub">Transform medical scans into crystal-clear diagnostic quality</p>
                    </div>

                    <div className="ei-card-wrap">
                        <div className="ei-card-title">
                            Upload Image
                        </div>

                        <div
                            className={`ei-upload ${dragOver ? 'drag' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                            {preview ? (
                                <>
                                    <img src={preview} className="ei-thumb" alt="preview" />
                                    <div className="ei-filename">{selectedFile?.name}</div>
                                </>
                            ) : (
                                <>
                                    <div className="ei-upload-icon">📂</div>
                                    <div className="ei-upload-title">Drop your image here</div>
                                    <div className="ei-upload-sub">or click to browse — PNG, JPG</div>
                                </>
                            )}
                        </div>

                        <button className="ei-btn" onClick={handleEnhance} disabled={!selectedFile || loading}>
                            {loading ? 'Enhancing...' : '✦ Enhance Image'}
                        </button>

                        {(loading || progress > 0) && (
                            <div className="ei-progress">
                                <div className="ei-progress-header">
                                    <span className="ei-progress-label">Processing</span>
                                    <span className="ei-progress-pct">{progress}%</span>
                                </div>
                                <div className="ei-track">
                                    <div className="ei-bar" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="ei-steps">
                                    {steps.map(({ label, threshold }) => (
                                        <span
                                            key={label}
                                            className={`ei-step ${progress >= threshold ? 'done' : progress >= threshold - 25 ? 'active' : ''}`}
                                        >
                                            {progress >= threshold ? '✓ ' : ''}{label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && <div className="ei-error">⚠ {error}</div>}
                    </div>

                    {originalSrc && enhancedSrc && (
                        <div className="ei-results">
                            <div className="ei-results-label">Results</div>
                            <div className="ei-grid">
                                <div className="ei-img-card">
                                    <div className="ei-img-header">
                                        <div className="ei-img-dot" />
                                        <span className="ei-img-lbl">Original</span>
                                    </div>
                                    <img src={originalSrc} alt="Original" className="ei-img" />
                                    <a href={originalSrc} download="original.png" className="ei-dl">⬇ Download Original</a>
                                </div>
                                <div className="ei-img-card enh">
                                    <div className="ei-img-header">
                                        <div className="ei-img-dot" />
                                        <span className="ei-img-lbl">Enhanced ✦</span>
                                    </div>
                                    <img src={enhancedSrc} alt="Enhanced" className="ei-img" />
                                    <a href={enhancedSrc} download="enhanced.png" className="ei-dl">⬇ Download Enhanced</a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}