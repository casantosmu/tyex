import type { RequestHandler, Express } from "express";
import type Ajv from "ajv";
import type { RouteDefinition, Method } from "./types";

export class TExpress {
  readonly ajv: Ajv;
  readonly express: Express;

  constructor(express: Express, ajv: Ajv) {
    this.express = express;
    this.ajv = ajv;
  }

  get(path: string, def: RouteDefinition, handler: RequestHandler) {
    return this.#route("get", path, def, handler);
  }

  post(path: string, def: RouteDefinition, handler: RequestHandler) {
    return this.#route("post", path, def, handler);
  }

  put(path: string, def: RouteDefinition, handler: RequestHandler) {
    return this.#route("put", path, def, handler);
  }

  delete(path: string, def: RouteDefinition, handler: RequestHandler) {
    return this.#route("delete", path, def, handler);
  }

  #route(
    method: Method,
    path: string,
    def: RouteDefinition,
    handler: RequestHandler,
  ) {
    this.express[method](path, (req, res, next) => {
      handler(req, res, next)?.catch(next);
    });
    return this;
  }
}
