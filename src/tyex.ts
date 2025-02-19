import type { RequestHandler, Express } from "express";
import type Ajv from "ajv";
import type {
  ParameterObject,
  RouteDefinition,
  Handler,
  ReqHandler,
  ResponsesObject,
  ContentObject,
  Method,
  OpenAPI,
  OpenAPIBase,
} from "./types";
import { Router } from "./router";
import { Routes } from "./routes";
import { Validator } from "./validator";

export class Tyex {
  readonly ajv: Ajv;
  readonly express: Express;
  readonly routes = new Routes();
  readonly #validator: Validator;
  #openapi: OpenAPI | null = null;

  constructor(express: Express, ajv: Ajv) {
    this.express = express;
    this.ajv = ajv;
    this.#validator = new Validator(ajv);
  }

  openapi(baseDoc: OpenAPIBase): RequestHandler {
    return (req, res) => {
      if (this.#openapi) {
        return res.json(this.#openapi);
      }

      const paths: Record<string, Record<string, unknown>> = {};
      for (const route of this.routes.get()) {
        const path = route.path.replace(/:([^/]+)/g, "{$1}");

        paths[path] = {
          ...paths[path],
          [route.method]: route.definition,
        };
      }

      const doc = {
        ...baseDoc,
        openapi: "3.0.0",
        paths,
      };

      this.#openapi = doc;
      res.json(doc);
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
  ): this;
  get(path: string, ...args: [...RequestHandler[], ReqHandler]): this;
  get(
    path: string,
    ...args:
      | [...RequestHandler[], RouteDefinition, ReqHandler]
      | [...RequestHandler[], ReqHandler]
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
  ): this;
  post(path: string, ...args: [...RequestHandler[], ReqHandler]): this;
  post(
    path: string,
    ...args:
      | [...RequestHandler[], RouteDefinition, ReqHandler]
      | [...RequestHandler[], ReqHandler]
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
  ): this;
  put(path: string, ...args: [...RequestHandler[], ReqHandler]): this;
  put(
    path: string,
    ...args:
      | [...RequestHandler[], RouteDefinition, ReqHandler]
      | [...RequestHandler[], ReqHandler]
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
  ): this;
  delete(path: string, ...args: [...RequestHandler[], ReqHandler]): this;
  delete(
    path: string,
    ...args:
      | [...RequestHandler[], RouteDefinition, ReqHandler]
      | [...RequestHandler[], ReqHandler]
  ) {
    return this.#route("delete", path, args);
  }

  #route(
    method: Method,
    path: string,
    args:
      | [...RequestHandler[], RouteDefinition, ReqHandler]
      | [...RequestHandler[], ReqHandler],
  ) {
    const handler = args.pop() as ReqHandler;
    const lastArg = args.pop();

    let routeDef: RouteDefinition = {
      responses: {
        default: {
          description: "Unknown",
        },
      },
    };
    if (typeof lastArg === "object") {
      routeDef = lastArg;
    }

    let middlewares = args as RequestHandler[];
    if (lastArg && typeof lastArg !== "object") {
      middlewares = [...args, lastArg] as RequestHandler[];
    }

    this.routes.add(method, path, routeDef);

    this.express[method](path, ...middlewares, (req, res, next) => {
      this.#validator.validateRequest(req, method, path, routeDef);
      handler(req, res, next)?.catch(next);
    });

    return this;
  }
}
