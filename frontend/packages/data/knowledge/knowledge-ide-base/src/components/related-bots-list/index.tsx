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

import { useEffect } from 'react';

import { useRequest } from 'ahooks';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { Loading } from '@coze-arch/coze-design';

import styles from './index.module.less';
interface RelatedBotsListProps {
  datasetId: string;
  classNameItem?: string;
  style?: Record<string, string>;
}

export const RelatedBotsList = (props: RelatedBotsListProps) => {
  const { datasetId, style, classNameItem } = props;

  const {
    loading,
    data,
    run,
    error: requestError,
  } = useRequest(
    async () => {
      const resq = await KnowledgeApi.GetDatasetRefBots({
        dataset_id: datasetId,
      });
      return resq.ref_bots;
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeGetDatasetRefDetail,
          error,
        });
      },
      manual: true,
    },
  );
  useEffect(() => {
    run();
  }, [datasetId]);
  if (requestError) {
    return <div>{I18n.t('knowledge_optimize_020')}</div>;
  }
  if (loading) {
    return <Loading loading={loading}></Loading>;
  }
  return (
    <div className={styles['related-bots-list']}>
      {data?.map(item => (
        <div
          className={
            classNameItem ? classNameItem : styles['related-bots-list-item']
          }
          style={style}
          key={item.name}
        >
          <div className="related-bots-circle">.</div>

          <div>{item.name}</div>
        </div>
      ))}
    </div>
  );
};
