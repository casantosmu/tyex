import { handler } from "./handler";
import { openapiMiddleware } from "./openapi-middleware";

export { TypeOpenAPI } from "./oas-type";
export { ValidationError } from "./req-validation";

const tyex = { handler, openapi: openapiMiddleware };

export default tyex;
