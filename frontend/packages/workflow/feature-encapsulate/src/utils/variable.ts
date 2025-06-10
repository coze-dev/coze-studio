import { isObject, get, has, isArray } from 'lodash-es';
import { type WorkflowVariable } from '@coze-workflow/variable';
import { type DTODefine } from '@coze-workflow/base';

/**
 * 遍历 DTO JSON 中的变量引用
 * @param data
 * @param cb
 * @returns
 */
export function traverseRefsInNodeJSON(
  data: unknown,
  cb: (_ref: DTODefine.RefExpression) => void,
) {
  if (isObject(data)) {
    // 判断是否符合 ValueExpressionDTO 的结构
    if (
      get(data, 'type') === 'ref' &&
      get(data, 'content.source') === 'block-output' &&
      has(data, 'content.blockID') &&
      has(data, 'content.name')
    ) {
      cb(data as DTODefine.RefExpression);
    }

    Object.entries(data).forEach(([_key, _val]) => {
      traverseRefsInNodeJSON(_val, cb);
    }, {});
    return;
  }

  if (isArray(data)) {
    data.forEach(_item => {
      traverseRefsInNodeJSON(_item, cb);
    });
  }
}

/**
 * 变量排序
 * @param variable
 * @returns
 */
export const variableOrder = (name?: string) => {
  const orders = {
    USER_INPUT: 2,
    CONVERSATION_NAME: 1,
  };
  return orders[name ?? ''] || 0;
};

export const sortVariables = (variables: WorkflowVariable[]) => {
  if (!variables) {
    return variables;
  }

  return variables.sort(
    (a, b) =>
      variableOrder(b?.viewMeta?.name) - variableOrder(a?.viewMeta?.name),
  );
};
