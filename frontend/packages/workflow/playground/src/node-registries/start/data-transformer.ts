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
 * Node Backend Data - > Frontend Form Data
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

    // The key of the trigger parameter should be turned, name - > key + type
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
        // Preview state does not modify required data
        if (!readonly) {
          item.required = false;
        }
      }
      return item;
    }),
  };

  const flags = getFlags();
  // auto_save_history parameters only work in chatflow
  if (isChatflow && flags['bot.automation.message_auto_write']) {
    formValue.inputs = {
      // If the backend has not defined auto_save_history this field, the default is set to true
      auto_save_history: isUndefined(inputs?.auto_save_history)
        ? true
        : Boolean(inputs?.auto_save_history),
    };
  }

  return formValue;
};

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (_value: FormData): NodeDataDTO => {
  const value: NodeDataDTO = _value as any;

  const outputsViewMeta = _value.outputs;
  // The trigger parameters of the start node need to be saved to the schema (VariableMetaDTO), for human review. The front and back ends are not consumed anywhere else
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
          // Multi-file list serialized into json string
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
