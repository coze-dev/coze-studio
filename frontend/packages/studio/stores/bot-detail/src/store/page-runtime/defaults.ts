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
