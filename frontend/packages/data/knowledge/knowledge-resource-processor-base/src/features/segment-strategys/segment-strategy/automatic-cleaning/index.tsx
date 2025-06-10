import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { Radio } from '@coze/coze-design';

import { SegmentMode } from '@/types';

export const AutomaticCleaning = () => (
  <Radio
    data-testid={KnowledgeE2e.CreateUnitResegmentAutoRadio}
    value={SegmentMode.AUTO}
    extra={I18n.t('datasets_createFileModel_step3_autoDescription')}
  >
    {I18n.t('datasets_createFileModel_step3_auto')}
  </Radio>
);
