import { createContext } from 'react';

import { type ScrollViewSize } from './type';

export const ScrollViewSizeContext = createContext<ScrollViewSize | undefined>(
  undefined,
);
