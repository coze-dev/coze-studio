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

import { type FormMetaV2 } from '@flowgram-adapter/free-layout-editor';

import { createFormMeta } from '../create-form-meta';
import FormRender from './form-render';
import {
  DEFAULT_CONVERSATION_VALUE,
  DEFAULT_OUTPUTS,
  FIELD_CONFIG,
} from './constants';

export const FORM_META: FormMetaV2 = createFormMeta({
  fieldConfig: FIELD_CONFIG,
  needSyncConversationName: false,
  defaultInputValue: DEFAULT_CONVERSATION_VALUE,
  defaultOutputValue: DEFAULT_OUTPUTS,
  formRenderComponent: FormRender,
});
