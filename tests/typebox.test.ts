import { describe, expect, test } from "vitest";
import request from "supertest";
import { Type } from "@sinclair/typebox";

import tyex, { Nullable, Options } from "../src";
import bodyParser from "body-parser";

describe("Options helper", () => {
  test("should use default value when undefined", async () => {
    const t = tyex();

    const defaultInt = 1000;
    t.get(
      "/",
      {
        parameters: [
          {
            in: "query",
            name: "int",
            required: false,
            schema: Options(Type.Integer(), {
              default: defaultInt,
            }),
          },
        ],
        responses: {
          200: {
            description: "",
            content: {
              "application/json": {
                schema: Type.Object({
                  int: Type.Integer(),
                }),
              },
            },
          },
        },
      },
      (req, res) => {
        const int: number = req.query.int;
        res.json({ int });
      },
    );

    const response = await request(t.express).get("/");

    expect(response.body).toStrictEqual({ int: defaultInt });
  });
});

describe("Nullable helper", () => {
  test("should allow null values", async () => {
    const t = tyex();
    t.express.use(bodyParser.json());

    t.post(
      "/",
      {
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: Type.Object({
                foo: Nullable(Type.String()),
              }),
            },
          },
        },
        responses: {
          200: {
            description: "",
            content: {
              "application/json": {
                schema: Type.Object({
                  foo: Nullable(Type.String()),
                }),
              },
            },
          },
        },
      },
      (req, res) => {
        const foo: string | null = req.body.foo;
        res.json({ foo });
      },
    );

    const body = {
      foo: null,
    };
    const response = await request(t.express).post("/").send(body);

    expect(response.body).toStrictEqual(body);
  });
});
