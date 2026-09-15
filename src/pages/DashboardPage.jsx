import { Grid2X2, List, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import DocumentList from "../features/documents/DocumentList";
import styles from "./DashboardPage.module.css";
import { useNavigate } from "react-router-dom";
import {
    createDocument as createDocumentRequest,
    getDocuments,
    deleteDocument,
    getProjects,
    createProject
} from "../services/apiClient";


const initialDocuments = [
    {
        id: 1,
        title: "Product roadmap",
        description: "Plan the next milestones for the product team.",
        updatedAt: "Just now",
        collaborators: 4,
        color: "purple",
    },
    {
        id: 2,
        title: "Marketing brief",
        description: "Campaign goals, audience, and launch timeline.",
        updatedAt: "Yesterday",
        collaborators: 2,
        color: "orange",
    },
    {
        id: 3,
        title: "Meeting notes",
        description: "Notes and action items from the weekly meeting.",
        updatedAt: "Sep 5, 2026",
        collaborators: 3,
        color: "blue",
    },
];

export default function DashboardPage() {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [view, setView] = useState("grid");
    const [isCreating, setIsCreating] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [projects, setProjects] = useState([])
    const [activeProjectId, setActiveProjectId] = useState("")

    useEffect(() => {
        if (!activeProjectId) {
            return;
        }

        async function loadDocuments() {
            try {
                const data = await getDocuments(activeProjectId);
                setDocuments(data);
            } catch (error) {
                console.error(error);
            }
        }

        loadDocuments();
    }, [activeProjectId]);

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

    const navigate = useNavigate();

    async function createDocument() {
        setIsCreating(true);
        setError("");

        try {
            const newDocument = await createDocumentRequest(activeProjectId, {
                title: "Untitled document",
                description: "Start writing something new.",
            });

            setDocuments((currentDocuments) => [
                newDocument,
                ...currentDocuments,
            ]);

            navigate(`/app/documents/${newDocument._id}`);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsCreating(false);
        }
    }

    async function handleDelete(documentId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this document?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteDocument(documentId);

            setDocuments((currentDocuments) =>
                currentDocuments.filter(
                    (document) => document._id !== documentId
                )
            );

            setOpenMenuId(null);
        } catch (error) {
            window.alert(error.message);
        }
    }

    async function handleCreateProject() {
        const name = window.prompt("Enter a project name:");

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

    function openDocument(document) {
        navigate(`/app/documents/${document._id}`);
    }

    return (
        <section className={styles.dashboard}>
            <div className={styles.pageHeader}>
                <div>
                    <p className={styles.eyebrow}>Your workspace</p>
                    <h2>Recent documents</h2>
                    <p className={styles.description}>
                        Continue working on your shared documents.
                    </p>
                </div>

                <div>
                    <label htmlFor="project-select">
                        Project
                    </label>

                    <select
                        id="project-select"
                        value={activeProjectId}
                        onChange={(event) =>
                            setActiveProjectId(event.target.value)
                        }
                    >
                        {projects.map((project) => (
                            <option key={project._id} value={project._id}>
                                {project.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        onClick={handleCreateProject}
                    >
                        New project
                    </button>
                </div>

                <button
                    type="button"
                    className={styles.createButton}
                    onClick={createDocument}
                    disabled={isCreating}
                >
                    <Plus size={17} />
                    {isCreating ? "Creating..." : "New document"}
                </button>
            </div>

            <div className={styles.toolbar}>
                <span className={styles.documentCount}>
                    {documents.length} {documents.length === 1 ? "document" : "documents"}
                </span>

                <div className={styles.viewToggle} aria-label="Change document view">
                    <button
                        type="button"
                        className={view === "grid" ? styles.selectedView : ""}
                        onClick={() => setView("grid")}
                        aria-label="Grid view"
                    >
                        <Grid2X2 size={16} />
                    </button>
                    <button
                        type="button"
                        className={view === "list" ? styles.selectedView : ""}
                        onClick={() => setView("list")}
                        aria-label="List view"
                    >
                        <List size={17} />
                    </button>
                </div>
            </div>

            {isLoading && <p>Loading documents...</p>}

            {error && <p>Failed to load documents: {error}</p>}

            {!isLoading && !error && (
                <DocumentList
                    documents={documents}
                    view={view}
                    onOpenDocument={openDocument}
                    onCreateDocument={createDocument}
                    onDeleteDocument={handleDelete}
                />
            )}
        </section>
    );
}
