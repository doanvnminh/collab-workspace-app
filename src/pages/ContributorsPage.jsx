import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getProject, removeProjectMember } from "../services/apiClient";
import styles from "./ContributorsPage.module.css";
import InviteMember from "../features/invitations/InviteDialog";

function getInitials(user) {
    const text = user?.name || user?.email || "?";

    return text
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export default function ContributorsPage() {
    const { activeProjectId } = useOutletContext();

    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingUserId, setRemovingUserId] = useState(null);
    const [actionError, setActionError] = useState("");


    useEffect(() => {
        async function loadProject() {
            if (!activeProjectId) {
                setProject(null);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await getProject(activeProjectId);
                setProject(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadProject();
    }, [activeProjectId]);

    async function handleRemoveMember(userId) {
        const confirmed = window.confirm(
            "Are you sure you want to remove this contributor?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingUserId(userId);
            setActionError("");

            await removeProjectMember(activeProjectId, userId);

            setProject((currentProject) => ({
                ...currentProject,
                members: currentProject.members.filter(
                    (member) => member.user._id !== userId
                ),
            }));
        } catch (err) {
            setActionError(err.message || "Failed to remove contributor.");
        } finally {
            setRemovingUserId(null);
        }
    }

    if (isLoading) {
        return <p className={styles.message}>Loading contributors...</p>;
    }

    if (error) {
        return <p className={styles.message}>Failed to load contributors: {error}</p>;
    }

    if (!project) {
        return <p className={styles.message}>Select a workspace first.</p>;
    }

    {/*This must stay here, after the if */ }
    const contributors = [
        {
            user: project.owner,
            role: "Owner",
            isOwner: true,
        },
        ...(project.members || []).map((member) => ({
            ...member,
            isOwner: false,
        })),
    ];

    return (
        <main className={styles.page}>
            <div className={styles.header}>
                <div>
                    <p className={styles.eyebrow}>Workspace</p>
                    <h1>{project.name} contributors</h1>
                    <p>People who can access this workspace and its documents.</p>
                </div>

                <div className={styles.headerActions}>
                    <InviteMember projectId={activeProjectId} />


                    <span className={styles.count}>
                        {contributors.length}{" "}
                        {contributors.length === 1 ? "member" : "members"}
                    </span>
                </div>
            </div>

            <section className={styles.list}>
                {contributors.map((contributor, index) => {
                    const user = contributor.user;

                    return (

                        <div
                            className={styles.row}
                            key={user?._id || `${user?.email}-${index}`}
                        >

                            <div className={styles.avatar}>{getInitials(user)}</div>

                            <div className={styles.info}>
                                <strong>{user?.name || "Unnamed user"}</strong>
                                <span>{user?.email}</span>
                            </div>

                            <div className={styles.rowActions}>
                                <span className={styles.role}>
                                    {contributor.role || "viewer"}
                                </span>

                                {!contributor.isOwner && (
                                    <button
                                        type="button"
                                        className={styles.removeButton}
                                        onClick={() => handleRemoveMember(user._id)}
                                        disabled={removingUserId === user._id}
                                    >
                                        {removingUserId === user._id ? "Removing..." : "Remove"}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </section>
        </main>
    );
}