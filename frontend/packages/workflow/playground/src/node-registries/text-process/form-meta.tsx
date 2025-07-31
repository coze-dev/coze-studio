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

import { I18n } from '@coze-arch/i18n';
import {
  ValidateTrigger,
  type FormMetaV2,
  DataEvent,
} from '@flowgram-adapter/free-layout-editor';

import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';

import { createValueExpressionInputValidate } from '../common/validators';
import Render from './form';
import { handleMethodChangeEffect } from './effects/handle-method-change-effect';
import { formatOnInit, formatOnSubmit } from './data-transformer';
import { StringMethod } from './constants';

export const FORM_META: FormMetaV2<FormData> = {
  render: () => <Render />,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    nodeMeta: nodeMetaValidate,
    // check input
    'inputParameters.*.input': createValueExpressionInputValidate({
      required: true,
    }),
    // Verify splicing content
    concatResult: ({ value, formValues }) => {
      // Only the splicing mode verifies the splicing content.
      if (formValues?.method === StringMethod.Split) {
        return undefined;
      }

      return !value?.length
        ? I18n.t('workflow_testset_required_tip', {
            param_name: I18n.t('Content'),
          })
        : undefined;
    },

    // check separator
    delimiter: ({ value: setterValue, formValues }) => {
      // Only split mode checks delimiters
      if (formValues?.method === StringMethod.Concat) {
        return undefined;
      }

      if (!setterValue?.value || setterValue?.value.length === 0) {
        return I18n.t('workflow_testset_required_tip', {
          param_name: I18n.t('workflow_stringprocess_delimiter_title'),
        });
      }
      return undefined;
    },
  },
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,

    // Listen for character handling method changes
    method: [
      {
        effect: handleMethodChangeEffect,
        event: DataEvent.onValueChange,
      },
    ],
  },
  formatOnInit,
  formatOnSubmit,
};
