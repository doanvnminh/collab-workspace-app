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

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";

    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
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

describe("Workspace routes", () => {
    it("requires authentication", async () => {
        const response = await request(app)
            .get("/api/projects");

        expect(response.status).toBe(401);
    });

    it("allows an authenticated user to create a workspace", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const response = await request(app)
            .post("/api/projects")
            .set("Authorization", getAuthHeader(owner))
            .send({
                name: "  My workspace  ",
            });

        expect(response.status).toBe(201);
        expect(response.body.name).toBe("My workspace");
        expect(response.body.owner).toBe(
            owner._id.toString()
        );
    });

    it("allows the owner to view the workspace", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const project = await Project.create({
            name: "Owner workspace",
            owner: owner._id,
            members: [],
        });

        const response = await request(app)
            .get(`/api/projects/${project._id}`)
            .set("Authorization", getAuthHeader(owner));

        expect(response.status).toBe(200);
        expect(response.body.name).toBe("Owner workspace");
    });

    it("allows a workspace member to view the workspace", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const member = await createTestUser(
            "member@example.com"
        );

        const project = await Project.create({
            name: "Shared workspace",
            owner: owner._id,
            members: [
                {
                    user: member._id,
                    role: "editor",
                },
            ],
        });

        const response = await request(app)
            .get(`/api/projects/${project._id}`)
            .set("Authorization", getAuthHeader(member));

        expect(response.status).toBe(200);
        expect(response.body.name).toBe("Shared workspace");
    });

    it("does not allow an unrelated user to view the workspace", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const outsider = await createTestUser(
            "outsider@example.com"
        );

        const project = await Project.create({
            name: "Private workspace",
            owner: owner._id,
            members: [],
        });

        const response = await request(app)
            .get(`/api/projects/${project._id}`)
            .set("Authorization", getAuthHeader(outsider));

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            "Project not found"
        );
    });
});