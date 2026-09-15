import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
    createProject,
    getProjects,
} from "../services/apiClient";
import styles from "./AppLayout.module.css";

export default function AppLayout({ title }) {
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] =
        useState("");

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

    const activeProject = projects.find(
        (project) => project._id === activeProjectId
    );

    const workspaceTitle = activeProject?.name || title;

    return (
        <div className={styles.app}>
            <Sidebar
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={setActiveProjectId}
                onCreateProject={handleCreateProject}
            />

            <div className={styles.main}>
                <Topbar
                    title={workspaceTitle}
                    projects={projects}
                    activeProjectId={activeProjectId}
                    onSelectProject={setActiveProjectId}
                    onCreateProject={handleCreateProject}
                />

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