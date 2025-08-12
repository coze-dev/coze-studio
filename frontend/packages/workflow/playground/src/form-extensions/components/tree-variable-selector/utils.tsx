/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { type ReactNode } from 'react';

import { groupBy } from 'lodash-es';
import {
  ViewVariableType,
  type ViewVariableTreeNode,
  variableUtils,
  isGlobalVariableKey,
  GlobalVariableKey,
  GLOBAL_VAR_ALIAS_MAP,
} from '@coze-workflow/variable';
import {
  type StandardNodeType,
  VARIABLE_TYPE_ALIAS_MAP,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { Tooltip, Space } from '@coze-arch/coze-design';

import { VariableTypeTag } from '../variable-type-tag';
import { type VariableMetaWithNode } from '../../typings';
import {
  type ITreeNodeData,
  type CustomFilterVar,
  type RenderDisplayVarName,
  type VariableTreeDataNode,
} from './types';

/** Filter variables that do not match the criteria (types) */
export const doesNodeIncludeEnabledTypes = (
  node: ViewVariableTreeNode,
  enabledTypes: Array<ViewVariableType>,
): boolean => {
  if (enabledTypes.includes(node.type)) {
    return true;
  }

  if (!node.children?.length) {
    return false;
  }

  return node.children
    .map(childNode => doesNodeIncludeEnabledTypes(childNode, enabledTypes))
    .includes(true);
};

export const normalizeTreeData = (
  dataSource: Array<ViewVariableTreeNode>,
  disabledTypes: Array<ViewVariableType>,
) => {
  const enabledTypes = ViewVariableType.getComplement(disabledTypes);
  return filterTreeNode(dataSource, node =>
    doesNodeIncludeEnabledTypes(node, enabledTypes),
  );
};

function filterTreeNode(
  treeData: Array<ViewVariableTreeNode & { nodeId?: string }>,
  condition: (item: ViewVariableTreeNode) => boolean,
  parent?: VariableTreeDataNode,
): Array<VariableTreeDataNode> {
  return treeData.reduce<Array<VariableTreeDataNode>>((buf, item) => {
    if (!condition(item)) {
      return buf;
    } else {
      const { children, ...others } = item;

      let value = item.key;
      if (parent?.value) {
        value = `${parent?.value}-${item.key}`;
      } else if (item?.nodeId) {
        value = `${item.nodeId}-${item.key}`;
      }

      const newItem: VariableTreeDataNode = {
        ...others,
        label: item.label || item.name,
        value,
        parent,
      };

      if (item.children) {
        newItem.children = filterTreeNode(item.children, condition, newItem);
      }

      buf.push(newItem);
      return buf;
    }
  }, []);
}

export function formatWithNodeVariables(
  withNodeVariables: VariableMetaWithNode[],
  disabledTypes: Array<ViewVariableType>,
): VariableTreeDataNode[] {
  const groupedVariableList = groupBy(withNodeVariables, 'nodeId');

  return Object.entries(groupedVariableList)
    .map(([key, value]) => {
      const nodeVariables = normalizeTreeData(value, disabledTypes);

      // Nodes without variables do not need to be displayed
      if (!nodeVariables?.length) {
        return null;
      }

      return {
        label: value[0]?.nodeTitle ?? key,
        value: key,
        isTop: true,
        type: ViewVariableType.Object,
        children: nodeVariables,
        nodeId: value[0]?.nodeId,
        nodeType: value[0]?.nodeType,
        nodeTitle: value[0]?.nodeTitle,
      };
    })
    .filter(Boolean) as VariableTreeDataNode[];
}

export const renderLabelWithItem = (
  item?: TreeNodeData,
  forArrayItem?: boolean,
  searchKey?: string,
  testId = '',
  // eslint-disable-next-line max-params
) => {
  if (!item) {
    return null;
  }

  const { label, type } = item;

  let searchLabelIndex = 0;

  let renderLabel = label;

  if (searchKey && label) {
    const labelStr = String(label);
    searchLabelIndex = labelStr.toLowerCase().indexOf(searchKey.toLowerCase());
    if (searchLabelIndex >= 0) {
      renderLabel = (
        <>
          {labelStr.substring(0, searchLabelIndex)}
          <span className="coz-fg-hglt-yellow">
            {labelStr.substring(
              searchLabelIndex,
              searchLabelIndex + searchKey.length,
            )}
          </span>
          {labelStr.substring(
            searchLabelIndex + searchKey.length,
            labelStr.length,
          )}
        </>
      );
    }
  }

  if (!type) {
    return <div data-testid={testId}>{renderLabel}</div>;
  }

  if (forArrayItem && variableUtils.ARRAY_TYPES.includes(type)) {
    return (
      <Tooltip
        content={I18n.t('workflow_detail_batch_item_tooltip', {
          name: label,
        })}
        position="left"
        style={{ maxWidth: 800, display: 'block', wordBreak: 'break-word' }}
        spacing={16}
        // The canvas can move freely, but flipping will lead to wrong positioning.
        autoAdjustOverflow={false}
      >
        <Space spacing={4}>
          <span className="tree-variable-select-label">
            {renderLabel}
            <>{' [n]'}</>
          </span>
          <VariableTypeTag size="xs">
            {VARIABLE_TYPE_ALIAS_MAP[type]}
          </VariableTypeTag>
        </Space>
      </Tooltip>
    );
  }

  return (
    <Space spacing={4}>
      <span data-testid={testId} className="tree-variable-select-label">
        {renderLabel}
      </span>
      <VariableTypeTag size="xs">
        {VARIABLE_TYPE_ALIAS_MAP[type]}
      </VariableTypeTag>
    </Space>
  );
};

export const genGlobalVariableData = (
  dataSource: VariableTreeDataNode[] = [],
) => {
  const global = [
    {
      label: GLOBAL_VAR_ALIAS_MAP[GlobalVariableKey.User],
      value: GlobalVariableKey.User,
      children: [],
      isTop: true,
      type: ViewVariableType.Object,
      nodeId: GlobalVariableKey.User,
      nodeType: undefined,
      nodeTitle: GLOBAL_VAR_ALIAS_MAP[GlobalVariableKey.User],
    },
    {
      label: GLOBAL_VAR_ALIAS_MAP[GlobalVariableKey.App],
      value: GlobalVariableKey.App,
      children: [],
      isTop: true,
      type: ViewVariableType.Object,
      nodeId: GlobalVariableKey.App,
      nodeType: undefined,
      nodeTitle: GLOBAL_VAR_ALIAS_MAP[GlobalVariableKey.App],
    },
    {
      label: GLOBAL_VAR_ALIAS_MAP[GlobalVariableKey.System],
      value: GlobalVariableKey.System,
      children: [],
      isTop: true,
      type: ViewVariableType.Object,
      nodeId: GlobalVariableKey.System,
      nodeType: undefined,
      nodeTitle: GLOBAL_VAR_ALIAS_MAP[GlobalVariableKey.System],
    },
  ] as unknown as VariableTreeDataNode[];

  const others: VariableTreeDataNode[] = [];

  dataSource?.forEach(item => {
    if (!isGlobalVariableKey(item.value)) {
      others.push(item);
    } else {
      const index = global.findIndex(
        globalVar => globalVar.value === item.value,
      );
      if (index !== -1) {
        global[index] = item;
      }
    }
  });

  return [...global, ...others];
};

/**
 * Process DataSource data, add partial fields/renders
 * For TreeSelect, you need to put the path on each dataSource Item to help TreeSelect determine the path when selecting.
 */
export const processDataSourceLabelRender = (params: {
  dataSource?: VariableTreeDataNode[];
  disabledTypes?: Array<ViewVariableType>;
  prevPath?: string[];
  prevNamePath?: string[];
  icon?: (node: VariableTreeDataNode) => ReactNode | undefined;
  renderDisplayVarName?: RenderDisplayVarName;
  customFilterVar?: CustomFilterVar;
  enableSelectNode?: boolean;
}): TreeNodeData[] | undefined => {
  const {
    dataSource,
    prevPath,
    prevNamePath,
    disabledTypes,
    icon,
    renderDisplayVarName,
    customFilterVar,
    enableSelectNode,
  } = params;

  if (!dataSource) {
    return undefined;
  }
  if (!dataSource.length) {
    return [];
  }

  return (
    dataSource
      .filter(
        item =>
          item.isTop ||
          (customFilterVar
            ? customFilterVar({
                meta: item,
                path: [...(prevPath || []), item.key || item.value],
              })
            : item.name),
      )
      .map(item => {
        const path: string[] = [
          ...(prevPath || []),
          item.key || item.value,
        ] as string[];

        const namePath: string[] = [
          ...(prevNamePath || []),
          item.name ?? item.value,
        ];

        let { label } = item;
        if (renderDisplayVarName && !item.isTop) {
          label = renderDisplayVarName({ meta: item, path });
        }

        return {
          ...item,
          label,
          key: path.join('-') as string,
          path,
          namePath,
          // TODO: can also be judged by disableTypes
          // Nodes in the first layer should not be selected & & Nodes that do not pass the optionFilter cannot be selected
          disabled:
            path?.length === 1 ||
            (disabledTypes &&
              Boolean(disabledTypes.length) &&
              disabledTypes.includes(item.type)) ||
            item.disabled,
          icon: icon && icon(item),
          children: processDataSourceLabelRender({
            dataSource: item.children,
            prevPath: path,
            prevNamePath: namePath,
            disabledTypes,
            renderDisplayVarName,
            customFilterVar,
          }),
        };
      })
      // Filter nodes without output variables
      .filter(_item => {
        if (enableSelectNode) {
          // No filtering required if root node selection is allowed
          return true;
        }
        if (!_item.isTop) {
          return true;
        }

        if (isGlobalVariableKey(_item.key)) {
          return true;
        }

        return (_item.children || []).length > 0;
      }) as TreeNodeData[]
  );
};

export const getLabelPath = (
  dataSource: TreeNodeData[],
  value: string[],
): string[] => {
  if (!value?.length) {
    return [];
  }
  const path: string[] = [];
  let i = 0;
  let currValue = value.slice(0, i + 1).join('-');

  let cur = dataSource.find(item => item.value === currValue);
  while (cur && i < value.length) {
    path.push(cur.label || cur.name);
    i++;
    currValue = value.slice(0, i + 1).join('-');
    cur = cur.children?.find(item => item.value === currValue);
  }
  return path;
};

// Look up the mount node
export const findActivityDOM = (node?: HTMLElement | null): HTMLElement => {
  if (!node) {
    return document.body;
  }
  if (node.classList.contains('gedit-flow-activity-node')) {
    return node;
  }

  if (node.parentElement) {
    return findActivityDOM(node.parentElement);
  }

  return document.body;
};

/** Go up and find the node information. */
export const findNodeInfo = (
  node: TreeNodeData,
): {
  nodeTitle?: string;
  nodeType?: StandardNodeType;
  nodeId?: string;
} => {
  if (node.parent) {
    return findNodeInfo(node.parent);
  }
  return {
    nodeTitle: node.nodeTitle,
    nodeType: node.nodeType,
    nodeId: node.nodeId,
  };
};

export const formatDataWithGlobalVariable = (data?: TreeNodeData[]) => {
  if (!data) {
    return [];
  }

  return data.map(item => {
    if (item.key && isGlobalVariableKey(item.key)) {
      return {
        groupId: 'global_variable',
        ...item,
      };
    }

    return item;
  });
};

const matchVariableDataByType = (
  data: VariableTreeDataNode[],
  type: ViewVariableType,
) =>
  data.map(item => {
    const { children = [], disabled, ...rest } = item;

    return {
      disabled: disabled || item.type !== type,
      children: matchVariableDataByType(children, type),
      ...rest,
    };
  });

export const formatVariableDataByMatchType = (
  data?: VariableTreeDataNode[],
  type?: ViewVariableType,
) => {
  if (!data?.length || !type) {
    return data;
  }

  return data.map(item => {
    const { children = [], ...rest } = item;
    return {
      children: matchVariableDataByType(children, type),
      ...rest,
    };
  });
};

export const sortTreeDataByGroup = (
  treeData?: ITreeNodeData[],
): ITreeNodeData[] => {
  if (!treeData) {
    return [];
  }

  const groupMap: Record<string, ITreeNodeData[]> = {};
  const noGroupArr: ITreeNodeData[] = [];

  treeData.forEach(item => {
    if (item.groupId) {
      return groupMap[item.groupId]
        ? groupMap[item.groupId].push(item)
        : (groupMap[item.groupId] = [item]);
    }
    noGroupArr.push(item);
  });

  return Object.keys(groupMap)
    .reduce<ITreeNodeData[]>((acc, cur) => acc.concat(groupMap[cur]), [])
    .concat(noGroupArr);
};
