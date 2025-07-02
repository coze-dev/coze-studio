import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';

import {
  type WriteableLifeCycleServiceCollection,
  type ReadonlyLifeCycleServiceCollection,
} from '../plugin/types/plugin-class/life-cycle';
import {
  type ReadonlyChatAreaPlugin,
  type WriteableChatAreaPlugin,
} from '../plugin/plugin-class/plugin';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 满足 System 需要额外增加
 */
export interface WriteableLifeCycleServicesAddition<T = any, K = any> {
  lifeCycleServices?:
    | WriteableLifeCycleServiceCollection<T, K>
    | ReadonlyLifeCycleServiceCollection<T, K>;
}

export interface ReadonlyLifeCycleServicesAddition<T = any, K = any> {
  lifeCycleServices?: ReadonlyLifeCycleServiceCollection<T, K>;
}

export interface PluginState {
  pluginInstanceList: (
    | (ReadonlyChatAreaPlugin<any, any> & WriteableLifeCycleServicesAddition)
    | (WriteableChatAreaPlugin<any, any> & ReadonlyLifeCycleServicesAddition)
  )[];
  serviceOffSubscriptionList: (() => void)[];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface PluginAction {
  setPluginInstanceList: (
    pluginInstanceList: (
      | ReadonlyChatAreaPlugin<object>
      | WriteableChatAreaPlugin<object>
    )[],
  ) => void;
  updateServiceOffSubscriptionListByImmer: (
    updater: (serviceOffSubscriptionList: (() => void)[]) => void,
  ) => void;
  appendServiceOffSubscriptionList: (offSubscription: () => void) => void;
  offAllSubscription: () => void;
  clearPluginStore: () => void;
}

export const createPluginStore = (mark: string) => {
  const usePluginStore = create<PluginState & PluginAction>()(
    devtools(
      (set, get) => ({
        pluginInstanceList: [],
        serviceOffSubscriptionList: [],
        setPluginInstanceList: pluginInstanceList => {
          set(
            {
              pluginInstanceList,
            },
            false,
            'setPluginInstanceList',
          );
        },
        updateServiceOffSubscriptionListByImmer: updater => {
          set(
            produce<PluginState>(state =>
              updater(state.serviceOffSubscriptionList),
            ),
            false,
            'updateServiceOffSubscriptionListByImmer',
          );
        },
        appendServiceOffSubscriptionList: offSubscription => {
          const { serviceOffSubscriptionList } = get();
          set(
            {
              serviceOffSubscriptionList: [
                ...serviceOffSubscriptionList,
                offSubscription,
              ],
            },
            false,
            'appendServiceOffSubscriptionList',
          );
        },
        offAllSubscription: () => {
          const { serviceOffSubscriptionList } = get();
          serviceOffSubscriptionList.forEach(off => off());
        },
        clearPluginStore: () => {
          set(
            {
              pluginInstanceList: [],
              serviceOffSubscriptionList: [],
            },
            false,
            'clearPluginStore',
          );
        },
      }),
      {
        name: `botStudio.ChatAreaPluginStore.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

  return usePluginStore;
};

export type PluginStore = ReturnType<typeof createPluginStore>;
