import { I18n } from '@coze-arch/i18n';
import { IconCozPencilPaper } from '@coze/coze-design/icons';
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
