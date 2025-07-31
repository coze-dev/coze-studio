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

import { FeatureRegistry } from '@coze-data/feature-register';

import { type ImportKnowledgeMenuSourceModule } from './module';

export type ImportKnowledgeMenuSourceFeatureType =
  | 'text-local'
  | 'text-custom'
  | 'table-custom'
  | 'table-local'
  | 'image-local'
  | 'image-custom';

export type ImportKnowledgeMenuSourceRegistry = FeatureRegistry<
  ImportKnowledgeMenuSourceFeatureType,
  ImportKnowledgeMenuSourceModule
>;

export const createImportKnowledgeMenuSourceFeatureRegistry = (
  name: string,
): ImportKnowledgeMenuSourceRegistry =>
  new FeatureRegistry<
    ImportKnowledgeMenuSourceFeatureType,
    ImportKnowledgeMenuSourceModule
  >({
    name,
  });
