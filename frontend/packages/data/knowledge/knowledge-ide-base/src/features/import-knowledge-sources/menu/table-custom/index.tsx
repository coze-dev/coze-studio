import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozPencilPaper } from '@coze/coze-design/icons';

import { KnowledgeSourceMenuItem } from '@/components/knowledge-source-menu-item';

import {
  type ImportKnowledgeMenuSourceModule,
  type ImportKnowledgeMenuSourceModuleProps,
} from '../module';

export const TableCustom = (props: ImportKnowledgeMenuSourceModuleProps) => {
  const { onClick } = props;
  return (
    <KnowledgeSourceMenuItem
      title={I18n.t('datasets_createFileModel_step1_TabCustomTitle')}
      icon={<IconCozPencilPaper className="w-4 h-4" />}
      testId={`${KnowledgeE2e.SegmentDetailDropdownItem}.${UnitType.TABLE_CUSTOM}`}
      value={UnitType.TABLE_CUSTOM}
      onClick={() => onClick(UnitType.TABLE_CUSTOM)}
    />
  );
};

export const TableCustomModule: ImportKnowledgeMenuSourceModule = {
  Component: TableCustom,
};
