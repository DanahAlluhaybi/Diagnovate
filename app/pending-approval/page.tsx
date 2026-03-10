'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

// No more <style> block — all classes live in auth-card.css + globals.css

export default function PendingApprovalPage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
      <div className="acard-page">

        {/* Ambient glows */}
        <span className="acard-page__glow acard-page__glow--teal" />
        <span className="acard-page__glow acard-page__glow--amber" />

        {/* ── Navbar ── */}
        <nav className="acard-nav">
          <Link href="/" className="acard-nav__logo">
            <div className="acard-nav__mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white" />
              </svg>
              <span className="acard-nav__mark-ring" />
            </div>
            <span className="acard-nav__word">Diagno<span>vate</span></span>
          </Link>
          <div className="acard-nav__links">
            <Link href="/"       className="acard-nav__link">Home</Link>
            <Link href="/about"  className="acard-nav__link">About</Link>
            <Link href="/contact"className="acard-nav__link">Contact</Link>
            <Link href="/log-in" className="acard-nav__cta">Sign In <ArrowRight size={14} /></Link>
          </div>
        </nav>

        {/* ── Card ── */}
        <div className="acard-wrap">
          <div
              className="acard"
              style={visible
                  ? { opacity: 1, transform: 'none', transition: 'all .6s cubic-bezier(.16,1,.3,1)' }
                  : { opacity: 0, transform: 'translateY(20px) scale(.98)' }
              }
          >
            {/* Logo */}
            <Link href="/" className="acard-logo">
              <div className="acard-logo__mark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3C10.5 3 9 4 9 6V9H6C4 9 3 10.5 3 12C3 13.5 4 15 6 15H9V18C9 20 10.5 21 12 21C13.5 21 15 20 15 18V15H18C20 15 21 13.5 21 12C21 10.5 20 9 18 9H15V6C15 4 13.5 3 12 3Z" fill="white" />
                </svg>
              </div>
              <span className="acard-logo__word">Diagno<span>vate</span></span>
            </Link>

            {/* Status badge */}
            <div className="acard-status acard-status--amber">
              <span className="acard-status__dot" />
              Pending Approval
            </div>

            {/* Icon */}
            <div className="acard-icon acard-icon--amber">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>

            {/* Progress path */}
            <div className="acard-path">
              <div className="acard-path__step">
                <div className="acard-path__dot acard-path__dot--done">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="acard-path__label acard-path__label--done">Registered</span>
              </div>
              <div className="acard-path__line acard-path__line--done" />
              <div className="acard-path__step">
                <div className="acard-path__dot acard-path__dot--done">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="acard-path__label acard-path__label--done">Email Verified</span>
              </div>
              <div className="acard-path__line acard-path__line--done" />
              <div className="acard-path__step">
                <div className="acard-path__dot acard-path__dot--wait">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                </div>
                <span className="acard-path__label acard-path__label--wait">Admin Review</span>
              </div>
              <div className="acard-path__line acard-path__line--idle" />
              <div className="acard-path__step">
                <div className="acard-path__dot acard-path__dot--idle">4</div>
                <span className="acard-path__label acard-path__label--idle">Access Granted</span>
              </div>
            </div>

            <h2 className="acard-h2">Account submitted.<br />Thank you!</h2>
            <p className="acard-p">
              Your account request has been received.<br />
              <strong>An admin will review and approve it shortly.</strong>
            </p>

            {/* Warning info box */}
            <div className="acard-info acard-info--amber">
              <svg className="acard-info__icon" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="acard-info__text">
                <strong>Pending Admin Approval</strong>
                You won't be able to log in until your account is approved. You'll receive an email once confirmed.
              </div>
            </div>

            {/* Next steps */}
            <div className="acard-steps">
              {[
                'Admin reviews your credentials and specialty',
                'You receive an approval email notification',
                'Sign in and access your clinical dashboard',
              ].map((text, i) => (
                  <div key={i} className="acard-step">
                    <div className="acard-step__num">{i + 1}</div>
                    <span className="acard-step__text">{text}</span>
                  </div>
              ))}
            </div>

            <Link href="/" className="acard-btn acard-btn--ghost acard-btn--full">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
  );
}