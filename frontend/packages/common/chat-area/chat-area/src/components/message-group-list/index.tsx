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

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import cs from 'classnames';
import {
  type ScrollViewController,
  ScrollView,
} from '@coze-common/scroll-view';
import { Layout } from '@coze-common/chat-uikit-shared';

import { OnboardingContent } from '../onborading';
import { MessageGroup } from '../message-group';
import { LoadMore } from '../load-more/load-more';
import { localLog } from '../../utils/local-log';
import { useBackgroundScroll } from '../../hooks/uikit/use-background-scroll';
import { useComputeScrollViewSize } from '../../hooks/dom/use-compute-scroll-view-size';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../../hooks/context/use-chat-area-context';
import { ScrollViewSizeContext } from '../../context/scroll-view-size/context';
import { useLoadMoreClient } from '../../context/load-more';
import { SCROLL_VIEW_BOTTOM_DISTANCE_TO_SHOW_NEWEST_TIP } from '../../constants/scroll-list';

import styles from './index.module.less';

export const MessageGroupList = forwardRef<
  () => ScrollViewController,
  {
    className?: string;
    hasHeaderNode?: boolean;
    layout?: Layout;
  }
>(({ className, hasHeaderNode, layout }, ref) => {
  const { lifeCycleService } = useChatAreaContext();
  const { useMessagesStore, useMessageIndexStore } = useChatAreaStoreSet();
  const setScrollViewFarFromBottom = useMessageIndexStore(
    state => state.setScrollViewFarFromBottom,
  );
  const loadMoreClient = useLoadMoreClient();

  const prevHasMore = useMessageIndexStore(state => state.prevHasMore);

  useEffect(() => {
    loadMoreClient.injectGetScrollController(() => scrollViewRef.current);
  }, []);

  const messageGroupIdList = useMessagesStore(
    useShallow(state =>
      // TODO: You need to consider how to access the business here. For the time being, let's follow the debugging area.
      state.messageGroupList.map(group => group.groupId),
    ),
  );
  const scrollViewRef = useRef<ScrollViewController>(null);

  const scrollViewSize = useComputeScrollViewSize({
    scrollViewWrapper: scrollViewRef.current?.getScrollViewWrapper().current,
  });

  const onScroll = () => {
    lifeCycleService.command.onViewScroll();
    const distance = scrollViewRef.current?.getScrollBottom() || 0;
    const shouldShowToNewestTip =
      distance > SCROLL_VIEW_BOTTOM_DISTANCE_TO_SHOW_NEWEST_TIP;
    setScrollViewFarFromBottom(shouldShowToNewestTip);
  };

  useImperativeHandle(ref, () => () => {
    if (!scrollViewRef.current) {
      throw new Error('scroll view ref not ready');
    }
    return scrollViewRef.current;
  });

  localLog('render: MessageGroupList', messageGroupIdList);

  const { onLeaveTop, onReachTop, beforeClassName, beforeNode, maskClassName } =
    useBackgroundScroll({
      hasHeaderNode,
      styles,
      maskNode: <div className={styles['mask-scroll-header-top']} />,
    });

  return (
    <ScrollViewSizeContext.Provider value={scrollViewSize}>
      <ScrollView
        ref={scrollViewRef}
        onReachTop={onReachTop}
        onLeaveTop={onLeaveTop}
        reachTopThreshold={10}
        reachBottomThreshold={50}
        reverse
        className={cs(
          'py-0',
          layout === Layout.MOBILE ? 'px-[4px]' : 'px-[14px]',
          styles['scroll-mask'],
          className,
          maskClassName,
        )}
        beforeClassName={beforeClassName}
        before={beforeNode}
        onScroll={onScroll}
      >
        <div className={cs(styles['bottom-safe-area'], 'bottom-safe-area')} />
        <LoadMore direction="next" />
        {messageGroupIdList.map(id => (
          <MessageGroup groupId={id} key={id} />
        ))}
        {!prevHasMore && <OnboardingContent />}
        <LoadMore direction="prev" />
        <div className={styles['top-safe-area']} />
      </ScrollView>
    </ScrollViewSizeContext.Provider>
  );
});

MessageGroupList.displayName = 'ChatAreaMessageGroupList';
