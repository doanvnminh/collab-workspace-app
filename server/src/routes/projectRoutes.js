import express from "express";
import Project from "../models/Project.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import Invitation from "../models/Invitation.js";

const router = express.Router();

router.use(authenticate);

// Get projects owned by or shared with the current user
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.userId },
                { "members.user": req.userId },
            ],
        }).sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get projects",
        });
    }
});

// Create a project
router.post("/", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Project name is required",
            });
        }

        const project = await Project.create({
            name: name.trim(),
            owner: req.userId,
            members: [],
        });

        res.status(201).json(project);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create project",
        });
    }
});

// Get one project
router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            $or: [
                { owner: req.userId },
                { "members.user": req.userId },
            ],
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        res.json(project);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get project",
        });
    }
});

router.post("/:projectId/invitations", async (req, res) => {
    try {
        const { email, role = "viewer" } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        if (!["viewer", "editor"].includes(role)) {
            return res.status(400).json({
                message: "Role must be viewer or editor",
            });
        }

        const project = await Project.findOne({
            _id: req.params.projectId,
            owner: req.userId,
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found or you are not the owner",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingInvitation = await Invitation.findOne({
            project: project._id,
            email: normalizedEmail,
            status: "pending",
        });

        if (existingInvitation) {
            return res.status(409).json({
                message: "This user already has a pending invitation",
            });
        }

        const invitation = await Invitation.create({
            project: project._id,
            invitedBy: req.userId,
            email: normalizedEmail,
            role,
        });

        res.status(201).json({
            message: "Invitation created successfully",
            invitation,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create invitation",
        });
    }
});

export default router;