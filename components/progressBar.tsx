'use client';

import { CheckCircle2 } from 'lucide-react';
import styles from './progress-bar.module.css';

interface Step {
    label: string;
    threshold: number;
}

interface ProgressBarProps {
    progress: number;               // 0–100
    steps?: Step[];                 // optional step pills
    label?: string;                 // top-left label (default "Processing")
    className?: string;
}

export default function ProgressBar({
                                        progress,
                                        steps,
                                        label = 'Processing',
                                        className = '',
                                    }: ProgressBarProps) {
    const stepClass = (threshold: number) => {
        if (progress >= threshold)      return styles.stepDone;
        if (progress >= threshold - 25) return styles.stepActive;
        return '';
    };

    return (
        <div className={`${styles.wrap} ${className}`}>

            {/* Top row — label + percentage */}
            <div className={styles.top}>
                <span className={styles.label}>{label}</span>
                <span className={styles.pct}>{progress}%</span>
            </div>

            {/* Track */}
            <div className={styles.track}>
                {/* Glow layer behind the bar */}
                <div className={styles.glow} style={{ width: `${progress}%` }} />
                {/* Bar */}
                <div className={styles.bar} style={{ width: `${progress}%` }} />
                {/* Tip dot */}
                {progress > 2 && progress < 100 && (
                    <div className={styles.tip} style={{ left: `${progress}%` }} />
                )}
            </div>

            {/* Step pills */}
            {steps && steps.length > 0 && (
                <div className={styles.steps}>
                    {steps.map(({ label: sl, threshold }) => (
                        <span key={sl} className={`${styles.step} ${stepClass(threshold)}`}>
              {progress >= threshold && (
                  <CheckCircle2
                      size={9}
                      style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }}
                  />
              )}
                            {sl}
            </span>
                    ))}
                </div>
            )}
        </div>
    );
}