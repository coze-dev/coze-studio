import { type Emitter } from 'mitt';
import { type GrabNode } from '@coze-common/text-grab';
import {
  type OnLinkElementContext,
  type MessageSource,
} from '@coze-common/chat-area';

import { type SelectionStore } from '../stores/selection';
import { type QuoteStore } from '../stores/quote';
import { type PreferenceStore } from '../stores/preference';
import { type Scene } from '../create';

export const enum EventNames {
  OnViewScroll = 'onViewScroll',
  OnMessageUpdate = 'onMessageUpdate',
  OnLinkElementMouseEnter = 'onCardLinkElementMouseEnter',
  OnLinkElementMouseLeave = 'onCardLinkElementMouseLeave',
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- 符合预期
export type EventCenter = {
  [EventNames.OnMessageUpdate]: unknown;
  [EventNames.OnViewScroll]: unknown;
  [EventNames.OnLinkElementMouseEnter]: OnLinkElementContext & {
    type: 'link' | 'image';
  };
  [EventNames.OnLinkElementMouseLeave]: OnLinkElementContext & {
    type: 'link' | 'image';
  };
};

export const enum PublicEventNames {
  UpdateQuote = 'updateQuote',
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PublicEventCenter = {
  [PublicEventNames.UpdateQuote]: {
    grabPluginId: string;
    quote: GrabNode[] | null;
  };
};

export interface GrabPluginBizContext {
  grabPluginId: string;
  storeSet: {
    useSelectionStore: SelectionStore;
    useQuoteStore: QuoteStore;
    usePreferenceStore: PreferenceStore;
  };
  eventCallbacks: EventCallbacks;
  eventCenter: Emitter<EventCenter>;
  publicEventCenter: Emitter<PublicEventCenter>;
  unsubscribe: () => void;
  scene?: Scene;
}

export interface EventCallbacks {
  onQuote?: ({
    botId,
    source,
  }: {
    botId: string;
    source: MessageSource | undefined;
  }) => void;
  onQuoteChange?: ({ isEmpty }: { isEmpty: boolean }) => void;
}
