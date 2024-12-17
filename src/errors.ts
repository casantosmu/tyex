import type { ErrorObject } from "ajv";

export interface ErrorDetails {
  path?: ErrorObject[];
  query?: ErrorObject[];
  body?: ErrorObject[];
  [key: string]: unknown;
}

export class TExpressError extends Error {
  status: number;
  code: string;
  details: ErrorDetails;

  constructor(
    status: number,
    code: string,
    message: string,
    details: ErrorDetails = {},
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends TExpressError {
  constructor(errors: ErrorDetails) {
    super(400, "VALIDATION_ERROR", "Validation failed", errors);
  }
}
