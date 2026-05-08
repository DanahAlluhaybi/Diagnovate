// Root layout — sets global font, metadata, and wraps all pages in the HTML shell.
import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const dmSerif = DM_Serif_Display({
    subsets: ['latin'],
    weight: ['400'],
    style: ['normal', 'italic'],
    variable: '--font-dm-serif',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-dm-sans',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Diagnovate',
    description: 'AI-powered thyroid cancer diagnostics platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${dmSerif.variable} ${dmSans.variable}`} style={{
            '--font-display': 'var(--font-dm-serif)',
            '--font-body': 'var(--font-dm-sans)',
        } as React.CSSProperties}>
        <body style={{ fontFamily: 'var(--font-dm-sans, "Plus Jakarta Sans", sans-serif)', margin: 0 }}>
        <div className="pageEnter">{children}</div>
        </body>
        </html>
    );
}
