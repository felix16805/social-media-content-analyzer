import express from "express";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createAnalyzeRouter } from "../analyze";
import { errorHandler } from "../../middleware/errorHandler";

// Use a mock Prisma client instead of a real database
const mockPrisma = {
  analysis: {
    create: jest.fn().mockResolvedValue({ id: "test-id" }),
  },
} as unknown as PrismaClient;

const app = express();
app.use(express.json());
app.use("/api/analyze", createAnalyzeRouter(mockPrisma));
app.use(errorHandler);

describe("POST /api/analyze", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should analyze text and save it", async () => {
    const response = await request(app)
      .post("/api/analyze")
      .send({ text: "Hello world. Please comment below #test" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("analysisId", "test-id");
    expect(response.body.analysis).toHaveProperty("wordCount", 6);
    expect(response.body.analysis).toHaveProperty("hasCta", true);
    expect(response.body.analysis).toHaveProperty("hashtagCount", 1);
    
    // Verify it was saved to DB
    expect(mockPrisma.analysis.create).toHaveBeenCalledTimes(1);
    const callArgs = (mockPrisma.analysis.create as jest.Mock).mock.calls[0][0];
    expect(callArgs.data).toHaveProperty("extractedText", "Hello world. Please comment below #test");
  });

  it("should return 400 if text is missing", async () => {
    const response = await request(app).post("/api/analyze").send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("code", "VALIDATION_ERROR");
  });
});
