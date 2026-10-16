import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import documentRoutes from "./routes/documentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";

dotenv.config();

const CLIENT_URL =
    process.env.CLIENT_URL || "http://localhost:5173";

const app = express();

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "CollabDocs API is running",
    });
});

app.use("/api/documents", documentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invitations", invitationRoutes);

export default app;