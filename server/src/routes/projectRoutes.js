import express from "express";
import Project from "../models/Project.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import Invitation from "../models/Invitation.js";
import User from "../models/User.js";
import Document from "../models/Document.js";

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
        })
            .populate("owner", "name email")
            .populate("members.user", "name email");
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
        const { email } = req.body;

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

        const invitedUser = await User.findOne({
            email: normalizedEmail,
        });

        if (invitedUser) {
            const invitedUserId = invitedUser._id.toString();

            if (project.owner.toString() === invitedUserId) {
                return res.status(409).json({
                    message: "The workspace owner is already a member",
                });
            }

            const alreadyMember = project.members.some(
                (member) => member.user.toString() === invitedUserId
            );

            if (alreadyMember) {
                return res.status(409).json({
                    message: "This user is already a workspace member",
                });
            }
        }

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
            role: "editor",
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

router.delete("/:projectId/members/:userId", async (req, res) => {
    try {
        const { projectId, userId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        if (project.owner.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only the workspace owner can remove contributors",
            });
        }

        if (project.owner.toString() === userId) {
            return res.status(400).json({
                message: "The workspace owner cannot be removed",
            });
        }

        const memberExists = project.members.some(
            (member) => member.user.toString() === userId
        );

        if (!memberExists) {
            return res.status(404).json({
                message: "Contributor not found",
            });
        }

        project.members = project.members.filter(
            (member) => member.user.toString() !== userId
        );

        await project.save();

        res.json({
            message: "Contributor removed successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to remove contributor",
        });
    }
});

router.patch("/:id", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Workspace name is required",
            });
        }

        const project = await Project.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.userId,
            },
            {
                name: name.trim(),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!project) {
            return res.status(404).json({
                message: "Workspace not found or you are not the owner",
            });
        }

        res.json(project);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to rename workspace",
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.userId,
        });

        if (!project) {
            return res.status(404).json({
                message: "Workspace not found or you are not the owner",
            });
        }

        await Document.deleteMany({
            project: project._id,
        });

        await Invitation.deleteMany({
            project: project._id,
        });

        await Project.deleteOne({
            _id: project._id,
        });

        res.json({
            message: "Workspace deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete workspace",
        });
    }
});

export default router;