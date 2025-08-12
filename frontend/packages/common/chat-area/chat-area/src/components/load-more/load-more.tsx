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

import {
  type PropsWithChildren,
  useDeferredValue,
  useEffect,
  useRef,
} from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useInViewport } from 'ahooks';
import { IconSpin } from '@douyinfe/semi-icons';

import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { useLoadMoreClient } from '../../context/load-more';
import { LoadRetry } from './load-retry';

type Direction = 'next' | 'prev';

export const LoadMore = ({
  direction,
}: PropsWithChildren<{
  direction: Direction;
}>) => {
  const { useMessageIndexStore } = useChatAreaStoreSet();
  const isForPrev = direction === 'prev';
  const { hasMore, error, loading } = useMessageIndexStore(
    useShallow(state => ({
      hasMore: isForPrev ? state.prevHasMore : state.nextHasMore,
      error: state.loadError.includes(isForPrev ? 'load-prev' : 'load-next'),
      loading: !!state.loadLock[isForPrev ? 'load-prev' : 'load-next'],
    })),
  );
  const showLoadSpin = hasMore && !error;

  const { loadByScrollPrev, loadByScrollNext } = useLoadMoreClient();
  const load = isForPrev ? loadByScrollPrev : loadByScrollNext;

  const spinRef = useRef<HTMLSpanElement>(null);
  const [inViewport] = useInViewport(() => spinRef.current);

  // Prevent two consecutive requests from being triggered (loading changes earlier than explicit changes in the IconSpin component)
  const deferredLoading = useDeferredValue(loading);

  useEffect(() => {
    if (!showLoadSpin) {
      return;
    }
    if (!inViewport) {
      return;
    }
    if (deferredLoading) {
      return;
    }
    load();
  }, [inViewport, deferredLoading, showLoadSpin]);

  if (error) {
    return <LoadRetry onClick={load} />;
  }

  if (!showLoadSpin) {
    return null;
  }

  return <IconSpin ref={spinRef} style={{ color: '#4D53E8' }} spin />;
};

LoadMore.displayName = 'LoadMore';
