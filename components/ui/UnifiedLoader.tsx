'use client';

const SPIN_STYLE = `
@keyframes unifiedSpin { to { transform: rotate(360deg); } }
@keyframes ldPulse { 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(1.06);opacity:1} }
@keyframes dotBlink { 0%,100%{opacity:0.2;transform:scale(0.75)} 50%{opacity:1;transform:scale(1)} }
`;

const LogoIcon = () => (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
        <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
        <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
        <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="3.5" fill="white"/>
    </svg>
);

// Inline section loader — minimal teal spinner
export const UnifiedLoader = ({ message = 'Loading...' }: { message?: string }) => (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'200px', gap:'16px' }}>
        <style>{SPIN_STYLE}</style>
        <div style={{ width:40, height:40, border:'3px solid rgba(29,158,117,0.15)', borderTopColor:'#1D9E75', borderRadius:'50%', animation:'unifiedSpin 0.75s linear infinite' }} />
        <p style={{ color:'#64748B', fontSize:'0.875rem', fontWeight:500, margin:0 }}>{message}</p>
    </div>
);

// Full-page loader — matches app/loading.tsx design exactly
export const PageLoader = ({ message = 'Loading...' }: { message?: string }) => (
    <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,158,117,0.09) 0%, transparent 60%), #FFFFFF',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        fontFamily:'"DM Sans", sans-serif',
    }}>
        <style>{SPIN_STYLE}</style>
        {/* Hex grid background */}
        <svg style={{ position:'fixed', inset:0, width:'100%', height:'100%', opacity:0.03, pointerEvents:'none' }}>
            <defs><pattern id="plHexGrid" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#plHexGrid)"/>
        </svg>
        {/* Logo tile */}
        <div style={{ width:56, height:56, borderRadius:14, background:'linear-gradient(145deg,#1D9E75,#0D9488)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, animation:'ldPulse 2.5s ease-in-out infinite', position:'relative', zIndex:1 }}>
            <LogoIcon />
        </div>
        {/* Wordmark */}
        <div style={{ fontFamily:'"DM Serif Display",serif', fontSize:26, letterSpacing:'-0.5px', color:'#111827', marginBottom:4, position:'relative', zIndex:1 }}>
            Diagn<em style={{ fontStyle:'italic', color:'#1D9E75' }}>ovate</em>
        </div>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:'2px', textTransform:'uppercase', color:'#9CA3AF', marginBottom:24, position:'relative', zIndex:1 }}>
            {message}
        </div>
        {/* Staggered dots */}
        <div style={{ display:'flex', gap:7, alignItems:'center', position:'relative', zIndex:1 }}>
            {[0, 0.22, 0.44].map((delay, i) => (
                <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:'#1D9E75', animation:`dotBlink 1.4s ease-in-out ${delay}s infinite` }}/>
            ))}
        </div>
        {/* Progress bar */}
        <div style={{ position:'fixed', bottom:0, left:0, right:0, height:3, overflow:'hidden' }}>
            <style>{`@keyframes loadBar { 0%{left:0;width:0} 50%{left:0;width:60%} 100%{left:100%;width:0} }`}</style>
            <div style={{ position:'absolute', bottom:0, height:3, background:'linear-gradient(90deg,#1D9E75,#0D9488)', animation:'loadBar 1.8s ease-in-out infinite' }}/>
        </div>
    </div>
);

export const SkeletonLine = ({ width = '100%', height = '16px' }: { width?: string; height?: string }) => (
    <div style={{ width, height, borderRadius:6, background:'linear-gradient(90deg, #E2E8F0 25%, #F1F5F9 50%, #E2E8F0 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.5s infinite' }}>
        <style>{`@keyframes shimmer { to { background-position: -200% 0; } }`}</style>
    </div>
);