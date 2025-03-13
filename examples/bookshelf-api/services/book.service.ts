import { randomUUID } from "crypto";
import type { Book, CreateBook, UpdateBook } from "../schemas/book.schema";

// In-memory store
const books = new Map<string, Book>();

export const BookService = {
  getAll: (): Book[] => {
    return Array.from(books.values());
  },

  getById: (id: string): Book | undefined => {
    return books.get(id);
  },

  create: (data: CreateBook): Book => {
    const id = randomUUID();
    const now = new Date().toISOString();

    const book: Book = {
      ...data,
      id,
      createdAt: now,
      updatedAt: null,
    };

    books.set(id, book);
    return book;
  },

  update: (id: string, data: UpdateBook): Book | undefined => {
    const existing = books.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Book = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    books.set(id, updated);
    return updated;
  },

  delete: (id: string): boolean => {
    return books.delete(id);
  },
};
