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
  // Can be replaced by disabledTypes
  optionFilter?: (value: string[]) => boolean;
  dropdownClassName?: string;
  showClear?: boolean;
  // Trigger onChange when variable rename occurs
  triggerChangeWhenRename?: boolean;
  renderDisplayVarName?: RenderDisplayVarName;
  customFilterVar?: CustomFilterVar;
  trigger?: ReactNode;
  onPopoverVisibleChange?: (visible: boolean) => void;
  renderExtraOption?: (data?: TreeNodeData[]) => ReactNode;
  handleDataSource?: (data: TreeNodeData[]) => TreeNodeData[];
  // Whether to allow node selection
  enableSelectNode?: boolean;
  popoverStyle?: React.CSSProperties;
}>;

/**
 * A stateless component where value is externally controlled
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

  /** Selectable variable data with default backstop */
  const defaultVariableDataSource = useFormatVariableDataSource({
    disabledTypes,
  });

  const dataSourceWithGlobal = useGlobalVariableCache(
    rawDataSource || defaultVariableDataSource,
  );

  // Process DataSource data, add partial fields/renders
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
         * Disable node selection only
         * When length is 1, node is selected and no variable is selected
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

  /** Get the currently selected subvariable according to the baseline variable and path */
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
      // Change the value reference directly to prevent triggerValidate from onChanging the old keyPath
      value[modifyIndex] = modifyKey;

      if (triggerChangeWhenRename) {
        onChange?.(value);
      }
    }
  });

  // Update value when renaming, uncontrolled components also need to update internal state
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

  // searchPosition = "trigger" and hover tooltip mutual exclusion
  // You need to actively trigger the focus of the input when you click on the selectSelection (tooltip) element
  // So that you can hover to the selectSelection element and trigger the selectSearchInput search
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
