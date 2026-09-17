import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import styles from "./SettingPage.module.css";

function getId(value) {
    return value?._id || value?.id || value;
}

function WorkspaceOwnerSettings({
    project,
    onRenameProject,
    onDeleteProject,
}) {
    const [name, setName] = useState(project.name);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function handleRename(event) {
        event.preventDefault();

        if (!name.trim()) {
            setError("Workspace name cannot be empty.");
            return;
        }

        try {
            setIsSaving(true);
            setError("");
            setMessage("");

            const updatedProject = await onRenameProject(
                project._id,
                name
            );

            setName(updatedProject.name);
            setMessage("Workspace renamed successfully.");
        } catch (err) {
            setError(err.message || "Failed to rename workspace.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        await onDeleteProject(project._id);
    }

    return (
        <>
            <section className={styles.card}>
                <h2>Workspace name</h2>
                <p>Change the name of this workspace.</p>

                <form onSubmit={handleRename} className={styles.form}>
                    <label htmlFor="workspace-name">
                        Workspace name
                    </label>

                    <input
                        id="workspace-name"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                    />

                    <button
                        type="submit"
                        disabled={isSaving}
                        className={styles.primaryButton}
                    >
                        {isSaving ? "Saving..." : "Save changes"}
                    </button>
                </form>

                {message && (
                    <p className={styles.success}>{message}</p>
                )}

                {error && (
                    <p className={styles.error}>{error}</p>
                )}
            </section>

            <section className={styles.dangerCard}>
                <h2>Danger zone</h2>
                <p>
                    Deleting this workspace also deletes all of its
                    documents.
                </p>

                <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={handleDelete}
                >
                    Delete workspace
                </button>
            </section>
        </>
    );
}

export default function SettingPage() {
    const {
        projects,
        activeProjectId,
        onRenameProject,
        onDeleteProject,
    } = useOutletContext();

    const activeProject = projects.find(
        (project) => project._id === activeProjectId
    );

    const savedUser = localStorage.getItem("user");
    const currentUser = savedUser
        ? JSON.parse(savedUser)
        : null;

    if (!activeProject) {
        return (
            <main className={styles.page}>
                <p>Select a workspace first.</p>
            </main>
        );
    }

    const isOwner =
        String(getId(activeProject.owner)) ===
        String(getId(currentUser));

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <p className={styles.eyebrow}>Workspace</p>
                <h1>{activeProject.name} settings</h1>
                <p>
                    Manage the settings for this workspace.
                </p>
            </header>

            {isOwner ? (
                <WorkspaceOwnerSettings
                    key={activeProject._id}
                    project={activeProject}
                    onRenameProject={onRenameProject}
                    onDeleteProject={onDeleteProject}
                />
            ) : (
                <section className={styles.notice}>
                    <h2>Workspace settings</h2>
                    <p>
                        Only the workspace owner can rename or delete
                        this workspace.
                    </p>
                </section>
            )}
        </main>
    );
}