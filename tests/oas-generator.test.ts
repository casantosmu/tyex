import { test, expect, describe } from "vitest";
import express from "express";
import { oasGenerator } from "../src/oas-generator";
import tyex from "../src";

const baseOAS = {
  openapi: "3.0.0",
  info: {
    title: "ExpressJS",
    version: "0.0.0",
  },
  paths: {},
};

describe("oas generator", () => {
  test("should extract paths from Express app", () => {
    const app = express();

    app.get(
      "/api/resource",
      tyex.handler(
        {
          responses: {
            "200": { description: "Successful response" },
          },
        },
        (req, res) => {
          res.send();
        },
      ),
    );

    const oas = oasGenerator(app, baseOAS);

    expect(oas.paths).toStrictEqual({
      "/api/resource": {
        get: {
          responses: {
            "200": { description: "Successful response" },
          },
        },
      },
    });
  });

  test("should extract paths from Express Router", () => {
    const router = express.Router();

    router.get(
      "/api/resource",
      tyex.handler(
        {
          responses: {
            "200": { description: "Successful response" },
          },
        },
        (req, res) => {
          res.send();
        },
      ),
    );

    const app = express();
    app.use(router);

    const oas = oasGenerator(app, baseOAS);

    expect(oas.paths).toStrictEqual({
      "/api/resource": {
        get: {
          responses: {
            "200": { description: "Successful response" },
          },
        },
      },
    });
  });

  test("should extract nested paths correctly", () => {
    const usersRouter = express.Router();

    usersRouter.get(
      "/",
      tyex.handler(
        {
          responses: {
            "200": { description: "Successful response" },
          },
        },
        (req, res) => {
          res.send();
        },
      ),
    );

    const router = express.Router();
    router.use("/resource", usersRouter);

    const app = express();
    app.use("/api", router);

    const oas = oasGenerator(app, baseOAS);

    expect(oas.paths).toStrictEqual({
      "/api/resource/": {
        get: {
          responses: {
            "200": { description: "Successful response" },
          },
        },
      },
    });
  });

  test("should extract all valid OpenAPI HTTP methods", () => {
    const app = express();

    const methods = [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "head",
      "options",
      "trace",
    ] as const;

    for (const method of methods) {
      app[method](
        "/api/resource",
        tyex.handler(
          {
            responses: {
              "200": { description: `${method} response` },
            },
          },
          (req, res) => {
            res.send();
          },
        ),
      );
    }

    const oas = oasGenerator(app, baseOAS);

    for (const method of methods) {
      const response = oas.paths["/api/resource"]?.[method]?.responses["200"];
      expect(response).toStrictEqual({ description: `${method} response` });
    }
  });

  test("should transform Express route params to OpenAPI path params", () => {
    const app = express();

    app.get(
      "/api/resource/:id",
      tyex.handler({ responses: {} }, (req, res) => {
        res.send();
      }),
    );

    const oas = oasGenerator(app, baseOAS);

    expect(oas.paths).toHaveProperty("/api/resource/{id}");
  });

  test("should ignore routes without tyex.handle", () => {
    const app = express();

    app.get(
      "/api/resource/with",
      tyex.handler({ responses: {} }, (req, res) => {
        res.send();
      }),
    );

    app.get("/api/resource/without", (req, res) => {
      res.send();
    });

    const oas = oasGenerator(app, baseOAS);

    expect(oas.paths).toHaveProperty("/api/resource/with");
    expect(oas.paths).not.toHaveProperty("/api/resource/without");
  });

  test("should handle empty Express app with no routes", () => {
    const app = express();

    const oas = oasGenerator(app, baseOAS);

    expect(oas.paths).toStrictEqual({});
  });

  test("should extract paths from Express Router with multi-segment path prefix", () => {
    const router = express.Router();

    router.get(
      "/",
      tyex.handler({ responses: {} }, (req, res) => {
        res.send();
      }),
    );

    const app = express();
    app.use("/api/resource", router);

    const oas = oasGenerator(app, baseOAS);

    expect(oas.paths).toHaveProperty("/api/resource/");
  });

  test("should ignore paths when encountering mounted_app", () => {
    const app = express();
    const subApp = express();

    subApp.get("/", (req, res) => res.send());
    app.use("/sub-app", subApp);

    const oas = oasGenerator(app, baseOAS);

    expect(oas.paths).toStrictEqual({});
  });

  test("should create a default OAS document when baseOAS is undefined", () => {
    const app = express();

    const oas = oasGenerator(app);

    expect(oas).toEqual({
      openapi: "3.0.0",
      info: {
        title: "ExpressJS",
        version: "0.0.0",
      },
      paths: {},
    });
  });

  test("should add an empty paths object if baseOAS is provided without one", () => {
    const app = express();

    const baseOAS = {
      openapi: "3.0.1",
      info: {
        title: "API Without Paths",
        version: "1.2.3",
      },
    };

    const oas = oasGenerator(app, baseOAS);

    expect(oas).toEqual({
      ...baseOAS,
      paths: {},
    });
  });

  test("should use paths object if baseOAS is provided with one", () => {
    const app = express();

    const baseOAS = {
      openapi: "3.0.1",
      info: {
        title: "My Custom API",
        version: "1.0.0",
      },
      paths: {
        "/existing-path": {},
      },
    };

    const oas = oasGenerator(app, baseOAS);

    expect(oas).toStrictEqual(baseOAS);
  });
});
