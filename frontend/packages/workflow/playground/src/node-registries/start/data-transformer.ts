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

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { omit, isUndefined } from 'lodash-es';
import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import {
  isPresetStartParams,
  type OutputValueVO,
  type LiteralExpression,
  type VariableMetaDTO,
} from '@coze-workflow/base';
import { getFlags } from '@coze-arch/bot-flags';

import { TriggerService } from '@/services';

import { TriggerForm } from '../trigger-upsert/types';
import { type FormData, type NodeDataDTO } from './types';

/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = (
  value: NodeDataDTO,
  context: NodeFormContext,
): FormData & { trigger?: unknown } => {
  const { playgroundContext } = context;
  const { isChatflow, readonly, projectId } = playgroundContext.globalState;
  const { outputs, inputs } = value || {};

  let trigger;

  // will support soon
  if (projectId && !IS_OPEN_SOURCE) {
    const triggerService =
      context.node.getService<TriggerService>(TriggerService);

    // trigger 参数的 key 要转一下，name -> key + type
    const { parameters, dynamicInputs, ...rest } =
      triggerService.getStartNodeFormValues();

    const _parameters: Record<string, unknown> = {};
    Object.keys(parameters as Record<string, unknown>).forEach(key => {
      const d = outputs?.find(item =>
        [
          item.name,
          TriggerForm.getVariableName(d as unknown as OutputValueVO),
        ].includes(key),
      );
      if (!d) {
        return;
      }
      _parameters[TriggerForm.getVariableName(d as unknown as OutputValueVO)] =
        (parameters as Record<string, unknown>)[key];
    });

    const { startNodeFormMeta, startNodeDefaultFormValue } =
      triggerService.getTriggerDynamicFormMeta();
    const _dynamicInputs: Record<string, unknown> = {};
    startNodeFormMeta.forEach(item => {
      _dynamicInputs[item.name] =
        dynamicInputs?.[item.name] ?? startNodeDefaultFormValue?.[item.name];
    });
    trigger = {
      ...rest,
      dynamicInputs: _dynamicInputs,
      parameters: _parameters,
    };
  }

  const formValue = {
    ...(value ?? {}),
    trigger,
    outputs: ((outputs as unknown as FormData['outputs']) || []).map(item => {
      if (isPresetStartParams(item.name)) {
        item.isPreset = isChatflow;
        item.enabled = true;
        // 预览态不修改 required 必填数据
        if (!readonly) {
          item.required = false;
        }
      }
      return item;
    }),
  };

  const flags = getFlags();
  // auto_save_history 参数只在 chatflow 中生效
  if (isChatflow && flags['bot.automation.message_auto_write']) {
    formValue.inputs = {
      // 如果后端没有定义过 auto_save_history 这个字段，默认设置成 true
      auto_save_history: isUndefined(inputs?.auto_save_history)
        ? true
        : Boolean(inputs?.auto_save_history),
    };
  }

  return formValue;
};

/**
 * 前端表单数据 -> 节点后端数据
 * @param value
 * @returns
 */
export const transformOnSubmit = (_value: FormData): NodeDataDTO => {
  const value: NodeDataDTO = _value as any;

  const outputsViewMeta = _value.outputs;
  // start 节点的 trigger 的 parameters 需要保存到 schema中(VariableMetaDTO), ，给人审用。其他地方前后端均不消费
  value.trigger_parameters = outputsViewMeta
    ?.map<VariableMetaDTO | undefined>(viewMeta => {
      const dtoMeta = variableUtils.viewMetaToDTOMeta(viewMeta);
      const v = (
        value as {
          trigger?: {
            parameters?: {
              [k: string]: LiteralExpression;
            };
          };
        }
      )?.trigger?.parameters?.[TriggerForm.getVariableName(viewMeta)];

      if (!isUndefined(v)) {
        let literalContent = (v as LiteralExpression)?.content;
        if (
          typeof literalContent !== 'string' &&
          typeof literalContent !== undefined
        ) {
          // 多文件列表序列化成 json 字符串
          literalContent = JSON.stringify(literalContent);
        }
        return {
          ...dtoMeta,
          defaultValue: literalContent,
        };
      }
      return;
    })
    ?.filter((item): item is VariableMetaDTO => Boolean(item));

  const { outputs } = value;
  return {
    ...omit(value, 'trigger'),
    outputs: (outputs || []).map(item =>
      omit(item, ['isPreset', 'enabled']),
    ) as VariableMetaDTO[],
  };
};
