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

import { DependencyOrigin, NodeType } from '../../typings';

export const colorMap: Record<NodeType, string> = {
  [NodeType.WORKFLOW]: 'linear-gradient(#ebf9f0 0%, var(--coz-bg-plus) 100%)',
  [NodeType.CHAT_FLOW]: 'linear-gradient(#ebf9f0 0%, var(--coz-bg-plus) 100%)',
  [NodeType.PLUGIN]: 'linear-gradient(#fbf2ff 0%, var(--coz-bg-plus) 100%)',
  [NodeType.KNOWLEDGE]: 'linear-gradient(#fff5ed 0%, var(--coz-bg-plus) 100%)',
  [NodeType.DATABASE]: 'linear-gradient(#fef9eb 0%, var(--coz-bg-plus) 100%)',
};

export const contentMap = {
  [NodeType.WORKFLOW]: 'edit_block_api_workflow',
  [NodeType.CHAT_FLOW]: 'wf_chatflow_76',
  [NodeType.PLUGIN]: 'edit_block_api_plugin',
  [NodeType.KNOWLEDGE]: 'datasets_title',
  [NodeType.DATABASE]: 'bot_database',
};

export const getFromText = {
  [DependencyOrigin.APP]: '',
  [DependencyOrigin.LIBRARY]: 'workflow_version_origin_text',
  [DependencyOrigin.SHOP]: 'navigation_store',
};
