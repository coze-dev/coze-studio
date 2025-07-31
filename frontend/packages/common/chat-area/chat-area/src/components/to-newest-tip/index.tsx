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

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { ToNewestTipUI, FullWidthAligner } from '@coze-common/chat-uikit';

import { useShowBackGround } from '../../hooks/public/use-show-bgackground';
import { useChatAreaStoreSet } from '../../hooks/context/use-chat-area-context';
import { usePreference } from '../../context/preference';
import { useLoadMoreClient } from '../../context/load-more';

import styles from './index.module.less';

export const ToNewestTip = () => {
  const { messageWidth } = usePreference();
  const showBackground = useShowBackGround();
  const { loadEagerly } = useLoadMoreClient();
  const { useMessageIndexStore } = useChatAreaStoreSet();
  const { nextHasMore, scrollViewFarFromBottom } = useMessageIndexStore(
    useShallow(state => ({
      nextHasMore: state.nextHasMore,
      scrollViewFarFromBottom: state.scrollViewFarFromBottom,
    })),
  );
  const show = nextHasMore || scrollViewFarFromBottom;
  return (
    <FullWidthAligner alignWidth={messageWidth} className={styles.aligner}>
      <ToNewestTipUI
        onClick={loadEagerly}
        className={classNames(styles.tip)}
        show={show}
        showBackground={showBackground}
      />
    </FullWidthAligner>
  );
};

ToNewestTip.displayName = 'ToNewestTip';
