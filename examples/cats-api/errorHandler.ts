import type { ErrorRequestHandler } from "express";
import { TYExError } from "../../src";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof TYExError) {
    res.status(error.status).json({
      message: error.message,
      code: error.code,
      details: error.details,
    });
  } else {
    next(error);
  }
};
