import { handler } from "./handler";
import { oasGenerator } from "./oas-generator";
import { openapiMiddleware } from "./openapi-middleware";

export { TypeOpenAPI } from "./oas-type";
export { ValidationError } from "./req-validation";

export type * from "./types";

const tyex = {
  handler,
  openapi: openapiMiddleware,
  oasGenerator,
};

export default tyex;
