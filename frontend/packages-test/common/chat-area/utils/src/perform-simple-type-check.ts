import { isNumber, isObject, isString } from 'lodash-es';

type CheckMethodName = 'is-string' | 'is-number';

const checkMethodsMap = new Map<CheckMethodName, (sth: unknown) => boolean>([
  ['is-string', isString],
  ['is-number', isNumber],
]);

/**
 * think about:
 * https://www.npmjs.com/package/type-plus
 * https://www.npmjs.com/package/generic-type-guard
 * https://github.com/runtypes/runtypes
 */
export const performSimpleObjectTypeCheck = <T extends Record<string, unknown>>(
  sth: unknown,
  pairs: [key: keyof T, checkMethod: CheckMethodName][],
): sth is T => {
  if (!isObject(sth)) {
    return false;
  }
  return pairs.every(([k, type]) => {
    if (!(k in sth)) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- runtime safe
    // @ts-expect-error
    const val = sth[k];
    return checkMethodsMap.get(type)?.(val);
  });
};
