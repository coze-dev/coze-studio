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

import { useWorkflowNode } from '@coze-workflow/base';
import { Tag } from '@coze-arch/bot-semi';

import { PLATFORM_OPTIONS } from '../constants';

export function PlatformStatusDisplay() {
  const node = useWorkflowNode();
  const platformValue = node?.inputs?.platform as
    | (typeof PLATFORM_OPTIONS)[number]['value']
    | undefined;
  const option =
    PLATFORM_OPTIONS.find(item => item.value === platformValue) ??
    PLATFORM_OPTIONS[0];

  return (
    <Tag size="small" color={option.available ? 'green' : 'grey'}>
      {option.label}
    </Tag>
  );
}
