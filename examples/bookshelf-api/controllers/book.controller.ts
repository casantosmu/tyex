import { Type } from "@sinclair/typebox";
import tyex from "tyex";
import {
  BookSchema,
  CreateBookSchema,
  UpdateBookSchema,
} from "../schemas/book.schema";
import { BookService } from "../services/book.service";

export const BookController = {
  getAll: tyex.handler(
    {
      tags: ["books"],
      summary: "Get all books",
      parameters: [
        {
          in: "query",
          name: "genre",
          required: false,
          schema: Type.String(),
        },
      ],
      responses: {
        "200": {
          description: "List of books",
          content: {
            "application/json": {
              schema: Type.Array(BookSchema),
            },
          },
        },
      },
    },
    (req, res) => {
      let books = BookService.getAll();

      // Apply genre filter if provided
      if (req.query.genre) {
        books = books.filter((book) => book.genre === req.query.genre);
      }

      res.json(books);
    },
  ),

  getById: tyex.handler(
    {
      tags: ["books"],
      summary: "Get a book by ID",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: Type.String({ format: "uuid" }),
        },
      ],
      responses: {
        "200": {
          description: "Book details",
          content: {
            "application/json": {
              schema: BookSchema,
            },
          },
        },
        "404": {
          description: "Book not found",
          content: {
            "application/json": {
              schema: Type.Object({
                error: Type.String(),
              }),
            },
          },
        },
      },
    },
    (req, res) => {
      const book = BookService.getById(req.params.id);

      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      res.json(book);
    },
  ),

  create: tyex.handler(
    {
      tags: ["books"],
      summary: "Create a new book",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: CreateBookSchema,
          },
        },
      },
      responses: {
        "201": {
          description: "Book created successfully",
          content: {
            "application/json": {
              schema: BookSchema,
            },
          },
        },
        "400": {
          description: "Invalid input",
          content: {
            "application/json": {
              schema: Type.Object({
                error: Type.String(),
              }),
            },
          },
        },
      },
    },
    (req, res) => {
      const book = BookService.create(req.body);
      res.status(201).json(book);
    },
  ),

  update: tyex.handler(
    {
      tags: ["books"],
      summary: "Update a book",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: Type.String({ format: "uuid" }),
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: UpdateBookSchema,
          },
        },
      },
      responses: {
        "200": {
          description: "Book updated successfully",
          content: {
            "application/json": {
              schema: BookSchema,
            },
          },
        },
        "404": {
          description: "Book not found",
          content: {
            "application/json": {
              schema: Type.Object({
                error: Type.String(),
              }),
            },
          },
        },
      },
    },
    (req, res) => {
      const book = BookService.update(req.params.id, req.body);

      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      res.json(book);
    },
  ),

  delete: tyex.handler(
    {
      tags: ["books"],
      summary: "Delete a book",
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: Type.String({ format: "uuid" }),
        },
      ],
      responses: {
        "204": {
          description: "Book deleted successfully",
        },
        "404": {
          description: "Book not found",
          content: {
            "application/json": {
              schema: Type.Object({
                error: Type.String(),
              }),
            },
          },
        },
      },
    },
    (req, res) => {
      const success = BookService.delete(req.params.id);

      if (!success) {
        return res.status(404).json({ error: "Book not found" });
      }

      res.status(204).end();
    },
  ),
};
