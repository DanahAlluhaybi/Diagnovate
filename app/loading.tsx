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
            {/* Hex grid background */}
            <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18, pointerEvents: 'none' }}
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <pattern id="hexLoad" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                        <polygon
                            points="28,2 52,14 52,38 28,50 4,38 4,14"
                            fill="none" stroke="#1D9E75" strokeWidth="0.8"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexLoad)" />
            </svg>

            {/* Ambient glow */}
            <div style={{
                position: 'absolute', width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(29,158,117,0.12) 0%, transparent 65%)',
                top: -150, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none',
            }} />

            {/* Animated hex logo mark */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
                {/* Outer pulsing ring */}
                <svg
                    width="96" height="108"
                    viewBox="0 0 96 108"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ animation: 'hexPulse 2.5s ease-in-out infinite' }}
                >
                    <polygon
                        points="48,4 90,26 90,80 48,104 6,80 6,26"
                        fill="rgba(29,158,117,0.08)"
                        stroke="#1D9E75"
                        strokeWidth="1.5"
                    />
                    <polygon
                        points="48,16 78,32 78,72 48,88 18,72 18,32"
                        fill="rgba(29,158,117,0.05)"
                        stroke="#1D9E75"
                        strokeWidth="1"
                        strokeDasharray="4 3"
                        opacity="0.6"
                    />
                </svg>
                {/* Inner rotating ring */}
                <svg
                    width="96" height="108"
                    viewBox="0 0 96 108"
                    fill="none"
                    style={{
                        position: 'absolute', top: 0, left: 0,
                        animation: 'hexRotate 3s linear infinite',
                        transformOrigin: '48px 54px',
                    }}
                >
                    <circle cx="48" cy="4" r="3.5" fill="#1D9E75" opacity="0.7" />
                    <circle cx="90" cy="26" r="3.5" fill="#1D9E75" opacity="0.5" />
                    <circle cx="90" cy="80" r="3.5" fill="#1D9E75" opacity="0.3" />
                </svg>
                {/* Center mark */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
                    boxShadow: '0 0 0 8px rgba(29,158,117,0.12), 0 8px 24px rgba(29,158,117,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white" />
                    </svg>
                </div>
            </div>

            {/* Wordmark */}
            <div style={{
                fontFamily: 'var(--font-display, "DM Serif Display", serif)',
                fontSize: 28,
                letterSpacing: '-0.5px',
                color: '#0D1B17',
                marginBottom: 6,
            }}>
                Diagn<em style={{ fontStyle: 'italic', color: '#1D9E75' }}>ovate</em>
            </div>

            <div style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: '#8A9E97',
                marginBottom: 32,
            }}>
                Medical AI Diagnostics
            </div>

            {/* Staggered loading dots */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 28 }}>
                {[0, 0.22, 0.44].map((delay, i) => (
                    <div key={i} style={{
                        width: 9, height: 9, borderRadius: '50%',
                        background: '#1D9E75',
                        animation: `dotBlink 1.4s ease-in-out ${delay}s infinite`,
                    }} />
                ))}
            </div>

            <style>{`
                @keyframes hexPulse { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.06)} }
                @keyframes hexRotate { to { transform: rotate(360deg); } }
                @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.18} }
            `}</style>
        </div>
    );
}
