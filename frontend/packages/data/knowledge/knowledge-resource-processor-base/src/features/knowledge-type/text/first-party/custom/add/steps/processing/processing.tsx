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
import { I18n } from '@coze-arch/i18n';
import {
  DocumentSource,
  FormatType,
  StorageLocation,
} from '@coze-arch/bot-api/knowledge';

import { getProcessingDescMsg } from '@/utils';
import { useCreateDocument } from '@/hooks';
import { getCustomValues } from '@/features/knowledge-type/text/utils';
import { UnitProgress } from '@/components';

import type { UploadTextCustomAddUpdateStore } from '../../store';

import styles from './index.module.less';

export const TextProcessing: FC<
  ContentProps<UploadTextCustomAddUpdateStore>
> = props => {
  const { useStore, footer } = props;

  const resourceNavigate = useDataNavigate();
  const params = useKnowledgeParams();

  const {
    progressList,
    createStatus,
    docName,
    docContent,
    segmentMode,
    segmentRule,
    enableStorageStrategy,
    storageLocation,
    openSearchConfig,
  } = useStore(
    useShallow(state => ({
      progressList: state.progressList,
      createStatus: state.createStatus,
      docName: state.docName,
      docContent: state.docContent,
      segmentMode: state.segmentMode,
      segmentRule: state.segmentRule,
      enableStorageStrategy: state.enableStorageStrategy,
      storageLocation: state.storageLocation,
      openSearchConfig: state.openSearchConfig,
    })),
  );

  const createDocument = useCreateDocument(useStore);

  useEffect(() => {
    createDocument({
      format_type: FormatType.Text,
      document_bases: [
        {
          name: docName,
          source_info: {
            custom_content: docContent,
            document_source: DocumentSource.Custom,
          },
        },
      ],
      // When not added for the first time, no segmentation rules are required
      chunk_strategy: getCustomValues(segmentMode, segmentRule),
      storage_strategy:
        IS_CN_REGION && enableStorageStrategy
          ? {
              storage_location: storageLocation,
              open_search_config:
                storageLocation === StorageLocation.OpenSearch
                  ? openSearchConfig
                  : undefined,
            }
          : undefined,
    });
  }, []);

  return (
    <>
      <UnitProgress progressList={progressList} createStatus={createStatus} />
      {footer?.({
        btns: [
          {
            e2e: KnowledgeE2e.UploadUnitNextBtn,
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
