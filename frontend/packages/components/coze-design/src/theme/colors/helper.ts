export const getCommonItems = (colors: [string, string][]) =>
  colors.map(([key, color]) => ({
    key,
    color,
  }));
