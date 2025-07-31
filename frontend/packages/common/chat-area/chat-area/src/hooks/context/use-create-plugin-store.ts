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
