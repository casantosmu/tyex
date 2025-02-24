import express, { type Express } from "express";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { Router } from "./router";
import { Tyex } from "./tyex";

export type { Tyex };
export { TyexError, ValidationError } from "./errors";
export { Options, Nullable, StringEnum } from "./typebox";

interface Options {
  ajv?: Ajv;
}

export default function tyex(app?: Express, options?: Options) {
  if (!app) {
    app = express();
  }

  let ajv = options?.ajv;
  if (!ajv) {
    ajv = addFormats(
      new Ajv({
        allErrors: true,
        removeAdditional: "all",
        useDefaults: true,
        coerceTypes: "array",
      }),
      [
        "date-time",
        "time",
        "date",
        "email",
        "hostname",
        "ipv4",
        "ipv6",
        "uri",
        "uri-reference",
        "uuid",
        "uri-template",
        "json-pointer",
        "relative-json-pointer",
        "regex",
        "binary",
      ],
    );
  }

  return new Tyex(app, ajv);
}

tyex.Router = () => {
  return new Router(express.Router());
};
