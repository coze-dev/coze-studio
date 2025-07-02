import { type FC } from 'react';

import { type MessageMentionListFields } from '@coze-common/chat-core/src/message/types';
import {
  type IBaseContentProps,
  type GetBotInfo,
} from '@coze-common/chat-uikit-shared';

import { ThinkingPlaceholder } from '../../chat';
import { isText } from '../../../utils/is-text';

import './index.less';

export type IPlainTextMessageContentProps = Omit<
  IBaseContentProps,
  'message'
> & {
  getBotInfo: GetBotInfo;
  content: string;
  mentioned: MessageMentionListFields['mention_list'][0] | undefined;
  isContentLoading: boolean | undefined;
};

export const PlainTextContent: FC<IPlainTextMessageContentProps> = props => {
  const { content, isContentLoading } = props;

  if (!isText(content)) {
    return null;
  }

  return (
    <div className="chat-uikit-plain-text-content">
      {isContentLoading ? (
        <ThinkingPlaceholder className="!p-0 !h-20px" />
      ) : (
        <span>{`${getMentionBotContent(props)}${content}`}</span>
      )}
    </div>
  );
};

PlainTextContent.displayName = 'PlainTextContent';

const getMentionBotContent = ({
  mentioned,
  getBotInfo,
}: IPlainTextMessageContentProps) => {
  // 接口真不一定返回了 mention_list
  if (!mentioned) {
    return '';
  }
  const name = getBotInfo(mentioned.id)?.nickname;
  if (!name) {
    return '';
  }
  return `@${name} `;
};
