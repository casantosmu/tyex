import type { RequestHandler, Express } from "express";
import type Ajv from "ajv";
import type { InfoObject, OpenAPIObject, PathsObject } from "openapi3-ts/oas30";
import type { RouteDefinition, Method, Handler } from "./types";
import { Validator } from "./validator";
import { Routes } from "./routes";

export class TExpress {
  readonly express: Express;
  readonly ajv: Ajv;
  readonly routes = new Routes();
  readonly #validator: Validator;

  constructor(express: Express, ajv: Ajv) {
    this.express = express;
    this.ajv = ajv;
    this.#validator = new Validator(ajv);
  }

  openapi(info: InfoObject): OpenAPIObject {
    const paths: PathsObject = {};

    for (const route of this.routes.get()) {
      const path = route.path.replace(/:([^/]+)/g, "{$1}");

      paths[path] = {
        ...paths[path],
        [route.method]: route.definition,
      };
    }

    return {
      openapi: "3.0.0",
      info,
      paths,
    };
  }

  get(path: string, ...args: [...RequestHandler[], RouteDefinition, Handler]) {
    return this.#route("get", path, args);
  }

  post(path: string, ...args: [...RequestHandler[], RouteDefinition, Handler]) {
    return this.#route("post", path, args);
  }

  put(path: string, ...args: [...RequestHandler[], RouteDefinition, Handler]) {
    return this.#route("put", path, args);
  }

  delete(
    path: string,
    ...args: [...RequestHandler[], RouteDefinition, Handler]
  ) {
    return this.#route("delete", path, args);
  }

  #route(
    method: Method,
    path: string,
    args: [...RequestHandler[], RouteDefinition, Handler],
  ) {
    const handler = args.pop() as Handler;
    const def = args.pop() as RouteDefinition;
    const middlewares = args as RequestHandler[];

    this.routes.add(method, path, def);
    this.express[method](path, ...middlewares, (req, res, next) => {
      this.#validator.validateRequest(req, method, path, def);
      handler(req, res, next)?.catch(next);
    });
    return this;
  }
}
