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
  type ShortcutCommand as ShortcutCommandFromService,
  ToolType,
} from '@coze-arch/bot-api/playground_api';

import type { ShortCutCommand } from './type';

export function getStrictShortcuts(shortcuts?: ShortcutCommandFromService[]) {
  return shortcuts?.filter((shortcut): shortcut is ShortCutCommand => {
    const { tool_type } = shortcut;
    const withoutCommandId = !shortcut.command_id;
    // const panelWithoutCardSchema =
    //   send_type === SendType.SendTypePanel && !shortcut.card_schema;
    const workflowWithoutWorkflowId =
      tool_type === ToolType.ToolTypeWorkFlow && !shortcut.plugin_id;
    const pluginWithoutPluginId =
      tool_type === ToolType.ToolTypePlugin && !shortcut.plugin_id;

    return !(
      withoutCommandId ||
      // panelWithoutCardSchema ||
      workflowWithoutWorkflowId ||
      pluginWithoutPluginId
    );
  });
}
