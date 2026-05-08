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
        color: isActive(href) ? '#0F6E56' : '#8A9E97',
        background: isActive(href) ? '#E1F5EE' : 'transparent',
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
        borderBottom: '1px solid rgba(29,158,117,0.12)',
        boxShadow: scrolled ? '0 4px 32px rgba(13,27,23,0.08)' : 'none',
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
        background: '#1D9E75',
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
                    {/* Hexagonal SVG mark */}
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polygon
                            points="18,2 32,9.5 32,26.5 18,34 4,26.5 4,9.5"
                            fill="#1D9E75"
                            opacity="0.12"
                            stroke="#1D9E75"
                            strokeWidth="1.5"
                        />
                        <polygon
                            points="18,7 28,12.5 28,23.5 18,29 8,23.5 8,12.5"
                            fill="none"
                            stroke="#1D9E75"
                            strokeWidth="1.2"
                            opacity="0.5"
                        />
                        <circle cx="18" cy="18" r="5" fill="#1D9E75" />
                        <circle cx="18" cy="11" r="2" fill="#1D9E75" opacity="0.6" />
                        <circle cx="18" cy="25" r="2" fill="#1D9E75" opacity="0.6" />
                        <circle cx="12" cy="14.5" r="2" fill="#1D9E75" opacity="0.6" />
                        <circle cx="24" cy="14.5" r="2" fill="#1D9E75" opacity="0.6" />
                        <circle cx="12" cy="21.5" r="2" fill="#1D9E75" opacity="0.6" />
                        <circle cx="24" cy="21.5" r="2" fill="#1D9E75" opacity="0.6" />
                    </svg>
                    <span style={{
                        fontFamily: 'var(--font-dm-serif, "DM Serif Display", serif)',
                        fontSize: 20,
                        letterSpacing: '-0.3px',
                        color: '#0D1B17',
                    }}>
                        Diagn<em style={{ fontStyle: 'italic', color: '#1D9E75' }}>ovate</em>
                    </span>
                </Link>

                {/* Desktop nav links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="pub-nav-links">
                    <Link href="/" style={linkStyle('/')}>Home</Link>
                    <Link href="/about" style={linkStyle('/about')}>About</Link>
                    <Link href="/contact" style={linkStyle('/contact')}>Contact</Link>
                    <Link
                        href="/log-in"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            fontSize: 14,
                            fontWeight: 600,
                            fontFamily: 'var(--font-dm-sans, sans-serif)',
                            color: isActive('/log-in') ? '#0F6E56' : '#1D9E75',
                            background: isActive('/log-in') ? '#E1F5EE' : 'transparent',
                            border: '1.5px solid',
                            borderColor: isActive('/log-in') ? '#1D9E75' : 'rgba(29,158,117,0.35)',
                            borderRadius: 9,
                            padding: '6px 16px',
                            transition: 'all 0.18s',
                            marginLeft: 4,
                        }}
                        onMouseEnter={e => {
                            const el = e.currentTarget as HTMLAnchorElement;
                            el.style.background = '#E1F5EE';
                            el.style.borderColor = '#1D9E75';
                        }}
                        onMouseLeave={e => {
                            const el = e.currentTarget as HTMLAnchorElement;
                            el.style.background = isActive('/log-in') ? '#E1F5EE' : 'transparent';
                            el.style.borderColor = isActive('/log-in') ? '#1D9E75' : 'rgba(29,158,117,0.35)';
                        }}
                    >
                        Log In
                    </Link>
                    <div style={{ width: 1, height: 20, background: 'rgba(29,158,117,0.2)', margin: '0 4px' }} />
                    <Link
                        href="/contact"
                        style={ctaStyle}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = '#0F6E56';
                            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(29,158,117,0.35)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = '#1D9E75';
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
                            border: '1px solid rgba(29,158,117,0.25)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            cursor: 'pointer',
                            color: '#1D9E75',
                            marginLeft: 8,
                        }}
                        aria-label="Toggle menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            {menuOpen ? (
                                <>
                                    <line x1="4" y1="4" x2="16" y2="16" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="16" y1="4" x2="4" y2="16" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="6" x2="17" y2="6" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="3" y1="10" x2="17" y2="10" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
                                    <line x1="3" y1="14" x2="17" y2="14" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round"/>
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
                    borderBottom: '1px solid rgba(29,158,117,0.15)',
                    padding: '16px 24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 8px 32px rgba(13,27,23,0.1)',
                }}>
                    {[
                        { href: '/', label: 'Home' },
                        { href: '/about', label: 'About' },
                        { href: '/contact', label: 'Contact' },
                        { href: '/log-in', label: 'Log In' },
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
                                color: isActive(href) ? '#0F6E56' : '#0D1B17',
                                background: isActive(href) ? '#E1F5EE' : 'transparent',
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
                            background: '#1D9E75',
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
