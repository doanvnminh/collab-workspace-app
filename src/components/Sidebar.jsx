import {
    FileText,
    Folder,
    Plus,
    Search,
    Settings,
    Share2,
    Star,
    Trash2,
    MoreHorizontal,
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
    onRenameProject,
    onDeleteProject,
}) {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null)

    const savedUser = localStorage.getItem("user")

    const currentUser = savedUser
        ? JSON.parse(savedUser)
        : null

    const currentUserId = currentUser?._id || currentUser?.id

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

                    {/*<button
                        type="button"
                        className={styles.addWorkspaceButton}
                        onClick={onCreateProject}
                        aria-label="Create workspace"
                    >
                        <Plus size={14} />
                    </button>*/}
                </div>

                <div className={styles.workspaceList}>
                    {projects.map((project) => {
                        const projectOwnerId =
                            typeof project.owner === "string"
                                ? project.owner
                                : project.owner?._id;

                        const isOwner = String(projectOwnerId) === String(currentUserId);

                        return (
                            <div
                                key={project._id}
                                className={styles.workspaceRow}
                            >
                                <button
                                    type="button"
                                    className={`${styles.workspaceButton} ${activeProjectId === project._id
                                        ? styles.activeWorkspace
                                        : ""
                                        }`}
                                    onClick={() => {
                                        onSelectProject(project._id);
                                        setOpenMenuId(null);
                                    }}
                                >
                                    <span className={styles.workspaceIcon}>●</span>
                                    <span>{project.name}</span>
                                </button>

                                {isOwner && (
                                    <div className={styles.workspaceMenuWrapper}>
                                        <button
                                            type="button"
                                            className={styles.workspaceMenuButton}
                                            onClick={(event) => {
                                                event.stopPropagation();

                                                setOpenMenuId((currentId) =>
                                                    currentId === project._id
                                                        ? null
                                                        : project._id
                                                );
                                            }}
                                            aria-label={`Options for ${project.name}`}
                                        >
                                            <MoreHorizontal size={17} />
                                        </button>

                                        {openMenuId === project._id && (
                                            <div className={styles.workspaceMenu}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        onRenameProject(project._id, project.name);
                                                    }}
                                                >
                                                    Rename
                                                </button>

                                                <button
                                                    type="button"
                                                    className={styles.deleteMenuItem}
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        onDeleteProject(project._id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    <button
                        type="button"
                        className={styles.newWorkspaceButton}
                        onClick={onCreateProject}
                    >
                        + New workspace
                    </button>
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
