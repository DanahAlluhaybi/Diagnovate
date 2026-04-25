'use client';

import { useRef, useState } from 'react';

export default function DateInput({ value = '', onChange, className = '' }) {
    const parse = (iso) => {
        if (!iso) return { d: '', m: '', y: '' };
        const [y, mo, da] = iso.split('-');
        return { d: da || '', m: mo || '', y: y || '' };
    };

    const [parts, setParts] = useState(() => parse(value));
    const mRef = useRef(null);
    const yRef = useRef(null);
    const dRef = useRef(null);

    const emit = (next) => {
        if (next.d.length === 2 && next.m.length === 2 && next.y.length === 4) {
            onChange?.(`${next.y}-${next.m.padStart(2,'0')}-${next.d.padStart(2,'0')}`);
        } else {
            onChange?.('');
        }
    };

    const handleD = (e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 2);
        const next = { ...parts, d: v };
        setParts(next); emit(next);
        if (v.length === 2) mRef.current?.focus();
    };
    const handleM = (e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 2);
        const next = { ...parts, m: v };
        setParts(next); emit(next);
        if (v.length === 2) yRef.current?.focus();
    };
    const handleY = (e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 4);
        const next = { ...parts, y: v };
        setParts(next); emit(next);
    };

    const seg = {
        border: 'none', outline: 'none', background: 'transparent',
        fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit',
        width: 28, textAlign: 'center', padding: 0,
    };
    const sep = {
        color: 'var(--muted, #94a3b8)', fontWeight: 700,
        fontSize: 15, userSelect: 'none', padding: '0 2px',
    };

    return (
        <div className={className} style={{ display: 'flex', alignItems: 'center' }}>
            <input ref={dRef} type="text" inputMode="numeric" placeholder="DD"
                   value={parts.d} onChange={handleD} maxLength={2} style={seg} />
            <span style={sep}>/</span>
            <input ref={mRef} type="text" inputMode="numeric" placeholder="MM"
                   value={parts.m} onChange={handleM} maxLength={2} style={seg}
                   onKeyDown={e => e.key === 'Backspace' && parts.m === '' && dRef.current?.focus()} />
            <span style={sep}>/</span>
            <input ref={yRef} type="text" inputMode="numeric" placeholder="YYYY"
                   value={parts.y} onChange={handleY} maxLength={4} style={{ ...seg, width: 52 }}
                   onKeyDown={e => e.key === 'Backspace' && parts.y === '' && mRef.current?.focus()} />
        </div>
    );
}