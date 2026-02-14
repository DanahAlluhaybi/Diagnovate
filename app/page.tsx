'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Scan,
  Brain,
  GitBranch,
  MessageSquare,
  Layers
} from 'lucide-react';
import styles from './page.module.css';

export default function HomePage() {
  const features = [
    {
      id: 1,
      category: "Automated Medical Image Enhancement",
      icon: <Scan className="w-6 h-6" />,
      iconClass: "featureIconBlue",
      description: "Transform blurry ultrasound images into crystal-clear diagnostic quality in real-time.",
      points: [
        "Enhances contrast to make thyroid nodules clearly visible",
        "Removes noise and graininess from ultrasound scans",
        "Sharpens edges for precise boundary detection",
        "Shows before/after comparison instantly",
        "Alerts you if image quality needs improvement"
      ]
    },
    {
      id: 2,
      category: "Context-Aware Diagnostic Recommendations",
      icon: <Brain className="w-6 h-6" />,
      iconClass: "featureIconPurple",
      description: "AI that thinks like a pathologist—analyzing images, patient history, and guidelines together.",
      points: [
        "Suggests next steps based on patient's specific case",
        "Follows ICCR, WHO, and hospital protocols automatically",
        "Explains why each recommendation is made",
        "Especially helpful for unclear cases (Bethesda III)"
      ]
    },
    {
      id: 3,
      category: "Model Selection & Execution Control",
      icon: <GitBranch className="w-6 h-6" />,
      iconClass: "featureIconGreen",
      description: "Choose your AI assistant—let it work automatically or pick specific models yourself.",
      points: [
        "Auto-selects the right AI models for your image type",
        "Or manually choose which algorithms to run",
        "Remembers your preferences for next time",
        "Runs multiple models at once for better accuracy",
        "Never runs a model on incompatible data"
      ]
    },
    {
      id: 4,
      category: "Structured Clinician Feedback",
      icon: <MessageSquare className="w-6 h-6" />,
      iconClass: "featureIconOrange",
      description: "Your expertise makes our AI smarter—flag issues and help us improve.",
      points: [
        "One-click flagging when AI gets it wrong",
        "Choose from common issue categories",
        "Add notes to explain complex cases",
        "Every feedback helps retrain better models"
      ]
    },
    {
      id: 5,
      category: "Result Aggregation & Presentation",
      icon: <Layers className="w-6 h-6" />,
      iconClass: "featureIconRed",
      description: "Never miss a diagnosis—see what multiple AI models agree on at a glance.",
      points: [
        "Combines results from all AI models automatically",
        "Shows consensus score when models agree",
        "Still lets you see each model's individual opinion",
        "Know exactly which data each model used"
      ]
    }
  ];

  return (
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.headerStrip}>
          <header className={styles.header}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>🩺</span>
              <span className={styles.logoText}>
              Diagno<span className={styles.logoHighlight}>vate</span>
            </span>
            </div>

            <nav className={styles.nav}>
              <button className={`${styles.navBtn} ${styles.navActive}`}>Home</button>
              <button className={styles.navBtn}>About</button>
              <Link href="/contact" className={styles.navBtn}>Contact</Link>
            </nav>
          </header>
        </div>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Hero Section */}
          <div className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Welcome to Diagnovate
              </h1>

              <h2 className={styles.heroSubtitle}>
                Smarter thyroid cancer diagnosis for faster, safer decisions.
              </h2>

              <p className={styles.heroDescription}>
                Web platform for digital pathology and radiology for thyroid cancer diagnosis using artificial intelligence
              </p>

              <div className={styles.heroButtons}>
                {/* ✅ Login button - يروح لصفحة log-in */}
                <Link href="/log-in">
                  <button className={styles.primaryBtn}>
                    Login & Try
                  </button>
                </Link>

                {/* ✅ Contact Us button - يروح لصفحة contact */}
                <Link href="/contact">
                  <button className={styles.secondaryBtn}>
                    Contact Us
                  </button>
                </Link>
              </div>
            </div>

            <div className={styles.heroImageWrapper}>
              <Image
                  src="/scan.png"
                  alt="AI Medical Imaging"
                  width={500}
                  height={350}
                  className={styles.heroImage}
                  priority
              />
            </div>
          </div>

          {/* Features Section */}
          <div className={styles.featuresSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                AI-Powered Features
              </h2>
              <p className={styles.sectionSubtitle}>
                Five integrated modules designed specifically for thyroid cancer diagnostics
              </p>
            </div>

            <div className={styles.featuresGrid}>
              {features.map((feature) => (
                  <div key={feature.id} className={styles.featureCard}>
                    <div className={styles.featureHeader}>
                      <div className={`${styles.featureIcon} ${styles[feature.iconClass]}`}>
                        {feature.icon}
                      </div>
                      <h3 className={styles.featureTitle}>{feature.category}</h3>
                    </div>

                    <p className={styles.featureDescription}>
                      {feature.description}
                    </p>

                    <div className={styles.featurePoints}>
                      {feature.points.map((point, idx) => (
                          <div key={idx} className={styles.featurePoint}>
                            <span className={styles.pointBullet}>•</span>
                            <span className={styles.pointText}>{point}</span>
                          </div>
                      ))}
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className={styles.ctaSection}>
            <h2 className={styles.ctaTitle}>
              Ready to transform your thyroid diagnostics?
            </h2>
            <p className={styles.ctaText}>
              Join leading pathology labs using Diagnovate AI platform.
            </p>
            <div className={styles.ctaButtons}>
              <button className={styles.primaryBtn}>
                Start Free Trial
              </button>
              <button className={styles.secondaryBtn}>
                Schedule Demo
              </button>
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