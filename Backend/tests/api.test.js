require("dotenv").config();

const request = require("supertest");
const app = require("../src/app");

describe("API", () => {
  it("rejects login without credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/unknown-route");
    expect(res.status).toBe(404);
  });

  it("requires authentication for protected routes", async () => {
    const res = await request(app).get("/api/books");
    expect(res.status).toBe(401);
  });

  it("rejects invalid book payload", async () => {
    const res = await request(app)
      .post("/api/books")
      .send({ title: "", author: "" });
    expect(res.status).toBe(401);
  });
});
