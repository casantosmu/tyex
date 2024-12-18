import type { ValidateFunction } from "ajv";

export const isEmptyObj = (value: unknown) =>
  typeof value === "object" &&
  value !== null &&
  Object.keys(value).length === 0;

export const validate = (validator: ValidateFunction, data: unknown) =>
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  !validator(data) ? validator.errors! : null;
