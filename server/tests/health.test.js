import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Health route", () => {
    it("returns a successful API response", async () => {
        const response = await request(app)
            .get("/api/health");

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            status: "ok",
            message: "CollabDocs API is running",
        });
    });
});