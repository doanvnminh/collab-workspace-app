import * as Y from "yjs";
import mongoose from "mongoose";
import Document from "../models/Document.js";

const saveTimers = new Map();

function getDocumentId(roomName) {
    const name = decodeURIComponent(
        roomName.split("/").pop() || ""
    );

    const prefix = "document-";

    if (!name.startsWith(prefix)) {
        return null;
    }

    const documentId = name.slice(prefix.length);

    return mongoose.isValidObjectId(documentId)
        ? documentId
        : null;
}

async function saveState(roomName, ydoc) {
    const documentId = getDocumentId(roomName);

    if (!documentId) {
        return;
    }

    const update = Y.encodeStateAsUpdate(ydoc);

    await Document.findByIdAndUpdate(documentId, {
        collaborationState: Buffer.from(update),
    });
}

function scheduleSave(roomName, ydoc) {
    const existingTimer = saveTimers.get(roomName);

    if (existingTimer) {
        clearTimeout(existingTimer);
    }

    const timer = setTimeout(async () => {
        saveTimers.delete(roomName);

        try {
            await saveState(roomName, ydoc);
            console.log(`Yjs document saved: ${roomName}`);
        } catch (error) {
            console.error("Failed to save Yjs document:", error);
        }
    }, 1000);

    saveTimers.set(roomName, timer);
}

export const yjsPersistence = {
    async bindState(roomName, ydoc) {
        const documentId = getDocumentId(roomName);

        if (!documentId) {
            return;
        }

        const document = await Document.findById(documentId)
            .select("+collaborationState");

        if (document?.collaborationState?.length) {
            Y.applyUpdate(
                ydoc,
                new Uint8Array(document.collaborationState)
            );
        }

        ydoc.on("update", () => {
            scheduleSave(roomName, ydoc);
        });
    },

    async writeState(roomName, ydoc) {
        const existingTimer = saveTimers.get(roomName);

        if (existingTimer) {
            clearTimeout(existingTimer);
            saveTimers.delete(roomName);
        }

        await saveState(roomName, ydoc);
    },
};