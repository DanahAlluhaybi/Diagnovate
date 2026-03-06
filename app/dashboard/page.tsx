'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './styles.module.css';
import {
    Activity, Camera, FileText, LogOut, Bell,
    TrendingUp, Heart, ChevronRight, User
} from 'lucide-react';

interface DashboardStats {
    active_cases: number;
    urgent_cases: number;
    total_patients: number;
}

interface RecentCase {
    id: number;
    case_id: string;
    patient_name: string;
    nodule_size: string;
    location: string;
    tirads_score: number;
    bethesda_category: string;
    created_at: string;
}

interface Doctor {
    id: number;
    name: string;
    email: string;
    specialty: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [error, setError] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if (!token || !userData) {
                router.push('/log-in');
                return;
            }

            const user = JSON.parse(userData);
            setDoctor(user);

            const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (statsRes.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/log-in');
                return;
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            const casesRes = await fetch('http://localhost:5000/api/dashboard/recent-cases', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (casesRes.ok) {
                const casesData = await casesRes.json();
                setRecentCases(casesData);
            }

        } catch (err) {
            setError('Failed to connect to server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setLoggingOut(true);
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/log-in');
        }, 1500);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 21) return 'Good evening';
        return 'Good night';
    };

    const formatDoctorName = (name: string | undefined) => {
        if (!name) return 'Doctor';
        if (name.toLowerCase().startsWith('dr.') || name.toLowerCase().startsWith('dr ')) {
            return name;
        }
        return `Dr. ${name}`;
    };

    const getFirstName = (name: string | undefined) => {
        if (!name) return 'Doctor';
        const cleanName = name.replace(/^dr\.?\s*/i, '');
        return cleanName.split(' ')[0];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loggingOut) {
        return (
            <div className={styles.logoutScreen}>
                <div className={styles.logoutCard}>
                    <div className={styles.logoutSpinner} />
                    <p className={styles.logoutText}>Signing out...</p>
                    <p className={styles.logoutSub}>See you next time, Dr. {getFirstName(doctor?.name)}</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={styles.logoutScreen}>
                <div className={styles.logoutCard}>
                    <div className={styles.logoutSpinner} />
                    <p className={styles.logoutText}>Loading dashboard...</p>
                    <p className={styles.logoutSub}>Preparing your workspace, Dr. {getFirstName(doctor?.name)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.logoArea}>
                    <div className={styles.logo}>
                        <Heart size={28} />
                    </div>
                    <div className={styles.logoTextArea}>
                        <h1 className={styles.logoMain}>DIAGNOVATE</h1>
                        <p className={styles.logoSub}>Thyroid Cancer Diagnostics</p>
                    </div>
                </div>

                <div className={styles.headerRight}>
                    <Link href="/profile" className={styles.profileCard}>
                        <div className={styles.avatar}>
                            <User size={24} />
                        </div>
                        <div className={styles.profileInfo}>
                            <div className={styles.profileName}>
                                <span className={styles.doctorName}>
                                    {formatDoctorName(doctor?.name)}
                                </span>
                                <span className={styles.specialty}>
                                    {doctor?.specialty || 'Thyroid Specialist'}
                                </span>
                            </div>
                            <div className={styles.profileEmail}>
                                {doctor?.email || 'doctor@diagnovate.com'}
                            </div>
                        </div>
                    </Link>

                    <div className={styles.actions}>
                        <div className={styles.notifWrapper} ref={notifRef}>
                            <button
                                className={`${styles.iconButton} ${showNotifications ? styles.iconButtonActive : ''}`}
                                onClick={() => setShowNotifications(v => !v)}
                                aria-label="Notifications"
                            >
                                <Bell size={20} />
                            </button>

                            {showNotifications && (
                                <div className={styles.notifPopup}>
                                    <div className={styles.notifHeader}>
                                        <Bell size={15} />
                                        <span>Notifications</span>
                                    </div>
                                    <div className={styles.notifEmpty}>
                                        <div className={styles.notifEmptyIcon}>
                                            <Bell size={26} />
                                        </div>
                                        <p className={styles.notifEmptyTitle}>No Notifications</p>
                                        <p className={styles.notifEmptyText}>
                                            You have no notifications for today.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={handleLogout} className={styles.iconButton} aria-label="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.welcomeSection}>
                    <div>
                        <h2 className={styles.greeting}>
                            {getGreeting()}, Dr. {getFirstName(doctor?.name)}
                        </h2>
                        <p className={styles.date}>
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {error ? (
                    <div className={styles.errorBox}>
                        <p>{error}</p>
                        <button onClick={fetchAllData}>Retry</button>
                    </div>
                ) : (
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#e6f7ff', color: '#0099cc' }}>
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className={styles.statLabel}>Active Cases</p>
                                <p className={styles.statValue}>{stats?.active_cases || 0}</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#fff1f0', color: '#f5222d' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className={styles.statLabel}>Urgent Cases</p>
                                <p className={styles.statValue}>{stats?.urgent_cases || 0}</p>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#e6f7e6', color: '#10b981' }}>
                                <User size={24} />
                            </div>
                            <div>
                                <p className={styles.statLabel}>Total Patients</p>
                                <p className={styles.statValue}>{stats?.total_patients || 0}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.featuresGrid}>
                    <Link href="/patient-management" className={styles.featureCard}>
                        <div className={styles.featureHeader}>
                            <div className={styles.featureIcon} style={{ backgroundColor: '#10b981' }}>
                                <User size={28} color="white" />
                            </div>
                            <span className={styles.featureBadge}>PATIENT MANAGEMENT</span>
                        </div>
                        <h3 className={styles.featureTitle}>Patient Management</h3>
                        <p className={styles.featureDesc}>Comprehensive patient records, appointments, and medical history management</p>
                        <ul className={styles.featureList}>
                            <li>Patient records & profiles</li>
                            <li>Appointment scheduling</li>
                            <li>Medical history tracking</li>
                            <li>Treatment plans</li>
                        </ul>
                    </Link>

                    <Link href="/image-enhancement" className={styles.featureCard}>
                        <div className={styles.featureHeader}>
                            <div className={styles.featureIcon} style={{ backgroundColor: '#0099cc' }}>
                                <Camera size={28} color="white" />
                            </div>
                            <span className={styles.featureBadge}>AI-POWERED</span>
                        </div>
                        <h3 className={styles.featureTitle}>Ultrasound Enhancement</h3>
                        <p className={styles.featureDesc}>Transform blurry thyroid ultrasound images into crystal-clear diagnostic quality</p>
                        <ul className={styles.featureList}>
                            <li>Contrast enhancement for nodules</li>
                            <li>Speckle noise removal</li>
                            <li>Nodule boundary sharpening</li>
                            <li>Microcalcification detection</li>
                        </ul>
                    </Link>

                    <Link href="/ai-diagnosis" className={styles.featureCard}>
                        <div className={styles.featureHeader}>
                            <div className={styles.featureIcon} style={{ backgroundColor: '#722ed1' }}>
                                <Activity size={28} color="white" />
                            </div>
                            <span className={styles.featureBadge}>DEEP LEARNING</span>
                        </div>
                        <h3 className={styles.featureTitle}>AI Diagnosis Models</h3>
                        <p className={styles.featureDesc}>Deep learning analysis for nodule classification and risk assessment</p>
                        <ul className={styles.featureList}>
                            <li>Nodule classification</li>
                            <li>Malignancy risk</li>
                            <li>TI-RADS scoring</li>
                            <li>Biopsy recommendations</li>
                        </ul>
                    </Link>

                    <Link href="/reports" className={styles.featureCard}>
                        <div className={styles.featureHeader}>
                            <div className={styles.featureIcon} style={{ backgroundColor: '#fa8c16' }}>
                                <FileText size={28} color="white" />
                            </div>
                            <span className={styles.featureBadge}>AI-ASSISTED</span>
                        </div>
                        <h3 className={styles.featureTitle}>Report Generation</h3>
                        <p className={styles.featureDesc}>Create comprehensive clinical reports with AI assistance</p>
                        <ul className={styles.featureList}>
                            <li>Automated findings</li>
                            <li>TI-RADS documentation</li>
                            <li>Biopsy integration</li>
                            <li>PDF export</li>
                        </ul>
                    </Link>
                </div>

                {recentCases.length > 0 && (
                    <div className={styles.recentCasesSection}>
                        <h3>Recent Cases</h3>
                        <div className={styles.casesGrid}>
                            {recentCases.map((caseItem) => (
                                <Link href={`/cases/${caseItem.case_id}`} key={caseItem.id} className={styles.caseCard}>
                                    <div className={styles.caseHeader}>
                                        <span className={styles.caseId}>#{caseItem.case_id}</span>
                                        <span className={styles.caseDate}>{formatDate(caseItem.created_at)}</span>
                                    </div>
                                    <div className={styles.caseBody}>
                                        <p><strong>Patient:</strong> {caseItem.patient_name}</p>
                                        <p><strong>Nodule Size:</strong> {caseItem.nodule_size}</p>
                                        <p><strong>Location:</strong> {caseItem.location}</p>
                                        <div className={styles.caseScores}>
                                            <span className={styles.tirads}>TI-RADS: {caseItem.tirads_score}</span>
                                            <span className={styles.bethesda}>Bethesda: {caseItem.bethesda_category}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}