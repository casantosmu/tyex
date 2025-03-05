import type { OperationObject } from "./types";

interface RequestSchema {
  type: string;
  required: string[];
  properties: {
    params: {
      type: string;
      required: string[];
      properties: Record<string, unknown>;
    };
    query: {
      type: string;
      required: string[];
      properties: Record<string, unknown>;
    };
    body: unknown;
  };
}

export const reqSchema = (def: OperationObject) => {
  const schema: RequestSchema = {
    type: "object",
    required: ["params", "query"],
    properties: {
      params: {
        type: "object",
        required: [],
        properties: {},
      },
      query: {
        type: "object",
        required: [],
        properties: {},
      },
      body: {
        type: "object",
        required: [],
        properties: {},
      },
    },
  };

  if (def.parameters) {
    for (const parameter of def.parameters) {
      if (parameter.in === "path" && parameter.schema) {
        schema.properties.params.properties[parameter.name] = parameter.schema;
        if (parameter.required) {
          schema.properties.params.required.push(parameter.name);
        } else {
          console.warn(`Path parameter "${parameter.name}" must be required`);
        }
      } else if (parameter.in === "query" && parameter.schema) {
        schema.properties.query.properties[parameter.name] = parameter.schema;
        if (parameter.required) {
          schema.properties.query.required.push(parameter.name);
        }
      }
    }
  }

  if (def.requestBody) {
    if (def.requestBody.required) {
      schema.required.push("body");
    }

    for (const [media, content] of Object.entries(def.requestBody.content)) {
      if (media !== "application/json") {
        console.warn(`${media} unsupported - only application/json supported`);
      } else if (content.schema) {
        schema.properties.body = content.schema;
      }
    }
  }

  return schema;
};
