import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./DocumentPage.module.css";
import Editor from "../features/editor/Editor";
import { getDocument, updateDocument } from "../services/apiClient";


export default function DocumentPage() {
    const { documentId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [saveStatus, setSaveStatus] = useState("Saved");

    useEffect(() => {
        if (isLoading) {
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                setSaveStatus("Saving...");

                await updateDocument(documentId, {
                    title,
                    content,
                });

                setSaveStatus("Saved");
            } catch (error) {
                console.error(error);
                setSaveStatus("Save failed");
            }
        }, 700);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [documentId, title, content, isLoading]);

    useEffect(() => {
        async function loadDocument() {
            try {
                const data = await getDocument(documentId);

                setTitle(data.title);
                setContent(data.content || "");
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadDocument();
    }, [documentId]);

    function handleTitleChange(value) {
        setTitle(value);
        setSaveStatus("Saving...");
    }

    function handleContentChange(value) {
        setContent(value);
        setSaveStatus("Saving...");
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

            <p>{saveStatus}</p>

            <Editor
                title={title}
                content={content}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
            />
        </section>
    );
}