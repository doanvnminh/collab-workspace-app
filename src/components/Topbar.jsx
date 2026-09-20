import { useState } from "react";
import { ChevronDown, Search, Menu } from "lucide-react";
import styles from "./Topbar.module.css";

export default function Topbar({
    title = "My workspace",
    projects = [],
    activeProjectId,
    onSelectProject,
    onCreateProject,
    onOpenSidebar,
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function handleSelectProject(projectId) {
        onSelectProject(projectId);
        setIsMenuOpen(false);
    }

    return (
        <header className={styles.topbar}>
            <div className={styles.heading}>
                <span className={styles.eyebrow}>Workspace</span>

                <div className={styles.titleRow}>
                    <button
                        type="button"
                        className={styles.workspaceButton}
                        onClick={() => setIsMenuOpen((open) => !open)}
                        aria-expanded={isMenuOpen}
                    >
                        <h1>{title}</h1>
                        <ChevronDown size={17} />
                    </button>
                </div>

                {isMenuOpen && (
                    <div className={styles.workspaceMenu}>
                        {projects.map((project) => (
                            <button
                                type="button"
                                key={project._id}
                                className={`${styles.workspaceOption} ${project._id === activeProjectId
                                    ? styles.selectedWorkspace
                                    : ""
                                    }`}
                                onClick={() =>
                                    handleSelectProject(project._id)
                                }
                            >
                                {project.name}
                            </button>
                        ))}

                        {/*<div className={styles.menuDivider} />

                        <button
                            type="button"
                            className={styles.createWorkspaceButton}
                            onClick={onCreateProject}
                        >
                            + New workspace
                        </button>*/}
                    </div>
                )}
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

                {/*<button
                    type="button"
                    className={styles.iconButton}
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                    <span className={styles.notificationDot} />
                </button>*/}
            </div>
        </header>
    );
}