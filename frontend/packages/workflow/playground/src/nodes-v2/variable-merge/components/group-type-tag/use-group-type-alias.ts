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

import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowVariableService } from '@coze-workflow/variable';

import { useVariableService } from '@/hooks';

import { getGroupTypeAlias } from '../../utils/get-group-type-alias';
import { type MergeGroup } from '../../types';

/**
 * Get group type alias
 */
export function useGroupTypeAlias(mergeGroup: MergeGroup) {
  const variableService: WorkflowVariableService = useVariableService();
  const node = useCurrentEntity();

  return getGroupTypeAlias(mergeGroup, variableService, node);
}
