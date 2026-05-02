// Admin navbar — fixed header for the admin panel, with notification bell and profile dropdown including sign-out.
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminNavbar({ pendingCount = 0 }: { pendingCount?: number }) {
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [bellOpen,     setBellOpen]     = useState(false);
    const [loggingOut,   setLoggingOut]   = useState(false);

    const handleLogout = () => {
        setLoggingOut(true);
        setTimeout(() => {
            localStorage.clear();
            router.push('/log-in');
        }, 1500);
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ringPulse { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.06)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .an-icon-btn {
          width:38px; height:38px; border-radius:10px;
          background:white; border:1.5px solid #E2E8F0;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all 0.18s;
          box-shadow:0 2px 6px rgba(15,23,42,0.05);
        }
        .an-icon-btn:hover { border-color:#CBD5E1; box-shadow:0 4px 12px rgba(15,23,42,0.1); }
        .an-menu-item {
          width:100%; display:flex; align-items:center; gap:10px;
          padding:10px 12px; border-radius:10px; border:none;
          background:none; cursor:pointer; text-align:left;
          font-family:'Plus Jakarta Sans',sans-serif;
          font-size:13px; font-weight:500; transition:background 0.15s;
        }
      `}</style>

            {loggingOut && (
                <div style={{
                    position:'fixed', inset:0, zIndex:9999,
                    background:'#F0F4F8',
                    backgroundImage:'radial-gradient(circle,#CBD5E1 1px,transparent 1px)',
                    backgroundSize:'28px 28px',
                    display:'flex', alignItems:'center', justifyContent:'center'
                }}>
                    <div style={{
                        background:'white', border:'1px solid #E2E8F0', borderRadius:28,
                        padding:'52px 64px', textAlign:'center',
                        boxShadow:'0 32px 80px rgba(15,23,42,.12)',
                        display:'flex', flexDirection:'column', alignItems:'center'
                    }}>
                        <div style={{
                            width:52, height:52,
                            background:'linear-gradient(145deg,#0D9488,#0891B2)',
                            borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center',
                            boxShadow:'0 8px 24px rgba(13,148,136,.3)', marginBottom:24
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
                            </svg>
                        </div>
                        <div style={{ width:36, height:36, border:'3px solid #F0FDFA', borderTop:'3px solid #0D9488', borderRadius:'50%', animation:'spin 0.75s linear infinite', marginBottom:20 }}/>
                        <p style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:'#0F172A', margin:'0 0 6px' }}>Signing out...</p>
                        <p style={{ fontSize:13, color:'#64748B', margin:0 }}>See you next time, Admin</p>
                    </div>
                </div>
            )}

            <header style={{
                position:'fixed', top:0, left:0, right:0, zIndex:100,
                height:72,
                background:'rgba(255,255,255,0.92)',
                backdropFilter:'blur(24px)',
                borderBottom:'1px solid #E2E8F0',
                boxShadow:'0 1px 0 rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)',
                fontFamily:"'Plus Jakarta Sans',sans-serif"
            }}>
                <div style={{
                    height:'100%', maxWidth:1240, margin:'0 auto',
                    padding:'0 48px',
                    display:'flex', alignItems:'center', justifyContent:'space-between'
                }}>

                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ position:'relative' }}>
                            <div style={{
                                width:44, height:44, borderRadius:14,
                                background:'linear-gradient(145deg,#0D9488 0%,#0891B2 60%,#0369A1 100%)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                                boxShadow:'0 6px 18px rgba(13,148,136,0.35), inset 0 1px 0 rgba(255,255,255,0.2)'
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white"/>
                                </svg>
                            </div>
                            <span style={{
                                position:'absolute', inset:-3, borderRadius:17,
                                border:'1.5px solid rgba(13,148,136,0.25)',
                                animation:'ringPulse 3s ease-in-out infinite',
                                pointerEvents:'none'
                            }}/>
                        </div>
                        <div style={{ lineHeight:1 }}>
                            <div style={{
                                fontFamily:"'DM Serif Display',serif",
                                fontSize:22, fontWeight:400, letterSpacing:'-0.3px',
                                color:'#0F172A', display:'flex', alignItems:'baseline'
                            }}>
                                <span>Diagno</span>
                                <span style={{
                                    background:'linear-gradient(120deg,#0D9488,#0891B2)',
                                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
                                }}>vate</span>
                            </div>
                            <div style={{ fontSize:10, fontWeight:700, letterSpacing:2.5, color:'#94A3B8', textTransform:'uppercase', marginTop:1 }}>
                                Admin Console
                            </div>
                        </div>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>

                        <div style={{ position:'relative' }}>
                            <button
                                className="an-icon-btn"
                                onClick={() => { setBellOpen(o => !o); setDropdownOpen(false); }}
                                style={{ position:'relative' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                {pendingCount > 0 && (
                                    <span style={{
                                        position:'absolute', top:5, right:5,
                                        width:7, height:7, borderRadius:'50%',
                                        background:'#EF4444', border:'2px solid white'
                                    }}/>
                                )}
                            </button>

                            {bellOpen && (
                                <div style={{
                                    position:'absolute', top:'calc(100% + 8px)', right:0,
                                    background:'white', border:'1px solid #E2E8F0',
                                    borderRadius:16, width:260,
                                    boxShadow:'0 16px 48px rgba(15,23,42,0.14)',
                                    zIndex:200, overflow:'hidden',
                                    animation:'fadeUp 0.18s ease'
                                }}>
                                    <div style={{ padding:'14px 18px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', gap:8 }}>
                                        <span style={{ width:7, height:7, borderRadius:'50%', background:'#0D9488', display:'inline-block' }}/>
                                        <span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>Notifications</span>
                                    </div>
                                    <div style={{ padding:'32px 18px', textAlign:'center' }}>
                                        <div style={{
                                            width:52, height:52, borderRadius:16,
                                            background:'#F8FAFC', border:'1px solid #E2E8F0',
                                            display:'flex', alignItems:'center', justifyContent:'center',
                                            margin:'0 auto 14px'
                                        }}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round">
                                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                            </svg>
                                        </div>
                                        <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:4 }}>All clear!</div>
                                        <div style={{ fontSize:12, color:'#94A3B8' }}>No new notifications.</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ position:'relative' }}>
                            <button
                                onClick={() => { setDropdownOpen(o => !o); setBellOpen(false); }}
                                style={{
                                    display:'flex', alignItems:'center', gap:9,
                                    padding:'5px 10px 5px 14px',
                                    background:'white', border:'1.5px solid #E2E8F0',
                                    borderRadius:14, cursor:'pointer',
                                    boxShadow:'0 2px 6px rgba(15,23,42,0.05)',
                                    transition:'border-color 0.18s',
                                    fontFamily:"'Plus Jakarta Sans',sans-serif"
                                }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = '#CBD5E1')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
                            >
                                <div style={{ textAlign:'left' }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:'#0F172A', lineHeight:1.2 }}>System Admin</div>
                                    <div style={{ fontSize:10, color:'#94A3B8' }}>Administrator</div>
                                </div>
                                <div style={{
                                    width:34, height:34, borderRadius:10, flexShrink:0,
                                    background:'linear-gradient(135deg,#0D9488,#7C3AED)',
                                    display:'flex', alignItems:'center', justifyContent:'center'
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="8" r="4" fill="white"/>
                                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round"
                                     style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s' }}>
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div style={{
                                    position:'absolute', top:'calc(100% + 8px)', right:0,
                                    background:'white', border:'1px solid #E2E8F0',
                                    borderRadius:16, width:220,
                                    boxShadow:'0 16px 48px rgba(15,23,42,0.14)',
                                    overflow:'hidden', zIndex:200,
                                    animation:'fadeUp 0.18s ease'
                                }}>
                                    <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid #F1F5F9' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                            <div style={{
                                                width:40, height:40, borderRadius:12, flexShrink:0,
                                                background:'linear-gradient(135deg,#0D9488,#7C3AED)',
                                                display:'flex', alignItems:'center', justifyContent:'center'
                                            }}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="8" r="4" fill="white"/>
                                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <div style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>System Admin</div>
                                                <div style={{ fontSize:11, color:'#94A3B8', marginTop:1 }}>admin@diagnovate.com</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding:'8px' }}>
                                        <button
                                            className="an-menu-item"
                                            style={{ color:'#334155' }}
                                            onClick={() => { setDropdownOpen(false); router.push('/admin/profile'); }}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            View Profile
                                        </button>

                                        <div style={{ height:1, background:'#F1F5F9', margin:'6px 0' }}/>

                                        <button
                                            className="an-menu-item"
                                            style={{ color:'#EF4444' }}
                                            onClick={handleLogout}
                                            onMouseEnter={e => (e.currentTarget.style.background = '#FFF1F2')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                                <polyline points="16 17 21 12 16 7"/>
                                                <line x1="21" y1="12" x2="9" y2="12"/>
                                            </svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </header>
        </>
    );
}