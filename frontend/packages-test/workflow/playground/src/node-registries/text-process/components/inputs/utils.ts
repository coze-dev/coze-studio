export const getMaxIndex = (values: string[], prefixStr: string): number => {
  if (!Array.isArray(values)) {
    return 1;
  }

  const maxIndex =
    values.length === 0
      ? 0
      : Math.max(
          ...values
            .map(item => Number(item?.split(prefixStr)[1] ?? 0))
            .filter(v => !isNaN(v)),
        );

  return maxIndex + 1;
};
