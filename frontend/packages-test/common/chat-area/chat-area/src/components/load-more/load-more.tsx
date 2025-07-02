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

  // 防止连续触发两次请求（loading 变化早于 IconSpin 组件显隐变化）
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
