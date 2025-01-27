import { describe, expect, test } from "vitest";
import { Type } from "@sinclair/typebox";
import SwaggerParser from "@apidevtools/swagger-parser";

import tyex from "../src";

describe("Generate OpenAPI", () => {
  test("Should generate OpenAPI specification with correct info", () => {
    const t = tyex();

    const info = {
      title: "Test API",
      version: "1.0.0",
      description: "Test API description",
    };

    const spec = t.openapi({ info });

    expect(spec.openapi).toBe("3.0.0");
    expect(spec.info).toStrictEqual(info);
    expect(spec.paths).toStrictEqual({});
  });

  test("Should include route paths and methods in OpenAPI spec", () => {
    const t = tyex();
    const router = tyex.Router();

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
    t.use("/api", router);

    const spec = t.openapi({
      info: {
        title: "Test API",
        version: "1.0.0",
      },
    });

    expect(spec.paths["/api/cats"]?.get?.summary).toBe("Get all cats");
    expect(spec.paths["/api/cats"]?.post?.summary).toBe("Create a cat");
  });

  test("Should generate a valid OpenAPI 3.0 specification", async () => {
    const t = tyex();
    const router = tyex.Router();

    router.get(
      "/pets",
      {
        summary: "List all pets",
        parameters: [
          {
            name: "limit",
            in: "query",
            required: false,
            schema: Type.Number(),
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
                schema: Type.Array(
                  Type.Object({
                    id: Type.Number(),
                    name: Type.String(),
                    type: Type.String(),
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
      "/pets",
      {
        summary: "Create a pet",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: Type.Object({
                name: Type.String(),
                type: Type.String(),
              }),
            },
          },
        },
        responses: {
          201: {
            description: "Pet created",
            content: {
              "application/json": {
                schema: Type.Object({
                  id: Type.Number(),
                  name: Type.String(),
                  type: Type.String(),
                }),
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
    t.use("/api", router);

    const spec = t.openapi({
      info: {
        title: "Pet Store API",
        version: "1.0.0",
        description: "A sample Pet Store API",
      },
    });

    // @ts-expect-error OpenAPIObject and Document types does not match
    const api = await SwaggerParser.validate(spec);
    expect(api).toBeDefined();
  });
});
