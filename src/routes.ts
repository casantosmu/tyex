import type { Method, RouteDefinition } from "./types";

interface Route {
  method: Method;
  path: string;
  definition: RouteDefinition;
}

export class Routes {
  #collection: Route[] = [];

  get(): Route[] {
    return [...this.#collection];
  }

  add(method: Method, path: string, def: RouteDefinition) {
    this.#collection.push({ method, path, definition: def });
  }
}
