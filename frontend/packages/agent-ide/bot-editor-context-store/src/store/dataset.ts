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

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { type Dataset } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';

type DatasetsIdMap = Record<string, Dataset>;

export interface DraftBotDataSetStoreState {
  datasetsMap: DatasetsIdMap;
}

export interface DraftBotDataSetStoreAction {
  batchLoad: (datasetIds: string[], spaceId: string) => Promise<void>;
  reset: () => void;
  batchUpdate: (datasets: Dataset[]) => void;
}

const getDefaultState = (): DraftBotDataSetStoreState => ({
  datasetsMap: {},
});

// At present, the dataset in the work_info contains only a small amount of meta information.
// In order to facilitate the determination of the type of dataset introduced (for grouping, model capability checking, etc.), the dataset currently in use is cached here
export const createDraftBotDatasetsStore = () =>
  create<DraftBotDataSetStoreState & DraftBotDataSetStoreAction>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        ...getDefaultState(),
        reset: () => {
          set({
            ...getDefaultState(),
          });
        },
        batchLoad: async (datasetIds, spaceId) => {
          const { datasetsMap } = get();
          const newIds = datasetIds.filter(id => !datasetsMap[id]);
          if (newIds.length) {
            const res = await KnowledgeApi.ListDataset({
              filter: {
                dataset_ids: newIds,
              },
              space_id: spaceId,
            });
            get().batchUpdate(res.dataset_list ?? []);
          }
        },
        batchUpdate: datasets => {
          set({
            datasetsMap: datasets.reduce<DatasetsIdMap>(
              (map, item) => ({
                ...map,
                [item.dataset_id ?? '']: item,
              }),
              {
                ...get().datasetsMap,
              },
            ),
          });
        },
      })),
    ),
  );

export type DraftBotDatasetsStore = ReturnType<
  typeof createDraftBotDatasetsStore
>;
