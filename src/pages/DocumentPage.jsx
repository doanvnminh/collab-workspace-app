import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./DocumentPage.module.css";
import { getDocument } from "../services/apiClient";
import CollaborativeEditor from "../features/editor/CollaborativeEditor";


export default function DocumentPage() {
    const { documentId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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



            <h1 className={styles.title}>
                {title || "Untitled document"}
            </h1>

            <CollaborativeEditor
                roomName={`document-${documentId}`}
            />
        </section>
    );
}