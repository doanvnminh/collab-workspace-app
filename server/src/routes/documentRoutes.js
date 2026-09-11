import express from "express";
import Document from "../models/Document.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticate)

// Get all documents
router.get("/", async (req, res) => {
    try {
        // Get only this user's documents
        const documents = await Document.find({
            owner: req.userId,
        });

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
            owner: req.userId,
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
                owner: req.userId,
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

export default router;