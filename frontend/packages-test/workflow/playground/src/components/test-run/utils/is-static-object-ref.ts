import {
  type ObjectRefExpression,
  type InputValueVO,
  ValueExpressionType,
} from '@coze-workflow/base';

interface InputObjectRefVO extends InputValueVO {
  input: ObjectRefExpression;
}

/**
 * 有没有变量引用
 * @param vos
 * @returns
 */
function hasRef(vos?: InputValueVO[]): boolean {
  if (!vos?.length) {
    return false;
  }

  return vos.some(
    vo => vo.input?.type === ValueExpressionType.REF || hasRef(vo.children),
  );
}

/**
 * 是不是静态的object ref
 * 里面都是使用的常量
 */
export function isStaticObjectRef(value: InputObjectRefVO): boolean {
  const input = value?.input;

  if (input?.type !== ValueExpressionType.OBJECT_REF) {
    return false;
  }

  return !hasRef(value.children);
}
