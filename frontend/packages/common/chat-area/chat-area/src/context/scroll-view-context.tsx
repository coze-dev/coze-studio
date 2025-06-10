import { createContext } from 'react';

import { type ScrollViewController } from '@coze-common/scroll-view';

interface ScrollViewContext {
  getScrollView: (() => ScrollViewController) | null;
}

export const ScrollViewContext = createContext<ScrollViewContext>({
  getScrollView: null,
});

export const ScrollViewProvider = ScrollViewContext.Provider;
