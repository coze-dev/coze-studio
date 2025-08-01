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

export const WORKFLOW_INNER_SIDE_SHEET_HOLDER =
  'workflow-inner-side-sheet-holder';

export const WORKFLOW_OUTER_SIDE_SHEET_HOLDER =
  'workflow-outer-side-sheet-holder';

export const DND_ACCEPT_KEY = 'flow-workflow-canvas-dnd';

export const WORKFLOW_PLAYGROUND_CONTENT_ID = 'workflow-playground-content';

export const WORKFLOW_CONTENT_ID = 'workflow-content';

export const SYSTEM_PROMPT_PANEL = 'system-prompt-panel';

export enum LayoutPanelKey {
  /** Node Form */
  NodeForm = 'node-form',
  /** Practice running process forms */
  TestFlowForm = 'test-flow-form',
  /** Practice running chatflow */
  TestChatFlowForm = 'test-chat-flow-form',
  /** log list */
  TraceList = 'trace-list',
  /** log details */
  TraceDetail = 'trace-detail',
  /** role configuration */
  RoleConfig = 'role-config',
}

/**
 * dependent source type
 */
export enum DependencySourceType {
  /** database */
  DataBase = 'database',
  /** Knowledge Base */
  DataSet = 'dataset',
  /** Large model */
  LLM = 'llm',
  /** plugin */
  Plugin = 'plugin',
  /** Workflow */
  Workflow = 'workflow',
}
