import { describe, test, expect } from "vitest";
import { Type } from "@sinclair/typebox";
import { TypeOpenAPI } from "../src";
import { removeTypeBoxSymbols } from "./utils";

describe("OpenAPI Types", () => {
  test("Options should merge options with schema", () => {
    const result = TypeOpenAPI.Options(Type.String(), {
      description: "User email",
    });

    expect(removeTypeBoxSymbols(result)).toStrictEqual({
      type: "string",
      description: "User email",
    });
  });

  test("Nullable should make schema nullable", () => {
    const result = TypeOpenAPI.Nullable(
      Type.String({ description: "User email" }),
    );

    expect(removeTypeBoxSymbols(result)).toStrictEqual({
      type: "string",
      nullable: true,
      description: "User email",
    });
  });

  test("StringEnum should create string enum schema", () => {
    const result = TypeOpenAPI.StringEnum(["admin", "user"], {
      description: "Role type",
    });

    expect(removeTypeBoxSymbols(result)).toStrictEqual({
      type: "string",
      enum: ["admin", "user"],
      description: "Role type",
    });
  });
});
