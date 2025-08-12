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

import { useEffect, type FC } from 'react';

import {
  useDataNavigate,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';
import { getKnowledgeIDEQuery } from '@coze-data/knowledge-common-services';
import { KnowledgeE2e } from '@coze-data/e2e';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import {
  CaptionType,
  DocumentSource,
  FormatType,
} from '@coze-arch/bot-api/knowledge';

import { reportProcessDocumentFail } from '@/utils/common';
import { getProcessingDescMsg } from '@/utils';
import { useCreateDocument } from '@/hooks';
import { UnitProgress } from '@/components';

import { ImageAnnotationType } from '../../types';
import { type ImageFileAddStore } from '../../store';

import styles from './index.module.less';

export const ImageProcess: FC<ContentProps<ImageFileAddStore>> = props => {
  const { useStore, footer } = props;

  const resourceNavigate = useDataNavigate();

  const params = useKnowledgeParams();

  const unitList = useStore(state => state.unitList);
  const annotationType = useStore(state => state.annotationType);
  const progressList = useStore(state => state.progressList);
  const createStatus = useStore(state => state.createStatus);

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
    createDocument({
      format_type: FormatType.Image,
      chunk_strategy: {
        caption_type:
          annotationType === ImageAnnotationType.Manual
            ? CaptionType.Manual
            : CaptionType.Auto,
      },
      document_bases: unitList.map(item => ({
        name: item.name,
        source_info: {
          tos_uri: item.uri,
          document_source: DocumentSource.Document,
        },
      })),
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
