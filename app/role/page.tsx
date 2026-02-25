'use client';

import { useRouter } from 'next/navigation';
import { Shield, Stethoscope, ChevronRight, Heart, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

export default function RolePage() {
  const router = useRouter();
  const [hoveredAdmin, setHoveredAdmin]   = useState(false);
  const [hoveredDoctor, setHoveredDoctor] = useState(false);
  const [hoveredBack, setHoveredBack]     = useState(false);

  return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Merriweather', Georgia, serif",
      }}>

        {/* ===== Header ===== */}
        <header style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%',
          height: '60px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
        }}>

          {/* Back to Home — left side */}
          <div
              role="button"
              tabIndex={0}
              onClick={() => router.push('/')}
              onKeyDown={(e) => e.key === 'Enter' && router.push('/')}
              onMouseEnter={() => setHoveredBack(true)}
              onMouseLeave={() => setHoveredBack(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 14px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: hoveredBack ? '#f1f5f9' : 'white',
                color: hoveredBack ? '#0099cc' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.88rem',
                fontWeight: 500,
                outline: 'none',
              }}
          >
            <ChevronLeft size={16} />
            Back to Home
          </div>

          {/* Logo — right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, textAlign: 'right' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e293b', letterSpacing: '0.5px' }}>
              DIAGNOVATE
            </span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 400 }}>
              Thyroid Cancer Diagnostics
            </span>
            </div>
            <div style={{
              width: '42px', height: '42px',
              background: 'linear-gradient(135deg, #0099cc, #0077aa)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Heart size={22} color="white" />
            </div>
          </div>

        </header>

        {/* ===== Main ===== */}
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px 40px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '48px 44px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            animation: 'fadeUp 0.4s ease both',
          }}>

            {/* Card Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#1e293b',
                marginBottom: '8px',
                letterSpacing: '-0.4px',
              }}>
                Welcome to Diagnovate
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0, fontWeight: 300 }}>
                Select your role to continue to the platform
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#e2e8f0', marginBottom: '28px' }} />

            {/* Role Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Admin Card */}
              <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push('/log-in?role=admin')}
                  onKeyDown={(e) => e.key === 'Enter' && router.push('/log-in?role=admin')}
                  onMouseEnter={() => setHoveredAdmin(true)}
                  onMouseLeave={() => setHoveredAdmin(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '20px 22px',
                    borderRadius: '14px',
                    border: hoveredAdmin ? '1.5px solid #0099cc' : '1.5px solid #e2e8f0',
                    background: hoveredAdmin ? 'white' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    boxShadow: hoveredAdmin ? '0 8px 24px rgba(0,153,204,0.12)' : 'none',
                    transform: hoveredAdmin ? 'translateY(-2px)' : 'translateY(0)',
                    outline: 'none',
                  }}
              >
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '13px',
                  background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
                  boxShadow: '0 6px 16px rgba(30,60,114,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Shield size={26} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                    Administrator
                  </h2>
                  <p style={{ fontSize: '0.83rem', color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: 300 }}>
                    Manage doctor registrations, approve accounts, and monitor system activity.
                  </p>
                </div>
                <ChevronRight
                    size={20}
                    color={hoveredAdmin ? '#0099cc' : '#cbd5e1'}
                    style={{ transition: 'all 0.2s', transform: hoveredAdmin ? 'translateX(4px)' : 'translateX(0)', flexShrink: 0 }}
                />
              </div>

              {/* Doctor Card */}
              <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push('/log-in?role=doctor')}
                  onKeyDown={(e) => e.key === 'Enter' && router.push('/log-in?role=doctor')}
                  onMouseEnter={() => setHoveredDoctor(true)}
                  onMouseLeave={() => setHoveredDoctor(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '20px 22px',
                    borderRadius: '14px',
                    border: hoveredDoctor ? '1.5px solid #0099cc' : '1.5px solid #e2e8f0',
                    background: hoveredDoctor ? 'white' : '#f8fafc',
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    boxShadow: hoveredDoctor ? '0 8px 24px rgba(0,153,204,0.12)' : 'none',
                    transform: hoveredDoctor ? 'translateY(-2px)' : 'translateY(0)',
                    outline: 'none',
                  }}
              >
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '13px',
                  background: 'linear-gradient(135deg, #0077aa, #0099cc)',
                  boxShadow: '0 6px 16px rgba(0,153,204,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Stethoscope size={26} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                    Doctor
                  </h2>
                  <p style={{ fontSize: '0.83rem', color: '#64748b', margin: 0, lineHeight: 1.5, fontWeight: 300 }}>
                    Access patient cases, manage appointments, and run AI diagnostics.
                  </p>
                </div>
                <ChevronRight
                    size={20}
                    color={hoveredDoctor ? '#0099cc' : '#cbd5e1'}
                    style={{ transition: 'all 0.2s', transform: hoveredDoctor ? 'translateX(4px)' : 'translateX(0)', flexShrink: 0 }}
                />
              </div>

            </div>
          </div>
        </div>

        <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      </div>
  );
}