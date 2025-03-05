import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
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
  const handle = (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

  handle[DEF_SYMBOL] = def;
  return handle;
};
