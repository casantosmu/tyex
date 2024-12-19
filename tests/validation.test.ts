import { describe, expect, test } from "vitest";
import supertest from "supertest";
import { Type } from "@sinclair/typebox";
import { errorHandler } from "./utils/error.handler";

import texpress, { Options } from "../src";

describe("Request Validation", () => {
  describe("Path Parameters", () => {
    test("Should validate required path parameters are present", async () => {
      const t = texpress();

      t.get(
        "/users/:id",
        {
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: Type.Number(),
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: Type.Object({ id: Type.Number() }),
                },
              },
            },
          },
        },
        (req, res) => {
          res.json(req.params);
        },
      );
      t.express.use(errorHandler);

      const path = {
        id: 123,
      };

      const response = await supertest(t.express).get(
        `/users/${String(path.id)}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(path);
    });

    test("Should reject invalid path parameter type", async () => {
      const t = texpress();

      t.get(
        "/users/:id",
        {
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: Type.Number(),
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: Type.Object({ id: Type.Number() }),
                },
              },
            },
          },
        },
        (req, res) => {
          res.json(req.params);
        },
      );
      t.express.use(errorHandler);

      const path = {
        id: "abc",
      };

      const response = await supertest(t.express).get(`/users/${path.id}`);
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: {
          path: [
            {
              instancePath: "/id",
              keyword: "type",
              message: "must be number",
              params: {
                type: "number",
              },
              schemaPath: "#/properties/id/type",
            },
          ],
        },
      });
    });

    test("Should validate multiple path parameters", async () => {
      const t = texpress();

      t.get(
        "/posts/:id/:slug",
        {
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: Type.Number(),
            },
            {
              in: "path",
              name: "slug",
              required: true,
              schema: Type.String(),
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: Type.Object({
                    id: Type.Number(),
                    slug: Type.String(),
                  }),
                },
              },
            },
          },
        },
        (req, res) => {
          res.json(req.params);
        },
      );
      t.express.use(errorHandler);

      const path = {
        id: 123,
        slug: "my-awesome-post",
      };

      const response = await supertest(t.express).get(
        `/posts/${String(path.id)}/${path.slug}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(path);
    });

    test("Should reject when one of multiple parameters is invalid (too short)", async () => {
      const t = texpress();

      t.get(
        "/posts/:id/:slug",
        {
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: Type.Number(),
            },
            {
              in: "path",
              name: "slug",
              required: true,
              schema: Type.String(),
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: Type.Object({
                    id: Type.Number(),
                    slug: Type.String(),
                  }),
                },
              },
            },
          },
        },
        (req, res) => {
          res.json(req.params);
        },
      );
      t.express.use(errorHandler);

      const path = {
        id: "abc",
        slug: "my-awesome-post",
      };

      const response = await supertest(t.express).get(
        `/posts/${path.id}/${path.slug}`,
      );
      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: {
          path: [
            {
              instancePath: "/id",
              keyword: "type",
              message: "must be number",
              params: {
                type: "number",
              },
              schemaPath: "#/properties/id/type",
            },
          ],
        },
      });
    });
  });

  describe("Query Parameters", () => {
    test("Should validate request with all valid query parameters", async () => {
      const t = texpress();

      t.get(
        "/search",
        {
          parameters: [
            {
              in: "query",
              name: "q",
              required: true,
              schema: Type.String({ minLength: 2 }),
            },
            {
              in: "query",
              name: "limit",
              required: false,
              schema: Type.Number({ minimum: 1, maximum: 100 }),
            },
            {
              in: "query",
              name: "tags",
              required: false,
              schema: Type.Array(Type.String()),
            },
            {
              in: "query",
              name: "published",
              required: false,
              schema: Type.Boolean(),
            },
            {
              in: "query",
              name: "sort",
              required: false,
              schema: Options(Type.String(), {
                default: "asc",
              }),
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: Type.Object({
                    q: Type.String(),
                    limit: Type.Optional(Type.Number()),
                    tags: Type.Optional(Type.Array(Type.String())),
                    published: Type.Optional(Type.Boolean()),
                    sort: Type.String(),
                  }),
                },
              },
            },
          },
        },
        (req, res) => {
          res.json(req.query);
        },
      );
      t.express.use(errorHandler);

      const query = {
        q: "test",
        limit: 50,
        tags: ["javascript", "typescript"],
        published: true,
      };

      const response = await supertest(t.express).get("/search").query(query);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        ...query,
        sort: "asc",
      });
    });

    test("Should validate request with only required parameters", async () => {
      const t = texpress();

      t.get(
        "/search",
        {
          parameters: [
            {
              in: "query",
              name: "q",
              required: true,
              schema: Type.String(),
            },
            {
              in: "query",
              name: "limit",
              required: false,
              schema: Type.Number(),
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: Type.Object({
                    q: Type.String(),
                    limit: Type.Optional(Type.Number()),
                  }),
                },
              },
            },
          },
        },
        (req, res) => {
          res.json(req.query);
        },
      );
      t.express.use(errorHandler);

      const query = {
        q: "test",
      };

      const response = await supertest(t.express).get("/search").query(query);

      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual(query);
    });

    test("Should reject request with missing required parameter", async () => {
      const t = texpress();

      t.get(
        "/search",
        {
          parameters: [
            {
              in: "query",
              name: "q",
              required: true,
              schema: Type.String(),
            },
            {
              in: "query",
              name: "limit",
              required: false,
              schema: Type.Number(),
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: Type.Object({
                    q: Type.String(),
                    limit: Type.Optional(Type.Number()),
                  }),
                },
              },
            },
          },
        },
        (req, res) => {
          res.json(req.query);
        },
      );
      t.express.use(errorHandler);

      const query = {
        limit: 50,
      };

      const response = await supertest(t.express).get("/search").query(query);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: {
          query: [
            {
              instancePath: "",
              keyword: "required",
              message: "must have required property 'q'",
              params: {
                missingProperty: "q",
              },
              schemaPath: "#/required",
            },
          ],
        },
      });
    });

    test("Should reject request with invalid query parameter type", async () => {
      const t = texpress();

      t.get(
        "/search",
        {
          parameters: [
            {
              in: "query",
              name: "q",
              required: true,
              schema: Type.String(),
            },
            {
              in: "query",
              name: "limit",
              required: false,
              schema: Type.Number(),
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: Type.Object({
                    q: Type.String(),
                    limit: Type.Optional(Type.Number()),
                  }),
                },
              },
            },
          },
        },
        (req, res) => {
          res.json(req.query);
        },
      );
      t.express.use(errorHandler);

      const query = {
        q: "test",
        limit: "invalid",
      };

      const response = await supertest(t.express).get("/search").query(query);

      expect(response.status).toBe(400);
      expect(response.body).toStrictEqual({
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: {
          query: [
            {
              instancePath: "/limit",
              keyword: "type",
              message: "must be number",
              params: {
                type: "number",
              },
              schemaPath: "#/properties/limit/type",
            },
          ],
        },
      });
    });
  });
});
