'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './styles.module.css';
import { Mail, User, Lock } from 'lucide-react';

const SignUpPage = () => {
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        idNumber: '',
        specialty: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    email: formData.email,
                    password: formData.password,
                    specialty: formData.specialty,
                    phone: formData.phone
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.doctor));
                router.push('/dashboard');
            } else {
                setError(data.error || 'Sign up failed');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.signupContainer}>
            <h2 className={styles.formTitle}>Create Account</h2>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <form className={styles.signupForm} onSubmit={handleSubmit}>
                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>First Name *</label>
                    <input
                        type="text"
                        name="firstName"
                        className={styles.inputField}
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Last Name *</label>
                    <input
                        type="text"
                        name="lastName"
                        className={styles.inputField}
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                    <User />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Email Address *</label>
                    <input
                        type="email"
                        name="email"
                        className={styles.inputField}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Mail />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Phone Number *</label>
                    <input
                        type="tel"
                        name="phone"
                        className={styles.inputField}
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>ID Number *</label>
                    <input
                        type="text"
                        name="idNumber"
                        className={styles.inputField}
                        value={formData.idNumber}
                        onChange={handleChange}
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid ID number"
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Job Title *</label>
                    <input
                        type="text"
                        name="specialty"
                        className={styles.inputField}
                        value={formData.specialty}
                        onChange={handleChange}
                        required
                    />
                    <User />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Password *</label>
                    <input
                        type="password"
                        name="password"
                        className={styles.inputField}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Lock />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Confirm Password *</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className={styles.inputField}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <Lock />
                </div>

                <button
                    type="submit"
                    className={styles.signupButton}
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <p className={styles.loginText}>
                Already have an account?{' '}
                <Link href="/log-in">Log in</Link>
            </p>
        </div>
    );
};

export default SignUpPage;
