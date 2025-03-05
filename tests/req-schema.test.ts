import { describe, expect, test } from "vitest";
import { reqSchema } from "../src/req-schema";
import type { OperationObject } from "../src/types.d.ts";
import { Type } from "@sinclair/typebox";
import { removeTypeBoxSymbols } from "./utils";

describe("request schema", () => {
  test("should handle path parameters", () => {
    const def: OperationObject = {
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: Type.String({ format: "uuid" }),
        },
        {
          name: "postId",
          in: "path",
          schema: Type.String({ format: "uuid" }),
        },
      ],
      responses: {},
    };

    const schema = reqSchema(def);

    expect(removeTypeBoxSymbols(schema)).toStrictEqual({
      type: "object",
      required: ["params", "query"],
      properties: {
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", format: "uuid" },
            postId: { type: "string", format: "uuid" },
          },
        },
        query: {
          type: "object",
          required: [],
          properties: {},
        },
        body: {
          type: "object",
          required: [],
          properties: {},
        },
      },
    });
  });

  test("should handle query parameters", () => {
    const def: OperationObject = {
      parameters: [
        {
          name: "page",
          in: "query",
          required: true,
          schema: Type.Integer({ minimum: 1 }),
        },
        {
          name: "limit",
          in: "query",
          schema: Type.Integer({ minimum: 1, maximum: 100 }),
        },
      ],
      responses: {},
    };

    const schema = reqSchema(def);

    expect(removeTypeBoxSymbols(schema)).toStrictEqual({
      type: "object",
      required: ["params", "query"],
      properties: {
        params: {
          type: "object",
          required: [],
          properties: {},
        },
        query: {
          type: "object",
          required: ["page"],
          properties: {
            page: { type: "integer", minimum: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100 },
          },
        },
        body: {
          type: "object",
          required: [],
          properties: {},
        },
      },
    });
  });

  test("should handle required request body", () => {
    const def: OperationObject = {
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: Type.Object({
              name: Type.String(),
              age: Type.Optional(Type.Number()),
            }),
          },
        },
      },
      responses: {},
    };

    const schema = reqSchema(def);

    expect(removeTypeBoxSymbols(schema)).toStrictEqual({
      type: "object",
      required: ["params", "query", "body"],
      properties: {
        params: {
          type: "object",
          required: [],
          properties: {},
        },
        query: {
          type: "object",
          required: [],
          properties: {},
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name"],
        },
      },
    });
  });

  test("should handle optional request body", () => {
    const def: OperationObject = {
      requestBody: {
        content: {
          "application/json": {
            schema: Type.Object({
              name: Type.String(),
              age: Type.Optional(Type.Number()),
            }),
          },
        },
      },
      responses: {},
    };

    const schema = reqSchema(def);

    expect(removeTypeBoxSymbols(schema)).toStrictEqual({
      type: "object",
      required: ["params", "query"],
      properties: {
        params: {
          type: "object",
          required: [],
          properties: {},
        },
        query: {
          type: "object",
          required: [],
          properties: {},
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
          },
          required: ["name"],
        },
      },
    });
  });

  test("should ignore content-types other than application/json", () => {
    const def: OperationObject = {
      requestBody: {
        content: {
          "application/xml": {
            schema: Type.Object({
              data: Type.String(),
            }),
          },
        },
      },
      responses: {},
    };

    const schema = reqSchema(def);

    expect(removeTypeBoxSymbols(schema)).toStrictEqual({
      type: "object",
      required: ["params", "query"],
      properties: {
        params: {
          type: "object",
          required: [],
          properties: {},
        },
        query: {
          type: "object",
          required: [],
          properties: {},
        },
        body: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    });
  });
});
