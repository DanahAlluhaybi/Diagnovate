'use client';
import { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Bell, Sun, Moon, X, ChevronRight, ArrowLeft, Settings, ChevronDown, LogOut, User, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BASE } from '@/lib/api';

const AP_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased}

.ap-wrap{min-height:100vh;background:#fff;background-image:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(29,158,117,0.09) 0%,transparent 60%),radial-gradient(ellipse 50% 40% at 90% 90%,rgba(8,80,65,0.05) 0%,transparent 50%)}

/* NAV */
.ap-nav{height:64px;background:rgba(255,255,255,0.92);backdrop-filter:blur(14px);border-bottom:1px solid rgba(0,0,0,0.07);display:flex;align-items:center;padding:0 28px;gap:16px;position:sticky;top:0;z-index:200;box-shadow:0 1px 16px rgba(15,23,42,0.06)}
.ap-nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;font-size:16px;font-weight:800;letter-spacing:-0.3px;color:#0F172A}
.ap-nav-logomark{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(13,148,136,0.3)}
.ap-nav-accent{color:#0D9488}
.ap-nav-links{display:flex;align-items:center;gap:4px;margin-left:16px}
.ap-nav-link{font-size:13px;font-weight:600;color:#64748B;text-decoration:none;padding:6px 12px;border-radius:8px;transition:all .15s}
.ap-nav-link:hover{background:#F1F5F9;color:#0F172A}
.ap-nav-right{display:flex;align-items:center;gap:8px;margin-left:auto}
.ap-nav-iconbtn{width:34px;height:34px;border-radius:9px;border:1px solid rgba(0,0,0,0.08);background:#F8FAFC;color:#64748B;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.ap-nav-iconbtn:hover{background:#F0FDFA;color:#0D9488;border-color:#CCFBF1}
.ap-nav-divider{width:1px;height:20px;background:rgba(0,0,0,0.08);margin:0 4px}
.ap-nav-dropwrap{position:relative}
.ap-nav-profile{display:flex;align-items:center;gap:8px;cursor:pointer;padding:6px 11px;border-radius:10px;border:1px solid rgba(0,0,0,0.08);background:#F8FAFC;transition:all .15s}
.ap-nav-profile:hover{background:#F0FDFA;border-color:#CCFBF1}
.ap-nav-avatar{width:28px;height:28px;border-radius:7px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;color:white}
.ap-nav-pname{font-size:12px;font-weight:700;color:#0F172A}
.ap-nav-prole{font-size:10px;color:#94A3B8}
.ap-nav-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:white;border:1px solid rgba(0,0,0,0.07);border-radius:18px;box-shadow:0 16px 48px rgba(15,23,42,0.12);z-index:300;width:220px;overflow:hidden;animation:apDropIn 0.18s cubic-bezier(0.16,1,0.3,1) both}
@keyframes apDropIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.ap-nav-profhead{padding:16px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;gap:10px}
.ap-nav-profav{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0}
.ap-nav-profname{font-size:13px;font-weight:700;color:#0F172A}
.ap-nav-profspec{font-size:11px;color:#94A3B8}
.ap-nav-menuitem{display:flex;align-items:center;gap:9px;padding:9px 14px;font-size:13px;font-weight:600;color:#334155;text-decoration:none;cursor:pointer;border:none;background:none;width:100%;font-family:'DM Sans',sans-serif;transition:background .12s}
.ap-nav-menuitem:hover{background:#F8FAFC;color:#0F172A}
.ap-nav-menuitem-danger{color:#E11D48}
.ap-nav-menuitem-danger:hover{background:#FFF1F2;color:#E11D48}
.ap-nav-sep{height:1px;background:#F1F5F9;margin:2px 0}

/* HERO */
.ap-hero{background:linear-gradient(135deg,#0D1B17 0%,#0F3028 60%,#082018 100%);padding:52px 48px 48px;position:relative;overflow:hidden}
.ap-hero-dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,0.06) 1px,transparent 1px);background-size:20px 20px;pointer-events:none}
.ap-hero-blob{position:absolute;width:300px;height:300px;border-radius:50%;background:rgba(29,158,117,0.15);filter:blur(40px);top:-60px;right:80px;pointer-events:none}
.ap-hero-inner{position:relative;z-index:1;max-width:1100px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap}
.ap-hero-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);text-decoration:none;margin-bottom:20px;padding:6px 12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:8px;transition:all .15s}
.ap-hero-back:hover{color:rgba(255,255,255,0.85);background:rgba(255,255,255,0.1)}
.ap-hero-label{font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#1D9E75;margin-bottom:10px}
.ap-hero-title{font-family:'DM Serif Display',serif;font-size:36px;color:#fff;letter-spacing:-0.5px;line-height:1.1;margin-bottom:6px}
.ap-hero-sub{font-size:14px;color:rgba(255,255,255,0.5)}
.ap-hero-pills{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:0}
.ap-hero-pill{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:100px;padding:7px 14px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.75)}
.ap-hero-pill-dot{width:6px;height:6px;border-radius:50%;background:#1D9E75;flex-shrink:0}

/* PAGE BODY */
.ap-body{max-width:1100px;margin:0 auto;padding:40px 48px 80px}
.ap-grid{display:grid;grid-template-columns:300px 1fr;gap:24px}

/* CARDS */
.ap-card{background:#fff;border:1px solid rgba(0,0,0,0.07);border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(15,23,42,0.05);margin-bottom:20px}
.ap-card:last-child{margin-bottom:0}
.ap-avatar-card{padding:36px 24px;text-align:center;background:linear-gradient(160deg,#F0FDFA 0%,#fff 60%);position:relative;overflow:hidden}
.ap-avatar-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#1D9E75,#0D9488)}
.ap-av{width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 8px 28px rgba(13,148,136,0.3)}
.ap-av-name{font-size:17px;font-weight:700;color:#0F172A;margin-bottom:4px}
.ap-av-role{font-size:13px;color:#64748B;margin-bottom:14px}
.ap-av-badge{display:inline-block;font-size:11px;font-weight:700;background:#F0FDFA;border:1px solid #99F6E4;color:#0D9488;padding:5px 12px;border-radius:100px}

.ap-settings-head{padding:18px 20px 14px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;gap:8px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#94A3B8}
.ap-setting-item{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;cursor:pointer;border:none;background:none;width:100%;text-align:left;border-bottom:1px solid #F8FAFC;transition:background .15s;font-family:'DM Sans',sans-serif}
.ap-setting-item:last-child{border-bottom:none}
.ap-setting-item:hover{background:#F8FAFC}
.ap-setting-left{display:flex;align-items:center;gap:12px}
.ap-setting-ic{width:34px;height:34px;border-radius:10px;background:#F0FDFA;border:1px solid #CCFBF1;display:flex;align-items:center;justify-content:center;color:#0D9488;flex-shrink:0}
.ap-setting-title{font-size:13.5px;font-weight:600;color:#0F172A}
.ap-setting-desc{font-size:11.5px;color:#64748B;margin-top:1px}

.ap-info-head{padding:20px 24px 16px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;gap:9px;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#94A3B8}
.ap-info-body{padding:28px}
.ap-info-row{display:flex;flex-direction:column;gap:7px;margin-bottom:20px}
.ap-info-row:last-child{margin-bottom:0}
.ap-label{font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#334155;display:block;margin-bottom:7px}
.ap-value{height:46px;background:#F8FAFC;border:1.5px solid rgba(0,0,0,0.08);border-radius:11px;padding:0 14px;display:flex;align-items:center;font-size:14px;color:#64748B}
.ap-note{font-size:11px;color:#94A3B8;margin-top:4px}

/* MODAL */
.ap-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,0.4);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px}
.ap-modal{background:white;border-radius:24px;width:100%;max-width:440px;border:1px solid rgba(0,0,0,0.07);box-shadow:0 24px 80px rgba(15,23,42,0.18);animation:apModalIn .25s cubic-bezier(.16,1,.3,1) both;overflow:hidden}
@keyframes apModalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.ap-modal-head{padding:20px 24px 16px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;justify-content:space-between}
.ap-modal-title-row{display:flex;align-items:center;gap:9px}
.ap-modal-title-ic{width:32px;height:32px;border-radius:9px;background:#F0FDFA;border:1px solid #CCFBF1;display:flex;align-items:center;justify-content:center;color:#0D9488}
.ap-modal-title{font-size:15px;font-weight:700;color:#0F172A}
.ap-modal-close{width:30px;height:30px;border-radius:8px;border:1px solid rgba(0,0,0,0.08);background:#F8FAFC;color:#64748B;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.ap-modal-close:hover{background:#FFF1F2;color:#E11D48;border-color:#FECDD3}
.ap-modal-body{padding:24px}
.ap-modal-fg{margin-bottom:16px}

.ap-theme-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.ap-theme-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:12px;border:1.5px solid rgba(0,0,0,0.08);background:#F8FAFC;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:#64748B;cursor:pointer;transition:all .18s}
.ap-theme-btn:hover{border-color:#CCFBF1;color:#0D9488;background:#F0FDFA}
.ap-theme-btn.active{border-color:#0D9488;color:#0D9488;background:#F0FDFA}

.ap-notif-item{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #F8FAFC}
.ap-notif-item:last-child{border-bottom:none}
.ap-notif-title{font-size:13.5px;font-weight:600;color:#0F172A;margin-bottom:2px}
.ap-notif-desc{font-size:11.5px;color:#64748B}

.ap-toggle{position:relative;width:40px;height:22px;flex-shrink:0}
.ap-toggle input{opacity:0;width:0;height:0}
.ap-toggle-sl{position:absolute;cursor:pointer;inset:0;background:#E2E8F0;border-radius:100px;transition:.25s}
.ap-toggle-sl::before{content:'';position:absolute;height:16px;width:16px;left:3px;bottom:3px;background:white;border-radius:50%;transition:.25s;box-shadow:0 1px 4px rgba(0,0,0,0.15)}
.ap-toggle input:checked+.ap-toggle-sl{background:#0D9488}
.ap-toggle input:checked+.ap-toggle-sl::before{transform:translateX(18px)}

.ap-save-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:46px;padding:0 28px;background:linear-gradient(135deg,#1D9E75,#0D9488,#0F6E56);color:white;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;border:none;border-radius:11px;cursor:pointer;box-shadow:0 6px 20px rgba(13,148,136,0.3);transition:all .2s;width:100%;margin-top:20px}
.ap-save-btn:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(13,148,136,0.4)}

.ap-input{height:46px;background:#F8FAFC;border:1.5px solid rgba(0,0,0,0.08);border-radius:11px;padding:0 14px;font-family:'DM Sans',sans-serif;font-size:14px;color:#0F172A;outline:none;transition:all .2s;width:100%}
.ap-input:focus{border-color:#0D9488;background:white;box-shadow:0 0 0 3px rgba(13,148,136,0.1)}

.ap-err{background:#FFF1F2;border:1px solid #FECDD3;color:#E11D48;padding:13px 16px;border-radius:12px;font-size:13.5px;font-weight:600;margin-bottom:16px}
.ap-ok{background:#F0FDFA;border:1px solid #99F6E4;color:#0D9488;padding:13px 16px;border-radius:12px;font-size:13.5px;font-weight:600;margin-bottom:16px}

.ap-toast{position:fixed;bottom:28px;right:28px;z-index:600;display:flex;align-items:center;gap:9px;padding:13px 20px;border-radius:14px;font-size:13px;font-weight:700;background:linear-gradient(135deg,#1D9E75,#0D9488);color:white;box-shadow:0 8px 32px rgba(13,148,136,0.3)}

@media(max-width:900px){.ap-body{padding:32px 20px 60px}.ap-grid{grid-template-columns:1fr}.ap-hero{padding:40px 24px 36px}}
`;

export default function AdminProfilePage() {
    const router = useRouter();
    const [admin, setAdmin] = useState<{name:string;email:string}|null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPrefsModal, setShowPrefsModal] = useState(false);
    const [showNotifModal, setShowNotifModal] = useState(false);
    const [theme, setTheme] = useState<'Light'|'Dark'>('Light');
    const [systemUpdates, setSystemUpdates] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [success, setSuccess] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('admin_user');
        if (userStr) setAdmin(JSON.parse(userStr));
        const savedTheme = localStorage.getItem('theme') as 'Light'|'Dark'|null;
        if (savedTheme) setTheme(savedTheme);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node))
                setProfileOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node))
                setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/log-in?role=admin');
    };

    const handlePasswordChange = async () => {
        setPasswordError('');
        setPasswordSuccess('');
        if (newPassword !== confirmPassword) return setPasswordError('Passwords do not match');
        if (newPassword.length < 6) return setPasswordError('Password must be at least 6 characters');
        try {
            const token = localStorage.getItem('admin_token');
            const res = await fetch(`${BASE}/api/admin/change-password`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });
            const data = await res.json();
            if (data.success) {
                setPasswordSuccess('Password changed successfully');
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(''); }, 2000);
            } else {
                setPasswordError(data.error || 'Failed to change password');
            }
        } catch {
            setPasswordError('Failed to connect to server');
        }
    };

    return (
        <>
            <style>{AP_STYLES}</style>
            <div className="ap-wrap">

                {/* NAV */}
                <nav className="ap-nav">
                    <Link href="/admin" className="ap-nav-logo">
                        <div className="ap-nav-logomark">
                            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                                <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
                                <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                                <circle cx="20" cy="20" r="3.5" fill="white"/>
                            </svg>
                        </div>
                        <span>Diagno<span className="ap-nav-accent">vate</span></span>
                    </Link>

                    <div className="ap-nav-links">
                        <Link href="/admin" className="ap-nav-link">Admin Panel</Link>
                    </div>

                    <div className="ap-nav-right">
                        <div style={{ position: 'relative' }} ref={notifRef}>
                            <button className="ap-nav-iconbtn" onClick={() => setNotifOpen(p => !p)} title="Notifications">
                                <Bell size={15} />
                            </button>
                            {notifOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                    background: 'white', border: '1px solid rgba(0,0,0,0.07)',
                                    borderRadius: 18, boxShadow: '0 16px 48px rgba(15,23,42,0.12)',
                                    zIndex: 300, width: 280, overflow: 'hidden',
                                    animation: 'apDropIn 0.18s cubic-bezier(0.16,1,0.3,1) both'
                                }}>
                                    <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0D9488', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Bell size={13} /> Notifications
                                    </div>
                                    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                                        <Bell size={28} color="#CBD5E1" style={{ margin: '0 auto 12px', display: 'block' }} />
                                        <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>All clear</p>
                                        <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>No new notifications</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="ap-nav-divider" />
                        <div className="ap-nav-dropwrap" ref={profileRef}>
                            <div className="ap-nav-profile" onClick={() => setProfileOpen(p => !p)}>
                                <div className="ap-nav-avatar"><Shield size={13} /></div>
                                <div>
                                    <div className="ap-nav-pname">{admin?.name ?? 'Admin'}</div>
                                    <div className="ap-nav-prole">Administrator</div>
                                </div>
                                <ChevronDown size={12} color="#94A3B8" />
                            </div>
                            {profileOpen && (
                                <div className="ap-nav-dropdown">
                                    <div className="ap-nav-profhead">
                                        <div className="ap-nav-profav"><Shield size={18} /></div>
                                        <div>
                                            <div className="ap-nav-profname">{admin?.name ?? 'Admin'}</div>
                                            <div className="ap-nav-profspec">{admin?.email ?? ''}</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '6px 0' }}>
                                        <Link href="/admin/profile" className="ap-nav-menuitem">
                                            <User size={14} /> My Profile
                                        </Link>
                                        <div className="ap-nav-sep" />
                                        <button className="ap-nav-menuitem ap-nav-menuitem-danger" onClick={handleLogout}>
                                            <LogOut size={14} /> Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>

                {/* HERO */}
                <div className="ap-hero">
                    <div className="ap-hero-dots" />
                    <div className="ap-hero-blob" />
                    <div className="ap-hero-inner">
                        <div>
                            <Link href="/admin" className="ap-hero-back">
                                <ArrowLeft size={13} /> Admin Panel
                            </Link>
                            <div className="ap-hero-label">Admin Account</div>
                            <h1 className="ap-hero-title">My Profile</h1>
                            <p className="ap-hero-sub">Manage your administrator account and preferences</p>
                        </div>
                        <div className="ap-hero-pills">
                            {[
                                { dot: true, label: 'Secure Access' },
                                { dot: false, label: 'Settings' },
                                { dot: false, label: 'Notifications' },
                            ].map((p, i) => (
                                <div key={i} className="ap-hero-pill">
                                    {p.dot && <span className="ap-hero-pill-dot" />}
                                    {p.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="ap-body">
                    <div className="ap-grid">
                        {/* LEFT COLUMN */}
                        <div>
                            <div className="ap-card">
                                <div className="ap-avatar-card">
                                    <div className="ap-av"><Shield size={32} color="white" /></div>
                                    <div className="ap-av-name">{admin?.name ?? 'Admin'}</div>
                                    <div className="ap-av-role">{admin?.email ?? ''}</div>
                                    <span className="ap-av-badge">System Administrator</span>
                                </div>
                            </div>
                            <div className="ap-card">
                                <div className="ap-settings-head"><Settings size={13} /> Settings</div>
                                {[
                                    { icon: <Sun size={15} />, title: 'Display Theme', desc: `Theme: ${theme}`, onClick: () => setShowPrefsModal(true) },
                                    { icon: <Bell size={15} />, title: 'Notifications', desc: `${[systemUpdates, emailNotifications].filter(Boolean).length} active`, onClick: () => setShowNotifModal(true) },
                                    { icon: <Lock size={15} />, title: 'Security', desc: 'Change your password', onClick: () => setShowPasswordModal(true) },
                                ].map((item, i) => (
                                    <button key={i} className="ap-setting-item" onClick={item.onClick}>
                                        <div className="ap-setting-left">
                                            <div className="ap-setting-ic">{item.icon}</div>
                                            <div>
                                                <div className="ap-setting-title">{item.title}</div>
                                                <div className="ap-setting-desc">{item.desc}</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={15} color="#CBD5E1" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div>
                            <div className="ap-card">
                                <div className="ap-info-head"><Shield size={13} /> Account Information</div>
                                <div className="ap-info-body">
                                    <div className="ap-info-row">
                                        <label className="ap-label">Full Name</label>
                                        <div className="ap-value">{admin?.name ?? 'Admin'}</div>
                                    </div>
                                    <div className="ap-info-row">
                                        <label className="ap-label">Email Address</label>
                                        <div className="ap-value">{admin?.email ?? ''}</div>
                                        <span className="ap-note">Contact support to change email</span>
                                    </div>
                                    <div className="ap-info-row">
                                        <label className="ap-label">Role</label>
                                        <div className="ap-value">System Administrator</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* THEME MODAL */}
            {showPrefsModal && (
                <div className="ap-modal-overlay" onClick={() => setShowPrefsModal(false)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-head">
                            <div className="ap-modal-title-row">
                                <div className="ap-modal-title-ic"><Sun size={15} /></div>
                                <span className="ap-modal-title">Display Theme</span>
                            </div>
                            <button className="ap-modal-close" onClick={() => setShowPrefsModal(false)}><X size={14} /></button>
                        </div>
                        <div className="ap-modal-body">
                            <div className="ap-theme-opts">
                                {(['Light', 'Dark'] as const).map(t => (
                                    <button key={t} className={`ap-theme-btn${theme === t ? ' active' : ''}`} onClick={() => setTheme(t)}>
                                        {t === 'Light' ? <Sun size={18} /> : <Moon size={18} />}{t}
                                    </button>
                                ))}
                            </div>
                            <button className="ap-save-btn" onClick={() => {
                                localStorage.setItem('theme', theme);
                                setShowPrefsModal(false);
                                setSuccess('Preferences saved');
                                setTimeout(() => setSuccess(''), 3000);
                            }}>
                                <Save size={15} /> Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NOTIFICATIONS MODAL */}
            {showNotifModal && (
                <div className="ap-modal-overlay" onClick={() => setShowNotifModal(false)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-head">
                            <div className="ap-modal-title-row">
                                <div className="ap-modal-title-ic"><Bell size={15} /></div>
                                <span className="ap-modal-title">Notification Settings</span>
                            </div>
                            <button className="ap-modal-close" onClick={() => setShowNotifModal(false)}><X size={14} /></button>
                        </div>
                        <div className="ap-modal-body">
                            {[
                                { label: 'System Updates', desc: 'Receive notifications about system updates', val: systemUpdates, set: setSystemUpdates },
                                { label: 'Email Notifications', desc: 'Receive email summaries and alerts', val: emailNotifications, set: setEmailNotifications },
                            ].map(n => (
                                <div key={n.label} className="ap-notif-item">
                                    <div>
                                        <div className="ap-notif-title">{n.label}</div>
                                        <div className="ap-notif-desc">{n.desc}</div>
                                    </div>
                                    <label className="ap-toggle">
                                        <input type="checkbox" checked={n.val} onChange={e => n.set(e.target.checked)} />
                                        <span className="ap-toggle-sl" />
                                    </label>
                                </div>
                            ))}
                            <button className="ap-save-btn" onClick={() => { setShowNotifModal(false); setSuccess('Settings saved'); setTimeout(() => setSuccess(''), 3000); }}>
                                <Save size={15} /> Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PASSWORD MODAL */}
            {showPasswordModal && (
                <div className="ap-modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="ap-modal-head">
                            <div className="ap-modal-title-row">
                                <div className="ap-modal-title-ic"><Lock size={15} /></div>
                                <span className="ap-modal-title">Change Password</span>
                            </div>
                            <button className="ap-modal-close" onClick={() => setShowPasswordModal(false)}><X size={14} /></button>
                        </div>
                        <div className="ap-modal-body">
                            {passwordError && <div className="ap-err">⚠ {passwordError}</div>}
                            {passwordSuccess && <div className="ap-ok">✓ {passwordSuccess}</div>}
                            {[
                                { label: 'Current Password', val: currentPassword, set: setCurrentPassword, ph: 'Enter current password' },
                                { label: 'New Password', val: newPassword, set: setNewPassword, ph: 'Minimum 6 characters' },
                                { label: 'Confirm Password', val: confirmPassword, set: setConfirmPassword, ph: 'Repeat new password' },
                            ].map(f => (
                                <div key={f.label} className="ap-modal-fg">
                                    <label className="ap-label">{f.label}</label>
                                    <input className="ap-input" type="password" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} />
                                </div>
                            ))}
                            <button className="ap-save-btn" onClick={handlePasswordChange}>
                                <Lock size={15} /> Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {success && <div className="ap-toast">✓ {success}</div>}
        </>
    );
}
