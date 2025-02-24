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

  test("Should mount routes with prefix", () => {
    const parent = new Routes();
    const child = new Routes();
    const def = { responses: {} };

    child.add("get", "/users", def);
    parent.addChild(child, "/api");

    expect(parent.get()).toStrictEqual([
      { method: "get", path: "/api/users", definition: def },
    ]);
  });

  test("Should mount without prefix", () => {
    const parent = new Routes();
    const child = new Routes();
    const def = { responses: {} };

    child.add("get", "/users", def);
    parent.addChild(child);

    expect(parent.get()).toStrictEqual([
      { method: "get", path: "/users", definition: def },
    ]);
  });

  test("Should propagate new routes after mounting", () => {
    const parent = new Routes();
    const child = new Routes();
    const def = { responses: {} };

    parent.addChild(child, "/api");
    child.add("get", "/users", def);
    child.add("post", "/products", def);

    expect(parent.get()).toStrictEqual([
      { method: "get", path: "/api/users", definition: def },
      { method: "post", path: "/api/products", definition: def },
    ]);
  });

  test("Should handle multiple children with different prefixes", () => {
    const parent = new Routes();
    const firstChild = new Routes();
    const secondChild = new Routes();
    const def = { responses: {} };

    parent.addChild(firstChild, "/api/v1");
    parent.addChild(secondChild, "/api/v2");

    firstChild.add("get", "/users", def);
    secondChild.add("get", "/users", def);

    expect(parent.get()).toStrictEqual([
      { method: "get", path: "/api/v1/users", definition: def },
      { method: "get", path: "/api/v2/users", definition: def },
    ]);
  });

  test("Should handle nested children (child of child) with single route", () => {
    const parent = new Routes();
    const child = new Routes();
    const grandChild = new Routes();
    const def = { responses: {} };

    grandChild.add("get", "/profiles", def);
    child.addChild(grandChild, "/v1");
    parent.addChild(child, "/api");

    expect(parent.get()).toStrictEqual([
      { method: "get", path: "/api/v1/profiles", definition: def },
    ]);
  });

  test("Should propagate new routes through multiple levels of nesting", () => {
    const parent = new Routes();
    const child = new Routes();
    const grandChild = new Routes();
    const def = { responses: {} };

    grandChild.add("get", "/profiles", def);
    child.addChild(grandChild, "/v1");
    parent.addChild(child, "/api");

    grandChild.add("post", "/settings", def);

    expect(parent.get()).toStrictEqual([
      { method: "get", path: "/api/v1/profiles", definition: def },
      { method: "post", path: "/api/v1/settings", definition: def },
    ]);
  });
});
