import { describe, expect, test } from "vitest";
import supertest from "supertest";
import type { Request, Response, NextFunction } from "express";

import texpress from "../src";

describe("TExpress methods", () => {
  const methods = ["get", "post", "put", "delete"] as const;

  test.each(methods)("Should handle %s requests", async (method) => {
    const t = texpress();
    const json = { message: "success" };

    t[method](
      "/test",
      {
        responses: {},
      },
      (req, res) => {
        res.json(json);
      },
    );

    const response = await supertest(t.express)[method]("/test");

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(json);
  });

  test("Should execute middlewares in order", async () => {
    const t = texpress();
    const order: number[] = [];

    t.get(
      "/test",
      (req: Request, res: Response, next: NextFunction) => {
        order.push(1);
        next();
      },
      (req: Request, res: Response, next: NextFunction) => {
        order.push(2);
        next();
      },
      {
        responses: {},
      },
      (req, res) => {
        order.push(3);
        res.send();
      },
    );

    const response = await supertest(t.express).get("/test");

    expect(response.status).toBe(200);
    expect(order).toEqual([1, 2, 3]);
  });

  test("Should handle resolved promises on handlers", async () => {
    const t = texpress();
    const json = { message: "success" };

    t.get(
      "/test",
      {
        responses: {},
      },
      async (req, res) => {
        await Promise.resolve();
        res.json(json);
      },
    );

    const response = await supertest(t.express).get("/test");

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(json);
  });

  test("Should handle rejected promises on handlers", async () => {
    const t = texpress();
    const app = t.express;
    const error = new Error("rejection");

    t.get(
      "/test",
      {
        responses: {},
      },
      async (req, res) => {
        await Promise.reject(error);
        res.json({ message: "success" });
      },
    );

    let errFound;
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      errFound = err;
      next(err);
    });

    const response = await supertest(t.express).get("/test");

    expect(response.status).toBe(500);
    expect(errFound).toBe(error);
  });
});
