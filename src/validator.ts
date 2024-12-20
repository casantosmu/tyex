import type { Request } from "express";
import type Ajv from "ajv";
import type { ValidateFunction } from "ajv";
import type { TSchema } from "@sinclair/typebox";
import type { RouteDefinition } from "./types";
import {
  UnsupportedMediaTypeError,
  ValidationError,
  type ErrorDetails,
} from "./errors";
import { isEmptyObj, validate } from "./utils";

interface Validation {
  path: ValidateFunction | null;
  query: ValidateFunction | null;
  body: Map<string, ValidateFunction>;
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
  query: ParamSchema;
}

const buildValidation = (ajv: Ajv, def: RouteDefinition) => {
  const validation: Validation = {
    path: null,
    query: null,
    body: new Map<string, ValidateFunction>(),
  };
  if (def.parameters) {
    const schemas: ParamsSchemas = {
      path: {
        type: "object",
        properties: {},
        required: [],
      },
      query: {
        type: "object",
        properties: {},
        required: [],
      },
    };

    for (const parameter of def.parameters) {
      if (parameter.in === "path" && parameter.schema) {
        schemas.path.properties[parameter.name] = parameter.schema;
        schemas.path.required.push(parameter.name);
      } else if (parameter.in === "query" && parameter.schema) {
        schemas.query.properties[parameter.name] = parameter.schema;
        if (parameter.required) {
          schemas.query.required.push(parameter.name);
        }
      }
    }

    validation.path = ajv.compile(schemas.path);
    validation.query = ajv.compile(schemas.query);
  }
  if (def.requestBody) {
    const content = def.requestBody.content;
    for (const [contentType, value] of Object.entries(content)) {
      if (value.schema) {
        validation.body.set(contentType, ajv.compile(value.schema));
      }
    }
  }

  return validation;
};

const validateRequest = (
  req: Request,
  def: RouteDefinition,
  validation: Validation,
) => {
  const errors: ErrorDetails = {};

  if (def.requestBody) {
    const contentType = req.get("Content-Type") ?? "unknown_content_type";
    // TODO:
    // - handle requests that match multiple keys (ej: 'application/*')
    // - handle multipart/form-data
    const bodyValidation = validation.body.get(contentType);
    if (!bodyValidation) {
      throw new UnsupportedMediaTypeError(contentType);
    }

    if (def.requestBody.required || !isEmptyObj(req.body)) {
      const error = validate(bodyValidation, req.body);
      if (error) {
        errors.body = error;
      }
    }
  }
  if (validation.path) {
    const error = validate(validation.path, req.params);
    if (error) {
      errors.path = error;
    }
  }
  if (validation.query) {
    const error = validate(validation.query, req.query);
    if (error) {
      errors.query = error;
    }
  }

  if (!isEmptyObj(errors)) {
    throw new ValidationError(errors);
  }
};
