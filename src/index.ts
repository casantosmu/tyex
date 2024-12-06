import express, { type Express } from "express";
import Ajv from "ajv";
import addFormats from "ajv-formats";

interface Options {
  ajv?: Ajv;
}

export default function texpress(app?: Express, options?: Options) {
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

  return {
    express: app,
    ajv,
  };
}
