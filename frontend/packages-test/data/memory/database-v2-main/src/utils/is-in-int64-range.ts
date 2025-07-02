// int64 的最大值和最小值
export const INT64_MAX = BigInt('9223372036854775807');
export const INT64_MIN = BigInt('-9223372036854775808');

/**
 * 检查数值是否在 int64 范围内
 * @param value - 要检查的字符串
 * @returns
 *  - 如果是有效的 int64 范围内的整数，返回 true
 *  - 如果无效或超出范围，返回 false
 */
export const isInInt64Range = (value: string): boolean => {
  if (
    value === '' ||
    value === undefined ||
    value === null ||
    Number.isNaN(value)
  ) {
    return false;
  }

  try {
    const bigIntValue = BigInt(value);
    if (bigIntValue > INT64_MAX || bigIntValue < INT64_MIN) {
      return false;
    }
    return true;
    // eslint-disable-next-line @coze-arch/use-error-in-catch -- 正常业务逻辑
  } catch {
    return false;
  }
};
