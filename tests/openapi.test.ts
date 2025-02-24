import { describe, expect, test } from "vitest";
import { Type } from "@sinclair/typebox";
import SwaggerParser from "@apidevtools/swagger-parser";
import express from "express";
import request from "supertest";

import tyex, { TypeOpenAPI } from "../src";

describe("OpenAPI Middleware", () => {
  test("Should serve OpenAPI specification with correct info", async () => {
    const app = express();
    const t = tyex(app);

    const info = {
      title: "Test API",
      version: "1.0.0",
      description: "Test API description",
    };
    app.use("/openapi", t.openapi({ info }));

    const response = await request(app)
      .get("/openapi")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toStrictEqual({
      openapi: "3.0.0",
      info,
      paths: {},
    });
  });

  test("Should include route paths and methods in OpenAPI spec", async () => {
    const app = express();
    const t = tyex(app);
    const router = tyex.Router();

    const info = {
      title: "Test API",
      version: "1.0.0",
    };
    app.use("/openapi", t.openapi({ info }));

    router.get(
      "/cats",
      {
        summary: "Get all cats",
        responses: {
          200: {
            description: "List of cats",
            content: {
              "application/json": {
                schema: Type.Array(
                  Type.Object({
                    id: Type.Number(),
                    name: Type.String(),
                  }),
                ),
              },
            },
          },
        },
      },
      (req, res) => {
        res.json([]);
      },
    );

    router.post(
      "/cats",
      {
        summary: "Create a cat",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: Type.Object({
                name: Type.String(),
                age: Type.Number(),
              }),
            },
          },
        },
        responses: {
          201: {
            description: "Cat created",
            content: {
              "application/json": {
                schema: Type.Object({
                  id: Type.Number(),
                  name: Type.String(),
                  age: Type.Number(),
                }),
              },
            },
          },
        },
      },
      (req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      },
    );

    // Without definition
    router.put("/cats", (req, res) => {
      res.status(204).send();
    });

    t.mount("/api", router);

    const response = await request(app)
      .get("/openapi")
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toStrictEqual({
      info: {
        title: "Test API",
        version: "1.0.0",
      },
      openapi: "3.0.0",
      paths: {
        "/api/cats": {
          get: {
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      items: {
                        properties: {
                          id: { type: "number" },
                          name: { type: "string" },
                        },
                        required: ["id", "name"],
                        type: "object",
                      },
                      type: "array",
                    },
                  },
                },
                description: "List of cats",
              },
            },
            summary: "Get all cats",
          },
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    properties: {
                      age: { type: "number" },
                      name: { type: "string" },
                    },
                    required: ["name", "age"],
                    type: "object",
                  },
                },
              },
              required: true,
            },
            responses: {
              "201": {
                content: {
                  "application/json": {
                    schema: {
                      properties: {
                        age: { type: "number" },
                        id: { type: "number" },
                        name: { type: "string" },
                      },
                      required: ["id", "name", "age"],
                      type: "object",
                    },
                  },
                },
                description: "Cat created",
              },
            },
            summary: "Create a cat",
          },
          put: {
            responses: {
              default: {
                description: "Unknown",
              },
            },
          },
        },
      },
    });
  });

  test("Should generate a valid OpenAPI 3.0 specification", async () => {
    const app = express();
    const t = tyex(app);
    const router = tyex.Router();

    app.use(
      "/openapi",
      t.openapi({
        info: {
          title: "Pet Store API",
          version: "1.0.0",
          description: "A sample Pet Store API",
        },
      }),
    );

    const PetSchema = Type.Object({
      id: Type.Number(),
      name: Type.String(),
      type: TypeOpenAPI.StringEnum(["foo", "bar"]),
      description: TypeOpenAPI.Nullable(Type.String()),
    });

    router.get(
      "/pets",
      {
        summary: "List all pets",
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: TypeOpenAPI.Options(Type.Integer(), {
              default: 10,
            }),
          },
          {
            name: "type",
            in: "query",
            required: false,
            schema: Type.String(),
          },
        ],
        responses: {
          200: {
            description: "List of pets",
            content: {
              "application/json": {
                schema: Type.Array(PetSchema),
              },
            },
          },
        },
      },
      (req, res) => {
        res.json([]);
      },
    );

    router.post(
      "/pets",
      {
        summary: "Create a pet",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: Type.Omit(PetSchema, ["id"]),
            },
          },
        },
        responses: {
          201: {
            description: "Pet created",
            content: {
              "application/json": {
                schema: PetSchema,
              },
            },
          },
          400: {
            description: "Invalid input",
            content: {
              "application/json": {
                schema: Type.Object({
                  error: Type.String(),
                }),
              },
            },
          },
        },
      },
      (req, res) => {
        res.status(201).json({ id: 1, ...req.body });
      },
    );

    // Without definition
    router.put("/pets", (req, res) => {
      res.status(204).send();
    });

    t.mount("/api", router);

    const response = await request(app).get("/openapi").expect(200);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const valid = await SwaggerParser.validate(response.body);
    expect(valid).toBeDefined();
  });
});
