import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozDocument } from '@coze/coze-design/icons';

import { KnowledgeSourceMenuItem } from '@/components/knowledge-source-menu-item';

import {
  type ImportKnowledgeMenuSourceModule,
  type ImportKnowledgeMenuSourceModuleProps,
} from '../module';

export const ImageLocal = (props: ImportKnowledgeMenuSourceModuleProps) => {
  const { onClick } = props;
  return (
    <KnowledgeSourceMenuItem
      title={I18n.t('knowledge_photo_002')}
      icon={<IconCozDocument className="w-4 h-4" />}
      testId={`${KnowledgeE2e.SegmentDetailDropdownItem}.${UnitType.IMAGE_FILE}`}
      value={UnitType.IMAGE_FILE}
      onClick={() => onClick(UnitType.IMAGE_FILE)}
    />
  );
};

export const ImageLocalModule: ImportKnowledgeMenuSourceModule = {
  Component: ImageLocal,
};
