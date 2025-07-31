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
  InputType,
  type shortcut_command,
  type ToolParams,
} from '@coze-arch/bot-api/playground_api';

import { type ShortcutEditFormValues } from '../../types';

export const initComponentsByToolParams = (
  params: ToolParams[],
): shortcut_command.Components[] =>
  params?.map(param => {
    const { name, desc, refer_component } = param;
    return {
      name,
      parameter: name,
      description: desc,
      input_type: InputType.TextInput,
      default_value: {
        value: '',
      },
      hide: !refer_component,
    };
  });

// Get unused components
export const getUnusedComponents = (
  shortcut: ShortcutEditFormValues,
): shortcut_command.Components[] => {
  const { components_list, template_query } = shortcut;
  return (
    components_list?.filter(
      component => !template_query?.includes(`{{${component.name}}}`),
    ) ?? []
  );
};
