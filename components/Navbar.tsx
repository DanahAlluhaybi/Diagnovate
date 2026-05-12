'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const NB_STYLES = `
@keyframes nbDropIn{from{opacity:0;transform:translateY(-8px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes nbFadeIn{from{opacity:0}to{opacity:1}}
@keyframes nbSpin{to{transform:rotate(360deg)}}
@keyframes nbRingPulse{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.8;transform:scale(1.07)}}

.nb-logout-overlay{position:fixed;inset:0;z-index:9999;background:rgba(255,255,255,0.92);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;animation:nbFadeIn .2s ease}
.nb-logout-card{background:white;border:1px solid rgba(0,0,0,0.06);border-radius:28px;padding:52px 64px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.06),0 0 40px rgba(13,148,136,0.06);display:flex;flex-direction:column;align-items:center;gap:0}
.nb-logout-logo{width:52px;height:52px;background:linear-gradient(145deg,#1D9E75,#0D9488);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(13,148,136,0.3);margin-bottom:24px}
.nb-logout-spinner{width:38px;height:38px;border:3px solid #CCFBF1;border-top-color:#0D9488;border-radius:50%;animation:nbSpin .75s linear infinite;margin-bottom:20px}
.nb-logout-title{font-family:'DM Serif Display',serif;font-size:22px;color:#0F172A;margin:0 0 6px;letter-spacing:-0.3px}
.nb-logout-sub{font-family:'DM Sans',sans-serif;font-size:13px;color:#64748B;margin:0}

.nb-nav{position:fixed;top:0;left:0;right:0;z-index:200;height:68px;background:rgba(255,255,255,0.90);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid rgba(0,0,0,0.06);transition:box-shadow .25s ease}
.nb-nav-scrolled{box-shadow:0 4px 24px rgba(15,23,42,0.06)}
.nb-inner{height:100%;max-width:1360px;margin:0 auto;padding:0 48px;display:flex;align-items:center;gap:0}

.nb-logo{display:flex;align-items:center;gap:12px;text-decoration:none;flex-shrink:0;margin-right:44px;transition:opacity .2s}
.nb-logo:hover{opacity:.85}
.nb-logomark{position:relative;width:40px;height:40px;background:linear-gradient(145deg,#1D9E75,#0D9488);border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(13,148,136,0.32),inset 0 1px 0 rgba(255,255,255,0.18);flex-shrink:0}
.nb-logo-pulse{position:absolute;inset:-4px;border-radius:17px;border:1.5px solid rgba(13,148,136,0.22);animation:nbRingPulse 3.5s ease-in-out infinite}
.nb-logo-text{display:flex;flex-direction:column;line-height:1}
.nb-logo-wordmark{font-family:'DM Serif Display',serif;font-size:21px;font-weight:400;color:#0F172A;letter-spacing:-0.3px}
.nb-logo-accent{color:#0D9488;font-style:italic}
.nb-logo-sub{font-family:'DM Sans',sans-serif;font-size:9.5px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#94A3B8;margin-top:3px}

.nb-links{display:flex;align-items:center;gap:2px;flex:1}
.nb-link{position:relative;padding:7px 14px;border-radius:9px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;color:#64748B;text-decoration:none;transition:all .18s;white-space:nowrap}
.nb-link:hover{color:#0F172A;background:#F1F5F9}
.nb-link-active{color:#0D9488!important;font-weight:600;background:#F0FDFA!important}
.nb-link-dot{position:absolute;bottom:5px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:#0D9488}

.nb-right{display:flex;align-items:center;gap:8px;margin-left:auto;flex-shrink:0}
.nb-divider{width:1px;height:26px;background:#E2E8F0;margin:0 2px;flex-shrink:0}

.nb-iconbtn{position:relative;width:38px;height:38px;border:1.5px solid #E2E8F0;border-radius:50%;background:white;color:#94A3B8;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s}
.nb-iconbtn:hover{background:#F0FDFA;color:#0D9488;border-color:rgba(13,148,136,0.2)}
.nb-iconbtn-active{background:#F0FDFA!important;color:#0D9488!important;border-color:rgba(13,148,136,0.25)!important}
.nb-notif-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:#EF4444;border:2px solid white;box-shadow:0 0 6px rgba(239,68,68,0.5)}

.nb-profile-btn{display:flex;align-items:center;gap:9px;padding:5px 10px 5px 14px;background:white;border:1.5px solid #E2E8F0;border-radius:40px;cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
.nb-profile-btn:hover{border-color:rgba(13,148,136,0.2);background:#F0FDFA;box-shadow:0 2px 12px rgba(13,148,136,0.10)}
.nb-profile-info{text-align:left}
.nb-profile-name{display:block;font-size:12.5px;font-weight:700;color:#0F172A;line-height:1.25}
.nb-profile-role{display:block;font-size:10px;color:#94A3B8;line-height:1}
.nb-profile-avatar{width:32px;height:32px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800;color:white;box-shadow:0 2px 8px rgba(13,148,136,0.25)}

.nb-dropwrap{position:relative}
.nb-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:white;border:1px solid rgba(0,0,0,0.06);border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 8px 24px rgba(0,0,0,0.06),0 0 40px rgba(13,148,136,0.06);z-index:300;overflow:hidden;animation:nbDropIn .2s cubic-bezier(0.16,1,0.3,1) both}
.nb-dropdown-bell{width:300px}
.nb-dropdown-prof{width:248px}
.nb-drop-head{padding:14px 18px 12px;border-bottom:1px solid #F0FDFA;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;color:#334155;display:flex;align-items:center;gap:7px}

.nb-empty{padding:28px 18px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.nb-empty-icon{width:52px;height:52px;border-radius:14px;background:#F0FDFA;border:1px solid #CCFBF1;display:flex;align-items:center;justify-content:center}
.nb-empty-title{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#334155;margin:0}
.nb-empty-sub{font-family:'DM Sans',sans-serif;font-size:11.5px;color:#94A3B8;margin:0}

.nb-notif-item{padding:14px 18px;display:flex;align-items:flex-start;gap:12px}
.nb-notif-dot2{width:8px;height:8px;border-radius:50%;background:#F59E0B;margin-top:4px;flex-shrink:0;box-shadow:0 0 6px rgba(245,158,11,0.4)}
.nb-notif-title{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:#0F172A}
.nb-notif-sub{font-family:'DM Sans',sans-serif;font-size:11.5px;color:#94A3B8;margin-top:2px}

.nb-prof-head{padding:16px 18px 14px;border-bottom:1px solid #F0FDFA;display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,#F0FDFA,#F8FAFC)}
.nb-prof-avatar{width:40px;height:40px;border-radius:12px;flex-shrink:0;background:linear-gradient(135deg,#1D9E75,#0D9488);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:white;box-shadow:0 4px 12px rgba(13,148,136,0.25)}
.nb-prof-name{font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:700;color:#0F172A}
.nb-prof-email{font-family:'DM Sans',sans-serif;font-size:11px;color:#94A3B8;margin-top:2px}

.nb-drop-menu{padding:8px}
.nb-menu-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:11px;font-family:'DM Sans',sans-serif;font-size:13.5px;font-weight:500;color:#334155;cursor:pointer;transition:all .15s;border:none;background:none;width:100%;text-align:left;text-decoration:none}
.nb-menu-item:hover{background:#F0FDFA;color:#0D9488}
.nb-menu-item-danger{color:#EF4444!important}
.nb-menu-item-danger:hover{background:#FFF1F2!important;color:#EF4444!important}
.nb-menu-sep{height:1px;background:#F0FDFA;margin:4px 0}

@media(max-width:1024px){.nb-inner{padding:0 24px}.nb-logo{margin-right:24px}}
@media(max-width:860px){.nb-links{display:none}.nb-logo-sub{display:none}}
@media(max-width:600px){.nb-inner{padding:0 16px}.nb-profile-info{display:none}.nb-profile-btn{padding:4px 8px;border-radius:50%}.nb-profile-avatar{width:36px;height:36px;font-size:13px}}
`;

const LogoIcon = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
        <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
        <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="3.5" fill="white"/>
    </svg>
);

const DOCTOR_LINKS = [
    { href: '/dashboard',          label: 'Dashboard'   },
    { href: '/patient-management', label: 'Patients'    },
    { href: '/image-enhancement',  label: 'Enhancement' },
    { href: '/ai-diagnosis',       label: 'AI Diagnosis'},
    { href: '/report',             label: 'Reports'     },
];
const ADMIN_LINKS = [{ href: '/admin', label: 'Dashboard' }];

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
function getFirstName(name?: string) {
    if (!name) return 'User';
    return name.replace(/^dr\.?\s*/i, '').split(' ')[0];
}

interface NavUser { name: string; email?: string; specialty?: string; }
interface NavbarProps { pendingCount?: number; variant?: 'doctor' | 'admin'; }

export default function Navbar({ pendingCount = 0, variant }: NavbarProps) {
    const router   = useRouter();
    const pathname = usePathname();
    const [user,       setUser]       = useState<NavUser | null>(null);
    const [role,       setRole]       = useState<'doctor' | 'admin'>('doctor');
    const [profOpen,   setProfOpen]   = useState(false);
    const [bellOpen,   setBellOpen]   = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [scrolled,   setScrolled]   = useState(false);
    const profRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored) setUser(JSON.parse(stored));
        } catch {}
        setRole(variant ?? (pathname?.startsWith('/admin') ? 'admin' : 'doctor'));
    }, [variant, pathname]);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 4);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    useEffect(() => {
        const fn = (e: MouseEvent) => {
            if (profRef.current && !profRef.current.contains(e.target as Node)) setProfOpen(false);
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    const handleLogout = () => {
        setLoggingOut(true);
        setProfOpen(false);
        setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/log-in');
        }, 900);
    };

    const links = role === 'admin' ? ADMIN_LINKS : DOCTOR_LINKS;

    return (
        <>
            <style>{NB_STYLES}</style>

            {loggingOut && (
                <div className="nb-logout-overlay">
                    <div className="nb-logout-card">
                        <div className="nb-logout-logo"><LogoIcon size={22} /></div>
                        <div className="nb-logout-spinner" />
                        <p className="nb-logout-title">Signing out...</p>
                        <p className="nb-logout-sub">See you next time, {role === 'admin' ? 'Admin' : `Dr. ${getFirstName(user?.name)}`}</p>
                    </div>
                </div>
            )}

            <nav className={`nb-nav${scrolled ? ' nb-nav-scrolled' : ''}`}>
                <div className="nb-inner">

                    <Link href={role === 'admin' ? '/admin' : '/dashboard'} className="nb-logo">
                        <div className="nb-logomark">
                            <LogoIcon size={22} />
                            <span className="nb-logo-pulse" />
                        </div>
                        <div className="nb-logo-text">
                            <span className="nb-logo-wordmark">Diagno<em className="nb-logo-accent">vate</em></span>
                            <span className="nb-logo-sub">{role === 'admin' ? 'Admin Console' : 'Clinical Platform'}</span>
                        </div>
                    </Link>

                    <div className="nb-links">
                        {links.map(l => {
                            const active = (l.href === '/dashboard' || l.href === '/admin')
                                ? pathname === l.href
                                : pathname?.startsWith(l.href);
                            return (
                                <Link key={l.href} href={l.href} className={`nb-link${active ? ' nb-link-active' : ''}`}>
                                    {l.label}
                                    {active && <span className="nb-link-dot" />}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="nb-right">

                        {/* Bell */}
                        <div className="nb-dropwrap" ref={bellRef}>
                            <button
                                className={`nb-iconbtn${bellOpen ? ' nb-iconbtn-active' : ''}`}
                                onClick={() => { setBellOpen(o => !o); setProfOpen(false); }}
                            >
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                {pendingCount > 0 && <span className="nb-notif-dot" />}
                            </button>
                            {bellOpen && (
                                <div className="nb-dropdown nb-dropdown-bell">
                                    <div className="nb-drop-head">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                        </svg>
                                        Notifications
                                    </div>
                                    {pendingCount > 0 && role === 'admin' ? (
                                        <div className="nb-notif-item">
                                            <div className="nb-notif-dot2" />
                                            <div>
                                                <div className="nb-notif-title">{pendingCount} pending request{pendingCount > 1 ? 's' : ''}</div>
                                                <div className="nb-notif-sub">Awaiting your review</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="nb-empty">
                                            <div className="nb-empty-icon">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
                                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                                </svg>
                                            </div>
                                            <p className="nb-empty-title">All clear</p>
                                            <p className="nb-empty-sub">No new notifications</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="nb-divider" />

                        {/* Profile */}
                        <div className="nb-dropwrap" ref={profRef}>
                            <button className="nb-profile-btn" onClick={() => { setProfOpen(o => !o); setBellOpen(false); }}>
                                <div className="nb-profile-info">
                                    <span className="nb-profile-name">
                                        {role === 'admin' ? 'System Admin' : (user?.name ? `Dr. ${getFirstName(user.name)}` : 'Doctor')}
                                    </span>
                                    <span className="nb-profile-role">
                                        {role === 'admin' ? 'Administrator' : (user?.specialty || 'Clinician')}
                                    </span>
                                </div>
                                <div className="nb-profile-avatar">
                                    {user?.name ? getInitials(user.name) : (role === 'admin' ? 'SA' : 'DR')}
                                </div>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                     style={{ transform: profOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </button>
                            {profOpen && (
                                <div className="nb-dropdown nb-dropdown-prof">
                                    <div className="nb-prof-head">
                                        <div className="nb-prof-avatar">
                                            {user?.name ? getInitials(user.name) : (role === 'admin' ? 'SA' : 'DR')}
                                        </div>
                                        <div>
                                            <div className="nb-prof-name">{role === 'admin' ? 'System Admin' : (user?.name || 'Doctor')}</div>
                                            <div className="nb-prof-email">{user?.email || (role === 'admin' ? 'admin@diagnovate.com' : '')}</div>
                                        </div>
                                    </div>
                                    <div className="nb-drop-menu">
                                        <Link
                                            href={role === 'admin' ? '/admin/profile' : '/profile'}
                                            className="nb-menu-item"
                                            onClick={() => setProfOpen(false)}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            My Profile
                                        </Link>
                                        <div className="nb-menu-sep" />
                                        <button className="nb-menu-item nb-menu-item-danger" onClick={handleLogout}>
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </nav>
        </>
    );
}