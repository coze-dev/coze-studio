import type {
  SendType,
  ShortcutCommand as ShortcutCommandFromService,
  ToolType,
  ShortcutStruct as ShortcutStructFromService,
} from '@coze-arch/bot-api/playground_api';

export type ShortCutStruct = Pick<
  ShortcutStructFromService,
  'shortcut_sort'
> & {
  shortcut_list?: ShortCutCommand[];
};

export type ShortCutCommand =
  | TemplateShortCutForWorkFlow
  | TemplateShortCutForPlugin
  | QueryShortCut;

type BaseShortCutInfo = Pick<
  ShortcutCommandFromService,
  'command_name' | 'template_query' | 'description' | 'send_type'
> & {
  command_id: string;
  object_id: string;
  bot_info: {
    icon_url?: string;
    name?: string;
  };
};

type WorkflowTool = Pick<
  ShortcutCommandFromService,
  'tool_type' | 'work_flow_id'
> & {
  tool_type: ToolType.ToolTypeWorkFlow;
  work_flow_id: string;
};

type PluginTool = Pick<
  ShortcutCommandFromService,
  'tool_type' | 'plugin_id' | 'plugin_api_name'
> & {
  tool_type: ToolType.ToolTypePlugin;
  plugin_id: string;
  plugin_api_name: string;
  plugin_api_id: string;
};

export type TemplateShortCutForWorkFlow = BaseShortCutInfo &
  Omit<
    ShortcutCommandFromService,
    'send_type' | 'tool_type' | 'work_flow_id' | 'components_list'
  > & {
    send_type: SendType.SendTypePanel;
  } & {
    components_list: ShortcutCommandFromService['components_list'];
  } & WorkflowTool;

export type TemplateShortCutForPlugin = BaseShortCutInfo &
  Omit<
    ShortcutCommandFromService,
    'send_type' | 'tool_type' | 'plugin_id' | 'plugin_api_name'
  > & {
    send_type: SendType.SendTypePanel;
  } & {
    components_list: ShortcutCommandFromService['components_list'];
  } & PluginTool;

export type QueryShortCut = BaseShortCutInfo &
  Omit<ShortcutCommandFromService, 'send_type'> & {
    send_type: SendType.SendTypeQuery;
  };
