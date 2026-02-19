// app/reset-password/page.js
'use client';

import Link from 'next/link';
import styles from './styles.module.css';
import { Clock } from 'lucide-react';

const ResetPasswordPage = () => {
    return (
        <div className={styles.container}>



            <h1 className={styles.title}>How do you want to reset your Password?</h1>

            <p className={styles.subtitle}>
                We found the following information associated with your account.
            </p>

            <div className={styles.optionsContainer}>

                <div className={styles.option}>
                    <input
                        type="radio"
                        id="email"
                        name="resetMethod"
                        className={styles.radio}
                        defaultChecked
                    />
                    <label htmlFor="email" className={styles.optionLabel}>
                        <span className={styles.optionText}>Email a link to ********@g********</span>
                    </label>
                </div>


                <div className={styles.option}>
                    <input
                        type="radio"
                        id="phone"
                        name="resetMethod"
                        className={styles.radio}
                    />
                    <label htmlFor="phone" className={styles.optionLabel}>
                        <span className={styles.optionText}>Send a code to a phone number </span>
                    </label>
                </div>
            </div>


            <button className={styles.sendButton}>
                Send
            </button>


        </div>
    );
};

export default ResetPasswordPage;