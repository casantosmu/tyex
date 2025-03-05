import type { TSchema } from "@sinclair/typebox";
import type { OpenAPIV3 } from "openapi-types";

export interface OperationObject extends OpenAPIV3.OperationObject {
  parameters?: {
    name: string;
    in: string;

    description?: string;
    required?: boolean;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: string;
    explode?: boolean;
    allowReserved?: boolean;
    schema?: TSchema;
    example?: unknown;
    examples?: Record<
      string,
      OpenAPIV3.ReferenceObject | OpenAPIV3.ExampleObject
    >;
    content?: Record<string, OpenAPIV3.MediaTypeObject>;
  }[];
  requestBody?: {
    description?: string;
    content: Record<
      string,
      {
        schema?: TSchema;
        example?: unknown;
        examples?: Record<
          string,
          OpenAPIV3.ReferenceObject | OpenAPIV3.ExampleObject
        >;
        encoding?: Record<string, OpenAPIV3.EncodingObject>;
      }
    >;
    required?: boolean;
  };
}
