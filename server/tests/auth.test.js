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
import { MongoMemoryServer } from "mongodb-memory-server";

import app from "../src/app.js";
import User from "../src/models/User.js";

let mongoServer;

beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";

    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("Authentication routes", () => {
    it("registers a new user", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "TEST@example.com",
                password: "password123",
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe(
            "User registered successfully"
        );
        expect(response.body.user.email).toBe(
            "test@example.com"
        );
        expect(response.body.user).not.toHaveProperty(
            "passwordHash"
        );
    });

    it("rejects a duplicate email", async () => {
        const user = {
            name: "Test User",
            email: "test@example.com",
            password: "password123",
        };

        await request(app)
            .post("/api/auth/register")
            .send(user);

        const response = await request(app)
            .post("/api/auth/register")
            .send(user);

        expect(response.status).toBe(409);
        expect(response.body.message).toBe(
            "Email is already registered"
        );
    });

    it("logs in with valid credentials", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "TEST@example.com",
                password: "password123",
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Login successful");
        expect(response.body.token).toEqual(expect.any(String));
        expect(response.body.user.email).toBe(
            "test@example.com"
        );
    });

    it("rejects an incorrect password", async () => {
        await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@example.com",
                password: "wrong-password",
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
            "Invalid email or password"
        );
    });
});