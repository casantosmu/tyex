const isObjectLike = (
  input: unknown,
): input is Record<string, unknown> | unknown[] => {
  return typeof input === "object" && input != null;
};

export const removeTypeBoxSymbols = (obj: unknown): unknown => {
  if (!isObjectLike(obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeTypeBoxSymbols(item));
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[key] = removeTypeBoxSymbols(obj[key]);
  }
  return result;
};
