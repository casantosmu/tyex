import type { Application, ILayer } from "express-serve-static-core";
import { OpenAPIV3 } from "openapi-types";
import { getDef } from "./handler";

const initOAS = (oas: OpenAPIV3.Document) => {
  return {
    ...oas,
    paths: { ...oas.paths },
  };
};

const getStack = (app: Application) => {
  let stack = app.stack as ILayer[] | undefined;
  if (!stack) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    stack = app._router?.stack as ILayer[] | undefined;
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

export const oasGenerator = (
  app: Application,
  oas: OpenAPIV3.Document,
  basePath = "",
) => {
  oas = initOAS(oas);
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
