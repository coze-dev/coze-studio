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

import { nanoid } from 'nanoid';
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { type AgentFormData } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import {
  AGENT_URL_PATH,
  QUERY_PATH,
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_COUNT,
} from './constants';

export const AGENT_FORM_META: FormMetaV2<AgentFormData> = {
  render: () => <FormRender />, // 节点表单渲染
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    [AGENT_URL_PATH]: ({ value }) => {
      if (!value || !String(value).trim()) {
        return I18n.t('Agent URL 不能为空');
      }
      try {
        new URL(String(value));
      } catch {
        return I18n.t('请输入合法的 URL');
      }
    },
    [QUERY_PATH]: ({ value }) => {
      if (!value || !String(value).trim()) {
        return I18n.t('查询内容不能为空');
      }
    },
  },
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },
  defaultValues: () => ({
    inputs: {
      platform: 'hiagent',
      agent_url: '',
      agent_key: '',
      query: '',
      dynamicInputs: [],
      timeout: DEFAULT_TIMEOUT,
      retry_count: DEFAULT_RETRY_COUNT,
    },
    outputs: [
      {
        key: nanoid(),
        name: 'answer',
        type: ViewVariableType.String,
      },
    ],
  }),
  formatOnInit: transformOnInit,
  formatOnSubmit: transformOnSubmit,
};
