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
