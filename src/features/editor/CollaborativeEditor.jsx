import { useEffect, useMemo, useState, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import styles from "./CollaborativeEditor.module.css";
import { updateDocument } from "../../services/apiClient";
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Quote,
    Undo2,
    Redo2,
} from "lucide-react";

function getCurrentUser() {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
        return {
            name: "Anonymous user",
            email: "",
        };
    }

    try {
        return JSON.parse(savedUser);
    } catch {
        return {
            name: "Anonymous user",
            email: "",
        };
    }
}

function getUserColor(name) {
    const colors = [
        "#5b4fe9",
        "#d14d72",
        "#2f9e7a",
        "#e08a32",
        "#3984c6",
    ];

    const total = [...name].reduce(
        (sum, character) => sum + character.charCodeAt(0),
        0
    );

    return colors[total % colors.length];
}

function ToolbarButton({

    label,
    Icon,
    active = false,
    disabled = false,
    onClick,
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            className={`${styles.toolbarButton} ${active ? styles.activeButton : ""
                }`}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
        >
            <Icon size={17} strokeWidth={2} />
        </button>
    );
}

function EditorToolbar({ editor }) {
    if (!editor) {
        return null;
    }

    return (
        <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>
                <ToolbarButton
                    editor={editor}
                    label="Undo"
                    Icon={Undo2}
                    disabled={!editor.can().chain().focus().undo().run()}
                    onClick={() => editor.chain().focus().undo().run()}
                />

                <ToolbarButton
                    editor={editor}
                    label="Redo"
                    Icon={Redo2}
                    disabled={!editor.can().chain().focus().redo().run()}
                    onClick={() => editor.chain().focus().redo().run()}
                />
            </div>

            <span className={styles.divider} />

            <div className={styles.toolbarGroup}>
                <ToolbarButton
                    editor={editor}
                    label="Bold"
                    Icon={Bold}
                    active={editor.isActive("bold")}
                    onClick={() =>
                        editor.chain().focus().toggleBold().run()
                    }
                />

                <ToolbarButton
                    editor={editor}
                    label="Italic"
                    Icon={Italic}
                    active={editor.isActive("italic")}
                    onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                    }
                />
            </div>

            <span className={styles.divider} />

            <div className={styles.toolbarGroup}>
                <ToolbarButton
                    editor={editor}
                    label="Heading 1"
                    Icon={Heading1}
                    active={editor.isActive("heading", { level: 1 })}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                    }
                />

                <ToolbarButton
                    editor={editor}
                    label="Heading 2"
                    Icon={Heading2}
                    active={editor.isActive("heading", { level: 2 })}
                    onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                    }
                />

                <ToolbarButton
                    editor={editor}
                    label="Bullet list"
                    Icon={List}
                    active={editor.isActive("bulletList")}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                />

                <ToolbarButton
                    editor={editor}
                    label="Numbered list"
                    Icon={ListOrdered}
                    active={editor.isActive("orderedList")}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                />

                <ToolbarButton
                    editor={editor}
                    label="Quote"
                    Icon={Quote}
                    active={editor.isActive("blockquote")}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                />
            </div>
        </div>
    );
}

function CollaborativeEditorSession({
    documentId,
    ydoc,
    provider,
    userName,
    userColor,
}) {
    const [connected, setConnected] = useState(provider.wsconnected);
    const [activeUsers, setActiveUsers] = useState([]);
    const [, setEditorVersion] = useState(0);

    const previewSaveTimeoutRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                history: false,
            }),

            Collaboration.configure({
                document: ydoc,
            }),

            CollaborationCaret.configure({
                provider,
                user: {
                    name: userName,
                    color: userColor,
                },
            }),
        ],

        onTransaction() {
            setEditorVersion((version) => version + 1);
        },

        onUpdate({ editor }) {
            const html = editor.getHTML();

            clearTimeout(previewSaveTimeoutRef.current);

            previewSaveTimeoutRef.current = setTimeout(async () => {
                try {
                    await updateDocument(documentId, {
                        content: html,
                    });
                } catch (error) {
                    console.error(
                        "Failed to update document preview:",
                        error
                    );
                }
            }, 800);
        },
    });

    useEffect(() => {
        return () => {
            clearTimeout(previewSaveTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const awareness = provider.awareness;

        const localUser = {
            name: userName,
            color: userColor,
        };

        function updateActiveUsers() {
            const users = Array.from(awareness.getStates().values())
                .map((state) => state.user)
                .filter(Boolean);

            // Always show the current user, even before the server syncs awareness.
            if (users.length === 0) {
                users.push(localUser);
            }

            setActiveUsers(users);
        }

        function registerLocalUser() {
            awareness.setLocalState({
                user: localUser,
            });

            updateActiveUsers();
        }

        function handleStatus({ status }) {
            setConnected(status === "connected");

            if (status === "connected") {
                registerLocalUser();
            }
        }

        provider.on("status", handleStatus);

        awareness.on("change", updateActiveUsers);
        awareness.on("update", updateActiveUsers);

        registerLocalUser();

        return () => {
            awareness.setLocalState(null);

            awareness.off("change", updateActiveUsers);
            awareness.off("update", updateActiveUsers);
            provider.off("status", handleStatus);
        };
    }, [provider, userName, userColor]);


    if (!editor) {
        return <p>Loading collaborative editor...</p>;
    }

    return (
        <section className={styles.wrapper}>
            <div className={styles.statusBar}>
                <span>
                    {connected ? "Connected" : "Connecting..."}
                </span>

                <span>
                    {activeUsers.length} active user
                    {activeUsers.length === 1 ? "" : "s"}
                </span>
            </div>

            <EditorToolbar editor={editor} />

            <EditorContent
                editor={editor}
                className={styles.editor}
            />
        </section>
    );
}

export default function CollaborativeEditor({
    documentId,
    roomName = "collab-test-room",
}) {
    const currentUser = useMemo(() => getCurrentUser(), []);

    const userName =
        currentUser.name || currentUser.email || "Anonymous user";

    const userColor = getUserColor(userName);
    const token = localStorage.getItem("token");

    const [collaboration, setCollaboration] = useState(null);

    const yjsUrl =
        import.meta.env.VITE_YJS_URL ||
        "ws://127.0.0.1:5000";

    useEffect(() => {
        const ydoc = new Y.Doc();

        const provider = new WebsocketProvider(
            yjsUrl,
            roomName,
            ydoc,
            {
                params: {
                    token: token || "",
                },
            }
        );

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollaboration({
            ydoc,
            provider,
        });

        return () => {
            provider.awareness.setLocalState(null);
            provider.destroy();
            ydoc.destroy();
        };
    }, [roomName, token, yjsUrl]);

    if (!collaboration) {
        return <p>Loading collaborative editor...</p>;
    }

    return (
        <CollaborativeEditorSession
            key={roomName}
            documentId={documentId}
            ydoc={collaboration.ydoc}
            provider={collaboration.provider}
            userName={userName}
            userColor={userColor}
        />
    );
}