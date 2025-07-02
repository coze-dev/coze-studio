import { type ComponentProps, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import {
  useMessageBoxContext,
  useLatestSectionId,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozRefresh } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { getShowRegenerate } from '../../utils/get-show-regenerate';
import { useTooltipTrigger } from '../../hooks/use-tooltip-trigger';

type RegenerateMessageProps = Omit<
  ComponentProps<typeof IconButton>,
  'icon' | 'iconSize' | 'onClick'
>;

export const RegenerateMessage: React.FC<
  PropsWithChildren<RegenerateMessageProps>
> = ({ className, ...props }) => {
  const { message, meta, regenerateMessage } = useMessageBoxContext();
  const latestSectionId = useLatestSectionId();

  const trigger = useTooltipTrigger('hover');

  const showRegenerate = getShowRegenerate({ message, meta, latestSectionId });
  if (!showRegenerate) {
    return null;
  }

  return (
    <Tooltip trigger={trigger} content={I18n.t('message_tool_regenerate')}>
      <IconButton
        data-testid="chat-area.answer-action.regenerate-message-button"
        size="small"
        color="secondary"
        icon={
          <IconCozRefresh
            className={classNames(className, 'w-[14px] h-[14px]')}
          />
        }
        onClick={() => {
          regenerateMessage();
        }}
        {...props}
      />
    </Tooltip>
  );
};
