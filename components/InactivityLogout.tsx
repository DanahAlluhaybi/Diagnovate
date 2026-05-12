'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes (FR2.6)

const PUBLIC_PATHS = ['/', '/log-in', '/sign-up', '/forgot-password',
    '/reset-password', '/email-verification', '/phone-verification',
    '/pending-approval', '/role', '/about', '/contact'];

export default function InactivityLogout() {
    const router   = useRouter();
    const pathname = usePathname();
    const timer    = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
        const token    = localStorage.getItem('token') || localStorage.getItem('admin_token');

        // only run for authenticated pages
        if (isPublic || !token) return;

        const isAdmin = !!localStorage.getItem('admin_token');

        const logout = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            router.push(`/log-in?role=${isAdmin ? 'admin' : 'doctor'}&reason=inactivity`);
        };

        const reset = () => {
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(logout, INACTIVITY_MS);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
        events.forEach(e => window.addEventListener(e, reset, { passive: true }));
        reset();

        return () => {
            if (timer.current) clearTimeout(timer.current);
            events.forEach(e => window.removeEventListener(e, reset));
        };
    }, [pathname, router]);

    return null;
}