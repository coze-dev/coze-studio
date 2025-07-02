import { useCreation } from 'ahooks';
import { type Scene } from '@coze-common/chat-core';
import { exhaustiveCheckForRecord } from '@coze-common/chat-area-utils';

import { createPluginStore } from '../../store/plugins';
import { retrieveAndClearLifecycleExtendedData } from '../../service/extend-data-lifecycle';
import {
  type ExtendDataLifecycle,
  type StoreSet,
} from '../../context/chat-area-context/type';

export const useCreatePluginStoreSet = ({
  extendDataLifecycle = 'disable',
  mark,
  scene,
}: {
  extendDataLifecycle?: ExtendDataLifecycle;
  mark: string;
  scene: Scene;
}): Pick<StoreSet, 'usePluginStore'> => {
  const preStore = useCreation(
    () =>
      extendDataLifecycle === 'full-site'
        ? retrieveAndClearLifecycleExtendedData(scene)
        : null,
    [],
  );
  const usePluginStore = useCreation(
    () => preStore?.usePluginStore || createPluginStore(mark),
    [],
  );

  return {
    usePluginStore,
  };
};

export const clearPluginStoreSet = (
  storeSet: Pick<StoreSet, 'usePluginStore'>,
) => {
  const { usePluginStore, ...rest } = storeSet;
  exhaustiveCheckForRecord(rest);
  usePluginStore.getState().clearPluginStore();
};
