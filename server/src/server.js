import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import documentRoutes from "./routes/documentRoutes.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import projectRoutes from "./routes/projectRoutes.js"
import invitationRoutes from "./routes/invitationRoutes.js";
import jwt from "jsonwebtoken";
import Document from "./models/Document.js";
import Project from "./models/Project.js";
import { WebSocketServer } from "ws";
import { createRequire } from "node:module";
import { yjsPersistence } from "./collaboration/yjsPersistence.js";
import { dirname, join } from "node:path";

dotenv.config();

const CLIENT_URL =
    process.env.CLIENT_URL || "http://localhost:5173";

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



const yjsWss = new WebSocketServer({
    noServer: true,
});

setPersistence(yjsPersistence);

yjsWss.on("connection", (connection, request) => {
    setupWSConnection(connection, request);
});

httpServer.on("upgrade", async (request, socket, head) => {

    const requestUrl = new URL(
        request.url || "/",
        "http://127.0.0.1"
    );

    // Leave Socket.IO connections alone.
    if (!requestUrl.pathname.startsWith("/document-")) {
        socket.destroy();
        return;
    }

    try {
        const token = requestUrl.searchParams.get("token");


        if (!token) {
            throw new Error("Missing authentication token");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const roomName = decodeURIComponent(
            requestUrl.pathname.slice(1)
        );

        const prefix = "document-";

        if (!roomName.startsWith(prefix)) {
            throw new Error("Invalid document room");
        }

        const documentId = roomName.slice(prefix.length);

        const document = await Document.findById(
            documentId
        ).select("project");

        if (!document) {
            throw new Error("Document not found");
        }

        const project = await Project.findOne({
            _id: document.project,
            $or: [
                { owner: decodedToken.userId },
                { "members.user": decodedToken.userId },
            ],
        });

        if (!project) {
            throw new Error("User has no document access");
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
    } catch (error) {
        console.error(
            "Yjs authorization failed:",
            error.message
        );

        socket.write(
            "HTTP/1.1 401 Unauthorized\r\n" +
            "Connection: close\r\n\r\n"
        );

        socket.destroy();
    }
});



app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.use("/api/documents", documentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invitations", invitationRoutes);

connectDB()
    .then(() => {
        httpServer.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Server startup failed:", error);
    });



