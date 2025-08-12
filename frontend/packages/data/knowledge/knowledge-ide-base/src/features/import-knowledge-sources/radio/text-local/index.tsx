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

import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozDocument } from '@coze-arch/coze-design/icons';

import { KnowledgeSourceRadio } from '@/components/knowledge-source-radio';
import { type ImportKnowledgeRadioSourceModule } from '../module';

export const TextLocal: ImportKnowledgeRadioSourceModule['Component'] = () => (
  <KnowledgeSourceRadio
    title={I18n.t('datasets_createFileModel_step1_LocalTitle')}
    description={I18n.t('datasets_createFileModel_step1_LocalDescription')}
    icon={<IconCozDocument className="w-4 h-4" />}
    e2e={KnowledgeE2e.CreateKnowledgeModalTextLocalRadio}
    key={UnitType.TEXT_DOC}
    value={UnitType.TEXT_DOC}
  />
);

export const TextLocalModule: ImportKnowledgeRadioSourceModule = {
  Component: TextLocal,
};
