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

interface KnowledgeIDEQuery {
  biz?: 'agentIDE' | 'workflow' | 'library' | 'project';
  bot_id?: string;
  workflow_id?: string;
  agent_id?: string;
  page_mode?: 'modal' | 'normal';
}
export const getKnowledgeIDEQuery = (): KnowledgeIDEQuery => {
  const queryParams = new URLSearchParams(location.search);
  const knowledgeQuery = {
    biz: queryParams.get('biz') as KnowledgeIDEQuery['biz'],
    bot_id: queryParams.get('bot_id'),
    workflow_id: queryParams.get('workflow_id'),
    agent_id: queryParams.get('agent_id'),
    page_mode: queryParams.get('page_mode') as KnowledgeIDEQuery['page_mode'],
  };
  // Filter out null values to avoid generating extra querystrings.
  return Object.fromEntries(Object.entries(knowledgeQuery).filter(e => !!e[1]));
};
