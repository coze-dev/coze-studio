export const safeJSONParse = (value?: string): unknown => {
  if (!value) {
    return void 0;
  }
  try {
    return JSON.parse(value);
  } catch {
    return void 0;
  }
};

export const safeJSONParseV2 = <T = unknown>(
  value: string,
  fallback: T | null,
):
  | {
      parseSuccess: true;
      useFallback: false;
      value: T;
    }
  | {
      parseSuccess: false;
      useFallback: true;
      value: T;
    }
  | {
      parseSuccess: false;
      useFallback: false;
      value: null;
    } => {
  try {
    return {
      parseSuccess: true,
      value: JSON.parse(value),
      useFallback: false,
    };
  } catch (error) {
    if (fallback !== null) {
      return {
        parseSuccess: false,
        useFallback: true,
        value: fallback,
      };
    }
    return {
      parseSuccess: false,
      useFallback: false,
      value: null,
    };
  }
};
