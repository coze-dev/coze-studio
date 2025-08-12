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

// copy from packages/arch/bot-typings/src/teamspace.ts
export interface DynamicParams extends Record<string, string | undefined> {
  space_id?: string;
  bot_id?: string;
  plugin_id?: string;
  workflow_id?: string;
  dataset_id?: string;
  doc_id?: string;
  tool_id?: string;
  invite_key?: string;
  product_id?: string;
  mock_set_id?: string;
  conversation_id: string;
  commit_version?: string;
  /** social scene */
  scene_id?: string;
  post_id?: string;

  project_id?: string;
}
