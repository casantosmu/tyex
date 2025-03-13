import tyex from "tyex";

export const openapiConfig = tyex.openapi({
  document: {
    openapi: "3.0.3",
    info: {
      title: "Bookshelf API",
      description: "A simple API for managing books",
      version: "1.0.0",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    tags: [
      {
        name: "books",
        description: "Operations for managing books",
      },
    ],
  },
});
