
import Link from 'next/link';
import Image from 'next/image';
import styles from './styles.module.css';

export default function ContactPage() {
    const team = [
        {
            initials: "DA",
            name: "Danah Alluhyabi",
            role: "Business Development",
            email: "x.x@gmail.com",
            region: "Saudi Arabia"
        },
        {
            initials: "RA",
            name: "Renad Almazroui",
            role: "Validation Lead",
            email: "renad@gmail.com",
            region: "Saudi Arabia"
        },
        {
            initials: "JA",
            name: "Jana Alghamdi",
            role: "Technical Lead",
            email: "r.r@gmail.com",
            region: "Saudi Arabia"
        },
        {
            initials: "RA",
            name: "Reena Aljahdali",
            role: "Technical Lead",
            email: "r.r@diagnovate.com",
            region: "Saudi Arabia"
        }
    ];

    return (
        <div className={styles.container}>
            {/* Header Strip */}
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
                        <Link href="/about" className={styles.navBtn}>About</Link>
                        <Link href="/contact" className={`${styles.navBtn} ${styles.navActive}`}>Contact</Link>
                    </nav>
                </header>
            </div>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.card}>



                    <div className={styles.ovalWrapper}>
                        <div className={styles.ovalShape}>
                            <h1 className={styles.ovalMainTitle}>Diagnovate Team</h1>

                            <div className={styles.ovalTextContent}>
                                <p className={styles.ovalParagraph}>
                                    Are you curious about how our AI solutions can support you or your organization?
                                </p>

                                <p className={styles.ovalParagraph}>
                                    Do you have questions about intelligent medical image analysis?
                                </p>

                                <p className={styles.ovalParagraph}>
                                    Interested in our platform or looking to integrate advanced AI tools into your workflow?
                                </p>

                                <p className={styles.ovalFinalParagraph}>
                                    Whether you’re exploring collaboration opportunities or seeking more information, <span className={styles.ovalHighlight}>we’d love to hear from you.</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className={styles.teamSection}>
                        <h2 className={styles.teamTitle}>Our Team</h2>
                        <div className={styles.teamGrid}>
                            {team.map((member, index) => (
                                <div key={index} className={styles.teamCard}>
                                    <div className={styles.avatar}>
                                        <div className={styles.avatarPlaceholder}>
                                            {member.initials}
                                        </div>
                                    </div>
                                    <h3 className={styles.memberName}>{member.name}</h3>
                                    <p className={styles.memberRole}>{member.role}</p>
                                    <p className={styles.memberRegion}>{member.region}</p>
                                    <a
                                        href={`mailto:${member.email}`}
                                        className={styles.emailLink}
                                    >
                                        📧 {member.email}
                                    </a>
                                </div>
                            ))}
                        </div>
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