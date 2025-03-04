import { handler } from "./handler";
import { openapiMiddleware } from "./openapi-middleware";

const tyex = { handler, openapi: openapiMiddleware };

export default tyex;
