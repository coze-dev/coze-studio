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
 
/* eslint-disable @coze-arch/max-line-per-function */
import { useParams } from 'react-router-dom';
import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import { useShallow } from 'zustand/react/shallow';
import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { type DynamicParams } from '@coze-arch/bot-typings/teamspace';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { type TreeProps } from '@coze-arch/bot-semi/Tree';
import { type VariableChannel } from '@coze-arch/bot-api/memory';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton, Toast, Tree, useFormApi } from '@coze-arch/coze-design';

import { traverse } from '@/utils/traverse';
import { useVariableGroupsStore, ViewVariableType } from '@/store';
import { VariableTreeContext } from '@/context/variable-tree-context';

import { flatVariableTreeData } from './utils';
import { type TreeNodeCustomData } from './type';
import { ChangeMode } from './components/custom-tree-node/constants';
import CustomTreeNode from './components/custom-tree-node';

export interface VariableTreeProps {
  groupId: string;
  value: Array<TreeNodeCustomData>;
  treeProps?: TreeProps;
  readonly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  showAddButton?: boolean;
  /** 默认变量类型 */
  defaultVariableType?: ViewVariableType;
  defaultCollapse?: boolean;
  children?: React.ReactNode;
  maxLimit?: number;
  hideHeaderKeys?: string[];
  channel: VariableChannel;
  validateExistKeyword?: boolean;
  onChange?: (changeValue: TreeNodeCustomData) => void;
}

export interface VariableTreeRef {
  validate: () => void;
}

function useExpandedKeys(keys: string[], defaultCollapse: boolean) {
  const [expandedKeys, setExpandedKeys] = useState(defaultCollapse ? [] : keys);

  const expandTreeNode = useCallback((key: string) => {
    setExpandedKeys(prev => [...new Set([...prev, key])]);
  }, []);

  const collapseTreeNode = useCallback((key: string) => {
    setExpandedKeys(prev => prev.filter(expandedKey => expandedKey !== key));
  }, []);

  return { expandedKeys, expandTreeNode, collapseTreeNode };
}

export function Index(
  props: VariableTreeProps,
  ref: React.Ref<VariableTreeRef>,
) {
  const {
    readonly = false,
    treeProps,
    className,
    style,
    value,
    defaultVariableType = ViewVariableType.String,
    defaultCollapse = false,
    maxLimit,
    groupId,
    channel,
    hideHeaderKeys,
    validateExistKeyword = false,
    onChange,
  } = props;

  const {
    createVariable,
    addRootVariable,
    addChildVariable,
    updateVariable,
    deleteVariable,
    findAndModifyVariable,
  } = useVariableGroupsStore(
    useShallow(state => ({
      createVariable: state.createVariable,
      addRootVariable: state.addRootVariable,
      addChildVariable: state.addChildVariable,
      updateVariable: state.updateVariable,
      deleteVariable: state.deleteVariable,
      findAndModifyVariable: state.findAndModifyVariable,
    })),
  );

  const formApi = useFormApi();

  const isValueEmpty = !value || value.length === 0;

  const itemKeysWithChildren = useMemo(() => {
    const keys: string[] = [];
    traverse(value, item => {
      if (item.children?.length > 0) {
        keys.push(item.variableId);
      }
    });
    return keys;
  }, [value]);

  const flatTreeData = useMemo(() => flatVariableTreeData(value), [value]);

  const { expandedKeys, expandTreeNode, collapseTreeNode } = useExpandedKeys(
    itemKeysWithChildren,
    defaultCollapse,
  );
  const params = useParams<DynamicParams>();

  useImperativeHandle(ref, () => ({
    validate: () => formApi.validate(),
  }));

  const disableAdd = useMemo(() => {
    if (maxLimit === undefined) {
      return false;
    }
    return (value?.length ?? 0) >= maxLimit;
  }, [value, maxLimit]);

  const showAddButton = !readonly && !disableAdd;

  const onAdd = () => {
    const newVariable = createVariable({
      groupId,
      parentId: '',
      variableType: defaultVariableType,
      channel,
    });

    addRootVariable(newVariable);
    onChange?.(newVariable);
    sendTeaEvent(EVENT_NAMES.memory_click_front, {
      project_id: params?.project_id || '',
      resource_type: 'variable',
      action: 'add',
      source: 'app_detail_page',
      source_detail: 'memory_manage',
    });
  };

  // 树节点的 change 方法
  const onTreeNodeChange = (mode: ChangeMode, param: TreeNodeCustomData) => {
    const findResult = findAndModifyVariable(
      groupId,
      item => item.variableId === param.variableId,
    );
    if (!findResult) {
      Toast.error(I18n.t('workflow_detail_node_output_parsingfailed'));
      return;
    }

    switch (mode) {
      case ChangeMode.Append: {
        const { variableId: parentId, channel: parentChannel } = findResult;
        const childVariable = createVariable({
          groupId,
          parentId,
          variableType: defaultVariableType,
          channel: parentChannel,
        });
        addChildVariable(childVariable);

        // 当前节点下新增节点 展开当前节点
        if (findResult?.variableId) {
          expandTreeNode(findResult.variableId);
        }
        sendTeaEvent(EVENT_NAMES.memory_click_front, {
          project_id: params?.project_id || '',
          resource_type: 'variable',
          action: 'add',
          source: 'app_detail_page',
          source_detail: 'memory_manage',
        });
        break;
      }
      case ChangeMode.Update: {
        updateVariable(param);
        sendTeaEvent(EVENT_NAMES.memory_click_front, {
          project_id: params?.project_id || '',
          resource_type: 'variable',
          action: 'edit',
          source: 'app_detail_page',
          source_detail: 'memory_manage',
        });
        break;
      }
      case ChangeMode.Delete: {
        deleteVariable(param);
        sendTeaEvent(EVENT_NAMES.memory_click_front, {
          project_id: params?.project_id || '',
          resource_type: 'variable',
          action: 'delete',
          source: 'app_detail_page',
          source_detail: 'memory_manage',
        });
        break;
      }
      case ChangeMode.UpdateEnabled: {
        findResult.enabled = param.enabled;
        // 一键关闭所有子节点
        traverse<TreeNodeCustomData>(findResult, node => {
          if (!param.enabled) {
            node.enabled = param.enabled;
          }
        });
        // 子点开启，父节点也开启
        if (findResult.parentId && findResult.enabled) {
          const parentData = findAndModifyVariable(
            groupId,
            item => item.variableId === findResult.parentId,
          );
          if (parentData) {
            parentData.enabled = findResult.enabled;
            updateVariable(parentData);
          }
        }
        updateVariable(findResult);
        sendTeaEvent(EVENT_NAMES.memory_click_front, {
          project_id: params?.project_id || '',
          resource_type: 'variable',
          action: param.enabled ? 'turn_on' : 'turn_off',
          source: 'app_detail_page',
          source_detail: 'memory_manage',
        });
        break;
      }
      case ChangeMode.Replace: {
        updateVariable(param);
        expandTreeNode(findResult.variableId);
        sendTeaEvent(EVENT_NAMES.memory_click_front, {
          project_id: params?.project_id || '',
          resource_type: 'variable',
          action: 'edit',
          source: 'app_detail_page',
          source_detail: 'memory_manage',
        });
        break;
      }
      default:
    }

    onChange?.(param);
  };

  if (readonly && isValueEmpty) {
    return null;
  }

  return (
    <VariableTreeContext.Provider value={{ groupId, variables: flatTreeData }}>
      <div
        className={classNames(
          // 基础容器样式
          'relative h-full',
          // 交互状态
          !readonly && 'cursor-default',
          // 自定义类名
          className,
        )}
        style={style}
      >
        <Tree
          style={readonly ? {} : { overflow: 'inherit' }}
          motion={false}
          keyMaps={{
            key: 'variableId',
          }}
          disabled={readonly}
          className={classNames(
            // 基础滚动行为
            'overflow-x-auto',

            // Tree 列表基础样式
            [
              // 列表容器样式
              '[&_.semi-tree-option-list]:overflow-visible',
              '[&_.semi-tree-option-list]:p-0',
              '[&_.semi-tree-option-list>div:first-child]:mt-0',
              // 选项样式
              '[&_.semi-tree-option]:!pl-2',
            ].join(' '),

            // 交互状态样式
            readonly
              ? '[&_.semi-tree-option-list-block_.semi-tree-option:hover]:bg-inherit'
              : [
                  '[&_.semi-tree-option-list-block_.semi-tree-option:hover]:bg-transparent',
                  '[&_.semi-tree-option-list-block_.semi-tree-option:active]:bg-transparent',
                ].join(' '),
          )}
          renderFullLabel={renderFullLabelProps => {
            const { data } = renderFullLabelProps;
            const currentLevelReadOnly = readonly || data.IsReadOnly;

            const onCollapse = (collapsed: boolean) => {
              const { variableId } = renderFullLabelProps.data;

              if (!variableId) {
                return;
              }

              if (collapsed) {
                expandTreeNode(variableId);
              } else {
                collapseTreeNode(variableId);
              }
            };

            return (
              <CustomTreeNode
                {...renderFullLabelProps}
                hideHeaderKeys={hideHeaderKeys}
                validateExistKeyword={validateExistKeyword}
                onChange={onTreeNodeChange}
                hasObjectLike={data.meta.hasObjectLike}
                readonly={currentLevelReadOnly}
                couldCollapse={(data.children?.length ?? 0) > 0}
                collapsed={renderFullLabelProps.expandStatus.expanded}
                onCollapse={onCollapse}
              />
            );
          }}
          emptyContent={<></>}
          expandedKeys={[...expandedKeys, nanoid()]}
          treeData={value}
          {...treeProps}
        />
        {showAddButton ? (
          <div className="flex items-center my-3">
            <IconButton icon={<IconCozPlus />} onClick={onAdd}>
              {I18n.t('workflow_detail_node_output_add_subitem')}
            </IconButton>
          </div>
        ) : null}
      </div>
    </VariableTreeContext.Provider>
  );
}

// 导出可调用ref方法的组件
export const VariableTree = React.forwardRef(Index);
