import { Clock3, FileText, MoreHorizontal, Star, } from "lucide-react";
import styles from "./DocumentCard.module.css";

export default function DocumentCard({ document, view, onOpen, onDelete, onToggleFavorite }) {

    const cardClassName = `${styles.documentCard} ${view === "list" ? styles.listCard : ""
        }`;

    const preview = document.content
        ? document.content.replace(/<[^>]*>/g, "").slice(0, 100)
        : "No content yet.";

    function formatDate(value) {
        if (!value) {
            return "Just now";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString();
    }

    return (
        <article className={cardClassName}>
            <button type="button" className={styles.cardButton} onClick={onOpen}>
                <div className={`${styles.documentIcon} ${styles[document.color]}`}>
                    <FileText size={22} strokeWidth={1.7} />
                </div>

                <div className={styles.cardContent}>
                    <h3>{document.title}</h3>
                    <p>{preview}</p>

                    <div className={styles.cardMeta}>
                        <span>
                            <Clock3 size={13} />
                            {formatDate(document.updatedAt)}
                        </span>

                    </div>
                </div>
            </button>


            <button
                type="button"
                className={`${styles.favoriteButton} ${document.isFavorite ? styles.favoriteButtonActive : ""
                    }`}
                aria-label={
                    document.isFavorite
                        ? "Remove from favorites"
                        : "Add to favorites"
                }
                aria-pressed={document.isFavorite}
                onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(document._id);
                }}
            >
                <Star
                    size={17}
                    fill={document.isFavorite ? "currentColor" : "none"}
                />
            </button>

            <button
                type="button"
                className={styles.moreButton}
                aria-label={`More options for ${document.title}`}
                onClick={(event) => {
                    event.stopPropagation()
                    onDelete()
                }}
            >
                <MoreHorizontal size={17} />
            </button>
        </article>
    );
}
