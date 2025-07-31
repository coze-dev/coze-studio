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

import { debounce } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi as knowledgeApi } from '@coze-arch/bot-api';

/**
 * Knowledge Base Global State Management (Singleton)
 */
export class DataSetStore {
  private dataSetInfosMap: { [k: string]: Dataset } = {};
  private queryQueue: string[] = [];
  private listeners: {
    ids: string[];
    callback: (DataSetInfos: Dataset[]) => void;
  }[] = [];

  setDataSetInfosMap = (dataSetInfos: Dataset[]) => {
    dataSetInfos.forEach(d => {
      if (!this.dataSetInfosMap[d.dataset_id as string]) {
        this.dataSetInfosMap[d.dataset_id as string] = d;
      }
    });
  };
  getDataSetInfosByIds = (ids: string[], spaceId): Promise<Dataset[]> =>
    new Promise(resolve => {
      this.getDataSetInfosByIdsCallback(ids, spaceId, dataSetInfos => {
        resolve(dataSetInfos);
      });
    });
  private getDataSetInfosByIdsCallback(
    ids: string[],
    spaceId,
    callback: (dataSetInfos: Dataset[]) => void,
  ): void {
    const existDataInfoIds: string[] = [];
    const needQueryInfoIds: string[] = [];
    ids.forEach(id => {
      if (this.dataSetInfosMap[id]) {
        existDataInfoIds.push(id);
      } else {
        needQueryInfoIds.push(id);
      }
    });

    // If all hits cache, return directly
    if (needQueryInfoIds.length === 0) {
      callback(existDataInfoIds.map(id => this.dataSetInfosMap[id]));
      return;
    }

    // Otherwise, register the queue and call the callback after the query is completed.
    this.listeners.push({
      ids,
      callback,
    });

    // Analyze IDs that require additional queries
    const needAddToQueryQueueIds = needQueryInfoIds.filter(
      id => !this.queryQueue.includes(id),
    );

    // If there are no ids that require additional queries, just wait
    if (needAddToQueryQueueIds.length === 0) {
      return;
    }

    // If there are ids that require additional queries, throw them into the queue to be queried
    this.queryQueue = this.queryQueue.concat(needAddToQueryQueueIds);
    // Invoke query
    this.query(spaceId);
  }

  private query = debounce(async (spaceId: string) => {
    const { dataset_list = [] } = await knowledgeApi.ListDataset({
      space_id: spaceId,
      page: 1,
      size: 99,
      filter: { dataset_ids: this.queryQueue },
    });
    const ids = this.queryQueue;
    this.queryQueue = [];

    const unUseIds: string[] = [];
    ids.forEach(id => {
      if (!dataset_list.find(d => d.dataset_id === id)) {
        unUseIds.push(id);
      }
    });

    this.addDataSetInfo(dataset_list, unUseIds);

    if (unUseIds.length > 0) {
      Toast.error(
        I18n.t(
          'workflow_knowledeg_unexit_error',
          {
            id: unUseIds.join(','),
          },
          '知识库不存在',
        ),
      );
    }
    this.onQueried();
  }, 100);

  onQueried = () => {
    this.listeners.forEach(l => {
      const { ids, callback } = l;

      let isQueryDone = true;
      ids.forEach(id => {
        if (!this.dataSetInfosMap[id]) {
          isQueryDone = false;
        }
      });

      if (isQueryDone) {
        callback(ids.map(id => this.dataSetInfosMap[id]));
        this.listeners = this.listeners.filter(_l => l !== _l);
      }
    });
  };

  addDataSetInfo = (dataSetInfos: Dataset[], unUseIds?: string[]) => {
    dataSetInfos.forEach(d => {
      if (!this.dataSetInfosMap[d.dataset_id as string]) {
        this.dataSetInfosMap[d.dataset_id as string] = d;
      } else {
        // Update cached knowledge base information
        this.dataSetInfosMap[d.dataset_id as string] = {
          ...this.dataSetInfosMap[d.dataset_id as string],
          ...d,
        };
      }
    });

    unUseIds?.forEach(id => {
      if (!this.dataSetInfosMap[id]) {
        this.dataSetInfosMap[id] = {
          dataset_id: id,
          name: I18n.t('workflow_knowledeg_un_exit', {}, '知识库不存在'),
        };
      }
    });
  };

  clearDataSetInfosMap = () => {
    this.dataSetInfosMap = {};
  };
}
