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
 
import React, {
  type FC,
  useCallback,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';

import { isArray } from 'lodash-es';
import {
  isGlobalVariableKey,
  useVariableRename,
  useWorkflowVariableByKeyPath,
} from '@coze-workflow/variable';
import { type ViewVariableType } from '@coze-workflow/variable';
import { type WithCustomStyle } from '@coze-workflow/base/types';
import { I18n } from '@coze-arch/i18n';
import { usePersistCallback, useUpdateEffect } from '@coze-arch/hooks';
import { type TreeSelectProps } from '@coze-arch/bot-semi/TreeSelect';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { IconCozVariables } from '@coze-arch/coze-design/icons';

import useGlobalVariableCache from '@/form-extensions/components/tree-variable-selector/use-global-variable-cache';
import GlobalVarIcon from '@/form-extensions/components/tree-variable-selector/global-var-icon';

import { NodeIcon } from '../../../components/node-icon';
import {
  formatDataWithGlobalVariable,
  processDataSourceLabelRender,
} from './utils';
import { useFormatVariableDataSource } from './useFormatVariableDataSource';
import {
  type CustomFilterVar,
  type RenderDisplayVarName,
  type VariableTreeDataNode,
} from './types';
import { TreeVariableSelectorContext } from './context';
import { CompositeSelect } from './composite-select';

export type VariableSelectorProps = WithCustomStyle<{
  testId?: string;
  disabled?: boolean;
  disabledTypes?: Array<ViewVariableType>;
  forArrayItem?: boolean;
  value?: string[];
  onChange?: (value: string[] | undefined) => void;
  onBlur?: (e: React.MouseEvent) => void;
  dataSource?: VariableTreeDataNode[];
  validateStatus?: TreeSelectProps['validateStatus'];
  placeholder?: string;
  emptyContent?: TreeSelectProps['emptyContent'];
  invalidContent?: string;
  readonly?: boolean;
  // 可以用 disabledTypes 替代
  optionFilter?: (value: string[]) => boolean;
  dropdownClassName?: string;
  showClear?: boolean;
  // 当发生变量 rename 时候触发 onChange
  triggerChangeWhenRename?: boolean;
  renderDisplayVarName?: RenderDisplayVarName;
  customFilterVar?: CustomFilterVar;
  trigger?: ReactNode;
  onPopoverVisibleChange?: (visible: boolean) => void;
  renderExtraOption?: (data?: TreeNodeData[]) => ReactNode;
  handleDataSource?: (data: TreeNodeData[]) => TreeNodeData[];
  // 是否允许选择节点
  enableSelectNode?: boolean;
  popoverStyle?: React.CSSProperties;
}>;

/**
 * 一个无状态的组件，value 由外部控制
 */
// eslint-disable-next-line complexity
export const VariableSelector: FC<VariableSelectorProps> = props => {
  const {
    dataSource: rawDataSource,
    disabled,
    disabledTypes = [],
    forArrayItem,
    className,
    style = {},
    onChange,
    onBlur,
    value,
    placeholder,
    emptyContent,
    validateStatus,
    invalidContent = I18n.t('workflow_detail_unknown_variable'),
    readonly,
    testId,
    showClear,
    triggerChangeWhenRename,
    renderDisplayVarName,
    customFilterVar,
    trigger,
    onPopoverVisibleChange,
    renderExtraOption,
    enableSelectNode = false,
    popoverStyle,
    handleDataSource,
  } = props;
  const [query, setQuery] = useState('');
  const treeSelectRef = useRef<HTMLDivElement>(null);

  /** 默认兜底的可选择变量数据 */
  const defaultVariableDataSource = useFormatVariableDataSource({
    disabledTypes,
  });

  const dataSourceWithGlobal = useGlobalVariableCache(
    rawDataSource || defaultVariableDataSource,
  );

  // 处理 DataSource 数据，添加部分字段 / 渲染
  const variableDataSource = processDataSourceLabelRender({
    dataSource: dataSourceWithGlobal,
    disabledTypes,
    icon: node =>
      isGlobalVariableKey(node.value) ? (
        <GlobalVarIcon nodeId={node.value} />
      ) : (
        <NodeIcon
          size={16}
          alt="logo"
          nodeId={node.value}
          className="leading-[0px]"
        />
      ),
    renderDisplayVarName,
    customFilterVar,
    enableSelectNode,
  });

  const variableDataSourceWithGroup =
    formatDataWithGlobalVariable(variableDataSource);

  const dataSource = handleDataSource
    ? handleDataSource(variableDataSourceWithGroup)
    : variableDataSourceWithGroup;

  const onValueChange = useCallback(
    (v?: TreeNodeData) => {
      const path: string[] = v?.path;
      if (!Array.isArray(path) || path.length <= 0) {
        return;
      }
      if (!enableSelectNode && path.length === 1) {
        /**
         * 禁止只选择 node
         * length 为 1 时说明值选择了 node 没有选择变量
         */
        return;
      }
      onChange?.(path);
    },
    [enableSelectNode, onChange],
  );

  const handleClear = () => {
    onChange?.(undefined);
  };

  /** 根据基线变量和 path 获取到当前选中的子变量 */
  const workflowVariable = useWorkflowVariableByKeyPath(value);
  const valueSubVariableMeta =
    value && workflowVariable?.viewMeta
      ? {
          ...workflowVariable.viewMeta,
          key: value.join('-'),
        }
      : null;

  const onRename = usePersistCallback(({ modifyIndex, modifyKey }) => {
    if (isArray(value)) {
      // 直接更改 value 引用，防止 triggerValidate 将老的 keyPath onChange 出去
      value[modifyIndex] = modifyKey;

      if (triggerChangeWhenRename) {
        onChange?.(value);
      }
    }
  });

  // 重命名时更新 value，非受控组件也需要更新内部状态
  useVariableRename({
    keyPath: value,
    onRename,
  });

  const isUnknownValue =
    !valueSubVariableMeta ||
    !dataSource?.find(_option => _option.value === value?.[0]);

  const triggerValidate = usePersistCallback(() => {
    if (value) {
      onChange?.(value);
    }
  });

  useUpdateEffect(() => {
    triggerValidate();
  }, [isUnknownValue]);

  // searchPosition="trigger" 和 hover tooltip 互斥
  // 需要在点击到 selectSelection(tooltip) 元素的时候，主动触发 input 的focus
  // 从而实现既可以 hover 到 selectSelection 元素，又可以触发 selectSearchInput 搜索
  useEffect(() => {
    setTimeout(() => {
      const selectSelection = treeSelectRef.current?.getElementsByClassName?.(
        'semi-tree-select-selection-TriggerSearchItem',
      )?.[0];
      const selectSearchInputWrapper =
        treeSelectRef.current?.getElementsByClassName?.(
          'semi-tree-select-triggerSingleSearch-wrapper',
        )?.[0];
      const selectSearchInput =
        selectSearchInputWrapper?.getElementsByTagName('input')?.[0];

      selectSelection?.addEventListener('click', () => {
        selectSearchInput?.focus?.();
      });
    }, 0);
  }, [treeSelectRef, query]);

  const displayVarName =
    renderDisplayVarName?.({
      meta: valueSubVariableMeta,
      path: value,
    }) ||
    valueSubVariableMeta?.label ||
    valueSubVariableMeta?.name;

  return (
    <TreeVariableSelectorContext.Provider
      value={{
        value,
        dataSource,
        query,
        setQuery,
        forArrayItem,
        invalidContent,
        testId,
        valueSubVariableMeta,
        displayVarName,
        isUnknownValue,
      }}
    >
      <div ref={treeSelectRef} className={className} style={style}>
        <CompositeSelect
          renderExtraOption={renderExtraOption}
          treeData={dataSource}
          onChange={onValueChange}
          onBlur={onBlur}
          onSelect={onValueChange}
          value={value ?? undefined}
          invalidContent={invalidContent}
          placeholder={
            placeholder || I18n.t('workflow_detail_condition_pleaseselect')
          }
          emptyContent={
            emptyContent || (
              <div className="text-center">
                <IconCozVariables fontSize={24} />
                <div>{I18n.t('workflow_detail_node_nodata')}</div>
              </div>
            )
          }
          disabled={disabled}
          readonly={readonly}
          validateStatus={validateStatus}
          showClear={showClear}
          onClear={handleClear}
          trigger={trigger}
          onPopoverVisibleChange={onPopoverVisibleChange}
          popoverStyle={popoverStyle}
        />
      </div>
    </TreeVariableSelectorContext.Provider>
  );
};
