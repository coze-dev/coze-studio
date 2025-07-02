import { useShallow } from 'zustand/react/shallow';
import { WithRuleImgBackground } from '@coze-common/chat-uikit';
import {
  type CustomComponent,
  useReadonlyPlugin,
  PluginName,
} from '@coze-common/chat-area';

import { type BackgroundPluginBizContext } from '../../types/biz-context';

import styles from './index.module.less';

export const ChatBackgroundUI: CustomComponent['MessageListFloatSlot'] = ({
  headerNode,
}) => {
  const plugin = useReadonlyPlugin<BackgroundPluginBizContext>(
    PluginName.ChatBackground,
  );
  const { useChatBackgroundContext } = plugin.pluginBizContext.storeSet;
  const backgroundImageInfo = useChatBackgroundContext(
    useShallow(state => state.backgroundImageInfo),
  );
  const isBackgroundMode =
    !!backgroundImageInfo?.mobile_background_image?.origin_image_url;

  return isBackgroundMode ? (
    <>
      {headerNode ? <div className={styles.mask}></div> : null}
      <WithRuleImgBackground backgroundInfo={backgroundImageInfo} />
    </>
  ) : null;
};
