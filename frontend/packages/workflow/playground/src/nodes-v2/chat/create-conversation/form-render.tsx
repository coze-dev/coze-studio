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

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';

import { createFormRender } from '../create-form-render';
import {
  FIELD_CONFIG,
  DEFAULT_CONVERSATION_VALUE,
  DEFAULT_OUTPUTS,
} from './constants';

const Render = () => {
  const readonly = useReadonly();

  return createFormRender({
    defaultInputValue: DEFAULT_CONVERSATION_VALUE,
    defaultOutputValue: DEFAULT_OUTPUTS,
    fieldConfig: FIELD_CONFIG,
    readonly,
    inputTooltip: I18n.t('wf_chatflow_13'),
    outputTooltip: I18n.t('wf_chatflow_15'),
  });
};

export default Render;
