'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const testToken = `test-token-${Date.now()}`;
            const testLink = `/reset-password?token=${testToken}&email=${encodeURIComponent(email)}`;

            setMessage(`
                Reset link Has Been Sent!
                Click the button below to test the reset page
            `);

            (window as any).testResetLink = testLink;
            setLoading(false);
        }, 2000);
    };

    const openTestLink = () => {
        const link = (window as any).testResetLink;
        if (link) {
            window.open(link, '_blank');
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.forgotContainer}>
                <h2 className={styles.formTitle}>Forgot Password</h2>
                <p className={styles.subtitle}>Enter your email to reset your password</p>

                <form onSubmit={handleSubmit} className={styles.forgotForm}>
                    {error && <div className={styles.errorText}>{error}</div>}

                    {message ? (
                        <div className={styles.successBox}>
                            <div className={styles.successText}>{message}</div>
                            <button
                                type="button"
                                onClick={openTestLink}
                                className={styles.testButton}
                            >
                                Open Reset Password Page
                            </button>
                        </div>
                    ) : null}

                    <div className={styles.inputWrapper}>
                        <input
                            type="email"
                            value={email}                     // ⭐ أضف هذا
                            onChange={(e) => setEmail(e.target.value)} // ⭐ وأضف هذا
                            placeholder="Email Address"
                            className={styles.inputField}
                            required
                            disabled={loading}
                        />
                        <Mail className={styles.icon} size={20} />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className={styles.loginText}>
                        Remember your password?{' '}
                        <a onClick={() => router.push('/log-in')} className={styles.loginLink}>
                            Back to Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}