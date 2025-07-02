import { ViewVariableType } from '@/store/variable-groups/types';
import { type TreeNodeCustomData } from '@/components/variable-tree/type';
import { formatJson } from '@/components/variable-tree/components/json-editor/utils/format-json';

const getDefaultValueByType = (type: ViewVariableType) => {
  switch (type) {
    case ViewVariableType.String:
      return '';
    case ViewVariableType.Integer:
    case ViewVariableType.Number:
      return 0;
    case ViewVariableType.Boolean:
      return false;
    case ViewVariableType.Object:
      return {};
    case ViewVariableType.ArrayString:
      return [''];
    case ViewVariableType.ArrayInteger:
      return [0];
    case ViewVariableType.ArrayBoolean:
      return [true];
    case ViewVariableType.ArrayNumber:
      return [0];
    case ViewVariableType.ArrayObject:
      return [{}];
    default:
      return {};
  }
};

const isArrayType = (type: ViewVariableType) =>
  [
    ViewVariableType.ArrayString,
    ViewVariableType.ArrayInteger,
    ViewVariableType.ArrayBoolean,
    ViewVariableType.ArrayNumber,
    ViewVariableType.ArrayObject,
  ].includes(type);

export const getEditorViewVariableJson = (treeData: TreeNodeCustomData) => {
  const { defaultValue, type, name, children } = treeData;

  if (defaultValue) {
    const json = JSON.parse(defaultValue);
    return formatJson(
      JSON.stringify({
        [name]: json,
      }),
    );
  }

  // 如果没有name,返回空对象
  if (!name) {
    return '{}';
  }

  const isArray = isArrayType(type);

  // 递归处理children
  const processChildren = (
    nodes?: TreeNodeCustomData[],
    parentType?: ViewVariableType,
  ) => {
    if (!nodes || nodes.length === 0) {
      return getDefaultValueByType(parentType || type);
    }

    if (isArray && !parentType) {
      const firstChild = nodes[0];
      if (!firstChild) {
        return [];
      }

      // 如果是数组类型，根据第一个子元素的类型生成默认值
      const result = {};
      if (firstChild.children && firstChild.children.length > 0) {
        result[firstChild.name] = processChildren(
          firstChild.children,
          firstChild.type,
        );
      } else {
        result[firstChild.name] = getDefaultValueByType(firstChild.type);
      }
      return [result];
    }

    return nodes.reduce(
      (acc, node) => {
        if (!node.name) {
          return acc;
        }
        if (node.children && node.children.length > 0) {
          const value = processChildren(node.children, node.type);
          acc[node.name] = isArrayType(node.type) ? [value] : value;
        } else {
          acc[node.name] = getDefaultValueByType(node.type);
        }
        return acc;
      },
      {} satisfies Record<string, unknown>,
    );
  };

  // 生成最终的JSON结构
  const result = {
    [name]: processChildren(children),
  };

  return formatJson(JSON.stringify(result));
};
