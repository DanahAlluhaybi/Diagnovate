'use client';

import { useState } from 'react';
import styles from './styles.module.css';

import {
    Activity,
    AlertCircle,
    Bone,
    Brain,
    Calendar,
    ChevronDown,
    Download,
    FileText,
    FlaskConical,
    Heart,
    Microscope,
    Pill,
    Printer,
    Save,
    Scan,
    Send,
    Stethoscope,
    Target,
    X
} from 'lucide-react';

const ThyroidIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4c-2.5 0-5 1.5-7 4-2 2.5-3 5.5-3 8 0 2.5 1 5 3 7 2 2 4.5 3 7 3s5-1 7-3c2-2 3-4.5 3-7 0-2.5-1-5.5-3-8-2-2.5-4.5-4-7-4z" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const LungIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 12c0-2.5 1.5-5 4-6 2.5-1 5-1 7 0 2.5 1 4 3.5 4 6v4c0 2.5-1.5 5-4 6-2.5 1-5 1-7 0-2.5-1-4-3.5-4-6v-4z" />
        <path d="M12 6v12" />
        <path d="M8 9v6" />
        <path d="M16 9v6" />
    </svg>
);

const DropletsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2.5c-2.5 3-5 6-5 10 0 3 2 5 5 5s5-2 5-5c0-4-2.5-7-5-10z" />
        <path d="M8 12c1.5-1 3-1 4 0" />
    </svg>
);

const ThyroidCancerReport = () => {
    const [activeTab, setActiveTab] = useState('tumor');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div>
                        <h1 className={styles.title}>Thyroid Cancer Report</h1>
                        <div className={styles.breadcrumb}>
                            <span>Oncology</span>
                            <ChevronDown size={14} />
                            <span className={styles.breadcrumbActive}>Thyroid Carcinoma</span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.actionButton}>
                            <Save size={18} />
                            Save Draft
                        </button>
                        <button className={`${styles.actionButton} ${styles.primaryButton}`}>
                            <Send size={18} />
                            Submit
                        </button>
                        <button className={styles.iconButton}>
                            <Printer size={18} />
                        </button>
                        <button className={styles.iconButton}>
                            <Download size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.patientInfo}>
                <div className={styles.patientHeader}>
                    <ThyroidIcon />
                    <h2>Patient Information</h2>
                </div>
                <div className={styles.patientGrid}>
                    <div className={styles.inputGroup}>
                        <label>Patient Name *</label>
                        <input type="text" placeholder="Enter patient name" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Patient ID *</label>
                        <input type="text" placeholder="Enter patient ID" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Age</label>
                        <input type="number" placeholder="Age" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Gender</label>
                        <select>
                            <option>Select gender</option>
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Date of Diagnosis</label>
                        <input type="date" />
                    </div>
                </div>
            </div>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'tumor' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('tumor')}
                >
                    <ThyroidIcon />
                    Tumor Details
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'pathology' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('pathology')}
                >
                    <Microscope size={16} />
                    Pathology
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'staging' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('staging')}
                >
                    <Target size={16} />
                    Staging (TNM)
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'molecular' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('molecular')}
                >
                    <FlaskConical size={16} />
                    Molecular
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'treatment' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('treatment')}
                >
                    <Pill size={16} />
                    Treatment
                </button>
            </div>

            <div className={styles.content}>
                {activeTab === 'tumor' && (
                    <div className={styles.section}>
                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <ThyroidIcon />
                                <h3>Primary Tumor Characteristics</h3>
                            </div>

                            <div className={styles.tumorGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Lobe Involvement *</label>
                                    <select>
                                        <option>Select lobe</option>
                                        <option>Right lobe only</option>
                                        <option>Left lobe only</option>
                                        <option>Isthmus only</option>
                                        <option>Bilateral</option>
                                        <option>Multifocal</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Tumor Size (cm) *</label>
                                    <input type="number" step="0.1" placeholder="e.g., 2.5" />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Number of Nodules</label>
                                    <input type="number" placeholder="e.g., 1, 2, 3" />
                                </div>
                            </div>
                        </div>

                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <Scan size={18} />
                                <h3>Ultrasound Features</h3>
                            </div>

                            <div className={styles.ultrasoundGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Composition</label>
                                    <select>
                                        <option>Cystic</option>
                                        <option>Spongiform</option>
                                        <option>Mixed</option>
                                        <option>Solid</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Echogenicity</label>
                                    <select>
                                        <option>Anechoic</option>
                                        <option>Hyperechoic</option>
                                        <option>Isoechoic</option>
                                        <option>Hypoechoic</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Shape</label>
                                    <select>
                                        <option>Wider-than-tall</option>
                                        <option>Taller-than-wide</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Margin</label>
                                    <select>
                                        <option>Smooth</option>
                                        <option>Ill-defined</option>
                                        <option>Lobulated</option>
                                        <option>Irregular</option>
                                    </select>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>TI-RADS Score</label>
                                    <input type="text" placeholder="e.g., TR3, TR4, TR5" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pathology' && (
                    <div className={styles.section}>
                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <Microscope size={18} />
                                <h3>Histopathological Type</h3>
                            </div>

                            <div className={styles.pathologyGrid}>
                                <div className={styles.radioGroup}>
                                    <label className={styles.radioLabel}>
                                        <input type="radio" name="histType" />
                                        Papillary Thyroid Carcinoma (PTC)
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input type="radio" name="histType" />
                                        Follicular Thyroid Carcinoma (FTC)
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input type="radio" name="histType" />
                                        Medullary Thyroid Carcinoma (MTC)
                                    </label>
                                    <label className={styles.radioLabel}>
                                        <input type="radio" name="histType" />
                                        Anaplastic Thyroid Carcinoma (ATC)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <Activity size={18} />
                                <h3>Pathological Features</h3>
                            </div>

                            <div className={styles.featuresGrid}>
                                <div className={styles.checkboxGroup}>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" /> Capsular invasion
                                    </label>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" /> Vascular invasion
                                    </label>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" /> Lymphatic invasion
                                    </label>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" /> Extrathyroidal extension
                                    </label>
                                    <label className={styles.checkbox}>
                                        <input type="checkbox" /> Multifocality
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'staging' && (
                    <div className={styles.section}>
                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <Target size={18} />
                                <h3>TNM Staging (AJCC 8th Edition)</h3>
                            </div>

                            <div className={styles.tnmGrid}>
                                <div className={styles.tnmCategory}>
                                    <h4>T - Primary Tumor</h4>
                                    <select className={styles.fullWidth}>
                                        <option>Select T category</option>
                                        <option>T1a - less than or equal 1 cm</option>
                                        <option>T1b - greater than 1-2 cm</option>
                                        <option>T2 - greater than 2-4 cm</option>
                                        <option>T3a - greater than 4 cm</option>
                                        <option>T3b - Gross ETE</option>
                                        <option>T4a - Invades nearby structures</option>
                                    </select>
                                </div>

                                <div className={styles.tnmCategory}>
                                    <h4>N - Lymph Nodes</h4>
                                    <select className={styles.fullWidth}>
                                        <option>Select N category</option>
                                        <option>N0 - No metastasis</option>
                                        <option>N1a - Level VI</option>
                                        <option>N1b - Other cervical levels</option>
                                    </select>
                                </div>

                                <div className={styles.tnmCategory}>
                                    <h4>M - Metastasis</h4>
                                    <select className={styles.fullWidth}>
                                        <option>Select M category</option>
                                        <option>M0 - No distant metastasis</option>
                                        <option>M1 - Distant metastasis</option>
                                    </select>
                                </div>

                                <div className={styles.tnmCategory}>
                                    <h4>Metastasis Sites</h4>
                                    <div className={styles.checkboxGroup}>
                                        <label className={styles.checkbox}>
                                            <input type="checkbox" /> Lung
                                        </label>
                                        <label className={styles.checkbox}>
                                            <input type="checkbox" /> Bone
                                        </label>
                                        <label className={styles.checkbox}>
                                            <input type="checkbox" /> Brain
                                        </label>
                                        <label className={styles.checkbox}>
                                            <input type="checkbox" /> Liver
                                        </label>
                                    </div>
                                </div>

                                <div className={styles.tnmCategory}>
                                    <h4>Stage Group</h4>
                                    <select className={styles.fullWidth}>
                                        <option>Stage I</option>
                                        <option>Stage II</option>
                                        <option>Stage III</option>
                                        <option>Stage IVA</option>
                                        <option>Stage IVB</option>
                                    </select>
                                </div>

                                <div className={styles.tnmCategory}>
                                    <h4>ATA Risk Stratification</h4>
                                    <select className={styles.fullWidth}>
                                        <option>Low Risk</option>
                                        <option>Intermediate Risk</option>
                                        <option>High Risk</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'molecular' && (
                    <div className={styles.section}>
                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <FlaskConical size={18} />
                                <h3>Molecular Markers</h3>
                            </div>

                            <div className={styles.molecularGrid}>
                                <div className={styles.mutationCard}>
                                    <h4>BRAF V600E</h4>
                                    <select>
                                        <option>Not tested</option>
                                        <option>Positive</option>
                                        <option>Negative</option>
                                    </select>
                                </div>

                                <div className={styles.mutationCard}>
                                    <h4>RAS Mutation</h4>
                                    <select>
                                        <option>Not tested</option>
                                        <option>Positive</option>
                                        <option>Negative</option>
                                    </select>
                                </div>

                                <div className={styles.mutationCard}>
                                    <h4>RET/PTC</h4>
                                    <select>
                                        <option>Not tested</option>
                                        <option>Positive</option>
                                        <option>Negative</option>
                                    </select>
                                </div>

                                <div className={styles.mutationCard}>
                                    <h4>TERT Promoter</h4>
                                    <select>
                                        <option>Not tested</option>
                                        <option>Positive</option>
                                        <option>Negative</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <DropletsIcon />
                                <h3>Serum Markers</h3>
                            </div>

                            <div className={styles.serumGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Tg (Thyroglobulin)</label>
                                    <input type="number" placeholder="ng/mL" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Anti-Tg Antibodies</label>
                                    <input type="number" placeholder="IU/mL" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Calcitonin</label>
                                    <input type="number" placeholder="pg/mL" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'treatment' && (
                    <div className={styles.section}>
                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <Stethoscope size={18} />
                                <h3>Surgery</h3>
                            </div>

                            <div className={styles.surgeryGrid}>
                                <select className={styles.fullWidth}>
                                    <option>Select procedure</option>
                                    <option>Total Thyroidectomy</option>
                                    <option>Near-total Thyroidectomy</option>
                                    <option>Lobectomy + Isthmusectomy</option>
                                    <option>Lobectomy only</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <Activity size={18} />
                                <h3>RAI Therapy</h3>
                            </div>

                            <div className={styles.raiGrid}>
                                <div className={styles.inputGroup}>
                                    <label>RAI Dose (mCi)</label>
                                    <input type="number" placeholder="e.g., 30, 100" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Date of RAI</label>
                                    <input type="date" />
                                </div>
                            </div>
                        </div>

                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <Pill size={18} />
                                <h3>TSH Suppression</h3>
                            </div>

                            <div className={styles.tshGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Levothyroxine Dose</label>
                                    <input type="number" placeholder="mcg/day" />
                                </div>
                            </div>
                        </div>

                        <div className={styles.subsection}>
                            <div className={styles.subsectionHeader}>
                                <Calendar size={18} />
                                <h3>Follow-up Plan</h3>
                            </div>

                            <div className={styles.followupGrid}>
                                <div className={styles.inputGroup}>
                                    <label>Next visit</label>
                                    <input type="date" />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Next Tg check</label>
                                    <input type="date" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.finalActions}>
                <button className={styles.cancelBtn}>Cancel</button>
                <button className={styles.saveBtn}>Save as Draft</button>
                <button className={styles.submitBtn}>Finalize Report</button>
            </div>
        </div>
    );
};

export default ThyroidCancerReport;