import express from "express";
import tyex from "../../src";
import catsRoutes from "./routes/cats";
import { errorHandler } from "./errorHandler";

const app = express();

const t = tyex(app);
app.use(express.json());

t.use("/api/cats", catsRoutes);

const docs = t.openapi({ title: "Cats API", version: "1.0.0" });
app.get("/api-docs/openapi.json", (req, res) => {
  res.json(docs);
});

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log("server running on port", PORT);
});
