import InvitationList from "../features/invitations/InvitationList";
import styles from "./NotificationsPage.module.css";

export default function NotificationsPage() {
    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Workspace</p>
                    <h1>Notifications</h1>
                    <p>Manage workspace invitations and other updates.</p>
                </div>
            </div>

            <section className={styles.section}>
                <h2>Pending invitations</h2>
                <InvitationList />
            </section>
        </main>
    );
}