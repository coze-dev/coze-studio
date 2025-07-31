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

import { getDocIdFromProgressList } from '@/features/knowledge-type/table/index';
import type {
  UploadTableState,
  UploadTableAction,
} from '@/features/knowledge-type/table/index';
import { UnitProgress } from '@/components';

import { useUpdateDocument } from './hooks';

export const TableProcessing = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  props: ContentProps<T>,
) => {
  const { useStore, footer } = props;

  /** store */
  const progressList = useStore(state => state.progressList);
  const createStatus = useStore(state => state.createStatus);

  /** config */
  const params = useKnowledgeParams();
  const resourceNavigate = useDataNavigate();
  const docId = useMemo(
    () => getDocIdFromProgressList(progressList),
    [progressList],
  );

  const handleUpdateDocument = useUpdateDocument(useStore);
  useEffect(() => {
    handleUpdateDocument();
  }, []);
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
