import { createContext, type PropsWithChildren } from 'react';

import {
  type LoadMoreClient,
  type LoadMoreClientMethod,
} from '../../service/load-more';

export const LoadMoreContext = createContext<{
  loadMoreClient: LoadMoreClientMethod | null;
}>({
  loadMoreClient: null,
});

/**
 * 反模式起飞
 */
export const LoadMoreProvider = (
  props: PropsWithChildren<{
    loadMoreClient: LoadMoreClient;
  }>,
) => {
  const { children, loadMoreClient } = props;
  return (
    <LoadMoreContext.Provider
      value={{
        loadMoreClient,
      }}
    >
      {children}
    </LoadMoreContext.Provider>
  );
};
