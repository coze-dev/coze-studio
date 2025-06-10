import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozDocument } from '@coze/coze-design/icons';

import { SourceRadio } from '../../../components/source-radio';

export const ImageLocal = () => (
  <SourceRadio
    title={I18n.t('knowledge_photo_002')}
    description={I18n.t('knowledge_photo_003')}
    icon={<IconCozDocument className="w-4 h-4" />}
    e2e={KnowledgeE2e.CreateKnowledgeModalPhotoImgRadio}
    key={UnitType.IMAGE_FILE}
    value={UnitType.IMAGE_FILE}
  />
);
