import { describe, it, expect, vi } from "vitest";
import tyex from "../src";

describe("tyex", () => {
  it("calls next function", () => {
    const middleware = tyex();
    const next = vi.fn();

    // @ts-expect-error just a simple test
    middleware({}, {}, next);

    expect(next).toHaveBeenCalled();
  });
});
