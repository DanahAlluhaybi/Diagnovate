'use client';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './styles.module.css';
import {
    Activity, Camera, FileText, LogOut, Bell, Calendar,
    TrendingUp, Heart, ChevronRight, User
} from 'lucide-react';

interface DashboardStats {
    active_cases: number;
    urgent_cases: number;
    total_patients: number;
    today_appointments: number;
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

interface Appointment {
    id: number;
    patient_name: string;
    patient_id: string;
    appointment_time: string;
    appointment_date: string;
    appointment_type: string;
    status: string;
    case_id: string;
    doctor_id: number;
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
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        patient_name: '',
        patient_id: '',
        appointment_time: '',
        appointment_date: '',
        appointment_type: 'Consultation',
        status: 'Pending',
        case_id: ''
    });

    useEffect(() => {
        fetchAllData();
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

            await fetchAppointments(token);

        } catch (err) {
            setError('Failed to connect to server');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async (token: string) => {
        try {
            const res = await fetch('http://localhost:5000/api/appointments/today', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAppointment(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAppointment = async () => {
        if (!newAppointment.patient_name || !newAppointment.appointment_time || !newAppointment.appointment_date) {
            alert('Please fill all required fields');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const res = await fetch('http://localhost:5000/api/appointments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patient_name: newAppointment.patient_name,
                    patient_id: newAppointment.patient_id,
                    appointment_time: newAppointment.appointment_time,
                    appointment_date: newAppointment.appointment_date,
                    appointment_type: newAppointment.appointment_type,
                    status: newAppointment.status,
                    case_id: newAppointment.case_id
                })
            });

            if (res.ok) {
                const result = await res.json();
                setAppointments(prev => [...prev, result.appointment]);
                setShowForm(false);
                setNewAppointment({
                    patient_name: '',
                    patient_id: '',
                    appointment_time: '',
                    appointment_date: '',
                    appointment_type: 'Consultation',
                    status: 'Pending',
                    case_id: ''
                });
                alert('Appointment added successfully!');
            } else {
                const errorData = await res.json();
                alert(errorData.error || 'Failed to add appointment');
            }
        } catch (err) {
            console.error('Error adding appointment:', err);
            alert('Failed to connect to server');
        }
    };

    const handleUpdateStatus = async (appointmentId: number, newStatus: string) => {
        try {
            const token = localStorage.getItem('token');

            const res = await fetch(`http://localhost:5000/api/appointments/${appointmentId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setAppointments(prev =>
                    prev.map(apt =>
                        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
                    )
                );
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/log-in');
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

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading dashboard...</p>
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
                    <div className={styles.profileCard}>
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
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.iconButton}><Bell size={20} /></button>
                        <button className={styles.iconButton}><Calendar size={20} /></button>
                        <button onClick={handleLogout} className={styles.iconButton}><LogOut size={20} /></button>
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
                        <div className={styles.statCard}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className={styles.statLabel}>Today's Appointments</p>
                                <p className={styles.statValue}>{stats?.today_appointments || 0}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.featuresGrid}>


                    {/* 👇 هذا الكود يكون الأول الآن */}
                    <Link href="/patient-management" className={styles.featureCard}>
                        <div className={styles.featureHeader}>
                            <div className={styles.featureIcon} style={{ backgroundColor: '#13c2c2' }}>
                                <Users size={28} color="white" />
                            </div>
                            <span className={styles.featureBadge}>PATIENT CARE</span>
                        </div>
                        <h3 className={styles.featureTitle}>Patient Management</h3>
                        <p className={styles.featureDesc}>Comprehensive patient records and clinical history tracking</p>
                        <ul className={styles.featureList}>
                            <li>Patient profiles & history</li>
                            <li>Treatment timeline</li>
                            <li>Follow-up scheduling</li>
                            <li>Clinical notes</li>
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

                <div className={styles.tableSection}>
                    <div className={styles.tableHeader}>
                        <h3>Today's Appointments & Patients</h3>
                        <Link href="/appointments" className={styles.viewAllLink}>
                            View All <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                        <button className={styles.addButton} onClick={() => setShowForm(!showForm)}>
                            + New Appointment
                        </button>
                    </div>

                    {showForm && (
                        <div className={styles.formContainer}>
                            <h4>Add New Appointment</h4>
                            <div className={styles.formGrid}>
                                <input
                                    type="text"
                                    name="patient_name"
                                    placeholder="Patient Name *"
                                    value={newAppointment.patient_name}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                />
                                <input
                                    type="text"
                                    name="patient_id"
                                    placeholder="Patient ID"
                                    value={newAppointment.patient_id}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                />
                                <input
                                    type="date"
                                    name="appointment_date"
                                    value={newAppointment.appointment_date}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                />
                                <input
                                    type="time"
                                    name="appointment_time"
                                    value={newAppointment.appointment_time}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                />
                                <select
                                    name="appointment_type"
                                    value={newAppointment.appointment_type}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                >
                                    <option value="Consultation">Consultation</option>
                                    <option value="Follow-up">Follow-up</option>
                                    <option value="Ultrasound">Ultrasound</option>
                                    <option value="Biopsy">Biopsy</option>
                                </select>
                                <select
                                    name="status"
                                    value={newAppointment.status}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <input
                                    type="text"
                                    name="case_id"
                                    placeholder="Case ID (optional)"
                                    value={newAppointment.case_id}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                />
                                <div className={styles.formActions}>
                                    <button onClick={handleAddAppointment} className={styles.saveBtn}>
                                        Save Appointment
                                    </button>
                                    <button onClick={() => setShowForm(false)} className={styles.cancelBtn}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.tableWrapper}>
                        <table className={styles.appointmentsTable}>
                            <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Time/Date</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Case ID</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {appointments.length > 0 ? (
                                appointments.map((apt) => (
                                    <tr key={apt.id}>
                                        <td>
                                            <div className={styles.patientInfo}>
                                                <div className={styles.patientAvatar}>
                                                    {apt.patient_name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <div className={styles.patientName}>{apt.patient_name}</div>
                                                    <div className={styles.patientId}>ID: {apt.patient_id || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {apt.appointment_time}
                                            {apt.appointment_date !== new Date().toISOString().split('T')[0] &&
                                                ` (${new Date(apt.appointment_date).toLocaleDateString()})`
                                            }
                                        </td>
                                        <td>
                                                <span className={`${styles.badge} ${styles[apt.appointment_type.toLowerCase() + 'Badge'] || styles.consultationBadge}`}>
                                                    {apt.appointment_type}
                                                </span>
                                        </td>
                                        <td>
                                            <select
                                                value={apt.status}
                                                onChange={(e) => handleUpdateStatus(apt.id, e.target.value)}
                                                className={`${styles.statusSelect} ${styles[apt.status.toLowerCase() + 'Select']}`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={styles.caseId}>#{apt.case_id}</span>
                                        </td>
                                        <td>
                                            <Link href={`/cases/${apt.case_id}`} className={styles.viewBtn}>
                                                View <ChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className={styles.noData}>
                                        No appointments found for today
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
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
