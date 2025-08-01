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
import { IconCozPencilPaper } from '@coze-arch/coze-design/icons';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';

import { type ImportKnowledgeRadioSourceModule } from '../module';
import { KnowledgeSourceRadio } from '@/components/knowledge-source-radio';

export const TextCustom: ImportKnowledgeRadioSourceModule['Component'] = () => (
  <KnowledgeSourceRadio
    title={I18n.t('datasets_createFileModel_step1_CustomTitle')}
    description={I18n.t('datasets_createFileModel_step1_CustomDescription')}
    icon={<IconCozPencilPaper className="w-4 h-4" />}
    e2e={KnowledgeE2e.CreateKnowledgeModalTextCustomRadio}
    key={UnitType.TEXT_CUSTOM}
    value={UnitType.TEXT_CUSTOM}
  />
);

export const TextCustomModule: ImportKnowledgeRadioSourceModule = {
  Component: TextCustom,
};
