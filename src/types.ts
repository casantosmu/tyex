import type { TSchema } from "@sinclair/typebox";

export type Method = "get" | "post" | "put" | "delete";

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

export interface RouteDefinition {
  responses: ResponsesObject;
}
