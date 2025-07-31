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

import React, { type ReactNode } from 'react';

import { GlobalVariableKey } from '@coze-workflow/variable';
import {
  IconCozFolder,
  IconCozPeople,
  IconCozSetting,
} from '@coze-arch/coze-design/icons';

const GLOBAL_VAR_ICON_MAP: Record<string, ReactNode> = {
  [GlobalVariableKey.App]: <IconCozFolder />,
  [GlobalVariableKey.User]: <IconCozPeople />,
  [GlobalVariableKey.System]: <IconCozSetting />,
};

export default function GlobalVarIcon({ nodeId }: { nodeId: string }) {
  return <>{GLOBAL_VAR_ICON_MAP[nodeId]}</>;
}
