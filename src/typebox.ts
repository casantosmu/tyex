import {
  type SchemaOptions,
  type Static,
  type TSchema,
  CloneType,
  Type,
} from "@sinclair/typebox";

type TOptions<
  Type extends TSchema,
  Options extends Record<PropertyKey, unknown>,
> = Type & Options;

export function Options<
  Type extends TSchema,
  Options extends Record<PropertyKey, unknown>,
>(type: Type, options: Options): TOptions<Type, Options> {
  return CloneType(type, options) as never;
}

export const Nullable = <T extends TSchema>(schema: T) =>
  Type.Unsafe<Static<T> | null>({
    ...schema,
    nullable: true,
  });

export const StringEnum = <T extends string[]>(
  values: [...T],
  options?: SchemaOptions,
) =>
  Type.Unsafe<T[number]>({
    type: "string",
    enum: values,
    ...options,
  });
