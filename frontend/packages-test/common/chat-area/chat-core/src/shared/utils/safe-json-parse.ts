export const safeJSONParse = <T = unknown>(
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
