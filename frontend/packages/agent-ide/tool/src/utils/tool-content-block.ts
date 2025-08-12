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

import {
  type ToolKey,
  TOOL_KEY_TO_API_STATUS_KEY_MAP,
  type AbilityKey,
  type SkillKeyEnum,
} from '@coze-agent-ide/tool-config';

/**
 * 'Capability module primary key 'to'interface-defined attribute name' function
 * ⚠️ For naming, see @/services/auto-generate/developer_api/namespaces/developer_api > TabDisplayItems
 */
export const toolKeyToApiStatusKeyTransformer = (
  $key: AbilityKey | SkillKeyEnum,
) => {
  const apiStatusKey = TOOL_KEY_TO_API_STATUS_KEY_MAP[$key as ToolKey];
  return apiStatusKey ?? `${$key}_tab_status`;
};
