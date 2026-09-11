import {
    FileText,
    Folder,
    Plus,
    Search,
    Settings,
    Share2,
    Star,
    Trash2,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import LogoutButton from "./LogoutButton";

const navigation = [
    { label: "All documents", icon: FileText },
    { label: "Shared with me", icon: Share2 },
    { label: "Favorites", icon: Star },
    { label: "Trash", icon: Trash2 },
];

const recentDocuments = [
    "Product roadmap",
    "Marketing brief",
    "Meeting notes",
];

export default function Sidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>
                <div className={styles.brandMark}>C</div>
                <span>CollabDocs</span>
            </div>

            <button className={styles.newButton} type="button">
                <Plus size={17} />
                New document
            </button>

            <nav className={styles.navigation} aria-label="Main navigation">
                {navigation.map(({ label, icon: Icon }, index) => (
                    <a
                        href="#"
                        key={label}
                        className={`${styles.navItem} ${index === 0 ? styles.active : ""}`}
                    >
                        <Icon size={17} strokeWidth={1.9} />
                        <span>{label}</span>
                    </a>
                ))}
            </nav>

            <div className={styles.section}>
                <div className={styles.sectionHeading}>WORKSPACE</div>
                <a href="#" className={styles.navItem}>
                    <Folder size={17} strokeWidth={1.9} />
                    <span>My workspace</span>
                </a>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeading}>RECENT DOCUMENTS</div>
                <div className={styles.recentList}>
                    {recentDocuments.map((document) => (
                        <a href="#" className={styles.recentItem} key={document}>
                            <FileText size={15} strokeWidth={1.8} />
                            <span>{document}</span>
                        </a>
                    ))}
                </div>
            </div>

            <div className={styles.sidebarBottom}>
                <a href="#" className={styles.navItem}>
                    <Search size={17} strokeWidth={1.9} />
                    <span>Search</span>
                </a>
                <a href="#" className={styles.navItem}>
                    <Settings size={17} strokeWidth={1.9} />
                    <span>Settings</span>
                </a>

                <div className={styles.profile}>
                    <div className={styles.avatar}>M</div>
                    <div className={styles.profileText}>
                        <strong>Minh Đoàn</strong>
                        <span>Free plan</span>
                    </div>
                    <div>
                        <LogoutButton />
                    </div>
                    <button
                        type="button"
                        className={styles.profileMenu}
                        aria-label="Open profile menu"
                    >
                        •••
                    </button>
                </div>
            </div>
        </aside>
    );
}
