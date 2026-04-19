'use client';
import { useState, useEffect } from 'react';
import { Shield, Lock, Bell, Sun, Moon, X, ChevronRight, ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { BASE } from '@/lib/api';

export default function AdminProfilePage() {
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
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('admin_user');
        if (userStr) setAdmin(JSON.parse(userStr));
        const savedTheme = localStorage.getItem('theme') as 'Light'|'Dark'|null;
        if (savedTheme) setTheme(savedTheme);
        setTimeout(() => setVisible(true), 50);
    }, []);

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
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
                :root{--bg:#F0F4F8;--surface:#fff;--teal:#0D9488;--text:#0F172A;--text2:#334155;--muted:#64748B;--border:#E2E8F0;--body:'Plus Jakarta Sans',sans-serif;--display:'DM Serif Display',serif;}
                body{background:var(--bg);font-family:var(--body);-webkit-font-smoothing:antialiased}
                .wrap{min-height:100vh;background:var(--bg);position:relative}
                .wrap::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);background-size:28px 28px;opacity:.4;pointer-events:none;z-index:0}
                .main{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:48px 48px 80px}
                .page-head{margin-bottom:40px;opacity:0;transform:translateY(20px);transition:all .6s cubic-bezier(.16,1,.3,1)}
                .page-head.visible{opacity:1;transform:translateY(0)}
                .back{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--muted);text-decoration:none;margin-bottom:20px;padding:7px 13px;background:white;border:1px solid var(--border);border-radius:9px;transition:all .15s}
                .back:hover{color:#0D9488;border-color:#CCFBF1;background:#F0FDFA}
                .badge{display:inline-flex;align-items:center;gap:7px;background:#F0FDFA;border:1px solid #99F6E4;color:#0D9488;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:14px}
                .dot{width:5px;height:5px;border-radius:50%;background:#0D9488;animation:pulse 2s ease-in-out infinite}
                @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
                .h1{font-family:var(--display);font-size:36px;color:var(--text);letter-spacing:-.3px;margin-bottom:6px}
                .sub{font-size:14px;color:var(--muted)}
                .grid{display:grid;grid-template-columns:300px 1fr;gap:24px;opacity:0;transform:translateY(20px);transition:all .6s .1s cubic-bezier(.16,1,.3,1)}
                .grid.visible{opacity:1;transform:translateY(0)}
                .card{background:white;border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(15,23,42,.05);margin-bottom:20px}
                .card:last-child{margin-bottom:0}
                .avatar-card{padding:36px 24px;text-align:center;background:linear-gradient(160deg,#F0FDFA 0%,white 60%);position:relative;overflow:hidden}
                .avatar-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#0D9488,#0891B2)}
                .av{width:80px;height:80px;border-radius:22px;background:linear-gradient(135deg,#0D9488,#0891B2);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;box-shadow:0 8px 28px rgba(13,148,136,.3)}
                .av-name{font-size:17px;font-weight:700;color:var(--text);margin-bottom:4px}
                .av-role{font-size:13px;color:var(--muted);margin-bottom:14px}
                .av-badge{display:inline-block;font-size:11px;font-weight:700;background:#F0FDFA;border:1px solid #99F6E4;color:#0D9488;padding:5px 12px;border-radius:100px}
                .settings-head{padding:18px 20px 14px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted)}
                .setting-item{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;cursor:pointer;border:none;background:none;width:100%;text-align:left;border-bottom:1px solid #F8FAFC;transition:background .15s;font-family:var(--body)}
                .setting-item:last-child{border-bottom:none}
                .setting-item:hover{background:#F8FAFC}
                .setting-left{display:flex;align-items:center;gap:12px}
                .setting-ic{width:34px;height:34px;border-radius:10px;background:#F0FDFA;border:1px solid #CCFBF1;display:flex;align-items:center;justify-content:center;color:#0D9488;flex-shrink:0}
                .setting-title{font-size:13.5px;font-weight:600;color:var(--text)}
                .setting-desc{font-size:11.5px;color:var(--muted);margin-top:1px}
                .info-head{padding:20px 28px 16px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;gap:9px;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted)}
                .info-body{padding:28px}
                .info-row{display:flex;flex-direction:column;gap:7px;margin-bottom:20px}
                .info-row:last-child{margin-bottom:0}
                .label{font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text2)}
                .value{height:46px;background:#F8FAFC;border:1.5px solid var(--border);border-radius:11px;padding:0 14px;display:flex;align-items:center;font-size:14px;color:var(--muted)}
                .note{font-size:11px;color:var(--muted)}
                .modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.4);backdrop-filter:blur(8px);z-index:500;display:flex;align-items:center;justify-content:center;padding:24px}
                .modal{background:white;border-radius:24px;width:100%;max-width:440px;border:1px solid var(--border);box-shadow:0 24px 80px rgba(15,23,42,.18);animation:modalIn .25s cubic-bezier(.16,1,.3,1) both;overflow:hidden}
                @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
                .modal-head{padding:20px 24px 16px;border-bottom:1px solid #F1F5F9;display:flex;align-items:center;justify-content:space-between}
                .modal-title-row{display:flex;align-items:center;gap:9px}
                .modal-title-ic{width:32px;height:32px;border-radius:9px;background:#F0FDFA;border:1px solid #CCFBF1;display:flex;align-items:center;justify-content:center;color:#0D9488}
                .modal-title{font-size:15px;font-weight:700;color:var(--text)}
                .modal-close{width:30px;height:30px;border-radius:8px;border:1px solid var(--border);background:#F8FAFC;color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
                .modal-close:hover{background:#FFF1F2;color:#E11D48;border-color:#FECDD3}
                .modal-body{padding:24px}
                .modal-fg{margin-bottom:16px}
                .theme-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
                .theme-btn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 8px;border-radius:12px;border:1.5px solid var(--border);background:#F8FAFC;font-family:var(--body);font-size:12px;font-weight:600;color:var(--muted);cursor:pointer;transition:all .18s}
                .theme-btn:hover{border-color:#CCFBF1;color:#0D9488;background:#F0FDFA}
                .theme-btn.active{border-color:#0D9488;color:#0D9488;background:#F0FDFA}
                .notif-item{display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #F8FAFC}
                .notif-item:last-child{border-bottom:none}
                .notif-title{font-size:13.5px;font-weight:600;color:var(--text);margin-bottom:2px}
                .notif-desc{font-size:11.5px;color:var(--muted)}
                .toggle{position:relative;width:40px;height:22px;flex-shrink:0}
                .toggle input{opacity:0;width:0;height:0}
                .toggle-sl{position:absolute;cursor:pointer;inset:0;background:#E2E8F0;border-radius:100px;transition:.25s}
                .toggle-sl::before{content:'';position:absolute;height:16px;width:16px;left:3px;bottom:3px;background:white;border-radius:50%;transition:.25s;box-shadow:0 1px 4px rgba(0,0,0,.15)}
                .toggle input:checked+.toggle-sl{background:#0D9488}
                .toggle input:checked+.toggle-sl::before{transform:translateX(18px)}
                .save-btn{display:inline-flex;align-items:center;gap:8px;height:46px;padding:0 28px;background:linear-gradient(135deg,#0D9488,#0891B2);color:white;font-family:var(--body);font-size:14px;font-weight:700;border:none;border-radius:12px;cursor:pointer;box-shadow:0 6px 20px rgba(13,148,136,.3);transition:all .2s}
                .save-btn:hover{transform:translateY(-1px);box-shadow:0 10px 28px rgba(13,148,136,.4)}
                .err{background:#FFF1F2;border:1px solid #FECDD3;color:#E11D48;padding:13px 16px;border-radius:12px;font-size:13.5px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px}
                .ok{background:#F0FDFA;border:1px solid #99F6E4;color:#0D9488;padding:13px 16px;border-radius:12px;font-size:13.5px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px}
                .pf-input{height:46px;background:#F8FAFC;border:1.5px solid var(--border);border-radius:11px;padding:0 14px;font-family:var(--body);font-size:14px;color:var(--text);outline:none;transition:all .2s;width:100%}
                .pf-input:focus{border-color:#0D9488;background:white;box-shadow:0 0 0 3px rgba(13,148,136,.1)}
                .pf-label{font-size:11.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:var(--text2);margin-bottom:7px;display:block}
                .toast{position:fixed;bottom:28px;right:28px;z-index:600;display:flex;align-items:center;gap:9px;padding:13px 20px;border-radius:14px;font-size:13px;font-weight:700;background:#0D9488;color:white;box-shadow:0 8px 32px rgba(15,23,42,.14)}
                @media(max-width:900px){.main{padding:32px 20px 60px}.grid{grid-template-columns:1fr}}
            `}</style>

            <div className="wrap">
                <main className="main">
                    <div className={`page-head${visible?' visible':''}`}>
                        <Link href="/admin" className="back"><ArrowLeft size={13}/> Admin Panel</Link>
                        <div className="badge"><span className="dot"/> Admin Account</div>
                        <h1 className="h1">My Profile</h1>
                        <p className="sub">Manage your admin account settings</p>
                    </div>

                    <div className={`grid${visible?' visible':''}`}>
                        <div>
                            <div className="card">
                                <div className="avatar-card">
                                    <div className="av"><Shield size={32} color="white"/></div>
                                    <div className="av-name">{admin?.name ?? 'Admin'}</div>
                                    <div className="av-role">{admin?.email ?? ''}</div>
                                    <span className="av-badge">System Administrator</span>
                                </div>
                            </div>
                            <div className="card">
                                <div className="settings-head"><Settings size={13}/> Settings</div>
                                {[
                                    {icon:<Sun size={15}/>, title:'Display Theme', desc:`Theme: ${theme}`, onClick:()=>setShowPrefsModal(true)},
                                    {icon:<Bell size={15}/>, title:'Notifications', desc:`${[systemUpdates,emailNotifications].filter(Boolean).length} active`, onClick:()=>setShowNotifModal(true)},
                                    {icon:<Lock size={15}/>, title:'Security', desc:'Change your password', onClick:()=>setShowPasswordModal(true)},
                                ].map((item,i)=>(
                                    <button key={i} className="setting-item" onClick={item.onClick}>
                                        <div className="setting-left">
                                            <div className="setting-ic">{item.icon}</div>
                                            <div>
                                                <div className="setting-title">{item.title}</div>
                                                <div className="setting-desc">{item.desc}</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={15} color="#CBD5E1"/>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="card">
                                <div className="info-head"><Shield size={13}/> Account Information</div>
                                <div className="info-body">
                                    <div className="info-row">
                                        <label className="label">Full Name</label>
                                        <div className="value">{admin?.name ?? 'Admin'}</div>
                                    </div>
                                    <div className="info-row">
                                        <label className="label">Email Address</label>
                                        <div className="value">{admin?.email ?? ''}</div>
                                        <span className="note">Contact support to change email</span>
                                    </div>
                                    <div className="info-row">
                                        <label className="label">Role</label>
                                        <div className="value">System Administrator</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {showPrefsModal&&(
                <div className="modal-overlay" onClick={()=>setShowPrefsModal(false)}>
                    <div className="modal" onClick={e=>e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="modal-title-row">
                                <div className="modal-title-ic"><Sun size={15}/></div>
                                <span className="modal-title">Display Theme</span>
                            </div>
                            <button className="modal-close" onClick={()=>setShowPrefsModal(false)}><X size={14}/></button>
                        </div>
                        <div className="modal-body">
                            <div className="theme-opts">
                                {(['Light','Dark'] as const).map(t=>(
                                    <button key={t} className={`theme-btn${theme===t?' active':''}`} onClick={()=>setTheme(t)}>
                                        {t==='Light'?<Sun size={18}/>:<Moon size={18}/>}{t}
                                    </button>
                                ))}
                            </div>
                            <button className="save-btn" style={{marginTop:24,width:'100%',justifyContent:'center'}} onClick={()=>{
                                localStorage.setItem('theme',theme);
                                setShowPrefsModal(false);
                                setSuccess('Preferences saved');
                                setTimeout(()=>setSuccess(''),3000);
                            }}>Save Preferences</button>
                        </div>
                    </div>
                </div>
            )}

            {showNotifModal&&(
                <div className="modal-overlay" onClick={()=>setShowNotifModal(false)}>
                    <div className="modal" onClick={e=>e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="modal-title-row">
                                <div className="modal-title-ic"><Bell size={15}/></div>
                                <span className="modal-title">Notification Settings</span>
                            </div>
                            <button className="modal-close" onClick={()=>setShowNotifModal(false)}><X size={14}/></button>
                        </div>
                        <div className="modal-body">
                            {[
                                {label:'System Updates',desc:'Receive notifications about system updates',val:systemUpdates,set:setSystemUpdates},
                                {label:'Email Notifications',desc:'Receive email summaries and alerts',val:emailNotifications,set:setEmailNotifications},
                            ].map(n=>(
                                <div key={n.label} className="notif-item">
                                    <div>
                                        <div className="notif-title">{n.label}</div>
                                        <div className="notif-desc">{n.desc}</div>
                                    </div>
                                    <label className="toggle">
                                        <input type="checkbox" checked={n.val} onChange={e=>n.set(e.target.checked)}/>
                                        <span className="toggle-sl"/>
                                    </label>
                                </div>
                            ))}
                            <button className="save-btn" style={{marginTop:20,width:'100%',justifyContent:'center'}} onClick={()=>{setShowNotifModal(false);setSuccess('Settings saved');setTimeout(()=>setSuccess(''),3000);}}>Save Settings</button>
                        </div>
                    </div>
                </div>
            )}

            {showPasswordModal&&(
                <div className="modal-overlay" onClick={()=>setShowPasswordModal(false)}>
                    <div className="modal" onClick={e=>e.stopPropagation()}>
                        <div className="modal-head">
                            <div className="modal-title-row">
                                <div className="modal-title-ic"><Lock size={15}/></div>
                                <span className="modal-title">Change Password</span>
                            </div>
                            <button className="modal-close" onClick={()=>setShowPasswordModal(false)}><X size={14}/></button>
                        </div>
                        <div className="modal-body">
                            {passwordError&&<div className="err">⚠ {passwordError}</div>}
                            {passwordSuccess&&<div className="ok">✓ {passwordSuccess}</div>}
                            {[
                                {label:'Current Password',val:currentPassword,set:setCurrentPassword,ph:'Enter current password'},
                                {label:'New Password',val:newPassword,set:setNewPassword,ph:'Minimum 6 characters'},
                                {label:'Confirm Password',val:confirmPassword,set:setConfirmPassword,ph:'Repeat new password'},
                            ].map(f=>(
                                <div key={f.label} className="modal-fg">
                                    <label className="pf-label">{f.label}</label>
                                    <input className="pf-input" type="password" value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}/>
                                </div>
                            ))}
                            <button className="save-btn" style={{marginTop:20,width:'100%',justifyContent:'center'}} onClick={handlePasswordChange}>Update Password</button>
                        </div>
                    </div>
                </div>
            )}

            {success&&<div className="toast">✓ {success}</div>}
        </>
    );
}
