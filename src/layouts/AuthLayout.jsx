import styles from "./AuthLayout.module.css";

function AuthLayout({ children }) {
    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <div className={styles.brand}>
                    <div className={styles.logo}>C</div>
                    <span className={styles.brandName}>
                        CollabDocs
                    </span>
                </div>

                {children}
            </section>
        </main>
    );
}

export default AuthLayout;