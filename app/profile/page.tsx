'use client';

import { useState, useEffect } from 'react';
import { User, Settings, Bell, Lock, ChevronRight, X, Sun, Moon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { BASE } from '@/lib/api';

interface Doctor {
    id: number;
    name: string;
    email: string;
    specialty: string;
    phone: string;
    license_number: string;
}

export default function ProfilePage() {
    const [doctor,        setDoctor]        = useState<Doctor | null>(null);
    const [loading,       setLoading]       = useState(true);
    const [saving,        setSaving]        = useState(false);
    const [error,         setError]         = useState('');
    const [success,       setSuccess]       = useState('');
    const [visible,       setVisible]       = useState(false);

    const [name,          setName]          = useState('');
    const [specialty,     setSpecialty]     = useState('');
    const [phone,         setPhone]         = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPrefsModal,    setShowPrefsModal]    = useState(false);
    const [showNotifModal,    setShowNotifModal]    = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword,     setNewPassword]     = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError,   setPasswordError]   = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const [theme, setTheme] = useState<'Light' | 'Dark'>('Light');
    const [systemUpdates,        setSystemUpdates]        = useState(true);
    const [emailNotifications,   setEmailNotifications]   = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        fetchProfile();
        setTimeout(() => setVisible(true), 50);
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE}/api/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setDoctor(data.doctor);
                setName(data.doctor.name || '');
                setSpecialty(data.doctor.specialty || '');
                setPhone(data.doctor.phone || '');
                setLicenseNumber(data.doctor.license_number || '');
            } else {
                setError('Failed to load profile');
            }
        } catch (err) {
            setError('Failed to connect to server');
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
            if (!token) {
                setError('Please login again');
                setSaving(false);
                return;
            }

            const updateData = {
                name:           name           || doctor?.name      || 'Doctor',
                specialty:      specialty      || doctor?.specialty  || 'Specialist',
                phone:          phone          || '',
                license_number: licenseNumber  || '',
            };

            const res = await fetch(`${BASE}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const data = await res.json();

            if (data.success) {
                setDoctor(data.doctor);
                setName(data.doctor.name || '');
                setSpecialty(data.doctor.specialty || '');
                setPhone(data.doctor.phone || '');
                setLicenseNumber(data.doctor.license_number || '');

                // ← حدّث localStorage عشان الـ Navbar يشوف الاسم الجديد فوراً
                const current = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...current,
                    name:      data.doctor.name,
                    specialty: data.doctor.specialty,
                    email:     data.doctor.email,
                }));
                // ← أبلّغ الـ Navbar بالتحديث
                window.dispatchEvent(new Event('user-updated'));

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

        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BASE}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await res.json();
            if (data.success) {
                setPasswordSuccess('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess('');
                }, 2000);
            } else {
                setPasswordError(data.error || 'Failed to change password');
            }
        } catch {
            setPasswordError('Failed to connect to server');
        }
    };

    const getInitials = (n: string) => n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
    const activeNotifCount = [systemUpdates, emailNotifications].filter(Boolean).length;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #F0F4F8; --surface: #fff; --teal: #0D9488;
          --text: #0F172A; --text2: #334155; --muted: #64748B;
          --border: #E2E8F0;
          --body: 'Plus Jakarta Sans', sans-serif;
          --display: 'DM Serif Display', serif;
        }

        body { background: var(--bg); font-family: var(--body); -webkit-font-smoothing: antialiased; }

        .pf-wrap { min-height: 100vh; background: var(--bg); position: relative; }
        .pf-wrap::before {
          content: ''; position: fixed; inset: 0;
          background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
          background-size: 28px 28px; opacity: 0.4; pointer-events: none; z-index: 0;
        }
        .pf-blob1 {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 65%);
          top: -200px; right: -150px; pointer-events: none; z-index: 0;
        }

        .pf-main { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 48px 48px 80px; }

        .pf-page-head {
          margin-bottom: 40px;
          opacity: 0; transform: translateY(20px);
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .pf-page-head.visible { opacity: 1; transform: translateY(0); }
        .pf-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600; color: var(--muted);
          text-decoration: none; margin-bottom: 20px;
          padding: 7px 13px; background: white; border: 1px solid var(--border);
          border-radius: 9px; transition: all 0.15s;
        }
        .pf-back:hover { color: #0D9488; border-color: #CCFBF1; background: #F0FDFA; }
        .pf-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: #F0FDFA; border: 1px solid #99F6E4; color: #0D9488;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          padding: 5px 12px; border-radius: 100px; margin-bottom: 14px;
        }
        .pf-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: #0D9488; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .pf-h1 { font-family: var(--display); font-size: 36px; color: var(--text); letter-spacing: -0.3px; margin-bottom: 6px; }
        .pf-sub { font-size: 14px; color: var(--muted); }

        .pf-success { background: #F0FDFA; border: 1px solid #99F6E4; color: #0D9488; padding: 13px 16px; border-radius: 12px; font-size: 13.5px; font-weight: 600; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }
        .pf-error   { background: #FFF1F2; border: 1px solid #FECDD3; color: #E11D48; padding: 13px 16px; border-radius: 12px; font-size: 13.5px; font-weight: 600; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; }

        .pf-grid {
          display: grid; grid-template-columns: 300px 1fr; gap: 24px;
          opacity: 0; transform: translateY(20px);
          transition: all 0.6s 0.1s cubic-bezier(0.16,1,0.3,1);
        }
        .pf-grid.visible { opacity: 1; transform: translateY(0); }

        .pf-card {
          background: white; border: 1px solid var(--border); border-radius: 20px;
          overflow: hidden; box-shadow: 0 2px 16px rgba(15,23,42,0.05);
          margin-bottom: 20px;
        }
        .pf-card:last-child { margin-bottom: 0; }

        .pf-avatar-card {
          padding: 36px 24px; text-align: center;
          background: linear-gradient(160deg, #F0FDFA 0%, white 60%);
          position: relative; overflow: hidden;
        }
        .pf-avatar-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #0D9488, #0891B2);
        }
        .pf-av {
          width: 80px; height: 80px; border-radius: 22px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; font-weight: 800; color: white;
          margin: 0 auto 16px;
          box-shadow: 0 8px 28px rgba(13,148,136,0.3);
        }
        .pf-av-name { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .pf-av-spec { font-size: 13px; color: var(--muted); margin-bottom: 14px; }
        .pf-license {
          display: inline-block; font-size: 11px; font-weight: 700;
          background: #F0FDFA; border: 1px solid #99F6E4; color: #0D9488;
          padding: 5px 12px; border-radius: 100px;
        }

        .pf-settings-head {
          padding: 18px 20px 14px;
          border-bottom: 1px solid #F1F5F9;
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase; color: var(--muted);
        }
        .pf-setting-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px; cursor: pointer;
          border: none; background: none; width: 100%; text-align: left;
          border-bottom: 1px solid #F8FAFC;
          transition: background 0.15s; font-family: var(--body);
        }
        .pf-setting-item:last-child { border-bottom: none; }
        .pf-setting-item:hover { background: #F8FAFC; }
        .pf-setting-left { display: flex; align-items: center; gap: 12px; }
        .pf-setting-ic {
          width: 34px; height: 34px; border-radius: 10px;
          background: #F0FDFA; border: 1px solid #CCFBF1;
          display: flex; align-items: center; justify-content: center; color: #0D9488;
          flex-shrink: 0;
        }
        .pf-setting-title { font-size: 13.5px; font-weight: 600; color: var(--text); }
        .pf-setting-desc  { font-size: 11.5px; color: var(--muted); margin-top: 1px; }
        .pf-setting-arrow { color: #CBD5E1; }

        .pf-form-head {
          padding: 20px 28px 16px; border-bottom: 1px solid #F1F5F9;
          display: flex; align-items: center; gap: 9px;
          font-size: 12px; font-weight: 800; letter-spacing: 1px;
          text-transform: uppercase; color: var(--muted);
        }
        .pf-form-body { padding: 28px; }
        .pf-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        .pf-form-group { display: flex; flex-direction: column; gap: 7px; }
        .pf-form-group.full { grid-column: 1 / -1; }
        .pf-label { font-size: 11.5px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: var(--text2); }
        .pf-input {
          height: 46px; background: #F8FAFC; border: 1.5px solid var(--border);
          border-radius: 11px; padding: 0 14px;
          font-family: var(--body); font-size: 14px; color: var(--text);
          outline: none; transition: all 0.2s;
        }
        .pf-input:focus { border-color: #0D9488; background: white; box-shadow: 0 0 0 3px rgba(13,148,136,0.1); }
        .pf-input:disabled { opacity: 0.6; cursor: not-allowed; }
        .pf-field-note { font-size: 11px; color: var(--muted); }
        .pf-save-btn {
          display: inline-flex; align-items: center; gap: 8px;
          height: 46px; padding: 0 28px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          color: white; font-family: var(--body); font-size: 14px; font-weight: 700;
          border: none; border-radius: 12px; cursor: pointer;
          box-shadow: 0 6px 20px rgba(13,148,136,0.3); transition: all 0.2s;
        }
        .pf-save-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(13,148,136,0.4); }
        .pf-save-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

        .pf-modal-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.4);
          backdrop-filter: blur(8px); z-index: 500;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .pf-modal {
          background: white; border-radius: 24px;
          width: 100%; max-width: 440px;
          border: 1px solid var(--border);
          box-shadow: 0 24px 80px rgba(15,23,42,0.18);
          animation: modalIn 0.25s cubic-bezier(0.16,1,0.3,1) both;
          overflow: hidden;
        }
        @keyframes modalIn { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
        .pf-modal-head {
          padding: 20px 24px 16px; border-bottom: 1px solid #F1F5F9;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pf-modal-title-row { display: flex; align-items: center; gap: 9px; }
        .pf-modal-title-ic {
          width: 32px; height: 32px; border-radius: 9px;
          background: #F0FDFA; border: 1px solid #CCFBF1;
          display: flex; align-items: center; justify-content: center; color: #0D9488;
        }
        .pf-modal-title { font-size: 15px; font-weight: 700; color: var(--text); }
        .pf-modal-close {
          width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--border);
          background: #F8FAFC; color: var(--muted); cursor: pointer;
          display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .pf-modal-close:hover { background: #FFF1F2; color: #E11D48; border-color: #FECDD3; }
        .pf-modal-body { padding: 24px; }
        .pf-modal-fg { margin-bottom: 16px; }
        .pf-modal-fg:last-child { margin-bottom: 0; }

        .pf-theme-opts { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-top: 10px; }
        .pf-theme-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 14px 8px; border-radius: 12px;
          border: 1.5px solid var(--border); background: #F8FAFC;
          font-family: var(--body); font-size: 12px; font-weight: 600; color: var(--muted);
          cursor: pointer; transition: all 0.18s;
        }
        .pf-theme-btn:hover { border-color: #CCFBF1; color: #0D9488; background: #F0FDFA; }
        .pf-theme-btn.active { border-color: #0D9488; color: #0D9488; background: #F0FDFA; }

        .pf-notif-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #F8FAFC; }
        .pf-notif-item:last-child { border-bottom: none; }
        .pf-notif-title { font-size: 13.5px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
        .pf-notif-desc  { font-size: 11.5px; color: var(--muted); }
        .pf-toggle { position: relative; width: 40px; height: 22px; flex-shrink: 0; }
        .pf-toggle input { opacity: 0; width: 0; height: 0; }
        .pf-toggle-sl {
          position: absolute; cursor: pointer; inset: 0;
          background: #E2E8F0; border-radius: 100px; transition: 0.25s;
        }
        .pf-toggle-sl::before {
          content: ''; position: absolute;
          height: 16px; width: 16px; left: 3px; bottom: 3px;
          background: white; border-radius: 50%;
          transition: 0.25s; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .pf-toggle input:checked + .pf-toggle-sl { background: #0D9488; }
        .pf-toggle input:checked + .pf-toggle-sl::before { transform: translateX(18px); }

        @media (max-width: 900px) {
          .pf-main { padding: 32px 20px 60px; }
          .pf-grid { grid-template-columns: 1fr; }
          .pf-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

            <div className="pf-wrap">
                <div className="pf-blob1" />
                <Navbar />

                {loading ? (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16 }}>
                        <div style={{ width:36, height:36, border:'3px solid #E2E8F0', borderTopColor:'#0D9488', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                        <p style={{ color:'#64748B', fontSize:14 }}>Loading profile…</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div className="pf-main">

                        <div className={`pf-page-head${visible ? ' visible' : ''}`}>
                            <Link href="/dashboard" className="pf-back">
                                <ArrowLeft size={13} /> Dashboard
                            </Link>
                            <div className="pf-badge"><span className="pf-badge-dot" /> My Account</div>
                            <h1 className="pf-h1">My Profile</h1>
                            <p className="pf-sub">Manage your personal information and account settings</p>
                        </div>

                        {success && <div className="pf-success">✓ {success}</div>}
                        {error   && <div className="pf-error">⚠ {error}</div>}

                        <div className={`pf-grid${visible ? ' visible' : ''}`}>

                            {/* LEFT */}
                            <div>
                                <div className="pf-card">
                                    <div className="pf-avatar-card">
                                        <div className="pf-av">{doctor ? getInitials(doctor.name) : 'DR'}</div>
                                        <div className="pf-av-name">{doctor?.name}</div>
                                        <div className="pf-av-spec">{doctor?.specialty || 'Thyroid Specialist'}</div>
                                        {doctor?.license_number && (
                                            <span className="pf-license">License: {doctor.license_number}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="pf-card">
                                    <div className="pf-settings-head">
                                        <Settings size={13} /> Settings
                                    </div>
                                    {[
                                        { icon: <Sun size={15} />, title: 'Display Theme', desc: `Theme: ${theme}`, onClick: () => setShowPrefsModal(true) },
                                        { icon: <Bell size={15} />,    title: 'Notifications',       desc: `${activeNotifCount} active`, onClick: () => setShowNotifModal(true)    },
                                        { icon: <Lock size={15} />,    title: 'Security',             desc: 'Change your password',       onClick: () => setShowPasswordModal(true) },
                                    ].map((item, i) => (
                                        <button key={i} className="pf-setting-item" onClick={item.onClick}>
                                            <div className="pf-setting-left">
                                                <div className="pf-setting-ic">{item.icon}</div>
                                                <div>
                                                    <div className="pf-setting-title">{item.title}</div>
                                                    <div className="pf-setting-desc">{item.desc}</div>
                                                </div>
                                            </div>
                                            <ChevronRight size={15} className="pf-setting-arrow" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* RIGHT */}
                            <div>
                                <div className="pf-card">
                                    <div className="pf-form-head"><User size={13} /> Personal Information</div>
                                    <div className="pf-form-body">
                                        <div className="pf-form-grid">
                                            <div className="pf-form-group">
                                                <label className="pf-label">Full Name</label>
                                                <input className="pf-input" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. John Doe" />
                                            </div>
                                            <div className="pf-form-group">
                                                <label className="pf-label">Specialty</label>
                                                <input className="pf-input" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="Thyroid Specialist" />
                                            </div>
                                            <div className="pf-form-group full">
                                                <label className="pf-label">Email</label>
                                                <input className="pf-input" value={doctor?.email || ''} disabled />
                                                <span className="pf-field-note">Contact support to change email</span>
                                            </div>
                                            <div className="pf-form-group">
                                                <label className="pf-label">Phone Number</label>
                                                <input className="pf-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966 5X XXX XXXX" />
                                            </div>
                                            <div className="pf-form-group">
                                                <label className="pf-label">Medical License</label>
                                                <input className="pf-input" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="e.g. SA-12345" />
                                            </div>
                                        </div>
                                        <button className="pf-save-btn" onClick={handleSave} disabled={saving}>
                                            {saving ? 'Saving…' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODALS */}
                {showPrefsModal && (
                    <div className="pf-modal-overlay" onClick={() => setShowPrefsModal(false)}>
                        <div className="pf-modal" onClick={e => e.stopPropagation()}>
                            <div className="pf-modal-head">
                                <div className="pf-modal-title-row">
                                    <div className="pf-modal-title-ic"><Sun size={15} /></div>
                                    <span className="pf-modal-title">System Preferences</span>
                                </div>
                                <button className="pf-modal-close" onClick={() => setShowPrefsModal(false)}><X size={14} /></button>
                            </div>
                            <div className="pf-modal-body">
                                <label className="pf-label" style={{ marginBottom:8, display:'block' }}>Display Theme</label>
                                <div className="pf-theme-opts">
                                    {(['Light','Dark'] as const).map(t => (
                                        <button key={t} className={`pf-theme-btn${theme === t ? ' active' : ''}`} onClick={() => setTheme(t)}>
                                            {t === 'Light' ? <Sun size={18}/> : <Moon size={18}/>}
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <button className="pf-save-btn" style={{ marginTop:24, width:'100%', justifyContent:'center' }}
                                        onClick={() => {
                                            document.documentElement.setAttribute('data-theme', theme.toLowerCase());
                                            localStorage.setItem('theme', theme);
                                            setShowPrefsModal(false);
                                            setSuccess('Preferences saved');
                                            setTimeout(() => setSuccess(''), 3000);
                                        }}>
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showNotifModal && (
                    <div className="pf-modal-overlay" onClick={() => setShowNotifModal(false)}>
                        <div className="pf-modal" onClick={e => e.stopPropagation()}>
                            <div className="pf-modal-head">
                                <div className="pf-modal-title-row">
                                    <div className="pf-modal-title-ic"><Bell size={15} /></div>
                                    <span className="pf-modal-title">Notification Settings</span>
                                </div>
                                <button className="pf-modal-close" onClick={() => setShowNotifModal(false)}><X size={14} /></button>
                            </div>
                            <div className="pf-modal-body">
                                {[
                                    { label:'System Updates',        desc:'Receive notifications about system updates', val:systemUpdates,        set:setSystemUpdates        },
                                    { label:'Email Notifications',   desc:'Receive email summaries and alerts',        val:emailNotifications,   set:setEmailNotifications   },
                                ].map(n => (
                                    <div key={n.label} className="pf-notif-item">
                                        <div>
                                            <div className="pf-notif-title">{n.label}</div>
                                            <div className="pf-notif-desc">{n.desc}</div>
                                        </div>
                                        <label className="pf-toggle">
                                            <input type="checkbox" checked={n.val} onChange={e => n.set(e.target.checked)} />
                                            <span className="pf-toggle-sl" />
                                        </label>
                                    </div>
                                ))}
                                <button className="pf-save-btn" style={{ marginTop:20, width:'100%', justifyContent:'center' }}
                                        onClick={() => { setShowNotifModal(false); setSuccess('Notification settings saved'); setTimeout(() => setSuccess(''), 3000); }}>
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showPasswordModal && (
                    <div className="pf-modal-overlay" onClick={() => setShowPasswordModal(false)}>
                        <div className="pf-modal" onClick={e => e.stopPropagation()}>
                            <div className="pf-modal-head">
                                <div className="pf-modal-title-row">
                                    <div className="pf-modal-title-ic"><Lock size={15} /></div>
                                    <span className="pf-modal-title">Change Password</span>
                                </div>
                                <button className="pf-modal-close" onClick={() => setShowPasswordModal(false)}><X size={14} /></button>
                            </div>
                            <div className="pf-modal-body">
                                {passwordError   && <div className="pf-error"   style={{ marginBottom:16 }}>⚠ {passwordError}</div>}
                                {passwordSuccess && <div className="pf-success" style={{ marginBottom:16 }}>✓ {passwordSuccess}</div>}
                                {[
                                    { label:'Current Password', val:currentPassword, set:setCurrentPassword, ph:'Enter current password' },
                                    { label:'New Password',     val:newPassword,     set:setNewPassword,     ph:'Minimum 6 characters'   },
                                    { label:'Confirm Password', val:confirmPassword, set:setConfirmPassword, ph:'Repeat new password'     },
                                ].map(f => (
                                    <div key={f.label} className="pf-modal-fg">
                                        <label className="pf-label" style={{ marginBottom:7, display:'block' }}>{f.label}</label>
                                        <input className="pf-input" style={{ width:'100%' }} type="password"
                                               value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} />
                                    </div>
                                ))}
                                <button className="pf-save-btn" style={{ marginTop:20, width:'100%', justifyContent:'center' }} onClick={handlePasswordChange}>
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}