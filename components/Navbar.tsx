// Shared navbar for the doctor-facing app — shows nav links, notification bell, and user profile dropdown. Also handles the logout overlay.
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

interface NavUser { name: string; email?: string; specialty?: string; }
interface NavbarProps { pendingCount?: number; variant?: 'doctor' | 'admin'; }

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
    { href: '/report', label: 'Reports' },];
const ADMIN_LINKS = [{ href: '/admin', label: 'Dashboard' }];

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
function getFirstName(name?: string) {
    if (!name) return 'User';
    return name.replace(/^dr\.?\s*/i, '').split(' ')[0];
}

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
            {loggingOut && (
                <div className={styles.logoutOverlay}>
                    <div className={styles.logoutCard}>
                        <div className={styles.logoutLogo}><LogoIcon size={22} /></div>
                        <div className={styles.logoutSpinner} />
                        <p className={styles.logoutTitle}>Signing out...</p>
                        <p className={styles.logoutSub}>See you next time, {role === 'admin' ? 'Admin' : `Dr. ${getFirstName(user?.name)}`}</p>
                    </div>
                </div>
            )}

            <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
                <div className={styles.navInner}>

                    <Link href={role === 'admin' ? '/admin' : '/dashboard'} className={styles.logo}>
                        <div className={styles.logoMark}>
                            <LogoIcon size={22} />
                            <span className={styles.logoPulse} />
                        </div>
                        <div className={styles.logoText}>
                            <span className={styles.logoWordmark}>Diagno<em className={styles.logoAccent}>vate</em></span>
                            <span className={styles.logoSub}>{role === 'admin' ? 'Admin Console' : 'Clinical Platform'}</span>
                        </div>
                    </Link>

                    <div className={styles.links}>
                        {links.map(l => {
                            const active = (l.href === '/dashboard' || l.href === '/admin')
                                ? pathname === l.href
                                : pathname?.startsWith(l.href);
                            return (
                                <Link key={l.href} href={l.href} className={`${styles.link} ${active ? styles.linkActive : ''}`}>
                                    {l.label}
                                    {active && <span className={styles.linkDot} />}
                                </Link>
                            );
                        })}
                    </div>

                    <div className={styles.right}>

                        <div className={styles.dropWrap} ref={bellRef}>
                            <button className={`${styles.iconBtn} ${bellOpen ? styles.iconBtnActive : ''}`}
                                    onClick={() => { setBellOpen(o => !o); setProfOpen(false); }}>
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                {pendingCount > 0 && <span className={styles.notifDot} />}
                            </button>
                            {bellOpen && (
                                <div className={`${styles.dropdown} ${styles.dropdownBell}`}>
                                    <div className={styles.dropHead}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                        </svg>
                                        Notifications
                                    </div>
                                    {pendingCount > 0 && role === 'admin' ? (
                                        <div className={styles.notifItem}>
                                            <div className={styles.notifItemDot} />
                                            <div>
                                                <div className={styles.notifItemTitle}>{pendingCount} pending request{pendingCount > 1 ? 's' : ''}</div>
                                                <div className={styles.notifItemSub}>Awaiting your review</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.emptyDrop}>
                                            <div className={styles.emptyDropIcon}>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
                                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                                </svg>
                                            </div>
                                            <p className={styles.emptyDropTitle}>All clear</p>
                                            <p className={styles.emptyDropSub}>No new notifications</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.dropWrap} ref={profRef}>
                            <button className={styles.profileBtn} onClick={() => { setProfOpen(o => !o); setBellOpen(false); }}>
                                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>
                    {role === 'admin' ? 'System Admin' : (user?.name ? `Dr. ${getFirstName(user.name)}` : 'Doctor')}
                  </span>
                                    <span className={styles.profileRole}>
                    {role === 'admin' ? 'Administrator' : (user?.specialty || 'Clinician')}
                  </span>
                                </div>
                                <div className={styles.profileAvatar}>
                                    {user?.name ? getInitials(user.name) : (role === 'admin' ? 'SA' : 'DR')}
                                </div>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                     style={{ transform: profOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </button>
                            {profOpen && (
                                <div className={`${styles.dropdown} ${styles.dropdownProf}`}>
                                    <div className={styles.profDropHead}>
                                        <div className={styles.profDropAvatar}>
                                            {user?.name ? getInitials(user.name) : (role === 'admin' ? 'SA' : 'DR')}
                                        </div>
                                        <div>
                                            <div className={styles.profDropName}>{role === 'admin' ? 'System Admin' : (user?.name || 'Doctor')}</div>
                                            <div className={styles.profDropEmail}>{user?.email || (role === 'admin' ? 'admin@diagnovate.com' : '')}</div>
                                        </div>
                                    </div>
                                    <div className={styles.dropMenu}>
                                        {role === 'doctor' && (
                                            <Link href="/profile" className={styles.menuItem} onClick={() => setProfOpen(false)}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                                </svg>
                                                My Profile
                                            </Link>
                                        )}
                                        <div className={styles.menuSep} />
                                        <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={handleLogout}>
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