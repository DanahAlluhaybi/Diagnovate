'use client';

import Link from 'next/link';
import styles from './styles.module.css';
import { Mail, Lock } from 'lucide-react';

const LoginPage = () => {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.loginContainer}>
                <h2 className={styles.formTitle}>Login</h2>

                <form className={styles.loginForm}>
                    {/* Email */}
                    <div className={styles.inputWrapper}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className={styles.inputField}
                            required
                        />
                        <Mail className={styles.icon} size={20} />
                    </div>

                    {/* Password */}
                    <div className={styles.inputWrapper}>
                        <input
                            type="password"
                            placeholder="Password"
                            className={styles.inputField}
                            required
                        />
                        <Lock className={styles.icon} size={20} />
                    </div>


                    <div className={styles.forgetPassLink}>
                        <a href="/forgot-password">Forgot password?</a>
                    </div>

                    <button type="submit" className={styles.loginButton}>
                        Log In
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
