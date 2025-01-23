# tyex 🚀

Type-safe Express.js routes with automatic OpenAPI documentation generation. Zero config, zero hassle.

![npm](https://img.shields.io/npm/v/tyex)
![license](https://img.shields.io/npm/l/tyex)

## Why tyex?

- ✨ **Full Type Safety**: Leverage TypeScript's type system for your Express routes
- 📚 **Automatic OpenAPI**: Generate OpenAPI documentation directly from your route definitions
- 🛡️ **Runtime Validation**: Uses AJV for runtime type checking
- 🔌 **Express Compatible**: Drop-in replacement for Express Router
- 🪶 **Lightweight**: Minimal overhead, maximum value

## Quick Start

```typescript
import { Type } from "@sinclair/typebox";
import express from "express";
import tyex from "tyex";

const app = express();
const t = tyex(app);

// Define your route with types and documentation in one place
t.get(
  "/hello",
  {
    summary: "Say hello",
    responses: {
      200: {
        description: "Success",
        content: {
          "application/json": {
            schema: Type.Object({
              message: Type.String(),
            }),
          },
        },
      },
    },
  },
  (req, res) => {
    res.json({ message: "Hello, World!" });
  },
);

// Get OpenAPI documentation
const docs = t.openapi({
  title: "My API",
  version: "1.0.0",
});
```

## Installation

```bash
npm install express @sinclair/typebox ajv tyex
```

## Examples

Check out our [example project](./examples/cats-api) for a complete CRUD API implementation.

## Contributing

PRs are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
