import Link from 'next/link';
import styles from './styles.module.css';

export default function AboutPage() {
  const offers = [
    {
      title: 'AI Diagnosis',
      desc: 'We support clinicians with intelligent analysis of thyroid ultrasound images and structured risk scoring.',
    },
    {
      title: 'Doctor Approval Flow',
      desc: 'Secure role-based onboarding, with admin review to ensure verified clinical access.',
    },
    {
      title: 'Reports & Insights',
      desc: 'Generate clear summaries and organize cases to support decisions and documentation.',
    },
    {
      title: 'Patient Impact',
      desc: 'Our goal is to improve early detection and streamline the clinical workflow.',
    },
  ];

  return (
    <div className={styles.container}>
      {/* Header Strip (Same as Contact) */}
      <div className={styles.headerStrip}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🩺</span>
            <span className={styles.logoText}>
              Diagno<span className={styles.logoHighlight}>vate</span>
            </span>
          </div>

          <nav className={styles.nav}>
            <Link href="/" className={styles.navBtn}>Home</Link>
            <Link href="/about" className={`${styles.navBtn} ${styles.navActive}`}>About</Link>
            <Link href="/contact" className={styles.navBtn}>Contact</Link>
          </nav>
        </header>
      </div>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.card}>

          {/* Oval Section (Same style as Contact) */}
          <div className={styles.ovalWrapper}>
            <div className={styles.ovalShape}>
              <h1 className={styles.ovalMainTitle}>About Diagnovate</h1>

              <div className={styles.ovalTextContent}>
                <p className={styles.ovalParagraph}>
                  Diagnovate is an AI-powered platform designed to support thyroid cancer diagnostics.
                </p>

                <p className={styles.ovalParagraph}>
                  We aim to help clinicians by improving image clarity, organizing cases, and providing structured scoring to support clinical decisions.
                </p>

                <p className={styles.ovalParagraph}>
                  The system includes role-based access (Admin / Doctor) with approval workflows for secure onboarding.
                </p>

                <p className={styles.ovalFinalParagraph}>
                  Our mission is to combine advanced AI with a clean clinical workflow to improve outcomes.
                </p>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <h2 className={styles.sectionTitle}>What We Offer</h2>

          <div className={styles.offerGrid}>
            {offers.map((item, idx) => (
              <div key={idx} className={styles.offerCard}>
                <h3 className={styles.offerTitle}>{item.title}</h3>
                <p className={styles.offerDesc}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className={styles.cta}>
            <p className={styles.ctaText}>Want to know more or collaborate with us?</p>
            <Link href="/contact" className={styles.ctaBtn}>Contact the Team</Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Diagnovate. Advanced AI for thyroid cancer diagnostics.</p>
      </footer>
    </div>
  );
}
