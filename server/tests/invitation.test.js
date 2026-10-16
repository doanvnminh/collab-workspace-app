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
import Invitation from "../src/models/Invitation.js";

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";

    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Invitation.deleteMany({});
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

async function createInvitation(project, owner, email) {
    return Invitation.create({
        project: project._id,
        invitedBy: owner._id,
        email,
        role: "editor",
        status: "pending",
        readAt: null,
    });
}

describe("Invitation routes", () => {
    it("allows the owner to create an invitation", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const project = await createProject(owner);

        const response = await request(app)
            .post(`/api/projects/${project._id}/invitations`)
            .set("Authorization", getAuthHeader(owner))
            .send({
                email: " INVITEE@example.com ",
            });

        expect(response.status).toBe(201);
        expect(response.body.invitation.email).toBe(
            "invitee@example.com"
        );
        expect(response.body.invitation.role).toBe("editor");
    });

    it("does not allow a non-owner to create an invitation", async () => {
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
            .post(`/api/projects/${project._id}/invitations`)
            .set("Authorization", getAuthHeader(member))
            .send({
                email: "invitee@example.com",
            });

        expect(response.status).toBe(404);
    });

    it("shows a pending invitation and unread count", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const invitee = await createTestUser(
            "invitee@example.com"
        );

        const project = await createProject(owner);

        await createInvitation(
            project,
            owner,
            invitee.email
        );

        const invitationsResponse = await request(app)
            .get("/api/invitations")
            .set("Authorization", getAuthHeader(invitee));

        expect(invitationsResponse.status).toBe(200);
        expect(invitationsResponse.body).toHaveLength(1);
        expect(
            invitationsResponse.body[0].project.name
        ).toBe("Test workspace");

        const countResponse = await request(app)
            .get("/api/invitations/unread-count")
            .set("Authorization", getAuthHeader(invitee));

        expect(countResponse.status).toBe(200);
        expect(countResponse.body.count).toBe(1);
    });

    it("allows the invited user to accept an invitation", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const invitee = await createTestUser(
            "invitee@example.com"
        );

        const project = await createProject(owner);

        const invitation = await createInvitation(
            project,
            owner,
            invitee.email
        );

        const response = await request(app)
            .post(
                `/api/invitations/${invitation._id}/accept`
            )
            .set("Authorization", getAuthHeader(invitee));

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
            "Invitation accepted"
        );

        const updatedProject = await Project.findById(
            project._id
        );

        const member = updatedProject.members.find(
            (projectMember) =>
                projectMember.user.toString() ===
                invitee._id.toString()
        );

        expect(member).toBeDefined();
        expect(member.role).toBe("editor");

        const updatedInvitation =
            await Invitation.findById(invitation._id);

        expect(updatedInvitation.status).toBe("accepted");
    });

    it("allows the invited user to decline an invitation", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const invitee = await createTestUser(
            "invitee@example.com"
        );

        const project = await createProject(owner);

        const invitation = await createInvitation(
            project,
            owner,
            invitee.email
        );

        const response = await request(app)
            .post(
                `/api/invitations/${invitation._id}/decline`
            )
            .set("Authorization", getAuthHeader(invitee));

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(
            "Invitation declined"
        );

        const updatedInvitation =
            await Invitation.findById(invitation._id);

        expect(updatedInvitation.status).toBe("declined");
    });

    it("marks pending invitations as read", async () => {
        const owner = await createTestUser(
            "owner@example.com"
        );

        const invitee = await createTestUser(
            "invitee@example.com"
        );

        const project = await createProject(owner);

        await createInvitation(
            project,
            owner,
            invitee.email
        );

        const markReadResponse = await request(app)
            .patch("/api/invitations/read")
            .set("Authorization", getAuthHeader(invitee));

        expect(markReadResponse.status).toBe(200);

        const countResponse = await request(app)
            .get("/api/invitations/unread-count")
            .set("Authorization", getAuthHeader(invitee));

        expect(countResponse.status).toBe(200);
        expect(countResponse.body.count).toBe(0);
    });
});