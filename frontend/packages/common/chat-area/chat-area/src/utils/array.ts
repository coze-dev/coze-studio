/**
 * 从列表中截取 center 位置左右各 side 大小的一段，减小搜索计算量
 */
export const sliceArrayByIndexRange = <T>(
  array: T[],
  center: number,
  side: number,
) => {
  const start = Math.max(center - side, 0);
  const end = Math.min(center + side, array.length);
  return array.slice(start, end);
};

/**
 * notice: execute mutable change
 */
export const uniquePush = <T extends string | number>(
  arr: T[],
  val: T,
): void => {
  if (arr.includes(val)) {
    return;
  }
  arr.push(val);
};
