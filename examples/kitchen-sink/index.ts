import express from "express";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./common/error";
import { openapiSpec } from "./common/openapi";
import router from "./router";

const app = express();
app.use(express.json());

// Serve the OpenAPI JSON
app.get("/api-spec", openapiSpec);

// Configure the OpenAPI UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(null, {
    swaggerOptions: { url: "/api-spec" },
  }),
);

app.use("/api", router);

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});
