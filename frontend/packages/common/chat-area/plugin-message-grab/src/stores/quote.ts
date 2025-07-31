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
import { produce } from 'immer';
import { type GrabNode } from '@coze-common/text-grab';

import { type EventCallbacks } from '../types/plugin-biz-context';

export interface QuoteState {
  quoteContent: GrabNode[] | null;
  quoteVisible: boolean;
  quoteContentMap: Record<string, GrabNode[]>;
}

export interface QuoteAction {
  updateQuoteContent: (quote: GrabNode[] | null) => void;
  updateQuoteContentMapByImmer: (
    updater: (quoteContentMap: Record<string, GrabNode[]>) => void,
  ) => void;
  updateQuoteVisible: (visible: boolean) => void;
  clearStore: () => void;
}

export const createQuoteStore = (mark: string) => {
  const useQuoteStore = create<QuoteState & QuoteAction>()(
    devtools(
      subscribeWithSelector(set => ({
        quoteContent: null,
        quoteVisible: false,
        quoteContentMap: {},
        updateQuoteContent: quote => {
          set({
            quoteContent: quote,
          });
        },
        updateQuoteContentMapByImmer: updater => {
          set(produce<QuoteState>(state => updater(state.quoteContentMap)));
        },
        updateQuoteVisible: visible => {
          set({
            quoteVisible: visible,
          });
        },
        clearStore: () => {
          set({
            quoteContent: null,
            quoteVisible: false,
          });
        },
      })),
      {
        name: `botStudio.ChatAreaGrabPlugin.Quote.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

  return useQuoteStore;
};

export type QuoteStore = ReturnType<typeof createQuoteStore>;

export const subscribeQuoteUpdate = (
  store: {
    useQuoteStore: QuoteStore;
  },
  eventCallbacks: EventCallbacks,
) => {
  const { useQuoteStore } = store;

  return useQuoteStore.subscribe(
    state => state.quoteContent,
    quoteContent => {
      const { onQuoteChange } = eventCallbacks;
      onQuoteChange?.({ isEmpty: !quoteContent });
    },
  );
};
