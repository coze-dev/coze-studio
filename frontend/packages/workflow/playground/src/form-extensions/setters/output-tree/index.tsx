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

import {
  type SetterComponentProps,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowBatchService } from '@coze-workflow/variable';
import { sortErrorBody } from '@coze-workflow/nodes';
import { HistoryService } from '@coze-workflow/history';
import {
  BatchMode,
  type ResponseFormat,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';
import { useNodeTestId } from '@coze-workflow/base';

import { withValidation } from '../../components/validation';
import { OutputTree, type OutputTreeProps } from '../../components/output-tree';

type OutputTreeValue = Array<ViewVariableTreeNode> | undefined;
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
  responseFormat?: ResponseFormat;
  needErrorBody?: boolean;
  hide?: boolean;
  defaultCollapse?: boolean;
  needAppendChildWhenNodeIsPreset?: boolean;
  /**
   * 是否可以配置默认值
   */
  withDefaultValue?: boolean;
  /**
   * 默认展开的参数名
   */
  defaultExpandParams?: string[];
  /**
   * 是不是新的异常设置
   */
  isSettingOnErrorV2?: boolean;
}
type OutputTreeSetterProps = SetterComponentProps<
  OutputTreeValue,
  OutputTreeOptions & Pick<OutputTreeProps, 'hiddenTypes' | 'columnsRatio'>
>;

export const OutputWithValidation = withValidation<OutputTreeSetterProps>(
  ({ value, onChange, options, readonly: workflowReadonly, context }) => {
    const {
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
      responseFormat,
      needErrorBody = false,
      hide = false,
      defaultCollapse,
      needAppendChildWhenNodeIsPreset,
      withDefaultValue = false,
      isSettingOnErrorV2,
      ...props
    } = options || {};

    const isBatch = batchMode === BatchMode.Batch;
    const historyService = useService<HistoryService>(HistoryService);

    // 记录当前batchMode
    const curBatchMode = useRef<BatchMode>();

    // 变更不记录历史
    const onChangeWithoutHistory = (outputTreeValue: OutputTreeValue) => {
      historyService.stop();
      onChange(outputTreeValue);
      historyService.start();
    };

    useEffect(() => {
      /**
       * 初始化时，赋值curBatchMode，但无需对值做修改
       */
      if (!curBatchMode.current) {
        curBatchMode.current = batchMode;
        return;
      }

      /**
       * 切换batch mode 需要将 single mode 的output 包成list, 或将 batch mode 的outputList 去掉list这层
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

    // 要对 value 排序，保证 errorbody 这个属性在最下面
    const _value = useMemo(() => {
      if (needErrorBody) {
        return sortErrorBody({
          value: value as ViewVariableTreeNode[],
          isBatch,
          isSettingOnErrorV2,
        });
      }
      return value;
    }, [value, needErrorBody, isBatch, isSettingOnErrorV2]);

    if (hide) {
      return null;
    }

    return (
      <OutputTree
        {...props}
        id={id}
        testId={getNodeSetterId(context.path)}
        responseFormat={{
          visible: showResponseFormat,
          value: responseFormat,
          readonly: needErrorBody,
          onChange: v => {
            const item = context.form.getFormItemByPath('/model');
            if (item?.value) {
              item.value = {
                ...item.value,
                responseFormat: v,
              };
            }
          },
        }}
        readonly={readonly || workflowReadonly}
        disabled={disabled}
        value={_value as any}
        onChange={onChange as any}
        isBatch={isBatch}
        withDescription={withDescription}
        withDefaultValue={withDefaultValue}
        withRequired={withRequired}
        topLevelReadonly={topLevelReadonly}
        allowDeleteLast={allowDeleteLast}
        emptyPlaceholder={emptyPlaceholder}
        hiddenTypes={hiddenTypes}
        defaultCollapse={defaultCollapse}
        needAppendChildWhenNodeIsPreset={needAppendChildWhenNodeIsPreset}
      />
    );
  },
);

export const output: SetterExtension = {
  key: 'OutputTree',
  component: OutputWithValidation as any,
};
