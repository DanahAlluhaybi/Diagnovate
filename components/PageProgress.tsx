'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageProgress() {
    const pathname = usePathname();
    const [width,  setWidth]  = useState(0);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        setFading(false);
        setWidth(0);
        const t1 = setTimeout(() => setWidth(82),  20);
        const t2 = setTimeout(() => setWidth(100), 380);
        const t3 = setTimeout(() => setFading(true), 440);
        const t4 = setTimeout(() => setWidth(0), 700);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, [pathname]);

    return (
        <>
            <style>{`
                .pg-bar {
                    position: fixed; top: 0; left: 0; height: 3px; z-index: 10000;
                    background: linear-gradient(90deg, #0D9488, #0891B2);
                    border-radius: 0 2px 2px 0;
                    box-shadow: 0 0 10px rgba(13,148,136,0.55);
                    pointer-events: none;
                    transition: width 0.38s ease-out;
                }
                .pg-bar.fading {
                    opacity: 0;
                    transition: width 0.2s ease-out, opacity 0.25s ease;
                }
            `}</style>
            <div className={`pg-bar${fading ? ' fading' : ''}`} style={{ width: `${width}%` }} />
        </>
    );
}
