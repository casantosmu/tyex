import express from "express";
import swaggerUi from "swagger-ui-express";
import tyex from "../../src";
import catsRoutes from "./routes/cats";
import { errorHandler } from "./errorHandler";

const PORT = 3000;

const app = express();
const t = tyex(app);

app.use(
  "/openapi.json",
  t.openapi({
    info: {
      title: "Cats API",
      version: "1.0.0",
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  }),
);
app.use(
  "/openapi",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerUrl: "/openapi.json",
  }),
);

app.use(express.json());
t.mount("/api/cats", catsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("server running on port", PORT);
});
