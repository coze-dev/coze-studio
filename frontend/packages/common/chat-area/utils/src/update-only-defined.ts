import { isUndefined, omitBy } from 'lodash-es';

/**
 * zustand update 辅助方法，检查入参对象，丢弃 value 为 undefined 的项.
 * zustand 自身没有过滤逻辑，如果类型没有问题，可能意外地将项目置为 undefined 值
 */
export const updateOnlyDefined = <T extends Record<string, unknown>>(
  updater: (sth: T) => void,
  val: T,
) => {
  const left = omitBy(val, isUndefined) as T;
  if (!Object.keys(left).length) {
    return;
  }
  updater(left);
};
