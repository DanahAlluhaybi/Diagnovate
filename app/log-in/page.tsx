'use client';

import Link from 'next/link';
import styles from './styles.module.css';
import { Mail, Lock } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save to localStorage
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect to dashboard
            router.push('/dashboard');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.loginContainer}>
                <h2 className={styles.formTitle}>Login</h2>

                {error && (
                    <div style={{
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className={styles.inputField}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <Mail className={styles.icon} size={20} />
                    </div>

                    <div className={styles.inputWrapper}>
                        <input
                            type="password"
                            placeholder="Password"
                            className={styles.inputField}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <Lock className={styles.icon} size={20} />
                    </div>

                    <div className={styles.forgetPassLink}>
                        <a href="/forgot-password">Forgot password?</a>
                    </div>

                    <button
                        type="submit"
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Log In'}
                    </button>
                </form>

                <p className={styles.signupText}>
                    Don&apos;t have an account?{' '}
                    <Link href="/sign-up">Sign up now</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;