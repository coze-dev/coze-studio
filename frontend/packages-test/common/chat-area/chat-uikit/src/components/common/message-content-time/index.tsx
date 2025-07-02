import classNames from 'classnames';

import { formatMessageBoxContentTime } from '../../../utils/date-time';

export const MessageContentTime = ({
  contentTime,
  className,
  showBackground,
}: {
  contentTime?: number;
  className?: string;
  showBackground: boolean;
}) => {
  if (!contentTime) {
    return null;
  }
  return (
    <span
      className={classNames(
        'text-[12px] leading-[16px] ml-[8px] font-normal',
        'chat-uikit-message-box-container__message-content-time',
        {
          'coz-fg-images-secondary': showBackground,
          'coz-fg-secondary': !showBackground,
        },
        className,
      )}
    >
      {formatMessageBoxContentTime(contentTime)}
    </span>
  );
};

MessageContentTime.displayName = 'MessageContentTime';
