import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import documentRoutes from "./routes/documentRoutes.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import projectRoutes from "./routes/projectRoutes.js"
import invitationRoutes from "./routes/invitationRoutes.js";
import jwt from "jsonwebtoken";
import Document from "./models/Document.js";
import Project from "./models/Project.js";
import User from "./models/User.js";
import { WebSocketServer } from "ws";
import { createRequire } from "node:module";
import { yjsPersistence } from "./collaboration/yjsPersistence.js";
import { dirname, join } from "node:path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const require = createRequire(import.meta.url);

const yWebsocketMainPath = require.resolve("y-websocket");
const yWebsocketPackageRoot = dirname(
    dirname(yWebsocketMainPath)
);

const {
    setupWSConnection,
    setPersistence,
} = require(
    join(
        yWebsocketPackageRoot,
        "bin",
        "utils.js"
    )
);

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

const yjsWss = new WebSocketServer({
    noServer: true,
});

setPersistence(yjsPersistence);

yjsWss.on("connection", (connection, request) => {
    setupWSConnection(connection, request);
});

httpServer.on("upgrade", (request, socket, head) => {
    const requestUrl = new URL(
        request.url || "/",
        "http://127.0.0.1"
    );

    // Let Socket.IO handle its own WebSocket path.
    if (requestUrl.pathname.startsWith("/socket.io")) {
        return;
    }

    yjsWss.handleUpgrade(
        request,
        socket,
        head,
        (webSocket) => {
            yjsWss.emit(
                "connection",
                webSocket,
                request
            );
        }
    );
});

async function broadcastPresence(room) {
    const sockets = await io.in(room).fetchSockets();

    const users = [];
    const seenUserIds = new Set();

    for (const connectedSocket of sockets) {
        const user = connectedSocket.data.user;

        if (!user || seenUserIds.has(user.id)) {
            continue;
        }

        seenUserIds.add(user.id);
        users.push(user);
    }

    io.in(room).emit("document:presence", users);
}

app.use(cors());
app.use(express.json());

app.use("/api/documents", documentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invitations", invitationRoutes);

connectDB()
    .then(() => {
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Server startup failed:", error);
    });

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        socket.userId = decodedToken.userId;

        next();
    } catch {
        next(new Error("Invalid authentication token"));
    }
});

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("document:join", async (documentId) => {
        try {
            const document = await Document.findById(documentId);

            if (!document) {
                return socket.emit("document:error", {
                    message: "Document not found",
                });
            }

            const project = await Project.findOne({
                _id: document.project,
                $or: [
                    { owner: socket.userId },
                    { "members.user": socket.userId },
                ],
            });

            if (!project) {
                return socket.emit("document:error", {
                    message: "You do not have access to this document",
                });
            }

            const user = await User.findById(socket.userId)
                .select("name email");

            if (!user) {
                return socket.emit("document:error", {
                    message: "User not found",
                });
            }

            const previousDocumentId =
                socket.data.documentId;

            if (
                previousDocumentId &&
                previousDocumentId !== documentId
            ) {
                socket.leave(
                    `document:${previousDocumentId}`
                );

                await broadcastPresence(
                    `document:${previousDocumentId}`
                );
            }

            socket.data.documentId = documentId;
            socket.data.user = {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
            };

            const room = `document:${documentId}`;

            socket.join(room);

            await broadcastPresence(room);

            console.log(
                `${socket.id} joined document ${documentId}`
            );
        } catch (error) {
            console.error(error);

            socket.emit("document:error", {
                message: "Failed to join document",
            });
        }
    });

    socket.on(
        "document:update",
        async (data, callback) => {
            const respond =
                typeof callback === "function"
                    ? callback
                    : () => { };

            try {
                const {
                    documentId,
                    title,
                    content,
                } = data;

                if (!documentId) {
                    return respond({
                        ok: false,
                        error: "documentId is required",
                    });
                }

                const document =
                    await Document.findById(documentId);

                if (!document) {
                    return respond({
                        ok: false,
                        error: "Document not found",
                    });
                }

                const project = await Project.findOne({
                    _id: document.project,
                    $or: [
                        { owner: socket.userId },
                        { "members.user": socket.userId },
                    ],
                });

                if (!project) {
                    return respond({
                        ok: false,
                        error: "You cannot edit this document",
                    });
                }

                if (typeof title === "string") {
                    document.title = title;
                }

                if (typeof content === "string") {
                    document.content = content;
                }

                await document.save();

                const updatedDocument = {
                    documentId: document._id.toString(),
                    title: document.title,
                    content: document.content,
                };

                socket
                    .to(`document:${documentId}`)
                    .emit(
                        "document:updated",
                        updatedDocument
                    );

                respond({
                    ok: true,
                    document: updatedDocument,
                });
            } catch (error) {
                console.error(error);

                respond({
                    ok: false,
                    error: "Failed to update document",
                });
            }
        }
    );

    socket.on("document:leave", async (documentId) => {
        const room = `document:${documentId}`;

        socket.leave(room);

        if (socket.data.documentId === documentId) {
            delete socket.data.documentId;
        }

        await broadcastPresence(room);
    });

    socket.on("disconnect", async () => {
        const documentId =
            socket.data.documentId;

        if (documentId) {
            await broadcastPresence(
                `document:${documentId}`
            );
        }

        console.log(
            "Socket disconnected:",
            socket.id
        );
    });
});