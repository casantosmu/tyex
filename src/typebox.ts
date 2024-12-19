import { type TSchema, CloneType } from "@sinclair/typebox";

export type TOptions<
  Type extends TSchema,
  Options extends Record<PropertyKey, unknown>,
> = Type & Options;

export function Options<
  Type extends TSchema,
  Options extends Record<PropertyKey, unknown>,
>(type: Type, options: Options): TOptions<Type, Options> {
  return CloneType(type, options) as never;
}
