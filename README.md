# tyex

**Type Safety Layer for Express APIs**  
_Runtime Validation • OpenAPI Docs • Full Type Inference_

![npm](https://img.shields.io/npm/v/tyex)
![Static Badge](https://img.shields.io/badge/express->=5.0.0-blue)
![license](https://img.shields.io/npm/l/tyex)
[![codecov](https://codecov.io/gh/casantosmu/tyex/graph/badge.svg?token=5IoSRdzqjN)](https://codecov.io/gh/casantosmu/tyex)
![CI](https://github.com/casantosmu/tyex/actions/workflows/pr-checks.yaml/badge.svg)

## Why tyex?

Building Express APIs involves three tedious, duplicated tasks:

- **Type definitions** for your request/response objects
- **Runtime validation** to ensure incoming data is valid
- **API documentation** for consumers to understand your endpoints

Keeping these in sync is a maintenance nightmare. Instead of juggling multiple libraries and duplicating schemas, `tyex` lets you define everything once and get all three benefits automatically.

## Features

- 🔄 **Single source of truth** for types, validation, and documentation
- 🚀 **No new frameworks** to learn - it's just Express
- 🔍 **Full TypeScript inference** for request params, query, and body
- ✅ **Runtime validation** with automatic coercion (strings to numbers, etc.)
- 📚 **OpenAPI documentation** auto-generated from your handlers
- 🔌 **Async handler support** with proper error handling

## Installation

```bash
npm install tyex @sinclair/typebox
```

## Quick Start

```typescript
import express from "express";
import tyex from "tyex";
import { Type } from "@sinclair/typebox";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(express.json());

// Define your schema with TypeBox
const UserSchema = Type.Object({
  id: Type.Integer(),
  username: Type.String(),
});

// Create a route with tyex.handler
app.get(
  "/api/users/:id",
  tyex.handler(
    {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: Type.Integer(),
        },
      ],
      responses: {
        "200": {
          description: "User details",
          content: {
            "application/json": {
              schema: UserSchema,
            },
          },
        },
      },
    },
    async (req, res) => {
      const user = await getUser(req.params.id);
      res.json(user);
    },
  ),
);

// Add OpenAPI documentation endpoint
app.get("/api-spec", tyex.openapi());

// Optional: Add Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(null, { swaggerOptions: { url: "/api-spec" } }),
);

app.listen(3000);
```

## How It Works

### Define Routes with OpenAPI Schema

The `tyex.handler` function wraps your Express handlers with two key benefits:

1. **Type-checking** - Your handler receives fully typed request objects
2. **Runtime validation** - Incoming requests are validated against your schema

```typescript
tyex.handler(
  {
    // OpenAPI 3 operation object
    parameters: [...],
    requestBody: {...},
    responses: {...},
  },
  (req, res) => {
    // Your regular Express handler
  }
)
```

### Generate OpenAPI Documentation

The `tyex.openapi()` middleware automatically generates an OpenAPI document from your handlers:

```typescript
// Basic usage
app.get("/api-spec", tyex.openapi());

// With additional configuration
app.get(
  "/api-spec",
  tyex.openapi({
    document: {
      openapi: "3.0.3",
      info: {
        title: "My API",
        version: "1.0.0",
      },
      servers: [
        {
          url: "https://api.example.com",
        },
      ],
    },
  }),
);
```

### OpenAPI-Specific Types

Since OpenAPI schemas are a superset of JSON Schema, `tyex` provides helper functions for common OpenAPI-specific patterns:

```typescript
import { TypeOpenAPI } from "tyex";

TypeOpenAPI.Nullable(Type.String()); // { type: 'string', nullable: true }
TypeOpenAPI.StringEnum(["admin", "user"]); // enum: ['admin', 'user']
TypeOpenAPI.Options(Type.Number(), { default: 10 }); // Default values with proper type inference
```

### Error Handling

Validation errors are passed to Express's error handling middleware:

```typescript
import { ValidationError } from "tyex";

app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ errors: err.errors });
  }
  next(err);
});
```

## Complete Examples

See the [examples directory](examples) for full working examples, including the "kitchen sink" example with authentication, error handling, and more.

## Current Limitations

- Only `application/json` request bodies are supported currently
- Response schemas are used for types and documentation, but aren't validated

## License

[MIT](LICENSE)
