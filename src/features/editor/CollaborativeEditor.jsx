import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import styles from "./CollaborativeEditor.module.css";

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

export default function CollaborativeEditor({
    roomName = "collab-test-room",
}) {
    const currentUser = useMemo(() => getCurrentUser(), []);

    const userName =
        currentUser.name || currentUser.email || "Anonymous user";

    const userColor = getUserColor(userName);

    const ydoc = useMemo(() => new Y.Doc(), [roomName]);

    const token = localStorage.getItem("token");

    const provider = useMemo(
        () =>
            new WebsocketProvider(
                "ws://127.0.0.1:5000",
                roomName,
                ydoc,
                {
                    params: {
                        token: token || "",
                    },
                }
            ),
        [roomName, ydoc, token]
    );


    const [connected, setConnected] = useState(() => provider.wsconnected);
    const [activeUsers, setActiveUsers] = useState([]);

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
    });

    useEffect(() => {
        function updateActiveUsers() {
            const users = Array.from(
                provider.awareness.getStates().values()
            )
                .map((state) => state.user)
                .filter(Boolean);

            setActiveUsers(users);
        }

        function handleStatus({ status }) {
            console.log("Yjs status:", status);
            setConnected(status === "connected");
        }

        function handleConnectionError(error) {
            console.error("Yjs connection error:", error);
        }

        function handleConnectionClose(event) {
            console.error("Yjs connection closed:", event);
        }

        provider.awareness.on("change", updateActiveUsers);
        provider.on("status", handleStatus);
        provider.on("connection-error", handleConnectionError);
        provider.on("connection-close", handleConnectionClose);

        // Handles the case where the provider connected
        // before this effect registered its listeners.
        setConnected(provider.wsconnected);

        updateActiveUsers();

        if (!provider.wsconnected && !provider.wsconnecting) {
            provider.connect();
        }

        return () => {
            provider.awareness.off("change", updateActiveUsers);
            provider.off("status", handleStatus);
            provider.off("connection-error", handleConnectionError);
            provider.off("connection-close", handleConnectionClose);

            // Disconnect instead of destroying the memoized provider.
            provider.disconnect();
        };
    }, [provider]);

    if (!editor) {
        return <p>Loading collaborative editor...</p>;
    }

    return (
        <section className={styles.wrapper}>
            <div className={styles.statusBar}>
                <span>
                    {connected
                        ? "Connected"
                        : "Connecting..."}
                </span>

                <span>
                    {activeUsers.length} active user
                    {activeUsers.length === 1 ? "" : "s"}
                </span>
            </div>

            <EditorContent
                editor={editor}
                className={styles.editor}
            />
        </section>
    );
}