import {
  isObject as isObjectBase,
  isFunction as isFunctionBase,
} from 'lodash-es';

import {
  type DebounceConfig,
  type ObjectDebounceTime,
  type SaveMiddlewareHander,
  type FunctionDebounceTime,
} from '../type/index';

export function isFunction(
  value: DebounceConfig,
): value is FunctionDebounceTime {
  return isFunctionBase(value);
}

export function isObject(value: DebounceConfig): value is ObjectDebounceTime {
  return isObjectBase(value);
}

/**
 * 获取保存接口调用时候需要的参数
 */
export const getPayloadByFormatter = async <T>(
  state: T,
  formatter?: SaveMiddlewareHander<T>,
) => {
  if (formatter) {
    return await formatter(state);
  }
  return state;
};
