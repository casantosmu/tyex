import type { RequestHandler } from "express-serve-static-core";
import type { OpenAPIV3 } from "openapi-types";
import { oasGenerator } from "./oas-generator";

interface Options {
  document?: Omit<OpenAPIV3.Document, "paths">;
}

export const openapiMiddleware = (options?: Options): RequestHandler => {
  let base = options?.document;
  if (!base) {
    base = {
      openapi: "3.0.0",
      info: {
        title: "ExpressJS",
        version: "0.0.0",
      },
    };
  }
  const oas = { ...base, paths: {} };
  return (req, res) => {
    res.json(oasGenerator(req.app, oas));
  };
};
