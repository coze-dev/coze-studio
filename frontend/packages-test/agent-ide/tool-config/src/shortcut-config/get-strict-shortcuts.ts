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
