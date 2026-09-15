import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        role: {
            type: String,
            enum: ["viewer", "editor"],
            default: "viewer",
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending",
        },

        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    },
    {
        timestamps: true,
    }
);

const Invitation = mongoose.model(
    "Invitation",
    invitationSchema
);

export default Invitation;