'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Upload, Camera, Activity, AlertCircle,
    CheckCircle, Loader, Maximize2, Minimize2,
    Download, RefreshCw, ZoomIn, ZoomOut
} from 'lucide-react';
import styles from './styles.module.css';  // 👈 import الصحيح

interface Nodule {
    id: number;
    size_mm: number;
    location: string;
    composition: string;
    echogenicity: string;
    shape: string;
    margin: string;
    echogenic_foci: string;
    tirads_score: number;
    malignancy_risk: string;
}

interface AnalysisResult {
    nodules_detected: number;
    nodules: Nodule[];
    ai_confidence: number;
    recommendations: string[];
}

export default function ImageEnhancementPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [enhancedMode, setEnhancedMode] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [patientId, setPatientId] = useState('');
    const [error, setError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // التحقق من نوع الملف
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/dicom'];
        if (!validTypes.includes(file.type) && !file.name.match(/\.(dcm|dicom)$/i)) {
            setError('Please select a valid ultrasound image (JPEG, PNG, or DICOM)');
            return;
        }

        setSelectedFile(file);
        setError('');

        // إنشاء معاينة
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        if (!patientId.trim()) {
            setError('Please enter Patient ID');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('patient_id', patientId);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/ultrasound/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            // بدأ التحليل
            await analyzeImage(data.image_id);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const analyzeImage = async (imageId: number) => {
        setAnalyzing(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/ultrasound/analyze/${imageId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            setAnalysisResult(data.results);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const enhanceImage = async () => {
        setEnhancedMode(!enhancedMode);
        // هنا بنضيف API call لتحسين الصورة
    };

    const resetAnalysis = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setAnalysisResult(null);
        setEnhancedMode(false);
        setZoom(1);
        setPatientId('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getTiradsColor = (score: number) => {
        if (score <= 2) return '#52c41a';
        if (score <= 4) return '#faad14';
        return '#f5222d';
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Thyroid Image Enhancement</h1>
                    <p className={styles.subtitle}>
                        Upload and enhance thyroid ultrasound images with AI assistance
                    </p>
                </div>
                <button onClick={resetAnalysis} className={styles.resetButton}>
                    <RefreshCw size={20} />
                    New Analysis
                </button>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            <div className={styles.splitView}>
                {/* Left Panel - Image Upload/View */}
                <div className={styles.imagePanel}>
                    {!previewUrl ? (
                        <div
                            className={styles.uploadArea}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".jpg,.jpeg,.png,.dcm,.dicom"
                                style={{ display: 'none' }}
                            />
                            <Upload size={48} className={styles.uploadIcon} />
                            <p className={styles.uploadText}>
                                Click to upload ultrasound image
                            </p>
                            <p className={styles.uploadHint}>
                                Supports JPEG, PNG, DICOM
                            </p>
                        </div>
                    ) : (
                        <div className={styles.imageContainer}>
                            <div className={styles.imageControls}>
                                <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))}>
                                    <ZoomIn size={20} />
                                </button>
                                <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>
                                    <ZoomOut size={20} />
                                </button>
                                <button onClick={enhanceImage}>
                                    {enhancedMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                </button>
                                <button>
                                    <Download size={20} />
                                </button>
                            </div>
                            <div className={styles.imageWrapper}>
                                <img
                                    src={previewUrl}
                                    alt="Ultrasound"
                                    style={{
                                        transform: `scale(${zoom})`,
                                        filter: enhancedMode ? 'contrast(1.2) brightness(1.1)' : 'none'
                                    }}
                                />
                            </div>
                            {analyzing && (
                                <div className={styles.analyzingOverlay}>
                                    <Loader className={styles.spinner} size={48} />
                                    <p>AI is analyzing the image...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {previewUrl && !analysisResult && !analyzing && (
                        <div className={styles.patientInfo}>
                            <input
                                type="text"
                                placeholder="Enter Patient ID"
                                value={patientId}
                                onChange={(e) => setPatientId(e.target.value)}
                                className={styles.patientInput}
                            />
                            <button
                                onClick={handleUpload}
                                disabled={uploading || !patientId.trim()}
                                className={styles.analyzeButton}
                            >
                                {uploading ? (
                                    <>
                                        <Loader className={styles.spinner} size={20} />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Activity size={20} />
                                        Analyze Image
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel - Analysis Results */}
                <div className={styles.resultsPanel}>
                    {analyzing ? (
                        <div className={styles.analyzingState}>
                            <Loader className={styles.spinner} size={48} />
                            <h3>AI Analysis in Progress</h3>
                            <p>Analyzing ultrasound features...</p>
                            <p className={styles.progressNote}>This may take a few seconds</p>
                        </div>
                    ) : analysisResult ? (
                        <div className={styles.resultsContent}>
                            <div className={styles.summaryCard}>
                                <div className={styles.summaryHeader}>
                                    <h2>Analysis Summary</h2>
                                    <span className={styles.confidenceBadge}>
                    AI Confidence: {analysisResult.ai_confidence}%
                  </span>
                                </div>
                                <div className={styles.summaryStats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Nodules Detected</span>
                                        <span className={styles.statValue}>{analysisResult.nodules_detected}</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>High Risk</span>
                                        <span className={styles.statValue}>
                      {analysisResult.nodules.filter(n => n.tirads_score >= 4).length}
                    </span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>FNA Recommended</span>
                                        <span className={styles.statValue}>
                      {analysisResult.nodules.filter(n => n.tirads_score >= 5).length}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Nodules List */}
                            <div className={styles.nodulesSection}>
                                <h3>Detected Nodules</h3>
                                {analysisResult.nodules.map((nodule) => (
                                    <div key={nodule.id} className={styles.noduleCard}>
                                        <div className={styles.noduleHeader}>
                                            <div>
                                                <span className={styles.noduleLocation}>{nodule.location}</span>
                                                <span className={styles.noduleSize}>{nodule.size_mm}mm</span>
                                            </div>
                                            <div className={styles.tiradsBadge}
                                                 style={{ backgroundColor: getTiradsColor(nodule.tirads_score) }}>
                                                TI-RADS {nodule.tirads_score}
                                            </div>
                                        </div>

                                        <div className={styles.noduleFeatures}>
                                            <div className={styles.featureRow}>
                                                <span className={styles.featureLabel}>Composition:</span>
                                                <span>{nodule.composition}</span>
                                            </div>
                                            <div className={styles.featureRow}>
                                                <span className={styles.featureLabel}>Echogenicity:</span>
                                                <span>{nodule.echogenicity}</span>
                                            </div>
                                            <div className={styles.featureRow}>
                                                <span className={styles.featureLabel}>Shape:</span>
                                                <span>{nodule.shape}</span>
                                            </div>
                                            <div className={styles.featureRow}>
                                                <span className={styles.featureLabel}>Margin:</span>
                                                <span>{nodule.margin}</span>
                                            </div>
                                            <div className={styles.featureRow}>
                                                <span className={styles.featureLabel}>Foci:</span>
                                                <span>{nodule.echogenic_foci}</span>
                                            </div>
                                        </div>

                                        <div className={styles.riskIndicator}>
                                            <span className={styles.riskLabel}>Malignancy Risk:</span>
                                            <span className={styles.riskValue}>{nodule.malignancy_risk}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recommendations */}
                            <div className={styles.recommendationsSection}>
                                <h3>Clinical Recommendations</h3>
                                <ul className={styles.recommendationsList}>
                                    {analysisResult.recommendations.map((rec, index) => (
                                        <li key={index} className={styles.recommendationItem}>
                                            <CheckCircle size={18} color="#52c41a" />
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className={styles.actionButtons}>
                                <button className={styles.primaryButton}>
                                    <Download size={20} />
                                    Export Report
                                </button>
                                <button className={styles.secondaryButton}>
                                    Save to Patient Records
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Camera size={64} className={styles.emptyIcon} />
                            <h3>No Analysis Yet</h3>
                            <p>Upload an ultrasound image to start AI analysis</p>
                            <p className={styles.emptyHint}>
                                The AI will detect nodules, calculate TI-RADS scores, and provide clinical recommendations
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}