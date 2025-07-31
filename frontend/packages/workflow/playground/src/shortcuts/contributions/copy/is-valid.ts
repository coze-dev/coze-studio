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
import { Toast } from '@coze-arch/coze-design';
import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { isAllSystemNodes } from './is-system-nodes';
import { getValidNodes } from './get-valid-nodes';

export const isValid = (nodes: WorkflowNodeEntity[]): boolean => {
  if (isAllSystemNodes(nodes)) {
    Toast.warning({
      content: I18n.t('workflow_multi_choice_copy_failed'),
      showClose: false,
    });
    return false;
  }
  const validNodes = getValidNodes(nodes);
  const nodeCount = validNodes.length;
  if (nodeCount === 0) {
    return false;
  }
  return true;
};
