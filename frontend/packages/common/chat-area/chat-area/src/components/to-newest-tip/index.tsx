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
