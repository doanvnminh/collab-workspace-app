import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            default: "Untitled document",
        },

        content: {
            type: String,
            default: "",
        },

        collaborationState: {
            type: Buffer,
            default: null,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;