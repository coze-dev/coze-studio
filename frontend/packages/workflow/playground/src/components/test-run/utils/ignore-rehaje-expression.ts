import { isString } from 'lodash-es';

/**
 * ai 生成的值中可能包含 {{xxx}} 会命中 rehaje 的表达式
 * 暂时先做忽略，等更换完表单引擎即可解除问题
 */
export const ignoreRehajeExpressionString = (value: unknown) => {
  if (!isString(value)) {
    return value;
  }
  const reg = /\{\{.*\}\}/;
  return value.match(reg) ? undefined : value;
};
