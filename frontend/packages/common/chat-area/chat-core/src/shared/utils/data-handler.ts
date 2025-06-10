import { pickBy, type merge, mergeWith, isArray } from 'lodash-es';

export const filterEmptyField = <T extends Record<string, unknown>>(
  obj: T,
): T =>
  pickBy(
    obj,
    value => value !== undefined && value !== null && value !== '',
  ) as T;

export type PartiallyRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

// enum转换为联合类型
export type EnumToUnion<T extends Record<string, string>> = T[keyof T];

export const muteMergeWithArray = (...args: Parameters<typeof merge>) =>
  mergeWith(...args, (objValue: unknown, srcValue: unknown) => {
    if (isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  });
