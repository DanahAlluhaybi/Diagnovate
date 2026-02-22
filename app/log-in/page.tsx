'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/api';
import { Mail, Lock } from 'lucide-react';
import styles from './styles.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await auth.login({ email, password });

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.doctor));

            router.push('/dashboard');

        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.loginContainer}>
                <h1 className={styles.formTitle}>Login to Diagnovate</h1>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <form className={styles.loginForm} onSubmit={handleSubmit}>
                    <div className={styles.inputWrapper}>
                        <input
                            type="email"
                            className={styles.inputField}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            required
                        />
                        <Mail className={styles.icon} size={18} />
                    </div>

                    <div className={styles.inputWrapper}>
                        <input
                            type="password"
                            className={styles.inputField}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <Lock className={styles.icon} size={18} />
                    </div>

                    <button
                        type="submit"
                        className={styles.loginButton}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                </form>

                <p className={styles.signupText}>
                    Don't have an account? <a href="/sign-up">Sign up</a>
                </p>
            </div>
        </div>
    );
}
