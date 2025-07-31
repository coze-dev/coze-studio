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

export { BaseKnowledgeIDE, type BaseKnowledgeIDEProps } from './scenes/base';
export { useBaseKnowledgeIDEFullScreenModal } from './scenes/base/modal';

export {
  BizAgentKnowledgeIDE,
  BizAgentKnowledgeIDEProps,
} from './scenes/biz-agent-ide';

export {
  BizLibraryKnowledgeIDE,
  type BizLibraryKnowledgeIDEProps,
} from './scenes/biz-library';

export {
  BizProjectKnowledgeIDE,
  type BizProjectKnowledgeIDEProps,
} from './scenes/biz-project';

export {
  BizWorkflowKnowledgeIDE,
  type BizWorkflowKnowledgeIDEProps,
} from './scenes/biz-workflow';
export { useBizWorkflowKnowledgeIDEFullScreenModal } from './scenes/biz-workflow/modal';
