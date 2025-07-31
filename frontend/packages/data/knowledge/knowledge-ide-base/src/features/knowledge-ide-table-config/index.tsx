/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
