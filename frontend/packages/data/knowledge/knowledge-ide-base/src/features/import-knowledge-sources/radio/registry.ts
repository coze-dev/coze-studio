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

import { TextLocalModule } from './text-local';
import { type ImportKnowledgeRadioSourceModule } from './module';

export type ImportKnowledgeRadioSourceFeatureType =
  | 'text-local'
  | 'text-custom'
  | 'table-custom'
  | 'table-local'
  | 'image-local'
  | 'image-custom';

export type ImportKnowledgeRadioSourceFeatureRegistry = FeatureRegistry<
  ImportKnowledgeRadioSourceFeatureType,
  ImportKnowledgeRadioSourceModule
>;

export const createImportKnowledgeSourceRadioFeatureRegistry = (
  name: string,
): ImportKnowledgeRadioSourceFeatureRegistry =>
  new FeatureRegistry<
    ImportKnowledgeRadioSourceFeatureType,
    ImportKnowledgeRadioSourceModule
  >({
    name,
    defaultFeature: {
      type: 'text-local',
      module: TextLocalModule,
    },
  });
