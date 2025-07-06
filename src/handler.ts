import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
import { reqSchema } from "./req-schema";
import { reqValidation } from "./req-validation";
import type {
  ContentObject,
  Handler,
  OperationObject,
  ParameterObject,
  ResponsesObject,
} from "./types.d.ts";

const DEF_SYMBOL = Symbol("tyex_def");

export const getDef = (handler: RequestHandler) => {
  if (DEF_SYMBOL in handler) {
    return handler[DEF_SYMBOL];
  }
  return undefined;
};

export const handler = <
  Locals extends Record<string, unknown>,
  const Params extends ParameterObject[],
  Responses extends ResponsesObject,
  ReqBodyContent extends ContentObject,
  ReqBodyRequired extends boolean,
>(
  def: OperationObject<Params, Responses, ReqBodyContent, ReqBodyRequired>,
  handler: Handler<Locals, Params, Responses, ReqBodyContent, ReqBodyRequired>,
) => {
  const schema = reqSchema(def);
  const validation = reqValidation(schema);

  const handle = (req: Request, res: Response, next: NextFunction) => {
    const result = validation(req);
    if (!result.success) {
      next(result.error);
      return;
    }

    // @ts-expect-error express types can not infer runtime modifications
    Promise.resolve(handler(req, res, next)).catch(next);
  };

  handle[DEF_SYMBOL] = def;
  return handle;
};
