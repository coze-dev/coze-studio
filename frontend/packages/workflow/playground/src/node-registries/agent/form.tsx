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

import { withNodeConfigForm } from '@/node-registries/common/hocs';

import {
  PLATFORM_PATH,
  QUERY_PATH,
  DYNAMIC_INPUTS_PATH,
  TIMEOUT_PATH,
  RETRY_COUNT_PATH,
} from './constants';
import {
  PlatformSelectorField,
  AgentConfigField,
  QueryInputField,
  DynamicInputsField,
  AdvancedSettingsField,
} from './components';

export const FormRender = withNodeConfigForm(() => (
  <>
    <PlatformSelectorField name={PLATFORM_PATH} />
    <AgentConfigField name="inputs" />
    <QueryInputField name={QUERY_PATH} />
    <DynamicInputsField name={DYNAMIC_INPUTS_PATH} />
    <AdvancedSettingsField
      timeoutPath={TIMEOUT_PATH}
      retryPath={RETRY_COUNT_PATH}
    />
  </>
));
