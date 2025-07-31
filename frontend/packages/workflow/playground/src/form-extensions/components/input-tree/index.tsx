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
  // Whether to allow new root nodes, the default is true
  allowAppendRootData?: boolean;
  // Is it batch processing?
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

  // Is the outermost output folded by default?
  formCardDefaultCollapse?: boolean;
  children?: React.ReactNode;
  maxLimit?: number;
  /**
   * Column widths such as 6:4 represent 6 copies of the name and 4 copies of the type
   */
  columnsRatio?: string;
  /**
   * Name is plain text
   */
  isNamePureText?: boolean;
  /**
   * Default added value
   * @param items
   * @returns
   */
  defaultAppendValue?: (items: TreeNodeCustomData[]) => any;
  /**
   * The first one can be deleted.
   */
  nthCannotDeleted?: number;
  /**
   * Delete not allowed
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

  // Monitor for changes in this value
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
          // Add field
          field: `[${formattedTreeData.length}]`,
          // At this time, there is no need to specify the type, so as as is used to cancel the type and report an error.
        } as unknown as TreeNodeCustomData) as InputValueVO[],
      );
    }
  };

  // How to change this component
  const onValueChange = (freshValue?: Array<TreeNodeCustomData>) => {
    if (onChange) {
      freshValue = (freshValue || []).concat([]);
      // Clean up useless fields
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
    // If it is an object, the first time you add a sub-node, you need to convert it to object ref.
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

    // When deleting a sub-node, fallback to object literal if all sub-nodes are cleared.
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

  // Tree node change method
  const onTreeNodeChange = (mode: ChangeMode, param: TreeNodeCustomData) => {
    // Clone one first, because the Tree will execute isEqual on treeData, cloning one must be false.
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
          // You can't use parentData as a standard for adding, you need to add it under the current data.
          const { data } = findResult;
          const currentChildren = data.children || [];

          convertObjectRef(mode, data);
          // @ts-expect-error Some values do not need to be specified at this time because format is executed during rerender
          data.children = currentChildren.concat({
            ...getDefaultAppendValue(currentChildren, defaultAppendValue),
            // Add field
            field: `${data.field}.children[${currentChildren.length}]`,
          });

          onValueChange(cloneDeepTreeData);

          // Add a new node under the current node and expand the current node
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
            expandedKeys={[...expandedKeys, nanoid()]} // The nanoid is added to prevent the internal memo state of the component from causing out of sync, and force a recalculation of the hidden state
            treeData={formattedTreeData}
            {...treeProps}
          />
          {showAddButton ? (
            <AddItemButton
              className="absolute right-0 top-0"
              // Solve the problem that onClick does not trigger due to Button displacement
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
