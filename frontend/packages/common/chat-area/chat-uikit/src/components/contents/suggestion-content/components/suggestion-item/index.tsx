import { type FC } from 'react';

import classNames from 'classnames';
import { type IMessage } from '@coze-common/chat-uikit-shared';

import { isText } from '../../../../../utils/is-text';
import { typeSafeSuggestionItemVariants } from './variants';
import './index.less';

interface ISuggestionItemProps {
  message?: Pick<IMessage, 'content_obj' | 'sender_id'>;
  content?: string;
  readonly?: boolean;
  showBackground?: boolean;
  className?: string;
  color?: 'white' | 'grey';
  onSuggestionClick?: (sugParam: {
    text: string;
    mentionList: { id: string }[];
  }) => void;
}

export const SuggestionItem: FC<ISuggestionItemProps> = props => {
  const {
    content,
    message,
    readonly,
    onSuggestionClick,
    showBackground,
    className,
    color,
  } = props;
  const { content_obj = content } = message ?? {};

  if (!isText(content_obj)) {
    return null;
  }

  return (
    <div
      className={classNames(
        className,
        '!bg-[235, 235, 235, 0.75]',
        typeSafeSuggestionItemVariants({
          showBackground: Boolean(showBackground),
          readonly: Boolean(readonly),
          color: color ?? 'white',
        }),
      )}
      onClick={() => {
        if (readonly) {
          return;
        }

        const senderId = message?.sender_id;
        onSuggestionClick?.({
          text: content_obj,
          mentionList: senderId ? [{ id: senderId }] : [],
        });
      }}
    >
      <span className="w-full">{content_obj}</span>
    </div>
  );
};

SuggestionItem.displayName = 'SuggestionItem';
