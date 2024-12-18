import type { TSchema } from "@sinclair/typebox";
import type { Request, Response, NextFunction } from "express";

export type Method = "get" | "post" | "put" | "delete";

// TODO:
// - If schema.default then required != true
// - typeof schema.default == schema.type
export type ParameterObject<Schema extends TSchema = TSchema> = {
  name: string;
  schema?: Schema;
} & (
  | {
      in: "query" | "header" | "cookie";
      required?: boolean;
    }
  | {
      /** If the parameter location is "path", required prop is REQUIRED and its value MUST be true. */
      in: "path";
      required: true;
    }
);

export type ContentObject<Schema extends TSchema = TSchema> = Record<
  string,
  {
    schema?: Schema;
    example?: unknown;
  }
>;

export type ResponsesObject = Record<
  string,
  {
    description: string;
    content?: ContentObject;
  }
>;

export interface RouteDefinition<
  Params extends ParameterObject[] = ParameterObject[],
> {
  parameters?: Params;
  responses: ResponsesObject;
}

export type Handler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;
