import DocumentCard from "./DocumentCard";
import styles from "./document.module.css";

export default function DocumentList({
    documents,
    view,
    onOpenDocument,
    onCreateDocument,
}) {
    if (documents.length === 0) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✦</div>
                <h3>No documents yet</h3>
                <p>Create your first document to start collaborating.</p>
                <button type="button" onClick={onCreateDocument}>
                    Create a document
                </button>
            </div>
        );
    }

    return (
        <div className={view === "list" ? styles.documentList : styles.documentGrid}>
            {documents.map((document) => (
                <DocumentCard
                    key={document.id}
                    document={document}
                    view={view}
                    onOpen={() => onOpenDocument(document)}
                />
            ))}
        </div>
    );
}
