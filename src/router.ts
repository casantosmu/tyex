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
import type { TExpress } from "./texpress";
import { Routes } from "./routes";
import { Validator } from "./validator";

export class Router {
  #router: express.Router;
  #routes = new Routes();
  #validator: Validator | null = null;

  constructor(router: express.Router) {
    this.#router = router;
  }

  _setup(texpress: TExpress, prefix?: string) {
    this.#validator = new Validator(texpress.ajv);
    texpress.routes._addChild(this.#routes, prefix);
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

    this.#routes.add(method, path, def);
    this.#router[method](path, ...middlewares, (req, res, next) => {
      if (!this.#validator) {
        throw new Error("router must be mounted before handling routes.");
      }
      this.#validator.validateRequest(req, method, path, def);
      handler(req, res, next)?.catch(next);
    });
    return this;
  }
}
