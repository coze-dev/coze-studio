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

import {
  useDataNavigate,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';
import { getKnowledgeIDEQuery } from '@coze-data/knowledge-common-services/use-case';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';

import { getProcessingDescMsg } from '@/utils';
import { UnitProgress } from '@/components';

import type { UploadTextResegmentStore } from '../../store';
import { useResegment } from './hooks';

import styles from './index.module.less';

export const TextProcessing: FC<
  ContentProps<UploadTextResegmentStore>
> = props => {
  const { useStore, footer } = props;

  const resourceNavigate = useDataNavigate();

  /** store */
  const progressList = useStore(state => state.progressList);
  const createStatus = useStore(state => state.createStatus);

  /** config */
  const params = useKnowledgeParams();

  const handleResegment = useResegment(useStore);

  useEffect(() => {
    handleResegment();
  }, []);
  return (
    <>
      <UnitProgress progressList={progressList} createStatus={createStatus} />
      {footer?.({
        btns: [
          {
            e2e: KnowledgeE2e.ResegmentUnitConfirmBtn,
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
