export default function Loading() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#F4F9F7',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'var(--font-body, "DM Sans", sans-serif)',
        }}>
            {/* Hex grid pattern */}
            <svg
                style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern id="ldHex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                        <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ldHex)" />
            </svg>

            {/* Soft blob — top right */}
            <div style={{
                position: 'fixed',
                width: 600, height: 600, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(29,158,117,0.07) 0%, transparent 65%)',
                top: -200, right: -200, pointerEvents: 'none',
            }} />

            {/* Soft blob — bottom left */}
            <div style={{
                position: 'fixed',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(8,80,65,0.05) 0%, transparent 65%)',
                bottom: -150, left: -100, pointerEvents: 'none',
            }} />

            {/* Animated hex logo mark */}
            <div style={{
                width: 56, height: 56, borderRadius: 13,
                background: 'linear-gradient(145deg,#1D9E75,#0D9488)',
                boxShadow: '0 8px 28px rgba(29,158,117,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
                animation: 'ldPulse 2.5s ease-in-out infinite',
            }}>
                <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
                    <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
                    <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                    <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                    <circle cx="20" cy="20" r="3.5" fill="white"/>
                </svg>
            </div>

            {/* Wordmark */}
            <div style={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: 26,
                letterSpacing: '-0.5px',
                color: '#0D1B17',
                marginBottom: 6,
            }}>
                Diagn<em style={{ fontStyle: 'italic', color: '#1D9E75' }}>ovate</em>
            </div>

            {/* Subtitle */}
            <div style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#8A9E97',
                marginBottom: 28,
            }}>
                Clinical AI Platform
            </div>

            {/* Staggered dots */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {[0, 0.22, 0.44].map((delay, i) => (
                    <div key={i} style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#1D9E75',
                        animation: `dotBlink 1.4s ease-in-out ${delay}s infinite`,
                    }} />
                ))}
            </div>

            {/* Progress bar — fixed at bottom */}
            <div style={{
                position: 'fixed',
                bottom: 0, left: 0,
                height: 3,
                background: '#1D9E75',
                animation: 'loadBar 1.8s ease-in-out infinite',
            }} />

            <style>{`
                @keyframes ldPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:0.88} }
            `}</style>
        </div>
    );
}
