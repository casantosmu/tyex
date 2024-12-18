import type { Request } from "express";
import type Ajv from "ajv";
import type { ValidateFunction } from "ajv";
import type { TSchema } from "@sinclair/typebox";
import type { RouteDefinition } from "./types";
import { ValidationError, type ErrorDetails } from "./errors";
import { isEmptyObj, validate } from "./utils";

interface Validation {
  path: ValidateFunction | null;
}

export class Validator {
  #ajv: Ajv;
  #validations = new Map<string, Validation>();

  constructor(ajv: Ajv) {
    this.#ajv = ajv;
  }

  validateRequest(
    req: Request,
    method: string,
    path: string,
    def: RouteDefinition,
  ) {
    const key = `${method}${path}`;
    let validation = this.#validations.get(key);
    if (!validation) {
      validation = buildValidation(this.#ajv, def);
      this.#validations.set(key, validation);
    }
    validateRequest(req, def, validation);
  }
}

interface ParamSchema {
  type: "object";
  properties: Record<string, TSchema>;
  required: string[];
}

interface ParamsSchemas {
  path: ParamSchema;
}

const buildValidation = (ajv: Ajv, def: RouteDefinition) => {
  const validation: Validation = {
    path: null,
  };
  if (def.parameters) {
    const schemas: ParamsSchemas = {
      path: {
        type: "object",
        properties: {},
        required: [],
      },
    };

    for (const parameter of def.parameters) {
      if (parameter.in === "path" && parameter.schema) {
        schemas.path.properties[parameter.name] = parameter.schema;
        schemas.path.required.push(parameter.name);
      }
    }

    validation.path = ajv.compile(schemas.path);
  }

  return validation;
};

const validateRequest = (
  req: Request,
  def: RouteDefinition,
  validation: Validation,
) => {
  const errors: ErrorDetails = {};

  if (validation.path) {
    const error = validate(validation.path, req.params);
    if (error) {
      errors.path = error;
    }
  }

  if (!isEmptyObj(errors)) {
    throw new ValidationError(errors);
  }
};
