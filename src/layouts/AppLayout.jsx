import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import WorkspaceNavbar from "../components/WorkspaceNavbar";
import {
    createProject,
    getProjects,
    renameProject,
    deleteProject,
    getUnreadInvitationCount,
    markInvitationsAsRead
} from "../services/apiClient";
import styles from "./AppLayout.module.css";

export default function AppLayout({ title }) {
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState("");
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] =
        useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        async function loadProjects() {
            try {
                const data = await getProjects();

                setProjects(data);

                if (data.length > 0) {
                    setActiveProjectId(data[0]._id);
                }
            } catch (error) {
                console.error(error);
            }
        }

        loadProjects();
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadUnreadNotificationCount() {
            try {
                const data = await getUnreadInvitationCount();

                if (isMounted) {
                    setUnreadNotificationCount(data.count || 0);
                }
            } catch (error) {
                console.error(
                    "Failed to load notification count:",
                    error
                );
            }
        }

        loadUnreadNotificationCount();

        const intervalId = window.setInterval(
            loadUnreadNotificationCount,
            30000
        );

        window.addEventListener(
            "focus",
            loadUnreadNotificationCount
        );

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
            window.removeEventListener(
                "focus",
                loadUnreadNotificationCount
            );
        };
    }, []);

    function startCreatingProject() {
        setIsCreatingProject(true);
    }

    function cancelCreatingProject() {
        setIsCreatingProject(false);
    }

    async function handleCreateProject(name) {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return false;
        }

        try {
            const project = await createProject({
                name: trimmedName,
            });

            setProjects((currentProjects) => [
                project,
                ...currentProjects,
            ]);

            setActiveProjectId(project._id);
            setIsCreatingProject(false);

            return true;
        } catch (error) {
            window.alert(error.message || "Failed to create workspace.");
            return false;
        }
    }

    function handleProjectChange(projectId) {
        setActiveProjectId(projectId);
        setIsSidebarOpen(false);

        if (location.pathname.startsWith("/app/documents/")) {
            navigate("/app", { replace: true });
        }
    }

    function handleNotificationsOpen() {
        // Hide the badge immediately
        setUnreadNotificationCount(0);

        // Persist the read status
        markInvitationsAsRead().catch((error) => {
            console.error(
                "Failed to mark notifications as read:",
                error
            );
        });
    }

    async function handleRenameProject(projectId, newName) {
        const trimmedName = newName.trim();

        if (!trimmedName) {
            throw new Error("Workspace name cannot be empty.");
        }

        const updatedProject = await renameProject(
            projectId,
            trimmedName
        );

        setProjects((currentProjects) =>
            currentProjects.map((project) =>
                project._id === projectId
                    ? { ...project, name: updatedProject.name }
                    : project
            )
        );

        return updatedProject;
    }

    async function handleDeleteProject(projectId) {
        const confirmed = window.confirm(
            "Delete this workspace and all of its documents?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteProject(projectId);

            const remainingProjects = projects.filter(
                (project) => project._id !== projectId
            );

            setProjects(remainingProjects);

            if (activeProjectId === projectId) {
                setActiveProjectId(remainingProjects[0]?._id || null);
            }
        } catch (error) {
            window.alert(error.message || "Failed to delete workspace.");
        }
    }

    const activeProject = projects.find(
        (project) => project._id === activeProjectId
    );

    const workspaceTitle = activeProject?.name || title;
    const isDocumentPage =
        location.pathname.startsWith("/app/documents/");

    return (
        <div className={styles.app}>
            {isSidebarOpen && (
                <button
                    type="button"
                    className={styles.mobileOverlay}
                    aria-label="Close navigation"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <Sidebar
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={handleProjectChange}
                onCreateProject={handleCreateProject}
                isCreatingProject={isCreatingProject}
                onStartCreateProject={startCreatingProject}
                onSubmitCreateProject={handleCreateProject}
                onCancelCreateProject={cancelCreatingProject}
                notificationCount={unreadNotificationCount}
                onNotificationsOpen={handleNotificationsOpen}
                isMobileOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className={styles.main}>
                <Topbar
                    title={workspaceTitle}
                    projects={projects}
                    activeProjectId={activeProjectId}
                    onSelectProject={handleProjectChange}
                    onCreateProject={startCreatingProject}
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                />

                {!isDocumentPage && <WorkspaceNavbar />}

                <main className={styles.content}>
                    <Outlet
                        context={{
                            projects,
                            activeProjectId,
                            setActiveProjectId,
                            onRenameProject: handleRenameProject,
                            onDeleteProject: handleDeleteProject,
                        }}
                    />
                </main>
            </div>
        </div>
    );
}