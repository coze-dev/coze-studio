import { nanoid } from 'nanoid';
import mitt from 'mitt';
import { type PluginRegistryEntry } from '@coze-common/chat-area';

import {
  type EventCenter,
  type GrabPluginBizContext,
  type PublicEventCenter,
  type EventCallbacks,
} from './types/plugin-biz-context';
import { createSelectionStore } from './stores/selection';
import { createQuoteStore, subscribeQuoteUpdate } from './stores/quote';
import { createPreferenceStore } from './stores/preference';
import { ChatAreaGrabPlugin } from './plugin';

interface Preference {
  enableGrab: boolean;
}

export type Scene = 'store' | 'other';

type CreateGrabPluginParams = {
  preference: Preference;
  scene?: Scene;
} & EventCallbacks;

export const publicEventCenter = mitt<PublicEventCenter>();

export const createGrabPlugin = (params: CreateGrabPluginParams) => {
  const { preference, onQuote, onQuoteChange, scene } = params;

  const grabPluginId = nanoid();

  const grabPlugin: PluginRegistryEntry<GrabPluginBizContext> = {
    createPluginBizContext: () => {
      const eventCallbacks = {
        onQuote,
        onQuoteChange,
      };

      const storeSet = {
        useSelectionStore: createSelectionStore('plugin'),
        useQuoteStore: createQuoteStore('plugin'),
        usePreferenceStore: createPreferenceStore('plugin'),
      };

      const eventCenter = mitt<EventCenter>();

      // 默认注入preference
      storeSet.usePreferenceStore
        .getState()
        .updateEnableGrab(preference.enableGrab);

      const unsubscribeQuoteStore = subscribeQuoteUpdate(
        {
          useQuoteStore: storeSet.useQuoteStore,
        },
        eventCallbacks,
      );

      const ctx = {
        grabPluginId,
        storeSet,
        eventCallbacks,
        unsubscribe: () => {
          unsubscribeQuoteStore();
        },
        eventCenter,
        publicEventCenter,
        scene,
      };

      return ctx;
    },
    Plugin: ChatAreaGrabPlugin,
  };

  return { grabPlugin, grabPluginId };
};
