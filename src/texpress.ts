import type { RequestHandler, Express } from "express";
import type Ajv from "ajv";
import type { RouteDefinition, Method, Handler } from "./types";

export class TExpress {
  readonly express: Express;
  readonly ajv: Ajv;

  constructor(express: Express, ajv: Ajv) {
    this.express = express;
    this.ajv = ajv;
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
    // const def =
    args.pop();
    //  as RouteDefinition;
    const middlewares = args as RequestHandler[];

    this.express[method](path, ...middlewares, (req, res, next) => {
      handler(req, res, next)?.catch(next);
    });
    return this;
  }
}
