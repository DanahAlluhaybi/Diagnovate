import type { Metadata } from 'next';
import { Merriweather } from 'next/font/google';
import './globals.css';

const merriweather = Merriweather({
    subsets: ['latin'],
    weight: ['300', '400', '700', '900'],
    variable: '--font-merriweather',
});

export const metadata: Metadata = {
    title: 'Diagnovate',
    description: 'AI-powered thyroid cancer diagnostics platform',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={merriweather.variable}>
        <body>{children}</body>
        </html>
    );
}