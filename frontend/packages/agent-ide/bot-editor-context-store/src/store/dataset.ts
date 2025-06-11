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

// 目前 work_info 里的 dataset 只包含了很少量的元信息，
// 为了方便判断引入的 dataset 类型（用于分组、模型能力检查等等），这里统一缓存当下使用的 dataset
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
