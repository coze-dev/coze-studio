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

import { getKnowledgeIDEQuery } from './get-knowledge-ide-query';

const isKnowledgePathname = (): boolean => {
  const knowledgePagePathReg = new RegExp('/space/[0-9]+/knowledge(/[0-9]+)*');
  return knowledgePagePathReg.test(location.pathname);
};
export const getKnowledgeIsFullModeByBiz = () => {
  if (!isKnowledgePathname()) {
    return false;
  }
  const { biz } = getKnowledgeIDEQuery();
  if (biz === 'agentIDE') {
    return true;
  }
  if (biz === 'workflow') {
    return true;
  }
  return false;
};
