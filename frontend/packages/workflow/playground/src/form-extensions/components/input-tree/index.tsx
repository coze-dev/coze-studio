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
 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable complexity */
import React, {
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { nanoid } from 'nanoid';
import cloneDeep from 'lodash-es/cloneDeep';
import classNames from 'classnames';
import {
  type InputValueVO,
  ValueExpressionType,
  ViewVariableType,
  useNodeTestId,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Toast, Tree } from '@coze-arch/coze-design';
import { type TreeNodeData, type TreeProps } from '@coze-arch/bot-semi/Tree';

import { FormCard } from '../form-card';
import { AddItemButton } from '../add-item-button';
import {
  findCustomTreeNodeDataResult,
  formatTreeData,
  traverse,
} from './utils';
import { type TreeNodeCustomData } from './types';
import { InputTreeContextProvider } from './context';
import { TreeCollapseWidth, ChangeMode } from './constants';
import InputTreeNode from './components/input-tree-node';
import InputHeader from './components/input-header';

import styles from './index.module.less';

export interface SimpleTreeNodeCustomData {
  key: string;
}

export interface InputTreeProps {
  testId?: string;
  // 是否允许新增根节点，默认为 true
  allowAppendRootData?: boolean;
  // 是否是批处理
  isBatch?: boolean;
  treeProps?: TreeProps;
  readonly?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
  title?: string;
  titleTooltip?: string | ReactNode;
  className?: string;
  style?: React.CSSProperties;
  value: InputValueVO[] | undefined;
  onChange: (value: InputValueVO[]) => void;
  topLevelReadonly?: boolean;
  emptyPlaceholder?: string;
  noCard?: boolean;
  addItemTitle?: string;
  defaultCollapse?: boolean;

  // 最外层输出是否默认折叠
  formCardDefaultCollapse?: boolean;
  children?: React.ReactNode;
  maxLimit?: number;
  /**
   * 列宽比 如 6:4 代表名称占6份，类型占4份
   */
  columnsRatio?: string;
  /**
   * 名称是纯文本
   */
  isNamePureText?: boolean;
  /**
   * 默认添加的值
   * @param items
   * @returns
   */
  defaultAppendValue?: (items: TreeNodeCustomData[]) => any;
  /**
   * 第几个可以删除
   */
  nthCannotDeleted?: number;
  /**
   * 不允许删除
   */
  disableDelete?: boolean;
}

const getDefaultAppendValue = (
  items: TreeNodeCustomData[],
  defaultAppendValue: InputTreeProps['defaultAppendValue'],
) => {
  const defaultValue: {
    fieldRandomKey: string;
    type: ViewVariableType;
    required?: boolean;
  } = {
    fieldRandomKey: nanoid(),
    ...(defaultAppendValue?.(items) || {}),
  };

  return defaultValue;
};

function useExpandedKeys(keys: string[], defaultCollapse: boolean) {
  const [expandedKeys, setExpandedKeys] = useState(defaultCollapse ? [] : keys);

  const expandTreeNode = useCallback(
    (key: string) => {
      setExpandedKeys([...new Set([...expandedKeys, key])]);
    },
    [keys],
  );

  const collapseTreeNode = useCallback(
    (key: string) => {
      setExpandedKeys([
        ...expandedKeys.filter(expandedKey => expandedKey !== key),
      ]);
    },
    [keys],
  );

  return { expandedKeys, expandTreeNode, collapseTreeNode };
}

export function InputTree(props: PropsWithChildren<InputTreeProps>) {
  const {
    testId,
    readonly = false,
    isBatch = false,
    disabled,
    disabledTooltip,
    children,
    allowAppendRootData = true,
    treeProps,
    title = I18n.t('workflow_detail_node_parameter_input'),
    titleTooltip = title,
    className,
    style,
    value,
    onChange,
    topLevelReadonly = false,
    emptyPlaceholder,
    noCard = false,
    addItemTitle = I18n.t('workflow_add_input'),
    defaultCollapse = false,
    formCardDefaultCollapse = false,
    maxLimit,
    columnsRatio = '4:6',
    isNamePureText,
    defaultAppendValue,
    nthCannotDeleted = 0,
    disableDelete,
  } = props;

  // 监听该值的变化
  const cardRef = useRef<HTMLDivElement>(null);
  const isValueEmpty = !value || value.length === 0;
  const {
    data: formattedTreeData = [],
    hasObject,
    itemKeysWithChildren,
  } = formatTreeData(cloneDeep(value) as TreeNodeCustomData[]);
  const isDataEmpty = formattedTreeData.length === 0;
  const { expandedKeys, expandTreeNode, collapseTreeNode } = useExpandedKeys(
    itemKeysWithChildren,
    defaultCollapse,
  );

  const disableAdd = useMemo(() => {
    if (maxLimit === undefined) {
      return false;
    }
    return (value?.length ?? 0) >= maxLimit;
  }, [value, maxLimit]);

  const { concatTestId } = useNodeTestId();

  const onAdd = () => {
    if (onChange) {
      onChange(
        (formattedTreeData || []).concat({
          ...getDefaultAppendValue(formattedTreeData, defaultAppendValue),
          // 增加 field
          field: `[${formattedTreeData.length}]`,
          // 此时不需要指定 type，所以用了 as as 取消类型报错
        } as unknown as TreeNodeCustomData) as InputValueVO[],
      );
    }
  };

  // 该组件的 change 方法
  const onValueChange = (freshValue?: Array<TreeNodeCustomData>) => {
    if (onChange) {
      freshValue = (freshValue || []).concat([]);
      // 清理掉无用字段
      traverse<TreeNodeCustomData>(freshValue, node => {
        const { key, name, input, children } = node;
        // eslint-disable-next-line guard-for-in
        for (const prop in node) {
          delete node[prop];
        }
        node.key = key || nanoid();
        node.name = name;
        node.input = input;

        if (children) {
          node.children = children;
        }
      });
      onChange(freshValue as InputValueVO[]);
    }
  };

  const convertObjectRef = (mode: ChangeMode, data: TreeNodeCustomData) => {
    // 如果是对象, 第一次添加子节点需要转成object ref
    if (mode === ChangeMode.Append) {
      if (
        data.input?.rawMeta?.type === ViewVariableType.Object &&
        data.input?.type !== ValueExpressionType.OBJECT_REF &&
        (data.children || []).length === 0
      ) {
        data.input = {
          type: ValueExpressionType.OBJECT_REF,
          rawMeta: {
            type: ViewVariableType.Object,
          },
        };
      }
    }

    // 删除子节点时，如果清空了所有子节点，则回退到object literal
    if ([ChangeMode.Delete, ChangeMode.DeleteChildren].includes(mode)) {
      if (
        data.input?.rawMeta?.type === ViewVariableType.Object &&
        data.input.type !== ValueExpressionType.REF &&
        (data.children || []).length === 0
      ) {
        data.input = {
          type: ValueExpressionType.LITERAL,
          rawMeta: data.input?.rawMeta,
          content: '{}',
        };
      }
    }

    return data;
  };

  // 树节点的 change 方法
  const onTreeNodeChange = (mode: ChangeMode, param: TreeNodeCustomData) => {
    // 先clone一份，因为Tree内部会对treeData执行isEqual，克隆一份一定是false
    const cloneDeepTreeData = cloneDeep(
      formattedTreeData,
    ) as Array<TreeNodeCustomData>;

    const findResult = findCustomTreeNodeDataResult(
      cloneDeepTreeData,
      param.field as string,
    );

    if (findResult) {
      switch (mode) {
        case ChangeMode.Append: {
          // 新增不可以用 parentData 做标准，要在当前 data 下新增
          const { data } = findResult;
          const currentChildren = data.children || [];

          convertObjectRef(mode, data);
          // @ts-expect-error 有些值不需要此时指定，因为在 rerender 的时候会执行 format
          data.children = currentChildren.concat({
            ...getDefaultAppendValue(currentChildren, defaultAppendValue),
            // 增加 field
            field: `${data.field}.children[${currentChildren.length}]`,
          });

          onValueChange(cloneDeepTreeData);

          // 当前节点下新增节点 展开当前节点
          if (findResult?.data?.key) {
            expandTreeNode(findResult.data.key);
          }

          break;
        }
        case ChangeMode.Update: {
          const targetArray = findResult.isRoot
            ? cloneDeepTreeData
            : findResult.parentData?.children;
          const index = targetArray?.findIndex(item => item.key === param.key);

          if (index !== undefined) {
            targetArray?.splice(index, 1, param);
            onValueChange(cloneDeepTreeData);
          }
          break;
        }
        case ChangeMode.Delete: {
          if (findResult.isRoot) {
            const freshValue = (cloneDeepTreeData || []).filter(
              item => item.key !== param.key,
            );
            onValueChange(freshValue);
          } else {
            const parentData = findResult.parentData as TreeNodeData;
            parentData.children = (parentData.children || []).filter(
              item => item.key !== param.key,
            );
            convertObjectRef(mode, parentData as TreeNodeCustomData);
            onValueChange(cloneDeepTreeData);
          }
          break;
        }
        case ChangeMode.DeleteChildren: {
          const { data } = findResult;
          data.children = [];
          if (!findResult.isRoot) {
            convertObjectRef(mode, data);
          }
          onValueChange(cloneDeepTreeData);
          break;
        }
        default:
      }
    } else {
      Toast.error(I18n.t('workflow_detail_node_output_parsingfailed'));
    }
  };

  if (readonly && isValueEmpty) {
    return null;
  }

  const Card = noCard ? React.Fragment : FormCard;
  const showAddButton =
    !readonly && !topLevelReadonly && allowAppendRootData && !disableAdd;
  const rootLength = formattedTreeData.length;
  return (
    <InputTreeContextProvider value={{ testId }}>
      <div
        className={classNames({
          [styles.container]: true,
          [styles['not-readonly']]: !readonly,
          [className || '']: Boolean(className),
          [styles['could-collapse']]: itemKeysWithChildren.length > 0,
        })}
        style={style}
        ref={cardRef}
      >
        <Card
          autoExpandWhenDomChange
          defaultExpand={!formCardDefaultCollapse}
          showBottomBorder
          header={title}
          tooltip={titleTooltip}
          contentClassName="nowheel"
          noPadding
        >
          {!isDataEmpty && (
            <InputHeader
              readonly={readonly}
              config={{
                hasObject,
                hasCollapse: itemKeysWithChildren.length > 0,
              }}
              columnsRatio={columnsRatio}
            />
          )}
          <Tree
            expandAll={!readonly}
            style={readonly ? {} : { overflow: 'inherit' }}
            motion={false}
            disabled={disabled}
            className={classNames({
              [styles.content]: true,
              [styles.readonly]: readonly,
              [styles['content-fix-pop-container']]: !readonly,
            })}
            renderFullLabel={renderFullLabelProps => {
              const { data } = renderFullLabelProps;

              const onCollapse = (collapsed: boolean) => {
                const { key } = data;

                if (!key) {
                  return;
                }

                if (collapsed) {
                  expandTreeNode(key);
                } else {
                  collapseTreeNode(key);
                }
              };

              const isDeleteDisabled = (() => {
                if (disableDelete) {
                  return true;
                }

                if (nthCannotDeleted === 0) {
                  return false;
                }
                const canDelete: boolean =
                  (data.level === 0
                    ? rootLength
                    : data.parent?.children?.length || 0) <
                  nthCannotDeleted + 1;
                return canDelete;
              })();

              return (
                <InputTreeNode
                  {...renderFullLabelProps}
                  readonly={readonly}
                  onChange={onTreeNodeChange}
                  hasObject={hasObject}
                  disableDelete={isDeleteDisabled}
                  couldCollapse={itemKeysWithChildren.length > 0}
                  collapsed={renderFullLabelProps.expandStatus.expanded}
                  onCollapse={onCollapse}
                  columnsRatio={columnsRatio}
                  isNamePureText={isNamePureText}
                />
              );
            }}
            emptyContent={
              emptyPlaceholder && (
                <p className={styles.emptyPlaceholder}>{emptyPlaceholder}</p>
              )
            }
            expandedKeys={[...expandedKeys, nanoid()]} // 加nanoid是为了防止组件内部memo状态导致不同步，强制重新计算显隐
            treeData={formattedTreeData}
            {...treeProps}
          />
          {showAddButton ? (
            <AddItemButton
              className="absolute right-0 top-0"
              // 解决 Button 位移导致 onClick 不触发问题
              onMouseDown={onAdd}
              disabled={isBatch || disabled}
              disabledTooltip={disabledTooltip}
              testId={concatTestId(testId ?? '', 'add-output-item')}
              style={{
                marginLeft:
                  itemKeysWithChildren.length > 0 ? TreeCollapseWidth : 0,
              }}
              title={addItemTitle}
            />
          ) : null}
          {children}
        </Card>
      </div>
    </InputTreeContextProvider>
  );
}
