// app/email-verification/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './styles.module.css';

const EmailVerificationPage = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Verification code:', code.join(''));
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Email Verification</h1>
            <p className={styles.subtitle}>
                Please enter the 6-digit verification code<br />
                that was sent to your email
            </p>

            <form onSubmit={handleSubmit}>
                <div className={styles.codeContainer}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                                const newCode = [...code];
                                newCode[index] = e.target.value;
                                setCode(newCode);
                            }}
                            className={styles.codeBox}
                        />
                    ))}
                </div>

                <button type="submit" className={styles.continueButton}>
                    Continue
                </button>
            </form>

            <p className={styles.resendLink}>
                Didn't receive an email?<Link href="/resend">Resend</Link>
            </p>
        </div>
    );
};

export default EmailVerificationPage;