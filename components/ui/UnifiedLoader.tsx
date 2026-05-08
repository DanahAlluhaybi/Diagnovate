'use client';

const SPIN_STYLE = `@keyframes unifiedSpin { to { transform: rotate(360deg); } }`;

export const UnifiedLoader = ({ message = 'Loading...' }: { message?: string }) => (
    <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '200px', gap: '16px',
    }}>
        <div style={{
            width: 44, height: 44,
            border: '3px solid #E2E8F0',
            borderTopColor: '#0D9488',
            borderRadius: '50%',
            animation: 'unifiedSpin 0.75s linear infinite',
        }} />
        <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
            {message}
        </p>
        <style>{SPIN_STYLE}</style>
    </div>
);

export const PageLoader = ({ message = 'Loading...' }: { message?: string }) => (
    <div style={{
        position: 'fixed', inset: 0,
        background: '#F0F4F8',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '20px', zIndex: 9999,
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
                width: 32, height: 32,
                background: 'linear-gradient(135deg,#0D9488,#0F766E)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
                    <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5"/>
                    <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                    <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                    <circle cx="20" cy="20" r="3.5" fill="white"/>
                </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>
                Diagno<span style={{ color: '#0D9488' }}>vate</span>
            </span>
        </div>
        <div style={{
            width: 40, height: 40,
            border: '3px solid #E2E8F0',
            borderTopColor: '#0D9488',
            borderRadius: '50%',
            animation: 'unifiedSpin 0.75s linear infinite',
        }} />
        <p style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>
            {message}
        </p>
        <style>{SPIN_STYLE}</style>
    </div>
);

export const SkeletonLine = ({ width = '100%', height = '16px' }: { width?: string; height?: string }) => (
    <div style={{
        width, height,
        borderRadius: 6,
        background: 'linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
    }}>
        <style>{`@keyframes shimmer { to { background-position: -200% 0; } }`}</style>
    </div>
);
