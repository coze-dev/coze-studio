import { get, isEmpty } from 'lodash-es';
import { VariableTypeDTO } from '@coze-workflow/base';

interface ListRefSchema {
  type: 'list';
  value: {
    type: 'ref';
    content: {
      source: string;
      blockID: string;
      name: string;
    };
  };
}

// TODO 暂时写死格式，后面统一看
export const toListRefSchema = (value: string[]): ListRefSchema => {
  const [nodeId, ...keyPaths] = value;
  return {
    type: VariableTypeDTO.list,
    value: {
      type: 'ref',
      content: {
        source: 'block-output',
        blockID: `${nodeId}`,
        name: keyPaths.join('.'), // 这是使用当前循环的变量，固定名字叫item
      },
    },
  };
};

export const listRefSchemaToValue = (
  listRefSchema: ListRefSchema,
): string[] => {
  if (!listRefSchema || isEmpty(listRefSchema)) {
    return [];
  }
  const nodeId = get(listRefSchema, 'value.content.blockID', '');
  const keys = get(listRefSchema, 'value.content.name', '');

  if (!nodeId) {
    return [];
  }

  return [nodeId].concat(keys ? keys.split('.') : []);
};
