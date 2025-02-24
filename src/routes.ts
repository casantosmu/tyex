import type { Method, RouteDefinition } from "./types";

interface Route {
  method: Method;
  path: string;
  definition: RouteDefinition;
}

interface Child {
  routes: Routes;
  prefix: string;
}

export class Routes {
  #collection: Route[] = [];
  #children: Child[] = [];

  get() {
    const routes = [...this.#collection];

    for (const child of this.#children) {
      routes.push(
        ...child.routes.get().map((route) => ({
          method: route.method,
          path: child.prefix + route.path,
          definition: route.definition,
        })),
      );
    }

    return routes;
  }

  add(method: Method, path: string, def: RouteDefinition) {
    this.#collection.push({ method, path, definition: def });
  }

  addChild(child: Routes, prefix = "") {
    this.#children.push({ routes: child, prefix });
  }
}
