import express from "express";
import Document from "../models/Document.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.use(authenticate)

// Get all documents
router.get("/", async (req, res) => {
    try {
        // Get only this user's documents
        const documents = await Document.find({
            $or: [
                { owner: req.userId },
                { "collaborators.user": req.userId },
            ],
        }).sort({ updatedAt: -1 });

        res.json(documents);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get documents",
        });
    }
});

// Get one document
router.get("/:id", async (req, res) => {
    try {
        // Get one document owned by this user
        const document = await Document.findOne({
            _id: req.params.id,
            $or: [
                { owner: req.userId },
                { "collaborators.user": req.userId },
            ],
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        res.json(document);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get document",
        });
    }
});

// Create a document
router.post("/", async (req, res) => {
    try {
        const document = await Document.create({
            title: req.body.title || "Untitled document",
            content: req.body.content || "",
            owner: req.userId,
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({
            message: "Failed to create document",
        });
    }
});

// Update a document
router.put("/:id", async (req, res) => {
    try {
        const document = await Document.findOneAndUpdate(
            {
                _id: req.params.id,
                $or: [
                    { owner: req.userId },
                    {
                        collaborators: {
                            $elemMatch: {
                                user: req.userId,
                                role: "editor",
                            },
                        },
                    },
                ],
            },
            {
                title: req.body.title,
                content: req.body.content,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        res.json(document);
    } catch (error) {
        res.status(500).json({
            message: "Failed to update document",
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const document = await Document.findOneAndDelete({
            _id: req.params.id,
            owner: req.userId,
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        res.json({
            message: "Document deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete document",
        });
    }
});

router.post("/:id/share", async (req, res) => {
    try {
        const { email, role = "viewer" } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        if (!["viewer", "editor"].includes(role)) {
            return res.status(400).json({
                message: "Role must be viewer or editor",
            });
        }

        const document = await Document.findOne({
            _id: req.params.id,
            owner: req.userId,
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                message: "User with this email was not found",
            });
        }

        if (user._id.toString() === req.userId.toString()) {
            return res.status(400).json({
                message: "You already own this document",
            });
        }

        const alreadyShared = document.collaborators.some(
            (collaborator) =>
                collaborator.user.toString() === user._id.toString()
        );

        if (alreadyShared) {
            return res.status(409).json({
                message: "Document is already shared with this user",
            });
        }

        document.collaborators.push({
            user: user._id,
            role,
        });

        await document.save();

        res.json({
            message: "Document shared successfully",
            document,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to share document",
        });
    }
});

export default router;