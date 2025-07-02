import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozPencilPaper } from '@coze-arch/coze-design/icons';

import { SourceRadio } from '../../../components/source-radio';

export const TextCustom = () => (
  <SourceRadio
    title={I18n.t('datasets_createFileModel_step1_CustomTitle')}
    description={I18n.t('datasets_createFileModel_step1_CustomDescription')}
    icon={<IconCozPencilPaper className="w-4 h-4" />}
    e2e={KnowledgeE2e.CreateKnowledgeModalTextCustomRadio}
    key={UnitType.TEXT_CUSTOM}
    value={UnitType.TEXT_CUSTOM}
  />
);
