import { test, expect, describe } from "vitest";
import express from "express";
import request from "supertest";
import tyex from "../src";

describe("openapi middleware", () => {
  test("should serve OpenAPI document", async () => {
    const app = express();

    app.get(
      "/api/resource",
      tyex.handler(
        {
          responses: {
            "200": { description: "Successful response" },
          },
        },
        (req, res) => {
          res.send();
        },
      ),
    );

    app.use("/openapi.json", tyex.openapi());

    const response = await request(app).get("/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      info: {
        title: "ExpressJS",
        version: "0.0.0",
      },
      openapi: "3.0.0",
      paths: {
        "/api/resource": {
          get: {
            responses: {
              "200": {
                description: "Successful response",
              },
            },
          },
        },
      },
    });
  });
});
