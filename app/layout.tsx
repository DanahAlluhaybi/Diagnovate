import type { Metadata } from 'next';
import './globals.css';     // ✅ استيراد CSS العام

export const metadata: Metadata = {
    title: 'Diagnovate - AI for Thyroid Diagnostics',
    description: 'Web platform for digital pathology and radiology',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}