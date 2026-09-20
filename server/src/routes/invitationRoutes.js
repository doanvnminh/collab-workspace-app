import express from "express";
import Invitation from "../models/Invitation.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

// Get current user's pending invitations
router.get("/", async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        const invitations = await Invitation.find({
            email: user.email,
            status: "pending",
            expiresAt: { $gt: new Date() },
        })
            .populate("project", "name")
            .populate("invitedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(invitations);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get invitations",
        });
    }
});

// Accept an invitation
router.post("/:invitationId/accept", async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        const invitation = await Invitation.findOne({
            _id: req.params.invitationId,
            email: user.email,
            status: "pending",
        });

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found",
            });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = "declined";
            await invitation.save();

            return res.status(410).json({
                message: "Invitation has expired",
            });
        }

        const project = await Project.findById(invitation.project);

        if (!project) {
            return res.status(404).json({
                message: "Project not found",
            });
        }

        const currentUserId = req.userId.toString();
        const ownerId = project.owner.toString();

        if (ownerId === currentUserId) {
            return res.status(409).json({
                message: "You are already the owner of this workspace",
            });
        }

        const alreadyMember = project.members.some(
            (member) => member.user.toString() === currentUserId
        );

        if (alreadyMember) {
            return res.status(409).json({
                message: "You are already a member of this workspace",
            });
        }

        project.members.push({
            user: req.userId,
            role: "editor",
        });

        await project.save();

        invitation.status = "accepted";
        await invitation.save();

        res.json({
            message: "Invitation accepted",
            project,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to accept invitation",
        });
    }
});

// Decline an invitation
router.post("/:invitationId/decline", async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        const invitation = await Invitation.findOneAndUpdate(
            {
                _id: req.params.invitationId,
                email: user.email,
                status: "pending",
            },
            {
                status: "declined",
            },
            {
                new: true,
            }
        );

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found",
            });
        }

        res.json({
            message: "Invitation declined",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to decline invitation",
        });
    }
});

// Get unread invitation count
router.get("/unread-count", async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("email");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const count = await Invitation.countDocuments({
            email: user.email.toLowerCase(),
            status: "pending",
            readAt: null,
            expiresAt: { $gt: new Date() },
        });

        res.json({ count });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get unread notification count",
        });
    }
});

// Mark current user's invitations as read
router.patch("/read", async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("email");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        await Invitation.updateMany(
            {
                email: user.email.toLowerCase(),
                status: "pending",
                readAt: null,
                expiresAt: { $gt: new Date() },
            },
            {
                $set: {
                    readAt: new Date(),
                },
            }
        );

        res.json({
            message: "Notifications marked as read",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to mark notifications as read",
        });
    }
});

export default router;