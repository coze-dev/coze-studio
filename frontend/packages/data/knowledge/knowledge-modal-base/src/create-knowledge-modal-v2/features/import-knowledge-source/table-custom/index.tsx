import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozPencilPaper } from '@coze/coze-design/icons';

import { SourceRadio } from '../../../components/source-radio';

export const TableCustom = () => (
  <SourceRadio
    title={I18n.t('datasets_createFileModel_step1_TabCustomTitle')}
    description={I18n.t('datasets_createFileModel_step1_TabCustomDescription')}
    icon={<IconCozPencilPaper className="w-4 h-4" />}
    e2e={KnowledgeE2e.CreateKnowledgeModalTableCustomRadio}
    key={UnitType.TABLE_CUSTOM}
    value={UnitType.TABLE_CUSTOM}
  />
);
