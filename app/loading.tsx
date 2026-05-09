export default function Loading() {
    return (
        <>
            <style>{`
                @keyframes ldPulse { 0%,100%{transform:scale(1);box-shadow:0 8px 28px rgba(29,158,117,0.35)} 50%{transform:scale(1.07);box-shadow:0 12px 36px rgba(29,158,117,0.55)} }
                @keyframes dotBlink { 0%,100%{opacity:0.2;transform:scale(0.75)} 50%{opacity:1;transform:scale(1)} }
                @keyframes loadBar { 0%{left:0;width:0} 50%{left:0;width:60%} 100%{left:100%;width:0} }
            `}</style>
            <div style={{
                minHeight: '100vh',
                background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(29,158,117,0.09) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 90% 90%, rgba(8,80,65,0.05) 0%, transparent 50%), #FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: '"DM Sans", sans-serif',
            }}>
                {/* Hex grid */}
                <svg style={{ position:'fixed',inset:0,width:'100%',height:'100%',opacity:0.03,pointerEvents:'none' }} xmlns="http://www.w3.org/2000/svg">
                    <defs><pattern id="ldHexGrid" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
                        <polygon points="28,2 52,14 52,38 28,50 4,38 4,14" fill="none" stroke="#1D9E75" strokeWidth="1"/>
                    </pattern></defs>
                    <rect width="100%" height="100%" fill="url(#ldHexGrid)"/>
                </svg>

                {/* Hex logo mark */}
                <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: 'linear-gradient(145deg,#1D9E75,#0D9488)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 22,
                    animation: 'ldPulse 2.5s ease-in-out infinite',
                    position: 'relative', zIndex: 1,
                }}>
                    <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
                        <polygon points="20,2 36,11 36,29 20,38 4,29 4,11" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5"/>
                        <line x1="20" y1="10" x2="20" y2="30" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                        <line x1="10" y1="20" x2="30" y2="20" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
                        <circle cx="20" cy="20" r="3.5" fill="white"/>
                    </svg>
                </div>

                {/* Wordmark */}
                <div style={{ fontFamily:'"DM Serif Display",serif', fontSize:28, letterSpacing:'-0.5px', color:'#111827', marginBottom:6, position:'relative',zIndex:1 }}>
                    Diagn<em style={{ fontStyle:'italic', color:'#1D9E75' }}>ovate</em>
                </div>

                {/* Tagline */}
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'2px', textTransform:'uppercase', color:'#9CA3AF', marginBottom:28, position:'relative',zIndex:1 }}>
                    Clinical AI Platform
                </div>

                {/* Staggered dots */}
                <div style={{ display:'flex', gap:7, alignItems:'center', position:'relative',zIndex:1 }}>
                    {[0, 0.22, 0.44].map((delay, i) => (
                        <div key={i} style={{
                            width:8, height:8, borderRadius:'50%',
                            background:'#1D9E75',
                            animation:`dotBlink 1.4s ease-in-out ${delay}s infinite`,
                        }}/>
                    ))}
                </div>

                {/* Fixed bottom progress bar */}
                <div style={{ position:'fixed', bottom:0, left:0, right:0, height:3, overflow:'hidden' }}>
                    <div style={{
                        position:'absolute', bottom:0, height:3,
                        background:'linear-gradient(90deg,#1D9E75,#0D9488)',
                        animation:'loadBar 1.8s ease-in-out infinite',
                    }}/>
                </div>
            </div>
        </>
    );
}
