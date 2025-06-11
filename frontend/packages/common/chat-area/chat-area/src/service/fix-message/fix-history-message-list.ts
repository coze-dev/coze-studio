import { type Reporter } from '@coze-arch/logger';
import { type ChatMessage } from '@coze-arch/bot-api/developer_api';

import { getShouldDropMessage } from '../ignore-message';
import { type IgnoreMessageType } from '../../context/chat-area-context/type';
import { fixMessageStruct, markHistoryMessage } from './fix-message-struct';

export const fixHistoryMessageList = ({
  historyMessageList,
  ignoreMessageConfigList,
  reporter,
}: {
  historyMessageList: ChatMessage[];
  ignoreMessageConfigList: IgnoreMessageType[];
  reporter: Reporter;
}) =>
  historyMessageList
    .map(msg => fixMessageStruct(msg, reporter))
    .filter(msg => !getShouldDropMessage(ignoreMessageConfigList, msg))
    .map(markHistoryMessage);
