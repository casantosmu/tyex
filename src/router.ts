import type express from "express";
import type {
  ParameterObject,
  RouteDefinition,
  Handler,
  ReqHandler,
  ResponsesObject,
  ContentObject,
  Method,
} from "./types";
import type { RequestHandler } from "express";
import type { Tyex } from "./tyex";
import { Routes } from "./routes";
import { Validator } from "./validator";

export class Router {
  #router: express.Router;
  #routes = new Routes();
  #validator: Validator | null = null;

  constructor(router: express.Router) {
    this.#router = router;
  }

  _setup(tyex: Tyex, prefix?: string) {
    this.#validator = new Validator(tyex.ajv);
    tyex.routes._addChild(this.#routes, prefix);
    return this.#router;
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

    this.#routes.add(method, path, routeDef);

    this.#router[method](path, ...middlewares, (req, res, next) => {
      if (!this.#validator) {
        throw new Error("router must be mounted before handling routes.");
      }
      this.#validator.validateRequest(req, method, path, routeDef);
      handler(req, res, next)?.catch(next);
    });

    return this;
  }
}
