import classNames from 'classnames';
import {
  useDeleteMessageGroup,
  useIsDeleteMessageLock,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozMore, IconCozTrashCan } from '@coze/coze-design/icons';
import { IconButton, Dropdown } from '@coze/coze-design';

interface MoreOperationsProps {
  className?: string;
}

export const MoreOperations: React.FC<MoreOperationsProps> = ({
  className,
}) => {
  const { groupId } = useMessageBoxContext();
  const isDeleteMessageLock = useIsDeleteMessageLock(groupId);

  const deleteMessageGroup = useDeleteMessageGroup();
  return (
    <Dropdown
      render={
        <Dropdown.Menu mode="menu">
          <Dropdown.Item
            disabled={isDeleteMessageLock}
            icon={<IconCozTrashCan className="coz-fg-hglt-red" />}
            onClick={() => {
              // 通过 groupId 索引即可
              deleteMessageGroup(groupId);
            }}
            type="danger"
          >
            {I18n.t('Delete')}
          </Dropdown.Item>
        </Dropdown.Menu>
      }
    >
      <IconButton
        data-testid="chat-area.answer-action.more-operation-button"
        size="small"
        color="secondary"
        icon={
          <IconCozMore className={classNames(className, 'w-[14px] h-[14px]')} />
        }
      />
    </Dropdown>
  );
};
