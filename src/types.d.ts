import type { Static, TSchema } from "@sinclair/typebox";
import type { NextFunction, Request, Response } from "express";
import type { OpenAPIV3 } from "openapi-types";

export type ContentObject<Schema extends TSchema = TSchema> = Record<
  string,
  {
    schema?: Schema;
    example?: unknown;
    examples?: Record<
      string,
      OpenAPIV3.ReferenceObject | OpenAPIV3.ExampleObject
    >;
    encoding?: Record<string, OpenAPIV3.EncodingObject>;
  }
>;

export interface ParameterObject<Schema extends TSchema = TSchema> {
  name: string;
  in: string;

  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: string;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: Schema;
  example?: unknown;
  examples?: Record<
    string,
    OpenAPIV3.ReferenceObject | OpenAPIV3.ExampleObject
  >;
  content?: ContentObject;
}

export type ResponsesObject = Record<
  string,
  {
    description: string;
    headers?: Record<
      string,
      OpenAPIV3.ReferenceObject | OpenAPIV3.HeaderObject
    >;
    content?: ContentObject;
    links?: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.LinkObject>;
  }
>;

export interface OperationObject<
  Params extends ParameterObject[] = ParameterObject[],
  Responses extends ResponsesObject = ResponsesObject,
  ReqBodyContent extends ContentObject = ContentObject,
  ReqBodyRequired extends boolean = boolean,
> extends OpenAPIV3.OperationObject {
  parameters?: Params;
  requestBody?: {
    description?: string;
    content: ReqBodyContent;
    required?: ReqBodyRequired;
  };
  responses: Responses;
}

export type Handler<
  Locals extends Record<string, unknown> = Record<string, unknown>,
  const Params extends ParameterObject[] = ParameterObject[],
  Responses extends ResponsesObject = ResponsesObject,
  ReqBodyContent extends ContentObject = ContentObject,
  ReqBodyRequired extends boolean = boolean,
> = (
  req: Request<
    {
      [P in Params[number] as P["in"] extends "path"
        ? P["name"]
        : never]: P["schema"] extends TSchema
        ? P["required"] extends true
          ? Static<P["schema"]>
          : P["schema"] extends { default: unknown }
            ? Static<P["schema"]>
            : Static<P["schema"]> | undefined
        : never;
    },
    unknown,
    {
      [MediaType in keyof ReqBodyContent]: ReqBodyContent[MediaType]["schema"] extends TSchema
        ? ReqBodyRequired extends true
          ? Static<ReqBodyContent[MediaType]["schema"]>
          : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
            Static<ReqBodyContent[MediaType]["schema"]> | {}
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
    },
    Locals
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
) => unknown;
