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
  // 是否允许新增根节点，默认为 true
  allowAppendRootData?: boolean;
  // 是否允许删除最后一条数据
  allowDeleteLast?: boolean;
  // 是否是批处理
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
  /** 不支持使用的类型 */
  disabledTypes?: ViewVariableType[];
  /** 隐藏类型 */
  hiddenTypes?: ViewVariableType[];
  topLevelReadonly?: boolean;
  emptyPlaceholder?: string;
  responseFormat?: {
    visible?: boolean;
    value?: number;
    readonly?: boolean;
    onChange?: (value?: number) => void;
  };
  /** 默认变量类型 */
  defaultVariableType?: ViewVariableType;
  jsonImport?: boolean;
  noCard?: boolean;
  addItemTitle?: string;
  defaultCollapse?: boolean;

  // 最外层输出是否默认折叠
  formCardDefaultCollapse?: boolean;
  children?: React.ReactNode;
  /**  在某一个node preset 时依旧可以添加child */
  needAppendChildWhenNodeIsPreset?: boolean;
  maxLimit?: number;
  /**
   * 是否可以配置默认值，默认为 false
   */
  withDefaultValue?: boolean;
  /**
   * 默认展开的参数名
   */
  defaultExpandParams?: string[];
  /**
   * 列宽比 如 6:4 代表名称占6份，类型占4份
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

  // 监听该值的变化
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
   * 表示当前哪一行的父亲节点的 description 处于多行状态(LLM节点)
   * 用于渲染树形竖线，处于多行文本的下一行竖线应该延长
   * 若 param name 有错误信息，竖线从错误信息下方延展，长度有所变化
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
          // 增加 field
          field: `[${formattedTreeData.length}]`,
          // 此时不需要指定 type，所以用了 as as 取消类型报错
        } as unknown as TreeNodeCustomData),
      );
    }
  };

  // 该组件的 change 方法
  const onValueChange = (freshValue?: Array<TreeNodeCustomData>) => {
    if (onChange) {
      freshValue = (freshValue || []).concat([]);
      // 清理掉无用字段
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
          node.required = required || false; // undefined 转为 false
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
          // @ts-expect-error 有些值不需要此时指定，因为在 rerender 的时候会执行 format
          data.children = currentChildren.concat({
            ...getDefaultAppendValue(false, defaultVariableType),
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

    // 如果切到文本模式
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
        // 如果本身有值，就取第一个，预期：复用变量名/描述
        if (_value?.[0]) {
          newValue = [_value[0]];
        }
        if (_value?.[0].children?.[0]) {
          const [first, ...rest] = _value[0].children;
          newValue[0].children = [first, ...rest.filter(c => c?.readonly)];
        }
        // 仅修改类型到 string
        if (
          newValue?.[0].children?.[0].type &&
          newValue?.[0].children?.[0].type !== ViewVariableType.String
        ) {
          newValue[0].children[0].type = ViewVariableType.String;

          // 移除 children
          if (newValue[0].children[0].children) {
            delete newValue[0].children[0].children;
          }
        }
      } else {
        // 如果本身有值，就取第一个，预期：复用变量名/描述
        if (_value?.[0]) {
          const [first, ...rest] = _value;
          newValue = [first, ...rest.filter(c => c?.readonly)];
        }
        // 仅修改类型到 string
        if (newValue[0].type !== ViewVariableType.String) {
          newValue[0].type = ViewVariableType.String;

          // 移除 children
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
              // 把 errorbody 刨除
              const isOnlyOneData = value.filter(v => !v.readonly).length <= 1;

              const currentLevelDisabled =
                Boolean(isTopLevel && (isBatch || topLevelReadonly)) ||
                disabled;

              const disableDelete = (() => {
                // 禁用时，不允许删除
                if (currentLevelDisabled) {
                  return true;
                }
                // 如果只有一条非只读数据
                if (isOnlyOneData) {
                  if (isTopLevel && !allowDeleteLast) {
                    // 并且是顶层数据，同时不允许删除最后一条数据，不可删除
                    return true;
                  }
                  // @tips hack逻辑，批处理改成单次处理时，会删除最外层的结构，必须保证children不是空数据才可以
                  // 此时只有一条数据，并且是批处理模式，并且当前是第二层数据，并且第二层非只读数据也只有一项
                  // 此时也不可以删除
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
