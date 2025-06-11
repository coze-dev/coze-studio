import { useContext } from 'react';

import { safeAsyncThrow } from '@coze-common/chat-area-utils';

import {
  fallbackLoadMoreClient,
  type LoadMoreClientMethod,
} from '../../service/load-more';
import { LoadMoreContext } from './load-more-context';

export { LoadMoreProvider } from './load-more-context';

export const useLoadMoreClient = (): LoadMoreClientMethod => {
  const client = useContext(LoadMoreContext).loadMoreClient;
  if (!client) {
    safeAsyncThrow('loadMoreClient not provided');
    return fallbackLoadMoreClient;
  }
  return client;
};

export const useLoadEagerlyUnconditionally = () => {
  const client = useLoadMoreClient();
  return () => client.loadEagerlyUnconditionally();
};
