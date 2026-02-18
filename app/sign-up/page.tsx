'use client';

import Link from 'next/link';
import styles from './styles.module.css';
import { Mail, User, Lock, Briefcase, Phone } from 'lucide-react';

const SignUpPage = () => {
    return (
        <div className={styles.signupContainer}>  {/* غيرناها */}
            <h2 className={styles.formTitle}>Create Account</h2>

            <form className={styles.signupForm}>  {/* غيرناها */}
                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>First Name *</label>
                    <input
                        type="text"
                        className={styles.inputField}
                        required
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Last Name *</label>
                    <input
                        type="text"
                        className={styles.inputField}
                        required
                    />
                    <User />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Email Address*</label>
                    <input
                        type="email"
                        className={styles.inputField}
                        required
                    />
                    <Mail />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Phone Number*</label>
                    <input
                        type="tel"
                        className={styles.inputField}
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit phone number"
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>ID Number*</label>
                    <input
                        type="text"
                        className={styles.inputField}
                        required
                        pattern="[0-9]{10}"
                        title="Please enter a ID number"
                    />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Job Title*</label>
                    <input
                        type="text"
                        className={styles.inputField}
                        required
                    />
                    <User />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Password*</label>
                    <input
                        type="password"
                        className={styles.inputField}
                        required
                    />
                    <Lock />
                </div>

                <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Confirm Password*</label>
                    <input
                        type="password"
                        className={styles.inputField}
                        required
                    />
                    <Lock />
                </div>

                <button type="submit" className={styles.signupButton}>  {/* غيرناها */}
                    Sign Up
                </button>
            </form>

            <p className={styles.loginText}>  {/* غيرناها من signupText */}
                Already have an account?{' '}
                <Link href="/log-in">Log in</Link>
            </p>
        </div>
    );
};

export default SignUpPage;