import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozDocument } from '@coze/coze-design/icons';

import { SourceRadio } from '../../../components/source-radio';

export const TextLocal = () => (
  <SourceRadio
    title={I18n.t('datasets_createFileModel_step1_LocalTitle')}
    description={I18n.t('datasets_createFileModel_step1_LocalDescription')}
    icon={<IconCozDocument className="w-4 h-4" />}
    e2e={KnowledgeE2e.CreateKnowledgeModalTextLocalRadio}
    key={UnitType.TEXT_DOC}
    value={UnitType.TEXT_DOC}
  />
);
