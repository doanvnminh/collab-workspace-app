import { Link } from "react-router-dom";
import { FileText, Users, Zap } from "lucide-react";
import styles from "./LandingPage.module.css";

const features = [
    {
        icon: FileText,
        title: "Organize your documents",
        text: "Keep all your work inside clear, focused workspaces.",
    },
    {
        icon: Users,
        title: "Collaborate with your team",
        text: "Invite contributors and work together in the same document.",
    },
    {
        icon: Zap,
        title: "Work in real time",
        text: "See changes and active collaborators as they happen.",
    },
];

export default function LandingPage() {
    return (
        <main className={styles.page}>
            <nav className={styles.navbar}>
                <Link to="/" className={styles.logo}>
                    <span className={styles.logoMark}>C</span>
                    CollabDocs
                </Link>

                <div className={styles.navActions}>
                    <Link to="/login" className={styles.loginLink}>
                        Log in
                    </Link>

                    <Link to="/register" className={styles.signupButton}>
                        Get started
                    </Link>
                </div>
            </nav>

            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <p className={styles.eyebrow}>
                        Collaborative documents, simplified
                    </p>

                    <h1>
                        Work together,
                        <span> in one place.</span>
                    </h1>

                    <p className={styles.description}>
                        CollabDocs helps teams organize workspaces, create
                        documents, and collaborate in real time.
                    </p>

                    <div className={styles.heroActions}>
                        <Link to="/register" className={styles.primaryButton}>
                            Start collaborating
                        </Link>

                        <Link to="/login" className={styles.secondaryButton}>
                            Log in to your workspace
                        </Link>
                    </div>
                </div>

                <div className={styles.preview}>
                    <div className={styles.previewTopbar}>
                        <div className={styles.previewDots}>
                            <span />
                            <span />
                            <span />
                        </div>

                        <span>Product roadmap</span>
                    </div>

                    <div className={styles.previewBody}>
                        <div className={styles.previewSidebar}>
                            <strong>CollabDocs</strong>
                            <span>Workspace</span>
                            <span>Documents</span>
                            <span>Contributors</span>
                        </div>

                        <div className={styles.previewDocument}>
                            <div className={styles.fakeLineLong} />
                            <div className={styles.fakeLineMedium} />
                            <div className={styles.fakeHeading} />
                            <div className={styles.fakeLineLong} />
                            <div className={styles.fakeLineLong} />
                            <div className={styles.fakeLineShort} />
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.features}>
                {features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                        <article className={styles.featureCard} key={feature.title}>
                            <div className={styles.featureIcon}>
                                <Icon size={20} />
                            </div>

                            <h2>{feature.title}</h2>
                            <p>{feature.text}</p>
                        </article>
                    );
                })}
            </section>
        </main>
    );
}