'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './styles.module.css';
import {Lock, Mail} from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('Invalid reset link');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            // محاكاة API
            await new Promise(resolve => setTimeout(resolve, 1500));

            setMessage('Password reset successfully! Redirecting to login...');

            setTimeout(() => {
                router.push('/log-in');
            }, 2000);

        } catch (err) {
            setError('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        router.push('/log-in');
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.resetContainer}>
                <h2 className={styles.formTitle}>Set New Password</h2>

                {!token ? (
                    <div className={styles.errorCard}>
                        <p className={styles.errorText}>Invalid or expired reset link</p>
                        <button
                            onClick={handleBackToLogin}
                            className={styles.resetButton}
                        >
                            Back to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.resetForm}>
                        {error && <div className={styles.errorText}>{error}</div>}
                        {message && <div className={styles.successText}>{message}</div>}

                        <div className={styles.inputWrapper}>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="New password"
                                className={styles.inputField}
                                required
                                minLength={8}
                                disabled={loading}
                            />
                            <Lock className={styles.icon} size={20} />

                        </div>

                        <div className={styles.inputWrapper}>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                className={styles.inputField}
                                required
                                minLength={8}
                                disabled={loading}
                            />
                            <Mail className={styles.icon} size={20} />
                        </div>

                        <button
                            type="submit"
                            className={styles.resetButton}
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <div className={styles.loginText}>
                            <a onClick={handleBackToLogin} className={styles.loginLink}>
                                Back to Login
                            </a>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}