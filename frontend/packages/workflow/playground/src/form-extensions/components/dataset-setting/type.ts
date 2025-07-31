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

export enum Strategy {
  Semantic = 0,
  Hybird = 1,
  FullText = 20,
}

export interface DataSetInfo {
  top_k: number;
  min_score?: number;
  strategy?: Strategy;
  use_nl2sql?: boolean;
  use_rerank?: boolean;
  use_rewrite?: boolean;
  is_personal_only?: boolean;
}
