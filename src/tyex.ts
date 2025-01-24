import type { RequestHandler, Express } from "express";
import type Ajv from "ajv";
import type { InfoObject, OpenAPIObject, PathsObject } from "openapi3-ts/oas30";
import type {
  ParameterObject,
  RouteDefinition,
  Handler,
  ReqHandler,
  ResponsesObject,
  ContentObject,
  Method,
} from "./types";
import { Router } from "./router";
import { Routes } from "./routes";
import { Validator } from "./validator";

export class Tyex {
  readonly ajv: Ajv;
  readonly express: Express;
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

  use(path: string, router: Router): void;
  use(router: Router): void;
  use(...args: [string, Router] | [Router]) {
    if (args.length === 2) {
      const [path, router] = args;
      this.express.use(path, router._setup(this, path));
    } else {
      const [router] = args;
      this.express.use(router._setup(this));
    }
  }

  get<
    const Params extends ParameterObject[],
    Responses extends ResponsesObject,
    ReqBodyContent extends ContentObject,
    ReqBodyRequired extends boolean,
  >(
    path: string,
    ...args: [
      ...RequestHandler[],
      RouteDefinition<Params, Responses, ReqBodyContent, ReqBodyRequired>,
      Handler<Params, Responses, ReqBodyContent, ReqBodyRequired>,
    ]
  ) {
    return this.#route("get", path, args);
  }

  post<
    const Params extends ParameterObject[],
    Responses extends ResponsesObject,
    ReqBodyContent extends ContentObject,
    ReqBodyRequired extends boolean,
  >(
    path: string,
    ...args: [
      ...RequestHandler[],
      RouteDefinition<Params, Responses, ReqBodyContent, ReqBodyRequired>,
      Handler<Params, Responses, ReqBodyContent, ReqBodyRequired>,
    ]
  ) {
    return this.#route("post", path, args);
  }

  put<
    const Params extends ParameterObject[],
    Responses extends ResponsesObject,
    ReqBodyContent extends ContentObject,
    ReqBodyRequired extends boolean,
  >(
    path: string,
    ...args: [
      ...RequestHandler[],
      RouteDefinition<Params, Responses, ReqBodyContent, ReqBodyRequired>,
      Handler<Params, Responses, ReqBodyContent, ReqBodyRequired>,
    ]
  ) {
    return this.#route("put", path, args);
  }

  delete<
    const Params extends ParameterObject[],
    Responses extends ResponsesObject,
    ReqBodyContent extends ContentObject,
    ReqBodyRequired extends boolean,
  >(
    path: string,
    ...args: [
      ...RequestHandler[],
      RouteDefinition<Params, Responses, ReqBodyContent, ReqBodyRequired>,
      Handler<Params, Responses, ReqBodyContent, ReqBodyRequired>,
    ]
  ) {
    return this.#route("delete", path, args);
  }

  #route(
    method: Method,
    path: string,
    args: [...RequestHandler[], RouteDefinition, ReqHandler],
  ) {
    const handler = args.pop() as ReqHandler;
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
