'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function PublicNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 4);
        window.addEventListener('scroll', handler, { passive: true });
        handler();
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const isActive = (href: string) => pathname === href;

    const linkStyle = (href: string): React.CSSProperties => ({
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'var(--font-dm-sans, sans-serif)',
        color: isActive(href) ? '#0F6E56' : '#64748B',
        background: isActive(href) ? '#F0FDFA' : 'transparent',
        borderRadius: isActive(href) ? 8 : 8,
        padding: '6px 14px',
        transition: 'all 0.18s',
        letterSpacing: '0.01em',
    });

    const navStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        background: 'rgba(244,249,247,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(13,148,136,0.12)',
        boxShadow: scrolled ? '0 4px 32px rgba(15,23,42,0.08)' : 'none',
        transition: 'box-shadow 0.25s',
    };

    const ctaStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 700,
        fontFamily: 'var(--font-dm-sans, sans-serif)',
        color: '#fff',
        background: '#0D9488',
        borderRadius: 10,
        padding: '8px 20px',
        transition: 'all 0.2s',
        letterSpacing: '0.01em',
        border: 'none',
        cursor: 'pointer',
    };

    return (
        <>
            <nav style={navStyle}>
                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 13,
                        background: 'linear-gradient(145deg,#0D9488,#0D9488)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 20px rgba(13,148,136,0.4)',
                        flexShrink: 0,
                    }}>
                        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                            <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
                            <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                            <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                            <circle cx="20" cy="20" r="3.5" fill="white"/>
                        </svg>
                    </div>
                    <span style={{
                        fontFamily: 'var(--font-dm-serif, "DM Serif Display", serif)',
                        fontSize: 20,
                        letterSpacing: '-0.3px',
                        color: '#0F172A',
                    }}>
                        Diagn<em style={{ fontStyle: 'italic', color: '#0D9488' }}>ovate</em>
                    </span>
                </Link>

                {/* Desktop nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="pub-nav-links">
                    <Link href="/" style={linkStyle('/')}>Home</Link>
                    <Link href="/about" style={linkStyle('/about')}>About</Link>
                    <Link href="/contact" style={linkStyle('/contact')}>Contact</Link>
                    <Link
                        href="/role"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 600,
                            fontFamily: 'var(--font-dm-sans, sans-serif)',
                            color: isActive('/role') ? '#0F6E56' : '#0D9488',
                            background: isActive('/role') ? '#F0FDFA' : 'transparent',
                            border: '1.5px solid',
                            borderColor: isActive('/role') ? '#0D9488' : 'rgba(13,148,136,0.35)',
                            borderRadius: 9,
                            padding: '6px 16px',
                            transition: 'all 0.18s',
                            marginLeft: 4,
                        }}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLAnchorElement;
                            el.style.background = '#F0FDFA';
                            el.style.borderColor = '#0D9488';
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLAnchorElement;
                            el.style.background = isActive('/role') ? '#F0FDFA' : 'transparent';
                            el.style.borderColor = isActive('/role') ? '#0D9488' : 'rgba(13,148,136,0.35)';
                        }}
                    >
                        Log In
                    </Link>
                    <div style={{ width: 1, height: 20, background: 'rgba(13,148,136,0.2)', margin: '0 4px' }} />
                    <Link
                        href="/contact"
                        style={ctaStyle}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = '#0F6E56';
                            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(13,148,136,0.35)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = '#0D9488';
                            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                        }}
                    >
                        Request Demo
                    </Link>

                    {/* Hamburger */}
                    <button
                        className="pub-nav-hamburger"
                        onClick={() => setMenuOpen(o => !o)}
                        style={{
                            display: 'none',
                            background: 'none',
                            border: '1px solid rgba(13,148,136,0.25)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            color: '#0D9488',
                            marginLeft: 8,
                        }}
                        aria-label="Toggle menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            {menuOpen ? (
                                <>
                                    <line x1="4" y1="4" x2="16" y2="16" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="16" y1="4" x2="4" y2="16" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="6" x2="17" y2="6" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="3" y1="10" x2="17" y2="10" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="3" y1="14" x2="17" y2="14" stroke="#0D9488" strokeWidth="2" strokeLinecap="round"/>
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* Mobile dropdown */}
            {menuOpen && (
                <div style={{
                    position: 'fixed',
                    top: 72,
                    left: 0,
                    right: 0,
                    zIndex: 199,
                    background: 'rgba(244,249,247,0.97)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(13,148,136,0.15)',
                    padding: '16px 24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 8px 32px rgba(15,23,42,0.1)',
                }}>
                    {[
                        { href: '/', label: 'Home' },
                        { href: '/about', label: 'About' },
                        { href: '/contact', label: 'Contact' },
                        { href: '/role', label: 'Log In' },
                    ].map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                display: 'block',
                                padding: '10px 14px',
                                borderRadius: 10,
                                textDecoration: 'none',
                                fontFamily: 'var(--font-dm-sans, sans-serif)',
                                fontSize: 15,
                                fontWeight: isActive(href) ? 700 : 500,
                                color: isActive(href) ? '#0F6E56' : '#0F172A',
                                background: isActive(href) ? '#F0FDFA' : 'transparent',
                            }}
                        >
                            {label}
                        </Link>
                    ))}
                    <Link
                        href="/contact"
                        onClick={() => setMenuOpen(false)}
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: '11px 14px',
                            borderRadius: 10,
                            textDecoration: 'none',
                            fontFamily: 'var(--font-dm-sans, sans-serif)',
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#fff',
                            background: '#0D9488',
                            marginTop: 4,
                        }}
                    >
                        Request Demo
                    </Link>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .pub-nav-links { gap: 0 !important; }
                    .pub-nav-links > a { display: none !important; }
                    .pub-nav-hamburger { display: flex !important; }
                }
            `}</style>
        </>
    );
}
