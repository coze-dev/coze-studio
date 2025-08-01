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

import { ImageLocalModule } from '@/features/import-knowledge-sources/radio/image-local';
import {
  createImportKnowledgeSourceRadioFeatureRegistry,
  type ImportKnowledgeRadioSourceFeatureRegistry,
} from '@/features/import-knowledge-sources/radio';

export const importImageKnowledgeSourceRadioGroupContributes: ImportKnowledgeRadioSourceFeatureRegistry =
  (() => {
    const importKnowledgeRadioSourceFeatureRegistry =
      createImportKnowledgeSourceRadioFeatureRegistry(
        'import-knowledge-source-image-radio-group',
      );
    importKnowledgeRadioSourceFeatureRegistry.registerSome([
      {
        type: 'image-local',
        module: ImageLocalModule,
      },
    ]);
    return importKnowledgeRadioSourceFeatureRegistry;
  })();
