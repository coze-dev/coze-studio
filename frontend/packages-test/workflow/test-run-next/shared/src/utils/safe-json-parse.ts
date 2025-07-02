interface TypeSafeJSONParseOptions {
  emptyValue?: any;
  needReport?: boolean;
  enableBigInt?: boolean;
}

export const safeJsonParse = (
  v: unknown,
  options?: TypeSafeJSONParseOptions,
): unknown => {
  if (typeof v === 'object') {
    return v;
  }
  try {
    return JSON.parse(String(v));
  } catch {
    return options?.emptyValue;
  }
};
