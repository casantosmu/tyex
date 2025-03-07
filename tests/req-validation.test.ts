import { describe, expect, test } from "vitest";
import type { Request } from "express";
import { reqValidation, ValidationError } from "../src/req-validation";

describe("request validation", () => {
  test("should return success:true for valid request", () => {
    const schema = {
      type: "object",
      properties: {
        body: { type: "string" },
      },
    };

    const req = { body: "valid", params: {}, query: {} } as Request;
    const result = reqValidation(schema)(req);

    expect(result).toStrictEqual({
      success: true,
      data: {
        body: "valid",
      },
    });
  });

  test("should return success:false with error for invalid request", () => {
    const schema = {
      type: "object",
      properties: {
        body: { type: "number" },
      },
      required: ["body"],
    };

    const req = { body: "invalid", params: {}, query: {} } as Request;
    const result = reqValidation(schema)(req);

    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(ValidationError);
    expect(result.error?.errors.length).toBeGreaterThan(0);
  });
});
