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

/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { nanoid } from 'nanoid';
import cloneDeep from 'lodash-es/cloneDeep';
import classNames from 'classnames';
import { useLatest } from 'ahooks';
import { WorkflowBatchService } from '@coze-workflow/variable';
import {
  ResponseFormat,
  ViewVariableType,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { type TreeNodeData, type TreeProps } from '@coze-arch/bot-semi/Tree';
import { Toast, Tree } from '@coze-arch/coze-design';

import { FormCard } from '../form-card';
import { AddItemButton } from '../add-item-button';
import {
  findCustomTreeNodeDataResult,
  formatTreeData,
  traverse,
} from './utils';
import { OutputTreeContextProvider } from './context';
import { TreeCollapseWidth } from './constants';
import { ResponseFormatSelect } from './components/response-format';
import { JSONImport, JSONImportPlaceholder } from './components/json-import';
import Header from './components/header';
import {
  type ActiveMultiInfo,
  type TreeNodeCustomData,
} from './components/custom-tree-node/type';
import { ChangeMode } from './components/custom-tree-node/constants';
import CustomTreeNode from './components/custom-tree-node';

import styles from './index.module.less';

export interface SimpleTreeNodeCustomData {
  key: string;
}

export interface OutputTreeProps {
  id: string;
  testId?: string;
  // Whether to allow new root nodes, the default is true
  allowAppendRootData?: boolean;
  // Is it allowed to delete the last piece of data?
  allowDeleteLast?: boolean;
  // Is it batch processing?
  isBatch?: boolean;
  treeProps?: TreeProps;
  readonly?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
  /** @default I18n.t('workflow_detail_node_output') */
  title?: string;
  /** @default title */
  titleTooltip?: string;
  className?: string;
  style?: React.CSSProperties;
  value: Array<TreeNodeCustomData>;
  onChange: (value: Array<TreeNodeCustomData>) => void;
  withDescription: boolean;
  withRequired: boolean;
  /** Types not supported */
  disabledTypes?: ViewVariableType[];
  /** hidden type */
  hiddenTypes?: ViewVariableType[];
  topLevelReadonly?: boolean;
  emptyPlaceholder?: string;
  responseFormat?: {
    visible?: boolean;
    value?: number;
    readonly?: boolean;
    onChange?: (value?: number) => void;
  };
  /** Default variable type */
  defaultVariableType?: ViewVariableType;
  jsonImport?: boolean;
  noCard?: boolean;
  addItemTitle?: string;
  defaultCollapse?: boolean;

  // Is the outermost output folded by default?
  formCardDefaultCollapse?: boolean;
  children?: React.ReactNode;
  /**  You can still add children to a node preset */
  needAppendChildWhenNodeIsPreset?: boolean;
  maxLimit?: number;
  /**
   * Can the default value be configured, the default is false
   */
  withDefaultValue?: boolean;
  /**
   * Default expanded parameter name
   */
  defaultExpandParams?: string[];
  /**
   * Column widths such as 6:4 represent 6 copies of the name and 4 copies of the type
   */
  columnsRatio?: string;
}

const getDefaultAppendValue = (
  withRequired = false,
  defaultVariableType = ViewVariableType.String,
) => {
  const defaultValue: {
    fieldRandomKey: string;
    type: ViewVariableType;
    required?: boolean;
  } = {
    fieldRandomKey: nanoid(),
    type: defaultVariableType,
  };
  if (withRequired) {
    defaultValue.required = true;
  }
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

export function OutputTree(props: PropsWithChildren<OutputTreeProps>) {
  const {
    id,
    testId,
    readonly = false,
    isBatch = false,
    disabled,
    disabledTooltip,
    children,
    allowAppendRootData = true,
    allowDeleteLast = false,
    treeProps,
    title = I18n.t('workflow_detail_node_output'),
    titleTooltip = title,
    className,
    style,
    value,
    onChange,
    withDescription = false,
    withRequired = false,
    disabledTypes = [],
    hiddenTypes,
    topLevelReadonly = false,
    emptyPlaceholder,
    responseFormat = {},
    defaultVariableType = ViewVariableType.String,
    jsonImport = true,
    noCard = false,
    addItemTitle = I18n.t('workflow_add_output'),
    defaultCollapse = false,
    formCardDefaultCollapse = false,
    needAppendChildWhenNodeIsPreset = true,
    maxLimit,
    withDefaultValue,
    defaultExpandParams = [],
    columnsRatio,
  } = props;

  // Monitor for changes in this value
  const cardRef = useRef<HTMLDivElement>(null);
  const isValueEmpty = !value || value.length === 0;
  const {
    data: formattedTreeData = [],
    hasObjectLike,
    itemKeysWithChildren,
  } = formatTreeData(cloneDeep(value), id);
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

  /**
   * The description of the parent node of which row is currently in a multi-row state (LLM node)
   * For rendering tree vertical lines, the next vertical line in multiple lines of text should be extended
   * If the param name has an error message, the vertical bar extends below the error message and the length changes
   */
  const [activeMultiInfo, setActiveMultiInfo] = useState<ActiveMultiInfo>({
    activeMultiKey: '',
  });

  const { concatTestId } = useNodeTestId();

  const onAdd = () => {
    if (onChange) {
      onChange(
        (formattedTreeData || []).concat({
          ...getDefaultAppendValue(withRequired, defaultVariableType),
          // Add field
          field: `[${formattedTreeData.length}]`,
          // At this time, there is no need to specify the type, so as as is used to cancel the type and report an error.
        } as unknown as TreeNodeCustomData),
      );
    }
  };

  // How to change this component
  const onValueChange = (freshValue?: Array<TreeNodeCustomData>) => {
    if (onChange) {
      freshValue = (freshValue || []).concat([]);
      // Clean up useless fields
      traverse<TreeNodeCustomData>(freshValue, node => {
        const {
          key,
          name,
          type,
          description,
          required,
          // eslint-disable-next-line @typescript-eslint/no-shadow
          children,
          isPreset,
          enabled,
          readonly: _readonly,
          defaultValue,
        } = node;
        // eslint-disable-next-line guard-for-in
        for (const prop in node) {
          delete node[prop];
        }
        node.key = key || nanoid();
        node.name = name;
        node.type = type;
        node.description = description;
        if (defaultValue !== null) {
          node.defaultValue = defaultValue;
        }
        if (isPreset) {
          node.isPreset = isPreset;
          node.enabled = enabled || false;
        }

        if (withRequired) {
          node.required = required || false; // Undefined to false
        }

        if (children) {
          node.children = children;
        }

        if (_readonly) {
          node.readonly = _readonly;
        }
      });
      onChange(freshValue);
    }
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
          // @ts-expect-error Some values do not need to be specified at this time because format is executed during rerender
          data.children = currentChildren.concat({
            ...getDefaultAppendValue(false, defaultVariableType),
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
            onValueChange(cloneDeepTreeData);
          }
          break;
        }
        case ChangeMode.DeleteChildren: {
          const { data } = findResult;
          data.children = [];
          onValueChange(cloneDeepTreeData);
          break;
        }
        default:
      }
    } else {
      Toast.error(I18n.t('workflow_detail_node_output_parsingfailed'));
    }
  };

  const onJSONImportChange = (freshValue?: Array<TreeNodeCustomData>) => {
    const nextValue: Array<TreeNodeCustomData> = [];
    value
      .filter(item => item.isPreset)
      .forEach(item => {
        const matched = (freshValue || []).find(it => it.name === item.name);
        if (matched) {
          nextValue.push({
            ...item,
            enabled: true,
          });
        } else {
          nextValue.push(item);
        }
      });

    (freshValue || []).forEach(item => {
      const matched = value.find(it => it.isPreset && it.name === item.name);
      if (!matched) {
        nextValue.push(item);
      }
    });

    onChange(
      maxLimit === undefined ? nextValue : nextValue?.slice(0, maxLimit),
    );
  };

  const onlyString = useMemo(
    () =>
      ([ResponseFormat.Text, ResponseFormat.Markdown] as number[]).includes(
        responseFormat?.value ?? ResponseFormat.JSON,
      ),
    [responseFormat.value],
  );

  const latestValue = useLatest(value);
  const responseFormatValue = useRef(-1);
  useEffect(() => {
    const isUserChangeType =
      responseFormatValue.current !== -1 &&
      responseFormatValue.current !== responseFormat.value;

    if (responseFormat.value !== undefined) {
      responseFormatValue.current = responseFormat.value;
    }

    // If you switch to text mode
    if (onlyString && isUserChangeType) {
      let newValue = [
        {
          key: nanoid(),
          name: 'output',
          type: ViewVariableType.String,
        },
      ] as TreeNodeCustomData[];

      const _value = latestValue.current;
      if (isBatch) {
        newValue = WorkflowBatchService.singleOutputMetasToList(
          newValue as ViewVariableTreeNode[],
        ) as TreeNodeCustomData[];
        // If there is a value in itself, take the first one, expect: reuse variable name/description
        if (_value?.[0]) {
          newValue = [_value[0]];
        }
        if (_value?.[0].children?.[0]) {
          const [first, ...rest] = _value[0].children;
          newValue[0].children = [first, ...rest.filter(c => c?.readonly)];
        }
        // Modify type to string only
        if (
          newValue?.[0].children?.[0].type &&
          newValue?.[0].children?.[0].type !== ViewVariableType.String
        ) {
          newValue[0].children[0].type = ViewVariableType.String;

          // Remove children
          if (newValue[0].children[0].children) {
            delete newValue[0].children[0].children;
          }
        }
      } else {
        // If there is a value in itself, take the first one, expect: reuse variable name/description
        if (_value?.[0]) {
          const [first, ...rest] = _value;
          newValue = [first, ...rest.filter(c => c?.readonly)];
        }
        // Modify type to string only
        if (newValue[0].type !== ViewVariableType.String) {
          newValue[0].type = ViewVariableType.String;

          // Remove children
          if (newValue[0].children) {
            delete newValue[0].children;
          }
        }
      }
      onChange(newValue);
    }
  }, [responseFormat.value]);

  if (readonly && isValueEmpty) {
    return null;
  }

  const Card = noCard ? React.Fragment : FormCard;
  const showAddButton =
    !readonly &&
    !topLevelReadonly &&
    allowAppendRootData &&
    !onlyString &&
    !disableAdd;
  return (
    <OutputTreeContextProvider value={{ testId }}>
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
          testId={testId}
          actionButton={
            <div className="flex gap-[4px] items-center">
              {responseFormat.visible ? (
                <ResponseFormatSelect
                  testId={concatTestId(testId ?? '', 'json-format')}
                  readonly={readonly || responseFormat.readonly}
                  value={responseFormat.value}
                  outputValue={value}
                  onlyString={onlyString}
                  onChange={onChange}
                  onResponseFormatChange={responseFormat.onChange}
                  isBatch={isBatch}
                />
              ) : undefined}
              {!readonly &&
              !topLevelReadonly &&
              allowAppendRootData &&
              !onlyString ? (
                <>
                  <JSONImportPlaceholder
                    enable={jsonImport}
                    hideAddButton={isBatch || !!disabled}
                  />
                </>
              ) : null}
            </div>
          }
        >
          {!isDataEmpty && (
            <Header
              readonly={readonly}
              config={{
                hasObjectLike,
                hasCollapse: itemKeysWithChildren.length > 0,
                hasDescription: withDescription,
                hasRequired: withRequired,
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
              const { level, data } = renderFullLabelProps;
              const isTopLevel = level === 0;
              const isSecondLevel = level === 1;
              // Planting the errorbody
              const isOnlyOneData = value.filter(v => !v.readonly).length <= 1;

              const currentLevelDisabled =
                Boolean(isTopLevel && (isBatch || topLevelReadonly)) ||
                disabled;

              const disableDelete = (() => {
                // When disabled, deletion is not allowed
                if (currentLevelDisabled) {
                  return true;
                }
                // If there is only one non-read-only data
                if (isOnlyOneData) {
                  if (isTopLevel && !allowDeleteLast) {
                    // And it is the top-level data, and the last piece of data is not allowed to be deleted. It cannot be deleted.
                    return true;
                  }
                  // @Tips hack logic. When batch processing is changed to single processing, the outermost structure will be deleted. You must ensure that children are not empty data.
                  // At this time, there is only one piece of data, and it is in batch mode, and it is currently the second layer of data, and there is only one piece of second-layer non-read-only data.
                  // It cannot be deleted at this time.
                  if (
                    isBatch &&
                    isSecondLevel &&
                    (value.at(0)?.children || []).filter(v => !v.readonly)
                      .length <= 1
                  ) {
                    return true;
                  }
                }
                return false;
              })();

              const onCollapse = (collapsed: boolean) => {
                const { key } = renderFullLabelProps.data;

                if (!key) {
                  return;
                }

                if (collapsed) {
                  expandTreeNode(key);
                } else {
                  collapseTreeNode(key);
                }
              };

              return (
                <CustomTreeNode
                  {...renderFullLabelProps}
                  readonly={data.readonly || readonly}
                  typeReadonly={onlyString}
                  needRenderAppendChild={
                    data.isPreset
                      ? !onlyString && needAppendChildWhenNodeIsPreset
                      : !onlyString
                  }
                  onChange={onTreeNodeChange}
                  hasObjectLike={hasObjectLike}
                  onActiveMultiInfoChange={setActiveMultiInfo}
                  activeMultiInfo={activeMultiInfo}
                  withDescription={withDescription}
                  withRequired={withRequired}
                  withDefaultValue={withDefaultValue}
                  disabledTypes={disabledTypes}
                  hiddenTypes={hiddenTypes}
                  disableDelete={disableDelete}
                  disabled={currentLevelDisabled}
                  couldCollapse={itemKeysWithChildren.length > 0}
                  collapsed={renderFullLabelProps.expandStatus.expanded}
                  onCollapse={onCollapse}
                  defaultExpand={defaultExpandParams?.includes(data.name)}
                  columnsRatio={columnsRatio}
                  readonlyTooltip={data.readonlyTooltip}
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
        {disableAdd ? null : (
          <JSONImport
            startField={id}
            testId={concatTestId(testId ?? '', 'json-import-btn')}
            onChange={onJSONImportChange}
            treeData={formattedTreeData}
            disabledTypes={disabledTypes}
            disabledTooltip={disabledTooltip}
            hideAddButton={isBatch || !!disabled}
            rules={{
              jsonImport,
              readonly,
              topLevelReadonly,
              disabled: Boolean(disabled),
              isBatch,
              withRequired,
              onlyString,
            }}
          />
        )}
      </div>
    </OutputTreeContextProvider>
  );
}
