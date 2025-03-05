import { test, expect, describe } from "vitest";
import express, {
  type Request,
  type Response,
  type NextFunction,
  type RequestHandler,
} from "express";
import request from "supertest";
import tyex from "../src";
import { getDef } from "../src/handler";
import { Type } from "@sinclair/typebox";

describe("handler", () => {
  test("should attach OpenAPI definition to handler", () => {
    const definition = {
      responses: {
        "200": {
          description: "Successful response",
          content: {
            "text/plain": {
              schema: Type.String(),
            },
          },
        },
      },
    };

    const handler = tyex.handler(definition, (req, res) => {
      res.send("OK");
    });

    expect(getDef(handler)).toStrictEqual(definition);
  });

  test("getDef should return undefined for regular handlers", () => {
    const handler: RequestHandler = (req, res) => {
      res.send("OK");
    };

    expect(getDef(handler)).toBeUndefined();
  });

  test("should work with synchronous handlers", async () => {
    const app = express();

    const definition = {
      responses: {
        "200": {
          description: "Successful response",
          content: {
            "text/plain": {
              schema: Type.String(),
            },
          },
        },
      },
    };

    app.get(
      "/",
      tyex.handler(definition, (req, res) => {
        res.send("OK");
      }),
    );

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("OK");
  });

  test("should work with asynchronous handlers", async () => {
    const app = express();

    const definition = {
      responses: {
        "200": {
          description: "Successful response",
          content: {
            "text/plain": {
              schema: Type.String(),
            },
          },
        },
      },
    };

    app.get(
      "/",
      tyex.handler(definition, async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        res.send("Async OK");
      }),
    );

    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Async OK");
  });

  test("should catch errors from async handlers", async () => {
    const app = express();

    app.get(
      "/",
      tyex.handler({ responses: {} }, async () => {
        await Promise.reject(new Error("Test error"));
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      res.status(500).send("Error caught");
    });

    const response = await request(app).get("/");

    expect(response.status).toBe(500);
    expect(response.text).toBe("Error caught");
  });

  test("should pass validation errors to next middleware", async () => {
    const app = express();

    app.get(
      "/",
      tyex.handler(
        {
          parameters: [
            {
              name: "param",
              in: "query",
              required: true,
              schema: Type.String(),
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "text/plain": {
                  schema: Type.String(),
                },
              },
            },
          },
        },
        (req, res) => {
          res.send("Should not reach here");
        },
      ),
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      res.status(400).send("Validation error");
    });

    const response = await request(app).get("/");

    expect(response.status).toBe(400);
    expect(response.text).toBe("Validation error");
  });
});
