import type { ErrorRequestHandler } from "express";
import { Type } from "@sinclair/typebox";

export const ErrorDTO = Type.Object({
  error: Type.String(),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.error(error);
  res.status(400).send(error);
};
