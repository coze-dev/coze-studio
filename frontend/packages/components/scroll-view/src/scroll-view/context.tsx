import { type MutableRefObject, createContext, useContext } from 'react';

export const ScrollViewContentContext = createContext<
  MutableRefObject<HTMLDivElement | null>
>({
  current: null,
});

export const useScrollViewContentRef = () =>
  useContext(ScrollViewContentContext);
