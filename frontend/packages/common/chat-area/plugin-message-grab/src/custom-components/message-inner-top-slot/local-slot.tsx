import { useShallow } from 'zustand/react/shallow';
import {
  PluginName,
  useWriteablePlugin,
  type CustomTextMessageInnerTopSlot,
} from '@coze-common/chat-area';

import { QuoteNode } from '../quote-node';
import { type GrabPluginBizContext } from '../../types/plugin-biz-context';
import { QuoteTopUI } from './quote-top-ui';

export const LocalQuoteInnerTopSlot: CustomTextMessageInnerTopSlot = ({
  message,
}) => {
  const localMessageId = message.extra_info.local_message_id;

  const plugin = useWriteablePlugin<GrabPluginBizContext>(
    PluginName.MessageGrab,
  );

  const { useQuoteStore } = plugin.pluginBizContext.storeSet;

  // 优先用本地映射的
  const localNodeList = useQuoteStore(
    useShallow(state => state.quoteContentMap[localMessageId]),
  );

  if (localNodeList) {
    return (
      <QuoteTopUI>
        <QuoteNode nodeList={localNodeList} theme="white" />
      </QuoteTopUI>
    );
  }

  return null;
};
