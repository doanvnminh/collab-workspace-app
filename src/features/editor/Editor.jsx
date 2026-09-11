import { useEffect, useRef } from "react";
import EditorToolbar from "./EditorToolbar";
import styles from "./Editor.module.css";

export default function Editor({
    title,
    content,
    onTitleChange,
    onContentChange,
}) {
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current && contentRef.current.innerHTML !== content) {
            contentRef.current.innerHTML = content;
        }
    }, [content]);

    function executeCommand(command, value = null) {
        contentRef.current.focus();

        window.document.execCommand(command, false, value);

        onContentChange(contentRef.current.innerHTML);
    }

    return (
        <div className={styles.editor}>
            <input
                className={styles.titleInput}
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Untitled document"
            />

            <EditorToolbar onCommand={executeCommand} />

            <div
                ref={contentRef}
                className={styles.content}
                contentEditable
                suppressContentEditableWarning
                onInput={(event) => onContentChange(event.currentTarget.innerHTML)}
                role="textbox"
                aria-label="Document content"
            />
        </div>
    );
}