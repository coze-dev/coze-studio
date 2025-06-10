import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozDocument } from '@coze/coze-design/icons';

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
