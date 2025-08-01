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
import { useEffect, useMemo, useRef } from 'react';

import { useForm, useRefresh } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowBatchService } from '@coze-workflow/variable';
import { sortErrorBody, useIsSettingOnErrorV2 } from '@coze-workflow/nodes';
import { HistoryService } from '@coze-workflow/history';
import { BatchMode, type ViewVariableTreeNode } from '@coze-workflow/base';
import { useNodeTestId } from '@coze-workflow/base';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { type ValidationProps } from '@/nodes-v2/components/validation/with-validation';
import { type ComponentProps } from '@/nodes-v2/components/types';
import {
  OutputTree,
  type OutputTreeProps,
} from '@/form-extensions/components/output-tree';

import { withValidation } from '../validation';

type OutputTreeValue = Array<ViewVariableTreeNode> | undefined;
type SortValue = (
  value?: ViewVariableTreeNode[] | undefined,
  isBatch?: boolean,
) => ViewVariableTreeNode[] | undefined;
interface OutputTreeOptions {
  id: string;
  batchMode?: BatchMode;
  withDescription?: boolean;
  withRequired?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
  readonly?: boolean;
  topLevelReadonly?: boolean;
  allowDeleteLast?: boolean;
  emptyPlaceholder?: string;
  showResponseFormat?: boolean;
  needErrorBody?: boolean;
  hide?: boolean;
  defaultCollapse?: boolean;
  needAppendChildWhenNodeIsPreset?: boolean;
  noCard?: boolean;
  sortValue?: SortValue; // sorting function
}
type OutputsProps = ComponentProps<OutputTreeValue> &
  OutputTreeOptions &
  Pick<
    OutputTreeProps,
    | 'hiddenTypes'
    | 'addItemTitle'
    | 'withDefaultValue'
    | 'defaultExpandParams'
    | 'columnsRatio'
    | 'maxLimit'
  > &
  ValidationProps;

export const Outputs = withValidation<OutputsProps>((props: OutputsProps) => {
  const {
    name,
    value,
    onChange,
    id,
    disabled = false,
    batchMode,
    withDescription = false,
    withRequired = false,
    readonly = false,
    topLevelReadonly = false,
    allowDeleteLast = false,
    emptyPlaceholder,
    hiddenTypes,
    showResponseFormat = false,
    needErrorBody = false,
    hide = false,
    defaultCollapse,
    needAppendChildWhenNodeIsPreset,
    noCard,
    sortValue,
  } = props || {};

  const form = useForm();

  const workflowReadonly = useReadonly();

  const isBatch = batchMode === BatchMode.Batch;
  const historyService = useService<HistoryService>(HistoryService);
  const refresh = useRefresh();
  const isSettingOnErrorV2 = useIsSettingOnErrorV2();

  // Record current batchMode
  const curBatchMode = useRef<BatchMode>();

  // Changes do not record history
  const onChangeWithoutHistory = (outputTreeValue: OutputTreeValue) => {
    historyService.stop();
    onChange(outputTreeValue);
    historyService.start();
  };

  useEffect(() => {
    /**
     * When initializing, assign curBatchMode, but do not modify the value
     */
    if (!curBatchMode.current) {
      curBatchMode.current = batchMode;
      return;
    }

    /**
     * To switch batch mode, you need to wrap the output of single mode into a list, or remove the list layer from the outputList of batch mode
     */
    if (batchMode !== curBatchMode.current) {
      curBatchMode.current = batchMode;

      if (batchMode === BatchMode.Batch) {
        onChangeWithoutHistory(
          WorkflowBatchService.singleOutputMetasToList(value),
        );
        return;
      }
      if (batchMode === BatchMode.Single) {
        onChangeWithoutHistory(
          WorkflowBatchService.listOutputMetasToSingle(value),
        );
        return;
      }
    }
  }, [batchMode, onChange]);

  const { getNodeSetterId } = useNodeTestId();

  // To sort value, ensure that the errorbody property is at the bottom
  const _value = useMemo(() => {
    const sortedValue = sortValue ? sortValue(value, isBatch) : value;
    if (needErrorBody) {
      return sortErrorBody({
        value: sortedValue as ViewVariableTreeNode[],
        isBatch,
        isSettingOnErrorV2,
      });
    }
    return sortedValue;
  }, [value, needErrorBody, isBatch, isSettingOnErrorV2]);

  if (hide) {
    return null;
  }

  return (
    <OutputTree
      {...props}
      id={id}
      testId={getNodeSetterId(name)}
      responseFormat={{
        visible: showResponseFormat,
        value: form.getValueIn('model.responseFormat'),
        readonly: needErrorBody,
        onChange: v => {
          const model = form.getValueIn('model');
          if (model) {
            form.setValueIn('model', {
              ...model,
              responseFormat: v,
            });
          }
          refresh();
        },
      }}
      readonly={readonly || workflowReadonly}
      disabled={disabled}
      value={_value as any}
      onChange={onChange as any}
      isBatch={isBatch}
      withDescription={withDescription}
      withRequired={withRequired}
      topLevelReadonly={topLevelReadonly}
      allowDeleteLast={allowDeleteLast}
      emptyPlaceholder={emptyPlaceholder}
      hiddenTypes={hiddenTypes}
      defaultCollapse={defaultCollapse}
      needAppendChildWhenNodeIsPreset={needAppendChildWhenNodeIsPreset}
      noCard={noCard}
    />
  );
});
