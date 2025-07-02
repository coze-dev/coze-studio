import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozDocument } from '@coze-arch/coze-design/icons';

import { KnowledgeSourceMenuItem } from '@/components/knowledge-source-menu-item';

import {
  type ImportKnowledgeMenuSourceModule,
  type ImportKnowledgeMenuSourceModuleProps,
} from '../module';

export const TextLocal = (props: ImportKnowledgeMenuSourceModuleProps) => {
  const { onClick } = props;
  return (
    <KnowledgeSourceMenuItem
      title={I18n.t('datasets_createFileModel_step1_LocalTitle')}
      icon={<IconCozDocument className="w-4 h-4" />}
      testId={`${KnowledgeE2e.SegmentDetailDropdownItem}.${UnitType.TEXT_DOC}`}
      value={UnitType.TEXT_DOC}
      onClick={() => onClick(UnitType.TEXT_DOC)}
    />
  );
};

export const TextLocalModule: ImportKnowledgeMenuSourceModule = {
  Component: TextLocal,
};
