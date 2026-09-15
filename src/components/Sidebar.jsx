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
import { useState } from "react";

const navigation = [
    { label: "All documents", icon: FileText },
    { label: "Shared with me", icon: Share2 },
    { label: "Favorites", icon: Star },
    { label: "Trash", icon: Trash2 },
];


export default function Sidebar({
    projects = [],
    activeProjectId,
    onSelectProject,
    onCreateProject,
}) {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const savedUser = localStorage.getItem("user")

    const currentUser = savedUser
        ? JSON.parse(savedUser)
        : null

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
                <div className={styles.sectionHeadingRow}>
                    <div className={styles.sectionHeading}>
                        WORKSPACE
                    </div>

                    <button
                        type="button"
                        className={styles.addWorkspaceButton}
                        onClick={onCreateProject}
                        aria-label="Create workspace"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className={styles.workspaceList}>
                    {projects.map((project) => (
                        <button
                            type="button"
                            key={project._id}
                            className={`${styles.navItem} ${styles.workspaceItem
                                } ${project._id === activeProjectId
                                    ? styles.active
                                    : ""
                                }`}
                            onClick={() => onSelectProject(project._id)}
                        >
                            <Folder size={17} strokeWidth={1.9} />
                            <span>{project.name}</span>
                        </button>
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
                    <div className={styles.avatar}>
                        {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className={styles.profileText}>
                        <strong>{currentUser?.name || "User"}</strong>
                        <span>{currentUser?.email || "No email available"}</span>
                    </div>
                    <div className={styles.profileActions}>
                        <button
                            type="button"
                            className={styles.profileMenu}
                            aria-label="Open profile menu"
                            aria-expanded={isProfileMenuOpen}
                            onClick={() =>
                                setIsProfileMenuOpen((isOpen) => !isOpen)
                            }
                        >
                            •••
                        </button>

                        {isProfileMenuOpen && (
                            <div className={styles.profileDropdown}>
                                <LogoutButton
                                    className={styles.logoutButton}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
