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

import { get } from 'lodash-es';
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Tag } from '@coze-arch/bot-semi';

const extractQuery = (query: unknown) => {
  if (typeof query === 'string') {
    return query;
  }
  if (query && typeof query === 'object') {
    const directContent = get(query, 'content');
    if (typeof directContent === 'string') {
      return directContent;
    }
    const nestedValue = get(query, 'value');
    if (nestedValue) {
      return extractQuery(nestedValue);
    }
    const literalContent = get(query, 'value.content');
    if (typeof literalContent === 'string') {
      return literalContent;
    }
  }
  return '';
};

export function AgentStatusIndicator() {
  return null;
}
