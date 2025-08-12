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

      // Default injection preference
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
