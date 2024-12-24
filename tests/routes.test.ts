import { describe, test, expect } from "vitest";
import { Routes } from "../src/routes";

describe("Routes", () => {
  test("Should add routes correctly", () => {
    const routes = new Routes();
    const def = { responses: {} };

    routes.add("get", "/users", def);
    routes.add("post", "/products", def);

    expect(routes.get()).toStrictEqual([
      { method: "get", path: "/users", definition: def },
      { method: "post", path: "/products", definition: def },
    ]);
  });
});
