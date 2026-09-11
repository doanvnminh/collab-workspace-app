import { Clock3, FileText, MoreHorizontal, Users } from "lucide-react";
import styles from "./document.module.css";

export default function DocumentCard({ document, view, onOpen }) {
    const cardClassName = `${styles.documentCard} ${view === "list" ? styles.listCard : ""
        }`;

    return (
        <article className={cardClassName}>
            <button type="button" className={styles.cardButton} onClick={onOpen}>
                <div className={`${styles.documentIcon} ${styles[document.color]}`}>
                    <FileText size={22} strokeWidth={1.7} />
                </div>

                <div className={styles.cardContent}>
                    <h3>{document.title}</h3>
                    <p>{document.description}</p>

                    <div className={styles.cardMeta}>
                        <span>
                            <Clock3 size={13} />
                            {document.updatedAt}
                        </span>
                        <span>
                            <Users size={13} />
                            {document.collaborators}
                        </span>
                    </div>
                </div>
            </button>

            <button
                type="button"
                className={styles.moreButton}
                aria-label={`More options for ${document.title}`}
            >
                <MoreHorizontal size={17} />
            </button>
        </article>
    );
}
