import { Type, type Static } from "@sinclair/typebox";
import { TypeOpenAPI } from "tyex";

export const BookSchema = Type.Object({
  id: Type.String({ format: "uuid" }),
  title: Type.String(),
  author: Type.String(),
  year: Type.Integer({ minimum: 0 }),
  genre: TypeOpenAPI.StringEnum([
    "fiction",
    "non-fiction",
    "science",
    "technology",
    "history",
    "biography",
  ]),
  available: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: TypeOpenAPI.Nullable(Type.String({ format: "date-time" })),
});

export type Book = Static<typeof BookSchema>;

export const CreateBookSchema = Type.Omit(BookSchema, [
  "id",
  "createdAt",
  "updatedAt",
]);

export type CreateBook = Static<typeof CreateBookSchema>;

export const UpdateBookSchema = Type.Partial(CreateBookSchema);

export type UpdateBook = Static<typeof UpdateBookSchema>;
