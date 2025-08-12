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
  TableLocalModule,
  TableCustomModule,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/menu';
import {
  createImportKnowledgeMenuSourceFeatureRegistry,
  type ImportKnowledgeMenuSourceRegistry,
} from '@coze-data/knowledge-ide-base/features/import-knowledge-sources/menu';

export const importKnowledgeSourceMenuContributes: ImportKnowledgeMenuSourceRegistry =
  (() => {
    const importKnowledgeMenuSourceFeatureRegistry =
      createImportKnowledgeMenuSourceFeatureRegistry(
        'import-knowledge-source-table-menu',
      );
    importKnowledgeMenuSourceFeatureRegistry.registerSome([
      {
        type: 'table-local',
        module: TableLocalModule,
      },
      {
        type: 'table-custom',
        module: TableCustomModule,
      },
    ]);
    return importKnowledgeMenuSourceFeatureRegistry;
  })();
