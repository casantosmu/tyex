import { Type } from "@sinclair/typebox";

export const Error = Type.Object({
  message: Type.String(),
});

export const Cat = Type.Object({
  id: Type.Integer({ description: "The cat's unique identifier" }),
  name: Type.String({ description: "The cat's name" }),
  breed: Type.String({ description: "The cat's breed" }),
  age: Type.Integer({ description: "The cat's age in years" }),
});
