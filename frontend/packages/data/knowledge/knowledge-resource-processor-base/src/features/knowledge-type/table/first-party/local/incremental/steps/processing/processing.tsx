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

import { useMemo, useEffect } from 'react';

import {
  useDataNavigate,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import {
  type ContentProps,
  FooterBtnStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { DocumentSource } from '@coze-arch/bot-api/knowledge';

import {
  getAddSegmentParams,
  getDocIdFromProgressList,
} from '@/features/knowledge-type/table/utils';
import type {
  UploadTableState,
  UploadTableAction,
} from '@/features/knowledge-type/table/interface';
import { useAddSegment } from '@/features/knowledge-type/table/hooks';
import { UnitProgress } from '@/components';

export const TableProcessing = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  props: ContentProps<T>,
) => {
  const { useStore, footer } = props;
  /** store */
  const unitList = useStore(state => state.unitList);
  const progressList = useStore(state => state.progressList);
  const createStatus = useStore(state => state.createStatus);
  const tableSettings = useStore(state => state.tableSettings);

  /** config */
  const params = useKnowledgeParams();
  const { docID: docIdByQuery, spaceID, datasetID } = params;
  const resourceNavigate = useDataNavigate();
  const docId = useMemo(
    () => getDocIdFromProgressList(progressList),
    [progressList],
  );

  const handleAddSegment = useAddSegment(useStore);
  useEffect(() => {
    if (
      !docIdByQuery ||
      !datasetID ||
      !spaceID ||
      !tableSettings ||
      !unitList
    ) {
      return;
    }
    const payload = getAddSegmentParams({
      spaceId: spaceID,
      docId: docIdByQuery,
      datasetId: datasetID,
      documentInfo: unitList.map(item => ({
        name: '', // item.name,
        source_info: {
          document_source: DocumentSource.Document,
          tos_uri: item.uri,
        },
        table_sheet: {
          sheet_id: tableSettings.sheet_id.toString(),
          header_line_idx: tableSettings.header_line_idx.toString(),
          start_line_idx: tableSettings.start_line_idx.toString(),
        },
      })),
    });
    handleAddSegment(payload);
  }, [tableSettings, unitList]);

  return (
    <>
      <UnitProgress progressList={progressList} createStatus={createStatus} />
      {footer
        ? footer([
            {
              e2e: KnowledgeE2e.CreateUnitConfirmBtn,
              type: 'hgltplus',
              theme: 'solid',
              text: I18n.t('variable_reset_yes'),
              onClick: () => {
                resourceNavigate.toResource?.('knowledge', params.datasetID);
              },
              status: docId ? FooterBtnStatus.ENABLE : FooterBtnStatus.DISABLE,
            },
          ])
        : null}
    </>
  );
};
