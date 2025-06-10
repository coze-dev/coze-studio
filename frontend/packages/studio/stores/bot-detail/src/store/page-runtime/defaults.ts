import { type TabDisplayItems, TabStatus } from '@coze-arch/idl/developer_api';

export const DEFAULT_BOT_SKILL_BLOCK_COLLAPSIBLE_STATE =
  (): TabDisplayItems => ({
    plugin_tab_status: TabStatus.Default,
    workflow_tab_status: TabStatus.Default,
    imageflow_tab_status: TabStatus.Default,
    knowledge_tab_status: TabStatus.Default,
    database_tab_status: TabStatus.Default,
    variable_tab_status: TabStatus.Default,
    opening_dialog_tab_status: TabStatus.Default,
    scheduled_task_tab_status: TabStatus.Default,
    suggestion_tab_status: TabStatus.Default,
    tts_tab_status: TabStatus.Default,
    filebox_tab_status: TabStatus.Default,
    background_image_tab_status: TabStatus.Default,
    shortcut_tab_status: TabStatus.Default,
  });
