'use client';
import styles from './styles.module.css';  // صح
// مو import styles from './dashboardstyles.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Activity, Camera, FileText, LogOut, Bell, Search, User,
    TrendingUp, Award, Layers, Heart, Shield, Clock,
    BarChart3
} from 'lucide-react';

interface UserData {
    id: number;
    email: string;
    is_verified: boolean;
    created_at: string;
}

interface CaseStats {
    active_cases: number;
    bethesda_3_plus: number;
    tirads_4_5: number;
    ai_consensus: number;
}

interface RecentCase {
    id: number;
    case_id: string;
    nodule_size: string;
    location: string;
    tirads_score: number;
    bethesda_category: string;
    created_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [stats, setStats] = useState<CaseStats | null>(null);
    const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = localStorage.getItem('user');
            const token = localStorage.getItem('token');

            if (!userData || !token) {
                router.push('/log-in');
                return;
            }

            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            try {
                // جلب الإحصائيات الحقيقية من API
                const statsRes = await fetch('http://localhost:5000/api/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // جلب الحالات الأخيرة
                const casesRes = await fetch('http://localhost:5000/api/dashboard/recent-cases', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (casesRes.ok) {
                    const casesData = await casesRes.json();
                    setRecentCases(casesData);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // إذا فشل الاتصال، نستخدم بيانات تجريبية مؤقتاً
                setStats({
                    active_cases: 0,
                    bethesda_3_plus: 0,
                    tirads_4_5: 0,
                    ai_consensus: 0
                });
                setRecentCases([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/log-in');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return `${Math.floor(diffMins / 1440)} days ago`;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading your clinical data...</p>
            </div>
        );
    }

    const doctorName = user?.email.split('@')[0] || 'Clinician';

    return (
        <div className={styles.container}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logoArea}>
                    <div className={styles.logo}>
                        <Heart size={24} />
                    </div>
                    <div>
                        <h2 className={styles.logoText}>Diagnovate</h2>
                        <p className={styles.logoSub}>Thyroid Cancer Diagnostics</p>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <Link href="/dashboard" className={`${styles.navItem} ${styles.navActive}`}>
                        <Activity size={20} />
                        <span>Dashboard</span>
                    </Link>
                    {/* هذا الرابط تم تعديله من /ultrasound إلى /image-enhancement */}
                    <Link href="/image-enhancement" className={styles.navItem}>
                        <Camera size={20} />
                        <span>Ultrasound Analysis</span>
                    </Link>
                    <Link href="/biopsy" className={styles.navItem}>
                        <FileText size={20} />
                        <span>Biopsy Results</span>
                    </Link>
                    <Link href="/patients" className={styles.navItem}>
                        <User size={20} />
                        <span>Patient Registry</span>
                    </Link>
                    <Link href="/reports" className={styles.navItem}>
                        <BarChart3 size={20} />
                        <span>Clinical Reports</span>
                    </Link>
                    <Link href="/guidelines" className={styles.navItem}>
                        <Award size={20} />
                        <span>ACR TI-RADS</span>
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                    <div className={styles.doctorBadge}>
                        <div className={styles.doctorAvatar}>
                            {doctorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className={styles.doctorName}>Dr. {doctorName}</p>
                            <p className={styles.doctorTitle}>Thyroid Specialist</p>
                            <p className={styles.doctorEmail}>{user?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.greeting}>
                            Thyroid Cancer Dashboard
                        </h1>
                        <p className={styles.date}>
                            {user?.created_at ? formatDate(user.created_at) : formatDate(new Date().toISOString())}
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.iconButton}>
                            <Search size={20} />
                        </button>
                        <button className={styles.iconButton}>
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                {/* Real Stats Cards */}
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
                            <Shield size={24} />
                        </div>
                        <div>
                            <p className={styles.statLabel}>Bethesda III+</p>
                            <p className={styles.statValue}>{stats?.bethesda_3_plus || 0}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#f6ffed', color: '#52c41a' }}>
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className={styles.statLabel}>TI-RADS 4/5</p>
                            <p className={styles.statValue}>{stats?.tirads_4_5 || 0}</p>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIcon} style={{ backgroundColor: '#f9f0ff', color: '#722ed1' }}>
                            <Layers size={24} />
                        </div>
                        <div>
                            <p className={styles.statLabel}>AI Consensus</p>
                            <p className={styles.statValue}>{stats?.ai_consensus || 0}%</p>
                        </div>
                    </div>
                </div>

                {/* Features Grid - ثابتة لأنها features مش بيانات متغيرة */}
                <div className={styles.featuresGrid}>
                    {/* Feature 1: Ultrasound Enhancement */}
                    {/* هذا الرابط تم تعديله من /ultrasound إلى /image-enhancement */}
                    <Link href="/image-enhancement" className={styles.featureCard}>
                        <div className={styles.featureHeader}>
                            <div className={styles.featureIcon} style={{ backgroundColor: '#0099cc' }}>
                                <Camera size={24} color="white" />
                            </div>
                            <span className={styles.featureBadge}>AI-Powered</span>
                        </div>
                        <h3 className={styles.featureTitle}>Thyroid Ultrasound Enhancement</h3>
                        <p className={styles.featureDesc}>
                            Transform blurry thyroid ultrasound images into crystal-clear diagnostic quality in real-time.
                        </p>
                        <ul className={styles.featureList}>
                            <li>• Enhances contrast for thyroid nodules</li>
                            <li>• Removes speckle noise from scans</li>
                            <li>• Sharpens nodule boundaries</li>
                            <li>• Auto-detects microcalcifications</li>
                        </ul>
                        <div className={styles.featureFooter}>
                            <span className={styles.featureLink}>Start Analysis →</span>
                        </div>
                    </Link>

                    {/* Feature 2: TI-RADS Scoring */}
                    <Link href="/ti-rads" className={styles.featureCard}>
                        <div className={styles.featureHeader}>
                            <div className={styles.featureIcon} style={{ backgroundColor: '#722ed1' }}>
                                <Award size={24} color="white" />
                            </div>
                            <span className={styles.featureBadge}>ACR Guidelines</span>
                        </div>
                        <h3 className={styles.featureTitle}>ACR TI-RADS Scoring</h3>
                        <p className={styles.featureDesc}>
                            Automated scoring based on composition, echogenicity, shape, margin, and echogenic foci.
                        </p>
                        <ul className={styles.featureList}>
                            <li>• Composition (cystic/solid)</li>
                            <li>• Echogenicity assessment</li>
                            <li>• Margin evaluation</li>
                            <li>• Echogenic foci detection</li>
                        </ul>
                        <div className={styles.featureFooter}>
                            <span className={styles.featureLink}>Score Nodules →</span>
                        </div>
                    </Link>
                </div>

                {/* Recent Thyroid Cases - حقيقية من API */}
                <div className={styles.recentSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Recent Thyroid Cases</h2>
                        <Link href="/cases" className={styles.viewAll}>
                            View All Cases
                        </Link>
                    </div>
                    <div className={styles.casesList}>
                        {recentCases.length > 0 ? (
                            recentCases.map((case_) => (
                                <Link href={`/case/${case_.id}`} key={case_.id} className={styles.caseItem}>
                                    <div className={styles.caseInfo}>
                                        <p className={styles.caseId}>{case_.case_id}</p>
                                        <p className={styles.caseDetails}>
                                            {case_.nodule_size} • {case_.location} • TI-RADS {case_.tirads_score}
                                        </p>
                                    </div>
                                    <div className={styles.caseStatus}>
                    <span className={styles.statusBadge}
                          style={{
                              backgroundColor: case_.bethesda_category >= 'V' ? '#fff1f0' : '#f6ffed',
                              color: case_.bethesda_category >= 'V' ? '#f5222d' : '#52c41a'
                          }}>
                      Bethesda {case_.bethesda_category}
                    </span>
                                        <span className={styles.caseTime}>
                      <Clock size={14} style={{ marginRight: 4 }} />
                                            {getTimeAgo(case_.created_at)}
                    </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className={styles.noCases}>No recent cases. Start by analyzing an ultrasound.</p>
                        )}
                    </div>
                </div>

                {/* Clinical Guidelines - ثابت */}
                <div className={styles.guidelinesBanner}>
                    <div>
                        <h3 className={styles.guidelinesTitle}>ATA Guidelines 2024</h3>
                        <p className={styles.guidelinesDesc}>
                            AI-powered recommendations following American Thyroid Association guidelines for nodule management.
                        </p>
                    </div>
                    <Link href="/guidelines" className={styles.guidelinesButton}>
                        View Guidelines
                    </Link>
                </div>
            </main>
        </div>
    );
}