import BigNumber from 'bignumber.js';

/**
 * 是不是大数字
 * @param value
 * @returns
 */
export function isBigNumber(value: unknown): value is BigNumber {
  return !!(value && value instanceof BigNumber);
}

/**
 * 大数字转字符串
 * @param value
 * @returns
 */
export function bigNumberToString(value: BigNumber): string {
  return value.toFixed();
}
