'use client';

import { useRouter } from 'next/navigation';
import { Shield, Stethoscope, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function RolePage() {
    const router = useRouter();
    const [hovered, setHovered] = useState(null);

    const roles = [
        {
            id: 'admin',
            label: 'Administrator',
            sub: 'Manage registrations, approve accounts & monitor system activity.',
            icon: <Shield size={26} color="white" />,
            color: '#1E3A8A',
            gradient: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
            lightBg: '#EFF6FF',
            border: '#BFDBFE',
            accentColor: '#3B82F6',
            path: '/log-in?role=admin',
        },
        {
            id: 'doctor',
            label: 'Doctor',
            sub: 'Access patient cases, manage appointments & run AI diagnostics.',
            icon: <Stethoscope size={26} color="white" />,
            color: '#0D9488',
            gradient: 'linear-gradient(135deg, #0D9488, #0891B2)',
            lightBg: '#F0FDFA',
            border: '#99F6E4',
            accentColor: '#0D9488',
            path: '/log-in?role=doctor',
        },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #F0F4F8;
          --surface: #FFFFFF;
          --teal: #0D9488;
          --text: #0F172A;
          --text2: #334155;
          --muted: #64748B;
          --border: #E2E8F0;
          --body: 'Plus Jakarta Sans', sans-serif;
          --display: 'DM Serif Display', serif;
        }

        body {
          background: var(--bg);
          font-family: var(--body);
          -webkit-font-smoothing: antialiased;
        }

        /* Dot pattern */
        .rp-bg {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .rp-bg::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, #CBD5E1 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.45;
          pointer-events: none;
          z-index: 0;
        }

        /* Blobs */
        .blob-tl {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 65%);
          top: -200px; left: -150px; pointer-events: none; z-index: 0;
        }
        .blob-br {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%);
          bottom: -150px; right: -100px; pointer-events: none; z-index: 0;
        }

        /* NAV */
        .rp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 68px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .rp-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--body); font-weight: 800; font-size: 17px;
          text-decoration: none; color: var(--text); letter-spacing: -0.2px;
        }

        .rp-logo-mark {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #0D9488, #0891B2);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(13,148,136,0.3);
        }

        .rp-back {
          display: inline-flex; align-items: center; gap: 7px;
          background: white; border: 1.5px solid var(--border);
          color: var(--muted); font-family: var(--body); font-size: 13px; font-weight: 600;
          padding: 8px 16px; border-radius: 10px; cursor: pointer;
          text-decoration: none; transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(15,23,42,0.05);
        }
        .rp-back:hover {
          color: var(--teal); border-color: #99F6E4;
          background: #F0FDFA;
          box-shadow: 0 4px 14px rgba(13,148,136,0.1);
        }

        /* MAIN */
        .rp-main {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 88px 24px 40px;
        }

        .rp-card {
          background: white;
          border-radius: 28px;
          padding: 52px 48px;
          width: 100%; max-width: 540px;
          border: 1px solid var(--border);
          box-shadow: 0 8px 48px rgba(15,23,42,0.1);
          animation: fadeUp 0.5s ease both;
          position: relative;
          overflow: hidden;
        }

        /* Subtle teal accent line at top */
        .rp-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0D9488, #0891B2, #7C3AED);
          border-radius: 28px 28px 0 0;
        }

        .rp-card-icon {
          width: 56px; height: 56px;
          background: #F0FDFA;
          border: 1px solid #99F6E4;
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }

        .rp-card-head {
          margin-bottom: 8px;
        }

        .rp-card-h1 {
          font-family: var(--display);
          font-size: 30px; font-weight: 400;
          color: var(--text); letter-spacing: -0.3px;
          margin-bottom: 8px; line-height: 1.2;
        }

        .rp-card-sub {
          font-size: 14px; color: var(--muted); line-height: 1.6;
          margin-bottom: 32px;
        }

        .rp-divider {
          height: 1px; background: var(--border); margin-bottom: 24px;
        }

        /* Role cards */
        .role-card {
          display: flex; align-items: center; gap: 18px;
          padding: 20px 22px;
          border-radius: 16px;
          border: 1.5px solid var(--border);
          background: #F8FAFC;
          cursor: pointer;
          transition: all 0.22s;
          margin-bottom: 12px;
          width: 100%;
          text-align: left;
          font-family: var(--body);
          position: relative;
          overflow: hidden;
        }

        .role-card:last-child { margin-bottom: 0; }

        .role-card:hover {
          transform: translateY(-2px);
        }

        .role-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .role-label {
          font-size: 15px; font-weight: 700; color: var(--text);
          margin-bottom: 4px;
        }

        .role-sub {
          font-size: 12.5px; color: var(--muted); line-height: 1.5;
        }

        .role-arrow {
          margin-left: auto; flex-shrink: 0; transition: transform 0.2s;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .rp-nav { padding: 0 20px; }
          .rp-card { padding: 36px 24px; }
        }
      `}</style>

            <div className="rp-bg">
                <div className="blob-tl"/><div className="blob-br"/>

                {/* NAV */}
                <nav className="rp-nav">
                    <a href="/" className="rp-logo">
                        <div className="rp-logo-mark">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
                            </svg>
                        </div>
                        {'DIAGNO'}<span style={{color:'#0D9488'}}>{'VATE'}</span>
                    </a>
                    <a href="/" className="rp-back">
                        <ChevronLeft size={15}/> Back to Home
                    </a>
                </nav>

                {/* MAIN */}
                <main className="rp-main">
                    <div className="rp-card">

                        <div className="rp-card-icon">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="#0D9488"/>
                            </svg>
                        </div>

                        <h1 className="rp-card-h1">Welcome to <em>Diagnovate</em></h1>
                        <p className="rp-card-sub">Select your role to continue to the platform.</p>

                        <div className="rp-divider"/>

                        {roles.map((r) => (
                            <div
                                key={r.id}
                                className="role-card"
                                role="button"
                                tabIndex={0}
                                onClick={() => router.push(r.path)}
                                onKeyDown={(e) => e.key === 'Enter' && router.push(r.path)}
                                onMouseEnter={() => setHovered(r.id)}
                                onMouseLeave={() => setHovered(null)}
                                style={{
                                    borderColor: hovered === r.id ? r.border : '#E2E8F0',
                                    background: hovered === r.id ? r.lightBg : '#F8FAFC',
                                    boxShadow: hovered === r.id ? `0 8px 28px ${r.accentColor}18` : 'none',
                                }}
                            >
                                <div
                                    className="role-icon"
                                    style={{
                                        background: r.gradient,
                                        boxShadow: hovered === r.id ? `0 6px 20px ${r.accentColor}35` : `0 4px 12px ${r.accentColor}20`,
                                    }}
                                >
                                    {r.icon}
                                </div>
                                <div style={{flex:1}}>
                                    <div className="role-label">{r.label}</div>
                                    <div className="role-sub">{r.sub}</div>
                                </div>
                                <ChevronRight
                                    size={18}
                                    className="role-arrow"
                                    style={{
                                        color: hovered === r.id ? r.accentColor : '#CBD5E1',
                                        transform: hovered === r.id ? 'translateX(4px)' : 'translateX(0)',
                                    }}
                                />
                            </div>
                        ))}

                    </div>
                </main>
            </div>
        </>
    );
}