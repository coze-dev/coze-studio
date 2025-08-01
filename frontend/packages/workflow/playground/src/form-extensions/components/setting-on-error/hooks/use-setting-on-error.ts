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

/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
import { useState } from 'react';

import { useDebounceEffect } from 'ahooks';
import {
  useForm,
  isFormV2,
  useCurrentEntity,
} from '@flowgram-adapter/free-layout-editor';
import {
  getExcludeErrorBody,
  getOutputsWithErrorBody,
  useIsSettingOnErrorV2,
} from '@coze-workflow/nodes';
import { BatchMode, ResponseFormat } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { outputsVerify } from '../utils/';
import { type SettingOnErrorValue, type SettingOnErrorProps } from '../types';
import { useRefreshOnVariableChange } from './use-refresh-on-variable-change';
import { useJSONWithOutputs } from './use-json-with-outputs';
import { useBatchChange } from './use-batch-change';

type Props = Pick<
  SettingOnErrorProps,
  'value' | 'onChange' | 'batchModePath' | 'outputsPath' | 'context' | 'options'
>;

export function useSettingOnError({
  value,
  onChange,
  batchModePath,
  outputsPath,
  context,
  options,
}: Props) {
  const { settingOnErrorIsOpen, settingOnErrorJSON } = value || {};
  const isSettingOnErrorV2 = useIsSettingOnErrorV2();

  const form = useForm();
  const node = useCurrentEntity();
  const formV2 = isFormV2(node);

  useRefreshOnVariableChange(node);

  let batchMode: BatchMode | undefined;

  if (formV2) {
    batchMode = batchModePath ? form.getValueIn(batchModePath) : undefined;
  } else {
    batchMode = options?.batchMode;
  }

  let outputs;
  if (formV2) {
    outputs = outputsPath ? form.getValueIn(outputsPath) : undefined;
  } else {
    outputs = options?.outputs;
  }

  const isBatch = batchMode === BatchMode.Batch;
  useBatchChange({
    value,
    onChange,
    isBatch,
    isSettingOnErrorV2,
  });

  /**
   * Why add anti-shake?
   * Because the changes of isBatch outputs are not synchronized, you will get results that do not meet expectations.
   * */
  const [args, setArgs] = useState({
    isOpen: settingOnErrorIsOpen,
    json: settingOnErrorJSON,
    isBatch,
    outputs: getExcludeErrorBody({
      value: outputs,
      isBatch,
      isSettingOnErrorV2,
    }),
  });

  useDebounceEffect(
    () => {
      setArgs({
        isOpen: settingOnErrorIsOpen,
        json: settingOnErrorJSON,
        isBatch,
        outputs: getExcludeErrorBody({
          value: outputs,
          isBatch,
          isSettingOnErrorV2,
        }),
      });
    },
    [settingOnErrorIsOpen, settingOnErrorJSON, isBatch, outputs],
    {
      wait: 100,
    },
  );

  const { value: json, defaultValue: defaultJSON } = useJSONWithOutputs({
    ...args,
    /**
     * Why pass onJSONChange?
     * 1. output structure changes need to actively modify json
     * 2. Turn on the switch for the first time and automatically generate json according to the output structure
     * */
    onJSONChange: v => {
      onChange({
        ...value,
        settingOnErrorJSON: v as string,
      });
    },
  });

  const syncOutputs = (isOpen: boolean) => {
    // If the ignore exception is turned on, the errorBody must be appended to the output; otherwise, it must be rejected
    if (formV2) {
      const outputsValue = form.getValueIn('outputs');
      if (outputs) {
        form.setValueIn(
          'outputs',
          getOutputsWithErrorBody({
            value: outputsValue,
            isBatch,
            isOpen,
            isSettingOnErrorV2,
          }),
        );
      }
    } else {
      const outputItem = context?.form.getFormItemByPath('/outputs');
      if (outputItem?.value) {
        outputItem.value = getOutputsWithErrorBody({
          value: outputItem?.value,
          isBatch,
          isOpen,
          isSettingOnErrorV2,
        });
      }
    }

    // If the ignore exception is turned on, change the output type of the model to json (for the llm node, other nodes cannot get the modelItem).
    if (formV2) {
      const modelValue = form.getValueIn('model');
      if (
        isOpen &&
        modelValue &&
        modelValue?.responseFormat !== ResponseFormat.JSON
      ) {
        form.setValueIn('model', {
          ...modelValue,
          responseFormat: ResponseFormat.JSON,
        });
      }
    } else {
      const modelItem = context?.form.getFormItemByPath('/model');
      if (
        isOpen &&
        modelItem?.value &&
        modelItem?.value?.responseFormat !== ResponseFormat.JSON
      ) {
        modelItem.value = {
          ...modelItem?.value,
          responseFormat: ResponseFormat.JSON,
        };
      }
    }
  };

  const settingOnError = {
    isOpen: settingOnErrorIsOpen,
    defaultValue: defaultJSON,
    json,
    onSwitchChange: isOpen => {
      const newValue: SettingOnErrorValue = {
        ...value,
        settingOnErrorIsOpen: isOpen,
      };

      onChange(newValue);
      syncOutputs(isOpen);
    },
    onJSONChange: v => {
      onChange({
        ...value,
        settingOnErrorJSON: v ?? '',
      });
    },
    errorMsg: outputsVerify(outputs)
      ? undefined
      : I18n.t('workflow_exception_json_error'),
    value,
    onChange,
    outputs,
    isSettingOnErrorV2,
    isBatch,
    syncOutputs,
  };
  return settingOnError;
}
