import { describe, expect, test } from "vitest";
import express from "express";
import Ajv from "ajv";

import tyex from "../src";

describe("Basic Setup and Initialization", () => {
  test("Should initialize with default Express app when no app is provided", () => {
    const t = tyex();
    expect(t.express).toBeInstanceOf(Function);
    expect(t.express.listen.bind(t.express)).toBeDefined();
  });

  test("Should initialize with custom Express app when provided", () => {
    const app = express();
    const t = tyex(app);
    expect(t.express).toBe(app);
  });

  test("Should initialize with default AJV instance when no options provided", () => {
    const t = tyex();
    expect(t.ajv).toBeInstanceOf(Ajv);
    expect(t.ajv.opts.allErrors).toBe(true);
    expect(t.ajv.opts.removeAdditional).toBe("all");
    expect(t.ajv.opts.useDefaults).toBe(true);
    expect(t.ajv.opts.coerceTypes).toBe("array");
  });

  test("Should initialize with custom AJV instance when provided in options", () => {
    const customAjv = new Ajv({ strict: true });
    const t = tyex(undefined, { ajv: customAjv });
    expect(t.ajv).toBe(customAjv);
  });
});
