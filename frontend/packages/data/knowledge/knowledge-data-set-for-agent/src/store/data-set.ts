import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { type Dataset } from '@coze-arch/idl/knowledge';

interface DatasetStore {
  dataSetList: Dataset[];
  setDataSetList: (dataSetList: Dataset[]) => void;
}

/**
 * 只适用于 bot 单 agent 模式
 */
export const useDatasetStore = create<DatasetStore>()(
  devtools(
    set => ({
      dataSetList: [],

      setDataSetList: (dataSetList: Dataset[]) => {
        set({ dataSetList }, false, 'setDataSetList');
      },
    }),
    {
      name: 'Coze.Agent.Dataset',
      enabled: IS_DEV_MODE,
    },
  ),
);
