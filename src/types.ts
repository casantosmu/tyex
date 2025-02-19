import type { Static, TSchema } from "@sinclair/typebox";
import type { NextFunction, Request, Response } from "express";

export type Method = "get" | "post" | "put" | "delete";

// TODO:
// - If schema.default then required != true
// - typeof schema.default == schema.type
export type ParameterObject<Schema extends TSchema = TSchema> = {
  name: string;
  description?: string;
  deprecated?: boolean;
  schema?: Schema;
  example?: unknown;
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
  Responses extends ResponsesObject = ResponsesObject,
  ReqBodyContent extends ContentObject = ContentObject,
  ReqBodyRequired extends boolean = boolean,
> {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: Params;
  requestBody?: {
    description?: string;
    content: ReqBodyContent;
    required?: ReqBodyRequired;
  };
  responses: Responses;
  deprecated?: boolean;
}

export type Handler<
  Params extends ParameterObject[] = ParameterObject[],
  Responses extends ResponsesObject = ResponsesObject,
  ReqBodyContent extends ContentObject = ContentObject,
  ReqBodyRequired extends boolean = boolean,
> = (
  req: Request<
    {
      [P in Params[number] as P["in"] extends "path"
        ? P["name"]
        : never]: P["schema"] extends TSchema ? Static<P["schema"]> : never;
    },
    unknown,
    {
      [MediaType in keyof ReqBodyContent]: ReqBodyContent[MediaType]["schema"] extends TSchema
        ? ReqBodyRequired extends true
          ? Static<ReqBodyContent[MediaType]["schema"]>
          : Static<ReqBodyContent[MediaType]["schema"]> | Record<string, never>
        : never;
    }[keyof ReqBodyContent],
    {
      [P in Params[number] as P["in"] extends "query"
        ? P["name"]
        : never]: P["schema"] extends TSchema
        ? P["required"] extends true
          ? Static<P["schema"]>
          : P["schema"] extends { default: unknown }
            ? Static<P["schema"]>
            : Static<P["schema"]> | undefined
        : never;
    }
  >,
  res: Response<
    {
      [Status in keyof Responses]: Responses[Status]["content"] extends ContentObject
        ? Responses[Status]["content"][keyof Responses[Status]["content"]]["schema"] extends TSchema
          ? Static<
              Responses[Status]["content"][keyof Responses[Status]["content"]]["schema"]
            >
          : never
        : never;
    }[keyof Responses]
  >,
  next: NextFunction,
) => void | Promise<void>;

export type ReqHandler = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export interface OpenAPI {
  openapi: string;
  info: {
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: {
      name?: string;
      url?: string;
      email?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
    version: string;
  };
  servers?: {
    url: string;
    description?: string;
  }[];
  paths: Record<string, Record<string, unknown>>;
}

export type OpenAPIBase = Omit<OpenAPI, "openapi" | "paths">;
