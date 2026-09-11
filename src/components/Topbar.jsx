import { Bell, ChevronDown, Plus, Search } from "lucide-react";
import styles from "./Topbar.module.css";

export default function Topbar({ title = "My workspace" }) {
    return (
        <header className={styles.topbar}>
            <div className={styles.heading}>
                <span className={styles.eyebrow}>Workspace</span>
                <div className={styles.titleRow}>
                    <h1>{title}</h1>
                    <ChevronDown size={17} />
                </div>
            </div>

            <div className={styles.actions}>
                <label className={styles.searchBox}>
                    <Search size={16} />
                    <input
                        type="search"
                        placeholder="Search documents"
                        aria-label="Search documents"
                    />
                    <kbd>⌘ K</kbd>
                </label>

                <button type="button" className={styles.iconButton} aria-label="Notifications">
                    <Bell size={18} />
                    <span className={styles.notificationDot} />
                </button>

                <button type="button" className={styles.inviteButton}>
                    <Plus size={16} />
                    Invite
                </button>
            </div>
        </header>
    );
}
