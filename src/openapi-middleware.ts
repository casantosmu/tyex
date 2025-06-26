import type { RequestHandler } from "express-serve-static-core";
import type { OpenAPIV3 } from "openapi-types";
import { oasGenerator } from "./oas-generator";

export interface Options {
  document?: Omit<OpenAPIV3.Document, "paths">;
}

export const openapiMiddleware = (options?: Options): RequestHandler => {
  return (req, res) => {
    res.json(oasGenerator(req.app, options?.document));
  };
};
