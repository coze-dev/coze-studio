import { useDataNavigate } from '@coze-data/knowledge-stores';
import { OptType } from '@coze-data/knowledge-resource-processor-core';
import { I18n } from '@coze-arch/i18n';
import { UpdateType } from '@coze-arch/bot-api/knowledge';
import { Menu } from '@coze-arch/coze-design';

import {
  type TableConfigMenuModule,
  type TableConfigMenuModuleProps,
} from '../module';

export const ConfigurationTableStructure = (
  props: TableConfigMenuModuleProps,
) => {
  const { documentInfo } = props;
  const resourceNavigate = useDataNavigate();

  if (
    documentInfo.update_type !== undefined &&
    documentInfo.update_type !== UpdateType.NoUpdate
  ) {
    return null;
  }

  const handleClick = () => {
    resourceNavigate.upload?.({
      type: 'table',
      opt: OptType.RESEGMENT,
      doc_id: documentInfo?.document_id ?? '',
    });
  };

  return (
    <Menu.Item onClick={handleClick}>
      {I18n.t('knowledge_segment_config_table')}
    </Menu.Item>
  );
};
export const ConfigurationTableStructureModule: TableConfigMenuModule = {
  Component: ConfigurationTableStructure,
};
