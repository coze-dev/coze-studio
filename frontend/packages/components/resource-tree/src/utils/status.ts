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

import { type DependencyTree } from '@coze-arch/bot-api/workflow_api';

export const isDepEmpty = (data?: DependencyTree) => {
  if (!data) {
    return true;
  }
  if (data.edge_list?.length) {
    return false;
  }
  const rootNode = data.node_list?.[0]?.dependency || {};
  const hasKnowledge = rootNode.knowledge_list?.length;
  const hasPlugins = rootNode.plugin_version?.length;
  const hasTable = rootNode.table_list?.length;
  const hasSubWorkflow = rootNode.workflow_version?.length;
  return !hasKnowledge && !hasPlugins && !hasTable && !hasSubWorkflow;
};
