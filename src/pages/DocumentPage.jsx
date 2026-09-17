import { ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./DocumentPage.module.css";
import Editor from "../features/editor/Editor";
import { getDocument } from "../services/apiClient";
import socket, { connectSocket } from "../services/socket";

function getInitials(user) {
    const name = user?.name || user?.email || "?";

    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}


export default function DocumentPage() {
    const { documentId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [saveStatus, setSaveStatus] = useState("Saved");
    const [activeUsers, setActiveUsers] = useState([]);

    const hasLoadedDocumentRef = useRef(false)
    const isApplyingRemoteUpdateRef = useRef(false)

    useEffect(() => {
        if (
            isLoading ||
            !hasLoadedDocumentRef.current
        ) {
            return;
        }

        if (isApplyingRemoteUpdateRef.current) {
            isApplyingRemoteUpdateRef.current = false;
            return;
        }


        const timeoutId = setTimeout(() => {
            if (!socket.connected) {
                setSaveStatus("Disconnected");
                return;
            }

            setSaveStatus("Saving...");

            socket.emit(
                "document:update",
                {
                    documentId,
                    title,
                    content,
                },
                (result) => {
                    console.log(
                        "Document update result:",
                        result
                    );

                    if (!result?.ok) {
                        setSaveStatus(
                            `Save failed: ${result?.error || "Unknown error"
                            }`
                        );

                        return;
                    }

                    setSaveStatus("Saved");
                }
            );
        }, 700);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [
        documentId,
        title,
        content,
        isLoading,
    ]);

    useEffect(() => {
        async function loadDocument() {
            try {
                const data = await getDocument(documentId);

                setTitle(data.title);
                setContent(data.content || "");
                hasLoadedDocumentRef.current = true
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }

        loadDocument();
    }, [documentId]);

    useEffect(() => {
        function handleConnect() {
            console.log("Socket connected:", socket.id);

            socket.emit("document:join", documentId);
        }

        function handleConnectError(error) {
            console.error(
                "Socket connection failed:",
                error.message
            );
        }

        function handleDocumentError(data) {
            console.error(
                "Document socket error:",
                data.message
            );
        }

        function handleDocumentUpdated(updatedDocument) {
            if (updatedDocument.documentId !== documentId) {
                return;
            }

            isApplyingRemoteUpdateRef.current = true;

            setTitle(updatedDocument.title);
            setContent(updatedDocument.content);
            setSaveStatus("Saved");
        }

        function handlePresence(users) {
            setActiveUsers(users);
        }

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("document:error", handleDocumentError);
        socket.on("document:updated", handleDocumentUpdated);
        socket.on("document:presence", handlePresence);

        if (socket.connected) {
            handleConnect();
        } else {
            connectSocket();
        }

        return () => {
            socket.emit("document:leave", documentId);

            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
            socket.off("document:error", handleDocumentError);
            socket.off("document:updated", handleDocumentUpdated);
            socket.off("document:presence", handlePresence);

            socket.disconnect();
        };
    }, [documentId]);

    function handleTitleChange(value) {
        setTitle(value);
        setSaveStatus("Saving...");
    }

    function handleContentChange(value) {
        setContent(value);
        setSaveStatus("Saving...");
    }

    function handleDocumentError(data) {
        console.error("Document socket error:", data.message);
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

            <div className={styles.statusBar}>
                <span className={styles.saveStatus}>
                    {saveStatus}
                </span>

                {activeUsers.length > 0 && (
                    <div className={styles.presence}>
                        <span className={styles.presenceLabel}>
                            Active now
                        </span>

                        <div className={styles.avatarStack}>
                            {activeUsers.slice(0, 4).map((user) => (
                                <span
                                    key={user.id}
                                    className={styles.presenceAvatar}
                                    title={`${user.name} (${user.email})`}
                                >
                                    {getInitials(user)}
                                </span>
                            ))}

                            {activeUsers.length > 4 && (
                                <span className={styles.moreUsers}>
                                    +{activeUsers.length - 4}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Editor
                title={title}
                content={content}
                onTitleChange={handleTitleChange}
                onContentChange={handleContentChange}
            />
        </section>
    );
}