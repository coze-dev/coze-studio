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
