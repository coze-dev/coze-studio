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

import {
  createContext,
  type PropsWithChildren,
  type FC,
  useRef,
  useContext,
} from 'react';

import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { useCreation } from 'ahooks';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { CustomError } from '@coze-arch/bot-error';

import { type BotPluginStateAction } from './types/store/plugin';
import { type BotPluginStore } from './types/store';
import {
  createPluginHistoryPanelUIStore,
  type PluginHistoryPanelUIStore,
} from './store/plugin-history-panel-ui';
import { createPluginStore } from './store/plugin';

interface StoreRef {
  plugin?: BotPluginStore;
}

export interface PluginNavType {
  toResource?: (
    res: string,
    resID?: string,
    query?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ) => void;
  // submodule
  tool?: (
    toolID: string,
    query?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ) => void;
  mocksetList?: (
    toolID: string,
    query?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ) => void;
  mocksetDetail?: (
    toolID: string,
    mocksetID: string,
    query?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ) => void;
  cloudIDE?: (
    query?: Record<string, string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Record<string, any>,
  ) => void;
}

export interface CallbacksType {
  onUpdateDisplayName?: (displayName: string) => void;
  onStatusChange?: (status: WidgetUIState) => void;
}

const BotPluginStoreContext = createContext<{
  storeRef: StoreRef;
  callbacks: CallbacksType;
  resourceNavigate: PluginNavType;
  memorizedStoreSet: null | {
    usePluginHistoryPanelUIStore: PluginHistoryPanelUIStore;
  };
}>({
  storeRef: {
    plugin: undefined,
  },
  callbacks: {},
  resourceNavigate: {},
  memorizedStoreSet: null,
});

interface PluginHistoryControllerType {
  reload: () => void;
}

const BotPluginControllerContext = createContext<{
  pluginHistoryController: { current: PluginHistoryControllerType | null };
  registryPluginHistoryController: (
    controller: PluginHistoryControllerType,
  ) => void;
}>({
  pluginHistoryController: { current: null },
  registryPluginHistoryController: () => 0,
});

export type WidgetUIState = 'loading' | 'saving' | 'error' | 'normal';

export const BotPluginStoreProvider: FC<
  PropsWithChildren<{
    pluginID: string;
    spaceID: string;
    projectID?: string;
    version?: string;

    onUpdateDisplayName?: (displayName: string) => void;
    onStatusChange?: (status: WidgetUIState) => void;
    resourceNavigate: PluginNavType;
  }>
> = ({
  pluginID,
  spaceID,
  projectID,
  version,
  children,
  onUpdateDisplayName,
  onStatusChange,
  resourceNavigate,
}) => {
  const store = useRef<StoreRef>({});
  const usePluginHistoryPanelUIStore = useCreation(
    () => createPluginHistoryPanelUIStore(),
    [],
  );
  const pluginHistoryControllerRef = useRef<PluginHistoryControllerType | null>(
    null,
  );

  if (!store.current?.plugin) {
    store.current.plugin = createPluginStore({
      pluginID,
      spaceID,
      projectID,
      version,
    });
  }

  return (
    <BotPluginStoreContext.Provider
      value={{
        storeRef: store.current,
        memorizedStoreSet: { usePluginHistoryPanelUIStore },
        callbacks: {
          onUpdateDisplayName,
          onStatusChange,
        },
        resourceNavigate,
      }}
    >
      <BotPluginControllerContext.Provider
        value={{
          pluginHistoryController: pluginHistoryControllerRef,
          registryPluginHistoryController: inputController => {
            pluginHistoryControllerRef.current = inputController;
          },
        }}
      >
        {children}
      </BotPluginControllerContext.Provider>
    </BotPluginStoreContext.Provider>
  );
};

export const usePluginStore: <T>(
  selector: (store: BotPluginStateAction) => T,
) => T = selector => {
  const ctx = useContext(BotPluginStoreContext);

  if (!ctx.storeRef.plugin) {
    throw new CustomError(REPORT_EVENTS.normalError, 'plugin store context');
  }

  return useStoreWithEqualityFn(ctx.storeRef.plugin, selector, shallow);
};

export const usePluginStoreInstance = () => {
  const ctx = useContext(BotPluginStoreContext);

  if (!ctx.storeRef.plugin) {
    throw new CustomError(REPORT_EVENTS.normalError, 'plugin store context');
  }
  return ctx.storeRef.plugin;
};

export const usePluginCallbacks: () => CallbacksType = () => {
  const {
    callbacks: { onStatusChange, onUpdateDisplayName },
  } = useContext(BotPluginStoreContext);

  return { onStatusChange, onUpdateDisplayName };
};

export const usePluginNavigate: () => PluginNavType = () => {
  const { resourceNavigate } = useContext(BotPluginStoreContext);

  return resourceNavigate;
};

export const useMemorizedPluginStoreSet = () => {
  const { memorizedStoreSet } = useContext(BotPluginStoreContext);
  if (!memorizedStoreSet) {
    throw new Error('plugin memorized store set not provided');
  }
  return memorizedStoreSet;
};

export const usePluginHistoryController = () => {
  const { pluginHistoryController } = useContext(BotPluginControllerContext);
  return pluginHistoryController;
};

export const usePluginHistoryControllerRegistry = () => {
  const { registryPluginHistoryController } = useContext(
    BotPluginControllerContext,
  );
  return registryPluginHistoryController;
};
