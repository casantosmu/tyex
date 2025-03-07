import { Type, type Static } from "@sinclair/typebox";
import { TypeOpenAPI } from "../../../src";

export const UserDTO = Type.Object({
  id: Type.Integer(),
  username: Type.String(),
  role: TypeOpenAPI.StringEnum(["admin", "user", "guest"]),
  deletedAt: TypeOpenAPI.Nullable(Type.String({ format: "date-time" })),
});

export type UserDTO = Static<typeof UserDTO>;
