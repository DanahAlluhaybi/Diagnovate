'use client';

import { useState, useEffect } from 'react';
import { Merriweather } from 'next/font/google';
import { User, Settings, Bell, Lock, ChevronRight, X, Sun, Moon, Monitor } from 'lucide-react';
import styles from './styles.module.css';

const merriweather = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700', '900'] });

interface Doctor {
    id: number;
    name: string;
    email: string;
    specialty: string;
    phone: string;
    license_number: string;
}

export default function ProfilePage() {
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [phone, setPhone] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');

    // Modals
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPrefsModal, setShowPrefsModal] = useState(false);
    const [showNotifModal, setShowNotifModal] = useState(false);

    // Password
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // System Preferences
    const [theme, setTheme] = useState<'Light' | 'Dark' | 'System'>('Light');

    // Notifications
    const [appointmentReminders, setAppointmentReminders] = useState(true);
    const [systemUpdates, setSystemUpdates] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDoctor(data.doctor);
                setName(data.doctor.name || '');
                setSpecialty(data.doctor.specialty || '');
                setPhone(data.doctor.phone || '');
                setLicenseNumber(data.doctor.license_number || '');
            }
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, specialty, phone, license_number: licenseNumber })
            });
            const data = await response.json();
            if (data.success) {
                setDoctor(data.doctor);
                setSuccess('Profile updated successfully');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.error || 'Failed to update');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordError('');
        setPasswordSuccess('');
        if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
        if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });
            const data = await response.json();
            if (data.success) {
                setPasswordSuccess('Password changed successfully');
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(''); }, 2000);
            } else {
                setPasswordError(data.error || 'Failed to change password');
            }
        } catch (err) {
            setPasswordError('Failed to connect to server');
        }
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const activeNotifCount = [appointmentReminders, systemUpdates, emailNotifications].filter(Boolean).length;

    if (loading) {
        return (
            <div className={`${styles.page} ${merriweather.className}`}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner} />
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.page} ${merriweather.className}`}>

            {/* ← Navbar — same style as Enhancement page */}
            <header className={styles.navbar}>
                <a href="/dashboard" className={styles.backBtn}>
                    ← Back to Dashboard
                </a>
            </header>

            <div className={styles.main}>
                <div className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>My Profile</h1>
                    <p className={styles.pageSub}>Manage your personal information and account settings</p>
                </div>

                {success && <div className={styles.successBox}>{success}</div>}
                {error && <div className={styles.errorBox}>{error}</div>}

                <div className={styles.profileGrid}>

                    {/* Left Column */}
                    <div className={styles.leftCol}>

                        {/* Avatar Card */}
                        <div className={styles.card}>
                            <div className={styles.avatarWrap}>
                                <div className={styles.avatar}>
                                    {doctor ? getInitials(doctor.name) : 'DR'}
                                </div>
                                <h2 className={styles.avatarName}>{doctor?.name}</h2>
                                <p className={styles.avatarSpecialty}>{doctor?.specialty}</p>
                                {doctor?.license_number && (
                                    <span className={styles.licenseBadge}>License: {doctor.license_number}</span>
                                )}
                            </div>
                        </div>

                        {/* Settings Card */}
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>
                                <Settings size={16} className={styles.cardIconSvg} />
                                Settings
                            </div>
                            <div className={styles.settingsList}>
                                <button className={styles.settingItem} onClick={() => setShowPrefsModal(true)}>
                                    <div className={styles.settingItemLeft}>
                                        <div className={styles.settingIcon}><Monitor size={16} /></div>
                                        <div>
                                            <div className={styles.settingItemTitle}>System Preferences</div>
                                            <div className={styles.settingItemDesc}>Theme: {theme}</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={styles.settingArrow} />
                                </button>

                                <button className={styles.settingItem} onClick={() => setShowNotifModal(true)}>
                                    <div className={styles.settingItemLeft}>
                                        <div className={styles.settingIcon}><Bell size={16} /></div>
                                        <div>
                                            <div className={styles.settingItemTitle}>Notifications</div>
                                            <div className={styles.settingItemDesc}>{activeNotifCount} active</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={styles.settingArrow} />
                                </button>

                                <button className={styles.settingItem} onClick={() => setShowPasswordModal(true)}>
                                    <div className={styles.settingItemLeft}>
                                        <div className={styles.settingIcon}><Lock size={16} /></div>
                                        <div>
                                            <div className={styles.settingItemTitle}>Security</div>
                                            <div className={styles.settingItemDesc}>Change your password</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className={styles.settingArrow} />
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className={styles.rightCol}>
                        <div className={styles.card}>
                            <div className={styles.cardTitle}>
                                <User size={16} className={styles.cardIconSvg} />
                                Personal Information
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Full Name</label>
                                    <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. John Doe" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Specialty</label>
                                    <input className={styles.input} value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Thyroid Specialist" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Email</label>
                                    <input className={`${styles.input} ${styles.inputDisabled}`} value={doctor?.email || ''} disabled />
                                    <span className={styles.fieldNote}>Contact support to change email</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Phone Number</label>
                                    <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+966 5X XXX XXXX" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Medical License Number</label>
                                    <input className={styles.input} value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. SA-12345" />
                                </div>
                            </div>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* System Preferences Modal */}
            {showPrefsModal && (
                <div className={styles.modalOverlay} onClick={() => setShowPrefsModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleRow}>
                                <Monitor size={18} className={styles.modalTitleIcon} />
                                <h3 className={styles.modalTitle}>System Preferences</h3>
                            </div>
                            <button className={styles.modalClose} onClick={() => setShowPrefsModal(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className={styles.prefSection}>
                            <p className={styles.prefLabel}>Display Theme</p>
                            <div className={styles.themeOptions}>
                                <button className={`${styles.themeBtn} ${theme === 'Light' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('Light')}>
                                    <Sun size={18} /><span>Light</span>
                                </button>
                                <button className={`${styles.themeBtn} ${theme === 'Dark' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('Dark')}>
                                    <Moon size={18} /><span>Dark</span>
                                </button>
                                <button className={`${styles.themeBtn} ${theme === 'System' ? styles.themeBtnActive : ''}`} onClick={() => setTheme('System')}>
                                    <Monitor size={18} /><span>System</span>
                                </button>
                            </div>
                        </div>

                        <button className={styles.saveBtn} onClick={() => {
                            setShowPrefsModal(false);
                            setSuccess('Preferences saved');
                            setTimeout(() => setSuccess(''), 3000);
                        }}>Save</button>
                    </div>
                </div>
            )}

            {/* Notifications Modal */}
            {showNotifModal && (
                <div className={styles.modalOverlay} onClick={() => setShowNotifModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleRow}>
                                <Bell size={18} className={styles.modalTitleIcon} />
                                <h3 className={styles.modalTitle}>Notification Settings</h3>
                            </div>
                            <button className={styles.modalClose} onClick={() => setShowNotifModal(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className={styles.notifList}>
                            <div className={styles.notifItem}>
                                <div className={styles.notifInfo}>
                                    <span className={styles.notifTitle}>Appointment Reminders</span>
                                    <span className={styles.notifDesc}>Get reminded before upcoming appointments</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input type="checkbox" checked={appointmentReminders} onChange={(e) => setAppointmentReminders(e.target.checked)} />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                            <div className={styles.notifItem}>
                                <div className={styles.notifInfo}>
                                    <span className={styles.notifTitle}>System Updates</span>
                                    <span className={styles.notifDesc}>Receive notifications about system updates</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input type="checkbox" checked={systemUpdates} onChange={(e) => setSystemUpdates(e.target.checked)} />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                            <div className={styles.notifItem}>
                                <div className={styles.notifInfo}>
                                    <span className={styles.notifTitle}>Email Notifications</span>
                                    <span className={styles.notifDesc}>Receive email summaries and alerts</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                            </div>
                        </div>

                        <button className={styles.saveBtn} onClick={() => {
                            setShowNotifModal(false);
                            setSuccess('Notification settings saved');
                            setTimeout(() => setSuccess(''), 3000);
                        }}>Save</button>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPasswordModal && (
                <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleRow}>
                                <Lock size={18} className={styles.modalTitleIcon} />
                                <h3 className={styles.modalTitle}>Change Password</h3>
                            </div>
                            <button className={styles.modalClose} onClick={() => setShowPasswordModal(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        {passwordError && <div className={styles.errorBox}>{passwordError}</div>}
                        {passwordSuccess && <div className={styles.successBox}>{passwordSuccess}</div>}

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Current Password</label>
                            <input className={styles.input} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                        </div>
                        <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                            <label className={styles.label}>New Password</label>
                            <input className={styles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" />
                        </div>
                        <div className={styles.formGroup} style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                            <label className={styles.label}>Confirm New Password</label>
                            <input className={styles.input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                        </div>

                        <button className={styles.saveBtn} onClick={handlePasswordChange}>
                            Update Password
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}