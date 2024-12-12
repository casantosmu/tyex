import { describe, expect, test } from "vitest";
import supertest from "supertest";

import texpress from "../src";

describe("TExpress methods", () => {
  const methods = ["get", "post", "put", "delete"] as const;

  test.each(methods)("Should handle %s requests", async (method) => {
    const t = texpress();
    const json = { message: "success" };

    t[method]("/test", { responses: {} }, (req, res) => {
      res.json(json);
    });

    const response = await supertest(t.express)[method]("/test");

    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual(json);
  });
});
