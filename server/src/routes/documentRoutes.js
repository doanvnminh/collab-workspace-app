import express from "express";
import Document from "../models/Document.js";

const router = express.Router();

// Get all documents
router.get("/", async (req, res) => {
    try {
        const documents = await Document.find().sort({ updatedAt: -1 });

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
        const document = await Document.findById(req.params.id);

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
        const document = await Document.findByIdAndUpdate(
            req.params.id,
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