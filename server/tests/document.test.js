import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
} from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../src/app.js";
import User from "../src/models/User.js";
import Project from "../src/models/Project.js";
import Document from "../src/models/Document.js";

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";

    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Document.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
});

async function createTestUser(email) {
    return User.create({
        name: "Test User",
        email,
        passwordHash: "test-password-hash",
    });
}

function getAuthHeader(user) {
    const token = jwt.sign(
        {
            userId: user._id.toString(),
        },
        process.env.JWT_SECRET
    );

    return `Bearer ${token}`;
}

async function createProject(owner, members = []) {
    return Project.create({
        name: "Test workspace",
        owner: owner._id,
        members,
    });
}

describe("Document routes", () => {
    it("allows the owner to create a document", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const project = await createProject(owner);

        const response = await request(app)
            .post("/api/documents")
            .set("Authorization", getAuthHeader(owner))
            .send({
                projectId: project._id.toString(),
                title: "Test document",
                content: "Hello world",
            });

        expect(response.status).toBe(201);
        expect(response.body.title).toBe("Test document");
        expect(response.body.content).toBe("Hello world");
        expect(response.body.project).toBe(
            project._id.toString()
        );
    });

    it("allows a member to create a document", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const member = await createTestUser(
            "member@example.com"
        );

        const project = await createProject(owner, [
            {
                user: member._id,
                role: "editor",
            },
        ]);

        const response = await request(app)
            .post("/api/documents")
            .set("Authorization", getAuthHeader(member))
            .send({
                projectId: project._id.toString(),
                title: "Member document",
                content: "Created by member",
            });

        expect(response.status).toBe(201);
        expect(response.body.title).toBe("Member document");
    });

    it("does not allow an unrelated user to list documents", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const outsider = await createTestUser(
            "outsider@example.com"
        );

        const project = await createProject(owner);

        await Document.create({
            project: project._id,
            createdBy: owner._id,
            title: "Private document",
            content: "Private content",
        });

        const response = await request(app)
            .get(`/api/documents?projectId=${project._id}`)
            .set("Authorization", getAuthHeader(outsider));

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            "Project not found"
        );
    });

    it("does not allow an unrelated user to open a document", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const outsider = await createTestUser(
            "outsider@example.com"
        );

        const project = await createProject(owner);

        const document = await Document.create({
            project: project._id,
            createdBy: owner._id,
            title: "Private document",
            content: "Private content",
        });

        const response = await request(app)
            .get(`/api/documents/${document._id}`)
            .set("Authorization", getAuthHeader(outsider));

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
            "You do not have access to this document"
        );
    });

    it("allows a project member to update a document", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const member = await createTestUser(
            "member@example.com"
        );

        const project = await createProject(owner, [
            {
                user: member._id,
                role: "editor",
            },
        ]);

        const document = await Document.create({
            project: project._id,
            createdBy: owner._id,
            title: "Original title",
            content: "Original content",
        });

        const response = await request(app)
            .put(`/api/documents/${document._id}`)
            .set("Authorization", getAuthHeader(member))
            .send({
                title: "Updated title",
                content: "Updated content",
            });

        expect(response.status).toBe(200);
        expect(response.body.title).toBe("Updated title");
        expect(response.body.content).toBe(
            "Updated content"
        );
    });

    it("does not allow a member to delete a document", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const member = await createTestUser(
            "member@example.com"
        );

        const project = await createProject(owner, [
            {
                user: member._id,
                role: "editor",
            },
        ]);

        const document = await Document.create({
            project: project._id,
            createdBy: owner._id,
            title: "Shared document",
            content: "Shared content",
        });

        const response = await request(app)
            .delete(`/api/documents/${document._id}`)
            .set("Authorization", getAuthHeader(member));

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
            "Only the project owner can delete documents"
        );

        const documentStillExists = await Document.findById(
            document._id
        );

        expect(documentStillExists).not.toBeNull();
    });

    it("allows the owner to delete a document", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const project = await createProject(owner);

        const document = await Document.create({
            project: project._id,
            createdBy: owner._id,
            title: "Document to delete",
            content: "Temporary content",
        });

        const response = await request(app)
            .delete(`/api/documents/${document._id}`)
            .set("Authorization", getAuthHeader(owner));

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
            "Document deleted successfully"
        );

        const deletedDocument = await Document.findById(
            document._id
        );

        expect(deletedDocument).toBeNull();
    });
});