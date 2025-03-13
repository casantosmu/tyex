import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import swaggerUi from "swagger-ui-express";
import { ValidationError } from "tyex";
import { openapiConfig } from "./config/openapi";
import bookRoutes from "./routes/book.routes";

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/books", bookRoutes);

// OpenAPI documentation
app.get("/api-docs/spec", openapiConfig);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: { url: "/api-docs/spec" },
  }),
);

// Error handler for validation errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: "Validation Error",
      details: err.errors,
    });
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    `API documentation available at http://localhost:${PORT}/api-docs`,
  );
});
