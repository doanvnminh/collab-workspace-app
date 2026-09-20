import {
    Search,
    Bell,
    BellDot,
    X,
} from "lucide-react";
import styles from "./Sidebar.module.css";
import LogoutButton from "./LogoutButton";
import { useState } from "react";
import { NavLink } from "react-router-dom";



export default function Sidebar({
    projects = [],
    activeProjectId,
    onSelectProject,
    isCreatingProject,
    onStartCreateProject,
    onSubmitCreateProject,
    onCancelCreateProject,
    notificationCount = 0,
    onNotificationsOpen,
    isMobileOpen = false,
    onClose = () => { },
}) {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [isSubmittingWorkspace, setIsSubmittingWorkspace] = useState(false);

    const savedUser = localStorage.getItem("user")

    const currentUser = savedUser
        ? JSON.parse(savedUser)
        : null

    const NotificationIcon = notificationCount > 0 ? BellDot : Bell

    async function handleWorkspaceSubmit(event) {
        event.preventDefault();

        if (!newWorkspaceName.trim()) {
            return;
        }

        setIsSubmittingWorkspace(true);

        const wasCreated = await onSubmitCreateProject(newWorkspaceName);

        if (wasCreated) {
            setNewWorkspaceName("");
        }

        setIsSubmittingWorkspace(false);
    }

    return (
        <aside className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ""
            }`}>
            <button
                type="button"
                className={styles.mobileCloseButton}
                aria-label="Close navigation"
                onClick={onClose}
            >
                <X size={20} />
            </button>
            <div className={styles.brand}>
                <div className={styles.brandMark}>C</div>
                <span>CollabDocs</span>
            </div>

            {/*<button className={styles.newButton} type="button">
                <Plus size={17} />
                New document
            </button>*/}

            {/*<nav className={styles.navigation} aria-label="Main navigation">
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
            </nav>*/}

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
                    {isCreatingProject && (
                        <form
                            className={styles.workspaceCreateForm}
                            onSubmit={handleWorkspaceSubmit}
                        >
                            <span className={styles.workspaceIcon}>●</span>

                            <input
                                className={styles.workspaceCreateInput}
                                value={newWorkspaceName}
                                onChange={(event) =>
                                    setNewWorkspaceName(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === "Escape") {
                                        setNewWorkspaceName("");
                                        onCancelCreateProject();
                                    }
                                }}
                                placeholder="Workspace name"
                                autoFocus
                                disabled={isSubmittingWorkspace}
                                aria-label="New workspace name"
                            />
                        </form>
                    )}
                    {projects.map((project) => {

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

                                    }}
                                >
                                    <span className={styles.workspaceIcon}>●</span>
                                    <span>{project.name}</span>
                                </button>



                            </div>
                        );
                    })}

                    <button
                        type="button"
                        className={styles.newWorkspaceButton}
                        onClick={onStartCreateProject}
                    >
                        + New workspace
                    </button>
                </div>
            </div>



            <div className={styles.sidebarBottom}>
                <NavLink
                    to="/app/notifications"
                    className={({ isActive }) =>
                        `${styles.navItem} ${isActive ? styles.active : ""
                        }`
                    }
                >
                    <NotificationIcon size={18} />
                    <span>Notifications</span>

                    {notificationCount > 0 && (
                        <span className={styles.notificationBadge}>
                            {notificationCount > 99
                                ? "99+"
                                : notificationCount}
                        </span>
                    )}
                </NavLink>
                <a href="#" className={styles.navItem}>
                    <Search size={17} strokeWidth={1.9} />
                    <span>Search</span>
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
