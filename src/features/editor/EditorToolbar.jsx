import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Minus,
    Quote,
    Underline,
} from "lucide-react";
import styles from "./Editor.module.css";

const toolbarItems = [
    { label: "Bold", command: "bold", icon: Bold },
    { label: "Italic", command: "italic", icon: Italic },
    { label: "Underline", command: "underline", icon: Underline },
    { label: "Bulleted list", command: "insertUnorderedList", icon: List },
    { label: "Numbered list", command: "insertOrderedList", icon: ListOrdered },
    {
        label: "Quote",
        command: "formatBlock",
        value: "blockquote",
        icon: Quote,
    },
    {
        label: "Divider",
        command: "insertHorizontalRule",
        icon: Minus,
    },
];

export default function EditorToolbar({ onCommand }) {
    return (
        <div className={styles.toolbar} role="toolbar">
            {toolbarItems.map(({ label, command, value, icon: Icon }) => (
                <button
                    key={label}
                    type="button"
                    title={label}
                    aria-label={label}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onCommand(command, value)}
                >
                    <Icon size={16} />
                </button>
            ))}
        </div>
    );
}