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

import { type EditorActionModule } from './module';

export type EditorActionFeatureType = 'upload-image';

export type EditorActionRegistry = FeatureRegistry<
  EditorActionFeatureType,
  EditorActionModule
>;

export const createEditorActionFeatureRegistry = (
  name: string,
): EditorActionRegistry =>
  new FeatureRegistry<EditorActionFeatureType, EditorActionModule>({
    name,
  });
