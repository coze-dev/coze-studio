import { type ComponentProps, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import {
  useDeleteMessageGroup,
  useIsDeleteMessageLock,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { useTooltipTrigger } from '../../hooks/use-tooltip-trigger';

type DeleteMessageProps = Omit<
  ComponentProps<typeof IconButton>,
  'icon' | 'iconSize' | 'onClick'
>;

export const DeleteMessage: React.FC<PropsWithChildren<DeleteMessageProps>> = ({
  className,
  ...props
}) => {
  const { groupId } = useMessageBoxContext();
  const trigger = useTooltipTrigger('hover');
  const isDeleteMessageLock = useIsDeleteMessageLock(groupId);
  const deleteMessageGroup = useDeleteMessageGroup();

  return (
    <Tooltip trigger={trigger} content={I18n.t('Delete')}>
      <IconButton
        data-testid="chat-area.answer-action.delete-message-button"
        disabled={isDeleteMessageLock}
        size="small"
        icon={
          <IconCozTrashCan
            className={classNames(
              'coz-fg-hglt-red',
              className,
              'w-[14px] h-[14px]',
            )}
          />
        }
        onClick={() => {
          // 通过 groupId 索引即可
          deleteMessageGroup(groupId);
        }}
        color="secondary"
        {...props}
      />
    </Tooltip>
  );
};
