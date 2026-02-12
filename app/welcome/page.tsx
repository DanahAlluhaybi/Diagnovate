
import Image from 'next/image';
import styles from './styles.module.css';

export default function WelcomePage() {
    return (
        <div className={styles.container}>
            <div className={styles.headerStrip}>
                <header className={styles.header}>
                    <div className={styles.logo}>
                        <span className={styles.logoIcon}>🩺</span>
                        <span className={styles.logoText}>Diagno<span className={styles.logoHighlight}>vate</span></span>
                    </div>

                    <nav className={styles.nav}>
                        <button className={styles.navBtn}>Home</button>
                        <button className={styles.navBtn}>Features</button>
                        <button className={styles.navBtn}>About</button>
                    </nav>
                </header>
            </div>

            <main className={styles.main}>
                <div className={styles.contentWithImage}>
                    <div className={styles.textSection}>
                        <h1 className={styles.title}>
                            Welcome to Diagnovate
                        </h1>

                        <h2 className={styles.subtitleLarge}>
                            Smarter thyroid cancer diagnosis for faster, safer decisions.
                        </h2>

                        <p className={styles.subtitle}>
                            Web platform for digital pathology and radiology for thyroid cancer diagnosis using artificial intelligence
                        </p>

                        <div className={styles.buttons}>
                            <button className={styles.primaryBtn}>
                                Login & Try
                            </button>
                            <button className={styles.secondaryBtn}>
                                Contact Us
                            </button>
                        </div>
                    </div>


                    <div className={styles.imageSection}>
                        <Image
                            src="/welcome.jpg"
                            alt="Ai image"
                            width={500}
                            height={350}
                            className={styles.heroImage}
                            priority
                        />
                    </div>
                </div>
            </main>


            <footer className={styles.footer}>
                <p>© 2026 Diagnovate..</p>
            </footer>
        </div>
    );
}