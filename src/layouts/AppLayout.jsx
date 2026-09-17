import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import WorkspaceNavbar from "../components/WorkspaceNavbar";
import {
    createProject,
    getProjects,
    renameProject,
    deleteProject
} from "../services/apiClient";
import styles from "./AppLayout.module.css";

export default function AppLayout({ title }) {
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState("");

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

    async function handleCreateProject() {
        const name = window.prompt("Enter a workspace name:");

        if (!name || !name.trim()) {
            return;
        }

        try {
            const project = await createProject({
                name: name.trim(),
            });

            setProjects((currentProjects) => [
                project,
                ...currentProjects,
            ]);

            setActiveProjectId(project._id);
        } catch (error) {
            window.alert(error.message);
        }
    }

    function handleProjectChange(projectId) {
        setActiveProjectId(projectId);

        if (location.pathname.startsWith("/app/documents/")) {
            navigate("/app", { replace: true });
        }
    }

    async function handleRenameProject(projectId, currentName) {
        const newName = window.prompt(
            "Enter a new workspace name:",
            currentName
        );

        if (newName === null) {
            return;
        }

        if (!newName.trim()) {
            window.alert("Workspace name cannot be empty.");
            return;
        }

        try {
            const updatedProject = await renameProject(
                projectId,
                newName.trim()
            );

            setProjects((currentProjects) =>
                currentProjects.map((project) =>
                    project._id === projectId
                        ? { ...project, name: updatedProject.name }
                        : project
                )
            );
        } catch (error) {
            window.alert(error.message || "Failed to rename workspace.");
        }
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

    return (
        <div className={styles.app}>
            <Sidebar
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={handleProjectChange}
                onCreateProject={handleCreateProject}
                onRenameProject={handleRenameProject}
                onDeleteProject={handleDeleteProject}
            />

            <div className={styles.main}>
                <Topbar
                    title={workspaceTitle}
                    projects={projects}
                    activeProjectId={activeProjectId}
                    onSelectProject={handleProjectChange}
                    onCreateProject={handleCreateProject}
                />

                <WorkspaceNavbar />

                <main className={styles.content}>
                    <Outlet
                        context={{
                            projects,
                            activeProjectId,
                            setActiveProjectId,
                        }}
                    />
                </main>
            </div>
        </div>
    );
}