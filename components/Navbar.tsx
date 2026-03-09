'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Activity, Bell, ChevronDown, LogOut, User,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */
interface Doctor { id: number; name: string; email: string; specialty: string; }

/* ─── Helpers ───────────────────────────────────────────────────── */
const formatName   = (n?: string) => !n ? 'Doctor' : /^dr\.?\s/i.test(n) ? n : `Dr. ${n}`;
const getFirstName = (n?: string) => !n ? 'Doctor' : n.replace(/^dr\.?\s*/i, '').split(' ')[0];

const NAV_LINKS = [
    { href: '/dashboard',          label: 'Dashboard'    },
    { href: '/patient-management', label: 'Patients'     },
    { href: '/image-enhancement',  label: 'Imaging'      },
    { href: '/ai-diagnosis',       label: 'AI Diagnosis' },
    { href: '/reports',            label: 'Reports'      },
];

const LOGO_PATH = "M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z";

/* ═══════════════════════════════════════════════════════════════════
   NAVBAR COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function Navbar() {
    const pathname  = usePathname();
    const router    = useRouter();

    const [doctor,      setDoctor]      = useState<Doctor | null>(null);
    const [showNotif,   setShowNotif]   = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [scrolled,    setScrolled]    = useState(false);

    const notifRef   = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    /* load doctor from localStorage */
    useEffect(() => {
        try { const ud = localStorage.getItem('user'); if (ud) setDoctor(JSON.parse(ud)); } catch {}
    }, []);

    /* close dropdowns on outside click */
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotif(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    /* scroll shadow */
    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/log-in');
    };

    return (
        <>
            <style>{`
        /* ── Navbar shell ───────────────────────────────────── */
        .dv-nav {
          position: sticky; top: 0; z-index: 300;
          height: 64px;
          display: flex; align-items: center;
          padding: 0 28px;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(28px) saturate(180%);
          border-bottom: 1px solid #EBF0F5;
          transition: box-shadow 0.3s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .dv-nav.scrolled {
          box-shadow: 0 4px 32px rgba(15,23,42,0.08), 0 1px 0 rgba(13,148,136,0.06);
        }

        /* ── Logo ───────────────────────────────────────────── */
        .dv-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
          font-weight: 800; font-size: 16.5px; letter-spacing: -0.4px;
          color: #0F172A; flex-shrink: 0; margin-right: 36px;
          transition: opacity 0.2s;
        }
        .dv-logo:hover { opacity: 0.8; }
        .dv-logo-mark {
          position: relative;
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(145deg, #0D9488 0%, #0891B2 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(13,148,136,0.35), inset 0 1px 0 rgba(255,255,255,0.2);
          flex-shrink: 0;
          transition: transform 0.22s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.22s ease;
        }
        .dv-logo:hover .dv-logo-mark {
          transform: translateY(-1px) scale(1.04);
          box-shadow: 0 8px 20px rgba(13,148,136,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        /* subtle pulse ring */
        .dv-logo-mark::after {
          content: '';
          position: absolute; inset: -3px; border-radius: 13px;
          border: 1.5px solid rgba(13,148,136,0.18);
          opacity: 0; transition: opacity 0.22s;
        }
        .dv-logo:hover .dv-logo-mark::after { opacity: 1; }
        .dv-logo-accent { color: #0D9488; }

        /* ── Nav links ──────────────────────────────────────── */
        .dv-links { display: flex; align-items: center; gap: 2px; flex: 1; }

        .dv-link {
          position: relative;
          padding: 7px 13px; border-radius: 9px;
          font-size: 13.5px; font-weight: 500; color: #64748B;
          text-decoration: none;
          transition: color 0.16s, background 0.16s;
          white-space: nowrap;
        }
        .dv-link:hover { color: #0F172A; background: #F1F5F9; }

        .dv-link-active {
          color: #0D9488 !important;
          font-weight: 700;
          background: #F0FDFA !important;
        }
        /* animated underline dot */
        .dv-link-active::after {
          content: '';
          position: absolute; bottom: 5px; left: 50%;
          transform: translateX(-50%);
          width: 4px; height: 4px; border-radius: 50%;
          background: #0D9488;
          animation: dotPop 0.25s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes dotPop {
          from { transform: translateX(-50%) scale(0); opacity: 0; }
          to   { transform: translateX(-50%) scale(1); opacity: 1; }
        }

        /* ── Right section ──────────────────────────────────── */
        .dv-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }

        /* Bell button */
        .dv-bell {
          position: relative;
          width: 38px; height: 38px; border-radius: 11px;
          border: 1px solid #E8EDF2; background: #F8FAFC;
          color: #94A3B8; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s; flex-shrink: 0;
        }
        .dv-bell:hover   { background: #F0FDFA; color: #0D9488; border-color: #CCFBF1; }
        .dv-bell.active  { background: #F0FDFA; color: #0D9488; border-color: #99F6E4; }

        /* Divider */
        .dv-divider { width: 1px; height: 26px; background: #E8EDF2; flex-shrink: 0; }

        /* Profile pill */
        .dv-profile {
          display: flex; align-items: center; gap: 9px;
          padding: 4px 12px 4px 4px;
          background: white;
          border: 1px solid #E8EDF2; border-radius: 100px;
          cursor: pointer; user-select: none;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .dv-profile:hover {
          background: #F0FDFA; border-color: #B2F0EA;
          box-shadow: 0 4px 16px rgba(13,148,136,0.12);
        }
        .dv-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(13,148,136,0.28);
          font-size: 11px; font-weight: 800;
        }
        .dv-pname { font-size: 12.5px; font-weight: 700; color: #0F172A; line-height: 1.2; }
        .dv-prole { font-size: 10px; color: #94A3B8; }
        .dv-chevron { color: #CBD5E1; transition: transform 0.2s; }
        .dv-profile:hover .dv-chevron { transform: translateY(1px); }

        /* ── Dropdowns ──────────────────────────────────────── */
        .dv-drop-wrap { position: relative; }

        .dv-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          background: white;
          border: 1px solid rgba(15,23,42,0.08);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.13), 0 4px 16px rgba(15,23,42,0.06);
          z-index: 400; overflow: hidden;
          animation: dropIn 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes dropIn {
          from { opacity:0; transform: translateY(-10px) scale(0.96); }
          to   { opacity:1; transform: translateY(0)     scale(1);    }
        }

        .dv-notif-drop { width: 300px; }
        .dv-prof-drop  { width: 252px; }

        /* Notif drop */
        .dv-drop-head {
          padding: 15px 18px 13px;
          border-bottom: 1px solid #F1F5F9;
          font-size: 13px; font-weight: 700; color: #0F172A;
          display: flex; align-items: center; gap: 9px;
        }
        .dv-drop-head-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #0D9488;
          box-shadow: 0 0 8px rgba(13,148,136,0.5);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }

        .dv-empty {
          padding: 36px 18px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .dv-empty-ic {
          width: 52px; height: 52px; border-radius: 16px;
          background: #F8FAFC; border: 1px solid #F1F5F9;
          display: flex; align-items: center; justify-content: center; color: #CBD5E1;
        }
        .dv-empty-t { font-size: 13.5px; font-weight: 700; color: #334155; margin: 0; }
        .dv-empty-s { font-size: 11.5px; color: #94A3B8; text-align: center; margin: 0; }

        /* Profile drop header */
        .dv-prof-head {
          padding: 18px;
          border-bottom: 1px solid #F1F5F9;
          display: flex; align-items: center; gap: 13px;
          background: linear-gradient(135deg, #F0FDFA 0%, #F8FAFC 100%);
        }
        .dv-prof-av {
          width: 46px; height: 46px; border-radius: 14px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          display: flex; align-items: center; justify-content: center;
          color: white; flex-shrink: 0;
          box-shadow: 0 6px 16px rgba(13,148,136,0.28);
          font-size: 16px; font-weight: 800;
        }
        .dv-prof-name  { font-size: 13.5px; font-weight: 700; color: #0F172A; }
        .dv-prof-spec  { font-size: 11.5px; color: #64748B; margin-top: 2px; }
        .dv-prof-email { font-size: 10.5px; color: #94A3B8; margin-top: 3px; }

        .dv-menu-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 18px;
          font-size: 13.5px; font-weight: 500; color: #334155;
          cursor: pointer; transition: all 0.15s;
          border: none; background: none; width: 100%;
          text-align: left; text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .dv-menu-item:hover { background: #F8FAFC; color: #0D9488; }
        .dv-menu-danger:hover { background: #FFF1F2 !important; color: #E11D48 !important; }
        .dv-sep { height: 1px; background: #F1F5F9; margin: 4px 0; }

        /* ── Mobile ─────────────────────────────────────────── */
        @media (max-width: 900px) {
          .dv-links { display: none; }
          .dv-divider { display: none; }
          .dv-nav { padding: 0 16px; }
        }
      `}</style>

            <header className={`dv-nav${scrolled ? ' scrolled' : ''}`}>

                {/* Logo */}
                <Link href="/dashboard" className="dv-logo">
                    <div className="dv-logo-mark">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d={LOGO_PATH} fill="white" />
                        </svg>
                    </div>
                    DIAGNO<span className="dv-logo-accent">VATE</span>
                </Link>

                {/* Nav links */}
                <nav className="dv-links">
                    {NAV_LINKS.map(l => (
                        <Link key={l.href} href={l.href}
                              className={`dv-link${pathname === l.href ? ' dv-link-active' : ''}`}>
                            {l.label}
                        </Link>
                    ))}
                </nav>

                {/* Right */}
                <div className="dv-right">

                    {/* Bell */}
                    <div className="dv-drop-wrap" ref={notifRef}>
                        <button className={`dv-bell${showNotif ? ' active' : ''}`}
                                onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}>
                            <Bell size={15} />
                        </button>
                        {showNotif && (
                            <div className="dv-dropdown dv-notif-drop">
                                <div className="dv-drop-head">
                                    <span className="dv-drop-head-dot" />
                                    Notifications
                                </div>
                                <div className="dv-empty">
                                    <div className="dv-empty-ic"><Bell size={20} /></div>
                                    <p className="dv-empty-t">All clear!</p>
                                    <p className="dv-empty-s">No new notifications.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="dv-divider" />

                    {/* Profile */}
                    <div className="dv-drop-wrap" ref={profileRef}>
                        <div className="dv-profile"
                             onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}>
                            <div className="dv-avatar">
                                {doctor?.name ? getFirstName(doctor.name)[0].toUpperCase() : <User size={13} />}
                            </div>
                            <div>
                                <div className="dv-pname">{formatName(doctor?.name)}</div>
                                <div className="dv-prole">{doctor?.specialty || 'Thyroid Specialist'}</div>
                            </div>
                            <ChevronDown size={12} className="dv-chevron" />
                        </div>

                        {showProfile && (
                            <div className="dv-dropdown dv-prof-drop">
                                <div className="dv-prof-head">
                                    <div className="dv-prof-av">
                                        {doctor?.name ? getFirstName(doctor.name)[0].toUpperCase() : <User size={18} />}
                                    </div>
                                    <div>
                                        <div className="dv-prof-name">{formatName(doctor?.name)}</div>
                                        <div className="dv-prof-spec">{doctor?.specialty || 'Thyroid Specialist'}</div>
                                        <div className="dv-prof-email">{doctor?.email}</div>
                                    </div>
                                </div>
                                <Link href="/profile" className="dv-menu-item"
                                      onClick={() => setShowProfile(false)}>
                                    <User size={14} /> View Profile
                                </Link>
                                <Link href="/dashboard" className="dv-menu-item"
                                      onClick={() => setShowProfile(false)}>
                                    <Activity size={14} /> Dashboard
                                </Link>
                                <div className="dv-sep" />
                                <button className="dv-menu-item dv-menu-danger" onClick={handleLogout}>
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}