import { Type } from "@sinclair/typebox";
import { TypeOpenAPI } from "../../../src";

export const Error = Type.Object({
  message: Type.String(),
});

export const Cat = Type.Object({
  id: Type.Integer({
    description: "The cat's unique identifier",
  }),
  name: Type.String({
    description: "The cat's name",
  }),
  breed: TypeOpenAPI.StringEnum(["Siamese", "Persian", "MaineCoon", "Other"], {
    description: "The cat's breed",
  }),
  age: Type.Integer({
    description: "The cat's age in years",
  }),
  img: TypeOpenAPI.Nullable(
    Type.String({
      description: "The cat's image URL",
    }),
  ),
});
