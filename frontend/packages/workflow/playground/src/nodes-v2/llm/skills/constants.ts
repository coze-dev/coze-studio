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

import { I18n } from '@coze-arch/i18n';

export const defaultKnowledgeGlobalSetting = {
  auto: false,
  min_score: 0.5,
  no_recall_reply_customize_prompt: I18n.t('No_recall_006'),
  no_recall_reply_mode: 0,
  search_strategy: 0,
  show_source: false,
  show_source_mode: 0,
  top_k: 3,
  use_rerank: true,
  use_rewrite: true,
  use_nl2_sql: true,
};

export const defaultResponseStyleMode = 0;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TypeMap = new Map([
  [1, 'String'],
  [2, 'Integer'],
  [3, 'Number'],
  [4, 'Object'],
  [5, 'Array'],
  [6, 'Bool'],
]);
