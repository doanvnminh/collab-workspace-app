import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import documentRoutes from "./routes/documentRoutes.js";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import projectRoutes from "./routes/projectRoutes.js"
import invitationRoutes from "./routes/invitationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/documents", documentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invitations", invitationRoutes);

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Server startup failed:", error);
    });