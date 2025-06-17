import { I18n } from '@coze-arch/i18n';
import { IconCozDocument } from '@coze-arch/coze-design/icons';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';

import { KnowledgeSourceRadio } from '@/components/knowledge-source-radio';
import { type ImportKnowledgeRadioSourceModule } from '../module';

export const TableLocal: ImportKnowledgeRadioSourceModule['Component'] = () => (
  <KnowledgeSourceRadio
    title={I18n.t('datasets_createFileModel_step1_TabLocalTitle')}
    description={I18n.t('datasets_createFileModel_step1_TabLocalDescription')}
    icon={<IconCozDocument className="w-4 h-4" />}
    e2e={KnowledgeE2e.CreateKnowledgeModalTableLocalRadio}
    key={UnitType.TABLE_DOC}
    value={UnitType.TABLE_DOC}
  />
);

export const TableLocalModule: ImportKnowledgeRadioSourceModule = {
  Component: TableLocal,
};
