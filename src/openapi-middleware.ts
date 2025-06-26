import type { RequestHandler } from "express-serve-static-core";
import type { OpenAPIV3 } from "openapi-types";
import { oasGenerator } from "./oas-generator";

export interface Options {
  document?: OpenAPIV3.Document | Omit<OpenAPIV3.Document, "paths">;
}

export const openapiMiddleware = (options?: Options): RequestHandler => {
  let cache: OpenAPIV3.Document | undefined;
  return (req, res) => {
    if (!cache) {
      cache = oasGenerator(req.app, options?.document);
    }

    res.json(cache);
  };
};
