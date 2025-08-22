import type { Application, ILayer } from "express-serve-static-core";
import { OpenAPIV3 } from "openapi-types";
import { getDef } from "./handler";

const initOAS = (
  oas?: OpenAPIV3.Document | Omit<OpenAPIV3.Document, "paths">,
) => {
  if (!oas) {
    return {
      openapi: "3.0.0",
      info: {
        title: "ExpressJS",
        version: "0.0.0",
      },
      paths: {},
    };
  }
  if ("paths" in oas) {
    return {
      ...oas,
      paths: { ...oas.paths },
    };
  }
  return {
    ...oas,
    paths: {},
  };
};

const getStack = (app: Application) => {
  let stack = app.stack as ILayer[] | undefined;
  if (!stack) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    stack = app._router?.stack as ILayer[] | undefined;

    // For Express 5.x but this doesn't get the router path for nested
    if (!stack) {
      stack = app.router?.stack as ILayer[] | undefined;
    }
  }
  return stack;
};

const extractPathFromRegex = (regexp: RegExp) => {
  const match =
    /^\/\^((?:\\[.*+?^${}()|[\]\\/]|[^.*+?^${}()|[\]\\/])*)\$\//.exec(
      regexp.toString().replace("\\/?", "").replace("(?=\\/|$)", "$"),
    );

  if (match?.[1]) {
    return match[1].replace(/\\(.)/g, "$1");
  }

  return "";
};

/**
 * Generates an OpenAPI v3 document by introspecting an Express application's routes.
 *
 * @param app The Express application instance. The generator will scan its route stack for handlers created with `tyex.handler`.
 * @param baseOAS An optional base OpenAPI document. The generator will merge the auto-discovered paths into this document.
 * @returns The complete OpenAPI document as a JavaScript object.
 */
export const oasGenerator = (
  app: Application,
  baseOAS?: OpenAPIV3.Document | Omit<OpenAPIV3.Document, "paths">,
  basePath = "",
) => {
  let oas = initOAS(baseOAS);
  const stack = getStack(app);

  if (!stack) {
    return oas;
  }

  for (const item of stack) {
    if (item.route) {
      const path = basePath + item.route.path;

      const handler = item.route.stack.at(-1);
      if (!handler) {
        console.warn(`Route "${path}" has no handlers at -1`);
        continue;
      }

      const def = getDef(handler.handle);
      if (!def) {
        continue;
      }

      const pathOAS = path.replace(/:([^/]+)/g, "{$1}");
      oas.paths[pathOAS] = {
        ...oas.paths[pathOAS],
        [handler.method]: def,
      };
    } else if (item.name === "router") {
      const path = basePath + extractPathFromRegex(item.regexp);
      // @ts-expect-error Express internals - item.handle types are not properly exposed
      oas = oasGenerator(item.handle, oas, path);
    } else if (item.name === "mounted_app") {
      const path = basePath + extractPathFromRegex(item.regexp);
      console.warn(`Cannot process mounted_app at path "${path}"`);
    }
  }

  return oas;
};
