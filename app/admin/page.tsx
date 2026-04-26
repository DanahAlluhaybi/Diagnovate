// Admin dashboard — manages doctor account approvals/rejections, shows pending and active user lists, with stats and search.
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users, CheckCircle, XCircle, Clock, Shield,
    Search, ChevronDown, Building2, AlertCircle,
    UserCheck, UserX, LogOut, Bell, User,
} from 'lucide-react';
import s from './styles.module.css';
import { BASE } from '@/lib/api';

const API_BASE_URL = `${BASE}/api`;

interface AdminStats {
    total_users: number;
    pending_approvals: number;
    active_users: number;
    rejected_today: number;
}

interface PendingUser {
    id: number;
    full_name: string;
    email: string;
    mobile: string;
    institution: string;
    license_number: string;
    specialty: string;
    registered_at: string;
    email_verified: boolean;
    sms_verified: boolean;
}

interface ActiveUser {
    id: number;
    full_name: string;
    email: string;
    institution: string;
    specialty: string;
    status: 'active' | 'inactive';
    last_login: string;
    created_at: string;
}

interface AdminUser {
    id: number;
    name: string;
    email: string;
}

type TabType = 'pending' | 'active' | 'all';

const REJECTION_REASONS = [
    'The provided information is incorrect or incomplete.',
    'The license number is invalid or could not be verified.',
    'The stated specialty is not accepted on this platform.',
    'Other',
];

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const getInitials = (name: string) =>
    name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

export default function AdminPage() {
    const router = useRouter();

    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<TabType>('pending');
    const [search, setSearch] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const [actionModal, setActionModal] = useState<{ user: PendingUser; type: 'approve' | 'reject' } | null>(null);
    const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
    const [customReason, setCustomReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAll();
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

    const fetchWithToken = async (endpoint: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/log-in?role=admin');
            throw new Error('No token');
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (response.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            router.push('/log-in?role=admin');
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} — ${errorText}`);
        }

        return response.json();
    };

    const fetchAll = async () => {
        try {
            setLoading(true);

            const token   = localStorage.getItem('admin_token');
            const userStr = localStorage.getItem('admin_user');

            if (!token || !userStr) {
                router.push('/log-in?role=admin');
                return;
            }

            const userData = JSON.parse(userStr) as AdminUser;
            setAdmin(userData);

            const [statsData, pendingData, activeData] = await Promise.all([
                fetchWithToken('/admin/stats'),
                fetchWithToken('/admin/pending-users'),
                fetchWithToken('/admin/active-users'),
            ]);

            setStats(statsData);
            setPendingUsers(pendingData);
            setActiveUsers(activeData);

        } catch (error) {
            console.error('FetchAll error:', error);
            showToast('Failed to load data', false);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3200);
    };

    const handleApprove = async () => {
        if (!actionModal) return;
        setActionLoading(true);
        try {
            await fetchWithToken(`/admin/approve/${actionModal.user.id}`, { method: 'POST' });
            setPendingUsers(p => p.filter(u => u.id !== actionModal.user.id));
            setStats(s => s ? { ...s, pending_approvals: s.pending_approvals - 1, active_users: s.active_users + 1 } : s);
            showToast(`${actionModal.user.full_name} approved successfully`, true);
        } catch {
            showToast('Failed to approve', false);
        } finally {
            setActionLoading(false);
            setActionModal(null);
        }
    };

    const handleReject = async () => {
        if (!actionModal) return;
        setActionLoading(true);

        const finalReason = rejectReason === 'Other'
            ? (customReason.trim() || 'No reason provided')
            : rejectReason;

        try {
            await fetchWithToken(`/admin/reject/${actionModal.user.id}`, {
                method: 'POST',
                body: JSON.stringify({ reason: finalReason }),
            });
            setPendingUsers(p => p.filter(u => u.id !== actionModal.user.id));
            setStats(s => s ? { ...s, pending_approvals: s.pending_approvals - 1, rejected_today: s.rejected_today + 1 } : s);
            showToast(`${actionModal.user.full_name} rejected`, false);
        } catch {
            showToast('Failed to reject', false);
        } finally {
            setActionLoading(false);
            setActionModal(null);
            setCustomReason('');
        }
    };

    const handleToggleStatus = async (user: ActiveUser) => {
        try {
            const action = user.status === 'active' ? 'deactivate' : 'activate';
            await fetchWithToken(`/admin/${action}/${user.id}`, { method: 'POST' });
            setActiveUsers(u => u.map(x => x.id === user.id ? { ...x, status: action === 'activate' ? 'active' : 'inactive' } : x));
            showToast(`${user.full_name} ${action}d`, action === 'activate');
        } catch {
            showToast('Network error.', false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        router.push('/log-in?role=admin');
    };

    const filteredPending = pendingUsers.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.institution.toLowerCase().includes(search.toLowerCase())
    );
    const filteredActive = activeUsers.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.institution.toLowerCase().includes(search.toLowerCase())
    );

    const hour = new Date().getHours();
    const loadingGreeting = hour >= 5 && hour < 12 ? 'Good morning, Admin'
        : hour >= 12 && hour < 17 ? 'Good afternoon, Admin'
        : hour >= 17 && hour < 21 ? 'Good evening, Admin'
        : 'Good night, Admin';

    if (loading) return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
                body{background:#F0F4F8;font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}
                body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);background-size:28px 28px;opacity:.45;pointer-events:none;z-index:0}
                .loading-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;z-index:1}
                .loading-card{background:white;border:1px solid #E2E8F0;border-radius:28px;padding:52px 64px;text-align:center;box-shadow:0 32px 80px rgba(15,23,42,.12);display:flex;flex-direction:column;align-items:center}
                .loading-logo{width:52px;height:52px;background:linear-gradient(145deg,#0D9488,#0891B2);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(13,148,136,.3);margin-bottom:24px}
                .loading-spinner{width:36px;height:36px;border:3px solid #F0FDFA;border-top-color:#0D9488;border-radius:50%;animation:spin .75s linear infinite;margin-bottom:20px}
                .loading-title{font-family:'DM Serif Display',serif;font-size:22px;color:#0F172A;margin:0 0 6px}
                .loading-sub{font-size:13px;color:#64748B;margin:0}
                @keyframes spin{to{transform:rotate(360deg)}}
            `}</style>
            <div className="loading-screen">
                <div className="loading-card">
                    <div className="loading-logo">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white" />
                        </svg>
                    </div>
                    <div className="loading-spinner" />
                    <p className="loading-title">{loadingGreeting}</p>
                    <p className="loading-sub">Preparing your workspace…</p>
                </div>
            </div>
        </>
    );

    return (
        <div className={s.wrap}>
            {/* NAVBAR */}
            <nav className={s.nav}>
                <Link href="/admin" className={s.navLogo}>
                    <div className={s.navLogoMark}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, fontWeight: 400, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                            Diagno<span className={s.navLogoAccent}>vate</span>
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: '#94A3B8', textTransform: 'uppercase', marginTop: 1 }}>
                            Admin Console
                        </div>
                    </div>
                </Link>

                <div className={s.navLinks}>
                    <Link href="/admin" className={`${s.navLink} ${s.navLinkActive}`}>Admin Panel</Link>
                </div>

                <div className={s.navRight}>
                    <div style={{ position: 'relative' }} ref={notifRef}>
                        <button className={s.navIconBtn} onClick={() => setNotifOpen(p => !p)} title="Notifications">
                            <Bell size={15} />
                        </button>
                        {notifOpen && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                background: 'white', border: '1px solid #EBF0F5',
                                borderRadius: 18, boxShadow: '0 16px 48px rgba(15,23,42,0.12)',
                                zIndex: 300, width: 280, overflow: 'hidden',
                                animation: 'dropIn 0.18s cubic-bezier(0.16,1,0.3,1) both'
                            }}>
                                <div style={{ padding: '14px 18px', borderBottom: '1px solid #F1F5F9', fontSize: 11, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0D9488', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Bell size={13} /> Notifications
                                </div>
                                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                                    <Bell size={28} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>All clear</p>
                                    <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>No new notifications</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className={s.navDivider} />
                    <div className={s.navDropWrap} ref={profileRef}>
                        <div className={s.navProfile} onClick={() => setProfileOpen(p => !p)}>
                            <div className={s.navAvatar}>
                                <Shield size={13} />
                            </div>
                            <div>
                                <div className={s.navPname}>{admin?.name ?? 'Admin'}</div>
                                <div className={s.navProle}>System Administrator</div>
                            </div>
                            <ChevronDown size={12} color="#94A3B8" />
                        </div>
                        {profileOpen && (
                            <div className={`${s.navDropdown} ${s.navProfDrop}`}>
                                <div className={s.navProfHead}>
                                    <div className={s.navProfAv}><Shield size={18} /></div>
                                    <div>
                                        <div className={s.navProfName}>{admin?.name ?? 'Admin'}</div>
                                        <div className={s.navProfSpec}>{admin?.email ?? ''}</div>
                                    </div>
                                </div>
                                <div style={{ padding: '6px 0' }}>
                                    <Link href="/admin/profile" className={s.navMenuItem}>
                                        <User size={14} /> My Profile
                                    </Link>
                                    <div className={s.navSep} />
                                    <button className={`${s.navMenuItem} ${s.navMenuItemDanger}`} onClick={handleLogout}>
                                        <LogOut size={14} /> Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className={s.main}>
                <div className={s.hero}>
                    <div className={s.heroBlob1} />
                    <div className={s.heroBlob2} />
                    <div className={s.heroBlob3} />
                    <div className={s.heroLeft}>
                        <div className={s.heroBadge}>
                            <span className={s.liveDot} />
                            Admin Control Panel
                        </div>
                        <h1 className={s.heroH1}>
                            User<br />
                            <em>Management</em>
                        </h1>
                        <p className={s.heroDate}>
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            })}
                        </p>
                    </div>
                    <div className={s.heroStats}>
                        {[
                            { icon: <Clock size={17}/>, label: 'Pending Approval', val: stats?.pending_approvals ?? 0, hc: '#F59E0B', hbg: '#FFFBEB', hb: '#FDE68A' },
                            { icon: <UserCheck size={17}/>, label: 'Active Users', val: stats?.active_users ?? 0, hc: '#0D9488', hbg: '#F0FDFA', hb: '#CCFBF1' },
                            { icon: <Users size={17}/>, label: 'Total Users', val: stats?.total_users ?? 0, hc: '#7C3AED', hbg: '#F5F3FF', hb: '#EDE9FE' },
                            { icon: <UserX size={17}/>, label: 'Rejected Today', val: stats?.rejected_today ?? 0, hc: '#E11D48', hbg: '#FFF1F2', hb: '#FECDD3' },
                        ].map((st, i) => (
                            <div key={i} className={s.heroStat}
                                 style={{ '--hc': st.hc, '--hbg': st.hbg, '--hb': st.hb } as React.CSSProperties}>
                                <div className={s.hstatIc}>{st.icon}</div>
                                <div className={s.hstatVal}>{st.val}</div>
                                <div className={s.hstatLbl}>{st.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={s.secHead}>
                    <span className={s.secLabel}>User Accounts</span>
                    <div className={s.secLine} />
                </div>

                <div className={s.toolbar}>
                    <div className={s.tabs}>
                        {([
                            { key: 'pending', label: 'Pending', count: pendingUsers.length },
                            { key: 'active', label: 'Active', count: activeUsers.filter(u => u.status === 'active').length },
                            { key: 'all', label: 'All Users', count: activeUsers.length },
                        ] as { key: TabType; label: string; count: number }[]).map(t => (
                            <button
                                key={t.key}
                                className={`${s.tab} ${tab === t.key ? s.tabActive : ''}`}
                                onClick={() => setTab(t.key)}
                            >
                                {t.label}
                                <span className={`${s.tabBadge} ${tab === t.key ? s.tabBadgeActive : ''}`}>
                                    {t.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className={s.searchWrap}>
                        <Search size={14} className={s.searchIc} />
                        <input
                            className={s.searchInput}
                            placeholder="Search by name, email, institution…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* PENDING TAB */}
                {tab === 'pending' && (
                    <div className={s.tableWrap}>
                        {filteredPending.length === 0 ? (
                            <div className={s.empty}>
                                <div className={s.emptyIc}><CheckCircle size={26} color="#0D9488" /></div>
                                <p className={s.emptyTitle}>All caught up!</p>
                                <p className={s.emptySub}>No pending registration requests at this time.</p>
                            </div>
                        ) : (
                            <table className={s.table}>
                                <thead>
                                <tr>
                                    <th>Clinician</th>
                                    <th>Institution</th>
                                    <th>ID Number</th>
                                    <th>Verification</th>
                                    <th>Registered</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredPending.map(u => (
                                    <tr key={u.id} className={s.tableRow}>
                                        <td>
                                            <div className={s.userCell}>
                                                <div className={s.userAvatar} style={{ background: 'linear-gradient(135deg,#0D9488,#0891B2)' }}>
                                                    {getInitials(u.full_name)}
                                                </div>
                                                <div>
                                                    <div className={s.userName}>{u.full_name}</div>
                                                    <div className={s.userEmail}>{u.email}</div>
                                                    {u.specialty && <div className={s.userSpec}>{u.specialty}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={s.cellWithIc}>
                                                <Building2 size={13} color="#94A3B8" />
                                                <span>{u.institution}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={s.licenseTag}>{u.mobile}</span>
                                        </td>
                                        <td>
                                            <div className={s.verifyBadges}>
                                                <span className={`${s.verifyBadge} ${u.email_verified ? s.verifyOk : s.verifyNo}`}>
                                                    {u.email_verified ? <CheckCircle size={10}/> : <XCircle size={10}/>} Email
                                                </span>
                                                <span className={`${s.verifyBadge} ${u.sms_verified ? s.verifyOk : s.verifyNo}`}>
                                                    {u.sms_verified ? <CheckCircle size={10}/> : <XCircle size={10}/>} SMS
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={s.dateCell}>
                                                <span>{formatDate(u.registered_at)}</span>
                                                <span className={s.timeLabel}>{formatTime(u.registered_at)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={s.actionBtns}>
                                                <button className={s.approveBtn} onClick={() => setActionModal({ user: u, type: 'approve' })}>
                                                    <CheckCircle size={13} /> Approve
                                                </button>
                                                <button className={s.rejectBtn} onClick={() => { setRejectReason(REJECTION_REASONS[0]); setCustomReason(''); setActionModal({ user: u, type: 'reject' }); }}>
                                                    <XCircle size={13} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ACTIVE / ALL TABS */}
                {(tab === 'active' || tab === 'all') && (
                    <div className={s.tableWrap}>
                        {filteredActive.length === 0 ? (
                            <div className={s.empty}>
                                <div className={s.emptyIc}><Users size={26} color="#94A3B8" /></div>
                                <p className={s.emptyTitle}>No users found</p>
                                <p className={s.emptySub}>Try adjusting your search.</p>
                            </div>
                        ) : (
                            <table className={s.table}>
                                <thead>
                                <tr>
                                    <th>Clinician</th>
                                    <th>Institution</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(tab === 'active' ? filteredActive.filter(u => u.status === 'active') : filteredActive).map(u => (
                                    <tr key={u.id} className={s.tableRow}>
                                        <td>
                                            <div className={s.userCell}>
                                                <div className={s.userAvatar} style={{
                                                    background: u.status === 'active'
                                                        ? 'linear-gradient(135deg,#10B981,#059669)'
                                                        : 'linear-gradient(135deg,#94A3B8,#CBD5E1)'
                                                }}>
                                                    {getInitials(u.full_name)}
                                                </div>
                                                <div>
                                                    <div className={s.userName}>{u.full_name}</div>
                                                    <div className={s.userEmail}>{u.email}</div>
                                                    {u.specialty && <div className={s.userSpec}>{u.specialty}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={s.cellWithIc}>
                                                <Building2 size={13} color="#94A3B8" />
                                                <span>{u.institution}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${s.statusTag} ${u.status === 'active' ? s.statusActive : s.statusInactive}`}>
                                                <span className={s.statusDot} />
                                                {u.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={s.dateCell}>
                                                <span>{formatDate(u.last_login)}</span>
                                                <span className={s.timeLabel}>{formatTime(u.last_login)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span>{formatDate(u.created_at)}</span>
                                        </td>
                                        <td>
                                            <button
                                                className={u.status === 'active' ? s.deactivateBtn : s.activateBtn}
                                                onClick={() => handleToggleStatus(u)}
                                            >
                                                {u.status === 'active' ? <><UserX size={13}/> Deactivate</> : <><UserCheck size={13}/> Activate</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>

            {/* ACTION MODAL */}
            {actionModal && (
                <div className={s.modalOverlay} onClick={() => !actionLoading && setActionModal(null)}>
                    <div className={s.modal} onClick={e => e.stopPropagation()}>
                        <div className={`${s.modalHeader} ${actionModal.type === 'approve' ? s.modalHeaderApprove : s.modalHeaderReject}`}>
                            {actionModal.type === 'approve'
                                ? <><CheckCircle size={20}/> Approve Registration</>
                                : <><XCircle size={20}/> Reject Registration</>
                            }
                        </div>
                        <div className={s.modalBody}>
                            <div className={s.modalUserCard}>
                                <div className={s.userAvatar} style={{ width: 44, height: 44, fontSize: 16, background: 'linear-gradient(135deg,#0D9488,#0891B2)', flexShrink: 0 }}>
                                    {getInitials(actionModal.user.full_name)}
                                </div>
                                <div>
                                    <div className={s.userName} style={{ fontSize: 14 }}>{actionModal.user.full_name}</div>
                                    <div className={s.userEmail}>{actionModal.user.email}</div>
                                    <div className={s.userSpec}>{actionModal.user.institution}</div>
                                </div>
                            </div>

                            {actionModal.type === 'approve' ? (
                                <p className={s.modalText}>
                                    Approving this account will grant <strong>{actionModal.user.full_name}</strong> full access to the Diagnovate platform.
                                </p>
                            ) : (
                                <>
                                    <p className={s.modalText}>Select a reason for rejecting this registration request.</p>
                                    <div className={s.reasonGroup}>
                                        {REJECTION_REASONS.map(r => (
                                            <label key={r} className={`${s.reasonOption} ${rejectReason === r ? s.reasonSelected : ''}`}>
                                                <input
                                                    type="radio" name="reason" value={r}
                                                    checked={rejectReason === r}
                                                    onChange={() => setRejectReason(r)}
                                                    className={s.reasonRadio}
                                                />
                                                {r}
                                            </label>
                                        ))}
                                    </div>
                                    {rejectReason === 'Other' && (
                                        <textarea
                                            placeholder="Write the reason here…"
                                            value={customReason}
                                            onChange={e => setCustomReason(e.target.value)}
                                            rows={3}
                                            style={{
                                                width: '100%', marginTop: 8, padding: '10px 12px',
                                                borderRadius: 10, border: '1.5px solid #E2E8F0',
                                                fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
                                                outline: 'none', color: '#334155',
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                        <div className={s.modalFooter}>
                            <button className={s.modalCancel} onClick={() => setActionModal(null)} disabled={actionLoading}>
                                Cancel
                            </button>
                            {actionModal.type === 'approve' ? (
                                <button className={s.modalApprove} onClick={handleApprove} disabled={actionLoading}>
                                    {actionLoading ? <span className={s.spinnerSm}/> : <CheckCircle size={14}/>}
                                    {actionLoading ? 'Approving…' : 'Confirm Approval'}
                                </button>
                            ) : (
                                <button className={s.modalReject} onClick={handleReject} disabled={actionLoading}>
                                    {actionLoading ? <span className={s.spinnerSm}/> : <XCircle size={14}/>}
                                    {actionLoading ? 'Rejecting…' : 'Confirm Rejection'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toast && (
                <div className={`${s.toast} ${toast.ok ? s.toastOk : s.toastErr}`}>
                    {toast.ok ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
                    {toast.msg}
                </div>
            )}
        </div>
    );
}