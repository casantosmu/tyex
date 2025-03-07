import {
  type SchemaOptions,
  type Static,
  type TSchema,
  CloneType,
  Type,
} from "@sinclair/typebox";

const Options = <Type extends TSchema, Options extends SchemaOptions>(
  type: Type,
  options: Options,
) => CloneType(type, options) as Type & Options;

const Nullable = <Type extends TSchema>(schema: Type) =>
  Type.Unsafe<Static<Type> | null>({
    ...schema,
    nullable: true,
  });

const StringEnum = <Type extends string[]>(
  values: [...Type],
  options?: SchemaOptions,
) =>
  Type.Unsafe<Type[number]>({
    type: "string",
    enum: values,
    ...options,
  });

export const TypeOpenAPI = { Options, Nullable, StringEnum };
