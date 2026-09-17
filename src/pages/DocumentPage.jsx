import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./DocumentPage.module.css";
import { getDocument, updateDocument } from "../services/apiClient";
import CollaborativeEditor from "../features/editor/CollaborativeEditor";


export default function DocumentPage() {
    const { documentId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [titleStatus, setTitleStatus] = useState("");

    useEffect(() => {
        async function loadDocument() {
            try {
                const data = await getDocument(documentId);
                setTitle(data.title);
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadDocument();
    }, [documentId]);

    async function handleTitleBlur() {
        const nextTitle = title.trim() || "Untitled document";

        setTitle(nextTitle);
        setTitleStatus("Saving...");

        try {
            await updateDocument(documentId, {
                title: nextTitle,
            });

            setTitleStatus("Saved");
        } catch (error) {
            console.error(error);
            setTitleStatus("Failed to save");
        }
    }


    if (isLoading) {
        return <p>Loading document...</p>;
    }

    if (error) {
        return <p>Failed to load document: {error}</p>;
    }

    return (
        <section className={styles.page}>
            <button
                type="button"
                className={styles.backButton}
                onClick={() => navigate("/app")}
            >
                <ArrowLeft size={16} />
                All documents
            </button>

            <div className={styles.titleSection}>
                <input
                    className={styles.titleInput}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onBlur={handleTitleBlur}
                    placeholder="Untitled document"
                />

                {titleStatus && (
                    <span className={styles.titleStatus}>
                        {titleStatus}
                    </span>
                )}
            </div>

            <CollaborativeEditor
                roomName={`document-${documentId}`}
            />
        </section>
    );
}