import express from "express";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { createHistoryRouter } from "../history";
import { errorHandler } from "../../middleware/errorHandler";

const mockAnalyses = [
  { id: "1", createdAt: new Date(), wordCount: 10, overallScore: 80, suggestions: [{ status: "good" }] },
  { id: "2", createdAt: new Date(), wordCount: 20, overallScore: 50, suggestions: [{ status: "warning" }] },
];

const mockPrisma = {
  analysis: {
    findMany: jest.fn().mockResolvedValue(mockAnalyses),
    count: jest.fn().mockResolvedValue(2),
    findUnique: jest.fn().mockImplementation(({ where }) => {
      if (where.id === "1") return Promise.resolve(mockAnalyses[0]);
      return Promise.resolve(null);
    }),
    delete: jest.fn().mockResolvedValue(mockAnalyses[0]),
  },
} as unknown as PrismaClient;

const app = express();
app.use(express.json());
app.use("/api/history", createHistoryRouter(mockPrisma));
app.use(errorHandler);

describe("History Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/history", () => {
    it("should return a paginated list of items with summary", async () => {
      const response = await request(app).get("/api/history?page=1&limit=10");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("total", 2);
      expect(response.body.items).toHaveLength(2);
      // Check summary extraction
      expect(response.body.items[0].suggestionsSummary).toHaveProperty("good", 1);
    });
  });

  describe("GET /api/history/:id", () => {
    it("should return single item if found", async () => {
      const response = await request(app).get("/api/history/1");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", "1");
    });

    it("should return 404 if not found", async () => {
      const response = await request(app).get("/api/history/99");
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/history/:id", () => {
    it("should delete item and return 204", async () => {
      const response = await request(app).delete("/api/history/1");
      expect(response.status).toBe(204);
      expect(mockPrisma.analysis.delete).toHaveBeenCalledWith({ where: { id: "1" } });
    });

    it("should return 404 if trying to delete non-existent item", async () => {
      const response = await request(app).delete("/api/history/99");
      expect(response.status).toBe(404);
    });
  });
});
