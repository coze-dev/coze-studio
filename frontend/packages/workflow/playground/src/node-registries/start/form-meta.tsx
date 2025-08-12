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

import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';
import { TriggerForm } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

import { TriggerService } from '@/services';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createOutputsValidator } from '@/node-registries/common/validators';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { type FormData } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
export const START_FORM_META: FormMetaV2<FormData> = {
  // Node form rendering
  render: () => <FormRender />,

  // verification trigger timing
  validateTrigger: ValidateTrigger.onChange,

  // validation rules
  validate: {
    nodeMeta: nodeMetaValidate,
    // Required
    outputs: createOutputsValidator({
      uniqueName: true,
    }),

    'trigger.dynamicInputs.*': ({ value, formValues, context, name }) => {
      console.log('gjy dynamicInputs', value, name);
      if (formValues?.trigger?.isOpen) {
        const triggerService =
          context.node.getService<TriggerService>(TriggerService);

        const { startNodeFormMeta } =
          triggerService.getTriggerDynamicFormMeta();
        const required = startNodeFormMeta.find(
          d => d.name === name?.replace('trigger.dynamicInputs.', ''),
        )?.required;

        if (required) {
          let isEmpty = false;
          // (Specialized) crontab structure special
          if (name === 'trigger.dynamicInputs.crontab') {
            isEmpty = !value?.content?.content;
          } else {
            isEmpty = !value?.content;
          }
          return isEmpty
            ? I18n.t('workflow_detail_node_error_empty', {}, '参数值不可为空')
            : undefined;
        }
      }
      return undefined;
    },
    'trigger.parameters.*': ({ value, formValues, name }) => {
      if (formValues?.trigger?.isOpen) {
        const inUseKeys = formValues.outputs.map(d =>
          TriggerForm.getVariableName(d),
        );
        if (inUseKeys.includes(name.replace('trigger.parameters.', ''))) {
          return !value?.content
            ? I18n.t('workflow_detail_node_error_empty', {}, '参数值不可为空')
            : undefined;
        }
      }
      return undefined;
    },
  },

  // defaultValues: {
  //   [TriggerForm.TabName]: TriggerForm.Tab.Basic,
  // } as any,

  // Side effect management
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // Node Backend Data - > Frontend Form Data
  formatOnInit: transformOnInit,

  // Front-end form data - > node back-end data
  formatOnSubmit: transformOnSubmit,
};
