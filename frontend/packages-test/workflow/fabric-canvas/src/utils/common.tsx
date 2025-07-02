export const getNumberBetween = ({
  value,
  max,
  min,
}: {
  value: number;
  max: number;
  min: number;
}) => {
  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }
  return value;
};
