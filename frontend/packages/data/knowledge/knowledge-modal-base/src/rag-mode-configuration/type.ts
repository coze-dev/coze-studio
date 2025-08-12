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

import {
  type KnowledgeShowSourceMode,
  type KnowledgeNoRecallReplyMode,
  type RecallStrategy,
} from '@coze-arch/bot-api/playground_api';
export interface IDataSetInfo {
  min_score: number;
  top_k: number;
  auto: boolean;
  search_strategy?: number;
  show_source?: boolean;
  no_recall_reply_mode?: KnowledgeNoRecallReplyMode;
  no_recall_reply_customize_prompt?: string;
  show_source_mode?: KnowledgeShowSourceMode;
  recall_strategy?: RecallStrategy;
}
export interface RagModeConfigurationProps {
  dataSetInfo: IDataSetInfo;
  onDataSetInfoChange: (v: IDataSetInfo) => void;
  showTitle?: boolean;
  isReadonly?: boolean;
  showNL2SQLConfig?: boolean;
  showAuto?: boolean;
  showSourceDisplay?: boolean;
}
