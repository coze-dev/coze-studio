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

import { type FC, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import {
  useDataNavigate,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';
import { getKnowledgeIDEQuery } from '@coze-data/knowledge-common-services';
import { KnowledgeE2e } from '@coze-data/e2e';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';

import { getProcessingDescMsg, reportProcessDocumentFail } from '@/utils';
import { useCreateDocument } from '@/hooks';
import { UnitProgress } from '@/components';

import type { UploadTextLocalAddUpdateStore } from '../../store';
import { getCreateDocumentParams } from './utils';

import styles from './index.module.less';

export const TextProcessing: FC<
  ContentProps<UploadTextLocalAddUpdateStore>
> = props => {
  const { useStore, footer } = props;

  const resourceNavigate = useDataNavigate();
  const params = useKnowledgeParams();

  /** store */
  const {
    unitList,
    progressList,
    createStatus,
    segmentMode,
    segmentRule,
    enableStorageStrategy,
    storageLocation,
    openSearchConfig,
    docReviewList,
  } = useStore(
    useShallow(state => ({
      unitList: state.unitList,
      progressList: state.progressList,
      createStatus: state.createStatus,
      segmentMode: state.segmentMode,
      segmentRule: state.segmentRule,
      enableStorageStrategy: state.enableStorageStrategy,
      storageLocation: state.storageLocation,
      openSearchConfig: state.openSearchConfig,
      docReviewList: state.docReviewList,
    })),
  );

  const createDocument = useCreateDocument(useStore, {
    onSuccess: docRes => {
      const documentInfos = docRes.document_infos ?? [];
      reportProcessDocumentFail(
        documentInfos,
        REPORT_EVENTS.KnowledgeProcessDocument,
      );
    },
  });

  useEffect(() => {
    const { parsingStrategy, filterStrategy, levelChunkStrategy } =
      useStore.getState();
    createDocument({
      ...getCreateDocumentParams({
        unitList,
        segmentMode,
        segmentRule,
        pdfFilterValueList: filterStrategy,
        levelChunkStrategy,
        docReviewList,
        enableStorageStrategy,
        storageLocation,
        openSearchConfig,
      }),
      parsing_strategy: parsingStrategy,
    });
  }, []);

  return (
    <>
      <UnitProgress progressList={progressList} createStatus={createStatus} />
      {footer?.({
        btns: [
          {
            e2e: KnowledgeE2e.CreateUnitConfirmBtn,
            type: 'hgltplus',
            theme: 'solid',
            text: I18n.t('variable_reset_yes'),
            onClick: () => {
              const query = getKnowledgeIDEQuery() as Record<string, string>;

              resourceNavigate.toResource?.(
                'knowledge',
                params.datasetID,
                query,
              );
            },
          },
        ],
        prefix: (
          <span className={styles['footer-sub-tip']}>
            {getProcessingDescMsg(createStatus)}
          </span>
        ),
      })}
    </>
  );
};
