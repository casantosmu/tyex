import Ajv, { type ErrorObject, type Schema } from "ajv";
import addFormats from "ajv-formats";
import type { Request } from "express-serve-static-core";

type Validator = (
  req: Request<unknown, unknown, unknown>,
) =>
  | { success: true; data: unknown; error?: never }
  | { success: false; data?: never; error: ValidationError };

const ajv = addFormats(
  new Ajv({
    allErrors: true,
    removeAdditional: "all",
    useDefaults: true,
    coerceTypes: "array",
  }),
  [
    "date-time",
    "time",
    "date",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uri",
    "uri-reference",
    "uuid",
    "uri-template",
    "json-pointer",
    "relative-json-pointer",
    "regex",
    "binary",
  ],
);

export class ValidationError {
  status = 400;
  code = "VALIDATION_ERROR";
  message = "Validation error";
  errors: ErrorObject[];

  constructor(errors: ErrorObject[]) {
    this.errors = errors;
  }
}

export const reqValidation = (schema: Schema): Validator => {
  const validate = ajv.compile(schema);

  return (req) => {
    const data = { params: req.params, query: req.query, body: req.body };

    if (validate(data)) {
      return {
        success: true,
        data,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const error = new ValidationError([...validate.errors!]);
    return {
      success: false,
      error,
    };
  };
};
