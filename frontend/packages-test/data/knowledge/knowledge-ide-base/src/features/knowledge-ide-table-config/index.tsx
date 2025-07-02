import { useMemo } from 'react';

import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { UnitType } from '@coze-data/knowledge-resource-processor-core';
import { FormatType } from '@coze-arch/bot-api/knowledge';

import { getUnitType } from '@/utils';

import { TableLocalTableConfigButton } from './table-local';
import { TableCustomTableConfigButton } from './table-custom';
import { type TableConfigButtonProps } from './base';
export const KnowledgeIDETableConfig = (props: TableConfigButtonProps) => {
  const documentInfo = useKnowledgeStore(state => state.documentList?.[0]);
  const unitType = useMemo(() => {
    if (documentInfo) {
      return getUnitType({
        format_type: FormatType.Table,
        source_type: documentInfo?.source_type,
      });
    }
    return UnitType.TABLE_API;
  }, [documentInfo]);
  if (unitType === UnitType.TABLE_CUSTOM) {
    return <TableCustomTableConfigButton {...props} />;
  }
  if (unitType === UnitType.TABLE_DOC) {
    return <TableLocalTableConfigButton {...props} />;
  }
  return null;
};
