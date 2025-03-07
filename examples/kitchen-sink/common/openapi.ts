import tyex from "../../../src";

export const openapiSpec = tyex.openapi({
  document: {
    openapi: "3.0.3",
    info: {
      title: "Express.js Basic API",
      description: "A basic Express.js API with common patterns",
      version: "1.0.0",
      contact: {
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "users",
        description: "User operations",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "string",
          description:
            "Enter the token with the `Bearer: ` prefix, e.g. 'Bearer secret-token'",
        },
      },
    },
  },
});
