import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
import { reqSchema } from "./req-schema";
import { reqValidation } from "./req-validation";
import type { OperationObject } from "./types";

const DEF_SYMBOL = Symbol("tyex_def");

export const getDef = (handler: RequestHandler) => {
  if (DEF_SYMBOL in handler) {
    return handler[DEF_SYMBOL];
  }
  return undefined;
};

export const handler = (
  def: OperationObject,
  handler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void> | void,
) => {
  const schema = reqSchema(def);
  const validation = reqValidation(schema);

  const handle = (req: Request, res: Response, next: NextFunction) => {
    const result = validation(req);
    if (!result.success) {
      next(result.error);
      return;
    }

    Promise.resolve(handler(req, res, next)).catch(next);
  };

  handle[DEF_SYMBOL] = def;
  return handle;
};
