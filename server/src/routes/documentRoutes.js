import express from "express";
import Document from "../models/Document.js";
import Project from "../models/Project.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

// Get documents inside a project
router.get("/", async (req, res) => {
    try {
        const { projectId } = req.query;

        if (!projectId) {
            return res.status(400).json({
                message: "projectId is required",
            });
        }

        const project = await Project.findOne({
            _id: projectId,
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

        const documents = await Document.find({
            project: projectId,
        }).sort({ updatedAt: -1 });

        const userId = req.userId.toString();

        const documentsWithFavoriteStatus = documents.map((document) => {
            const data =
                typeof document.toObject === "function"
                    ? document.toObject()
                    : document;

            return {
                ...data,
                isFavorite: (document.favoritedBy || []).some(
                    (favoriteUserId) =>
                        favoriteUserId.toString() === userId
                ),
            };
        });

        res.json(documentsWithFavoriteStatus);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get documents",
        });
    }
});

// Get one document
router.get("/:id", async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        const project = await Project.findOne({
            _id: document.project,
            $or: [
                { owner: req.userId },
                { "members.user": req.userId },
            ],
        });

        if (!project) {
            return res.status(403).json({
                message: "You do not have access to this document",
            });
        }

        res.json(document);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get document",
        });
    }
});

// Create a document inside a project
router.post("/", async (req, res) => {
    try {
        const { projectId, title, content } = req.body;

        if (!projectId) {
            return res.status(400).json({
                message: "projectId is required",
            });
        }

        const project = await Project.findOne({
            _id: projectId,
            $or: [
                { owner: req.userId },
                { "members.user": req.userId },
            ],
        });

        if (!project) {
            return res.status(403).json({
                message: "You cannot create documents in this project",
            });
        }

        const document = await Document.create({
            project: projectId,
            createdBy: req.userId,
            title: title || "Untitled document",
            content: content || "",
        });

        res.status(201).json(document);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create document",
        });
    }
});

// Update a document
router.put("/:id", async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        const project = await Project.findOne({
            _id: document.project,
            $or: [
                { owner: req.userId },
                { "members.user": req.userId },
            ],
        });

        if (!project) {
            return res.status(403).json({
                message: "You cannot edit this document",
            });
        }

        if (typeof req.body.title === "string") {
            document.title = req.body.title;
        }

        if (typeof req.body.content === "string") {
            document.content = req.body.content;
        }

        await document.save();

        res.json(document);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update document",
        });
    }
});

// Delete a document — project owner only
router.delete("/:id", async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        const project = await Project.findOne({
            _id: document.project,
            owner: req.userId,
        });

        if (!project) {
            return res.status(403).json({
                message: "Only the project owner can delete documents",
            });
        }

        await document.deleteOne();

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

router.patch("/:id/favorite", async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        const project = await Project.findOne({
            _id: document.project,
            $or: [
                { owner: req.userId },
                { "members.user": req.userId },
            ],
        });

        if (!project) {
            return res.status(403).json({
                message: "You do not have access to this document",
            });
        }

        if (!document.favoritedBy) {
            document.favoritedBy = [];
        }

        const userId = req.userId.toString();

        const favoriteIndex = document.favoritedBy.findIndex(
            (id) => id.toString() === userId
        );

        let isFavorite;

        if (favoriteIndex === -1) {
            document.favoritedBy.push(req.userId);
            isFavorite = true;
        } else {
            document.favoritedBy.splice(favoriteIndex, 1);
            isFavorite = false;
        }

        await document.save();

        res.json({
            isFavorite,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update favorite",
        });
    }
});

export default router;