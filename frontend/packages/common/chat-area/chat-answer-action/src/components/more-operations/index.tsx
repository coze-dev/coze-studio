/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import classNames from 'classnames';
import {
  useDeleteMessageGroup,
  useIsDeleteMessageLock,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozMore, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { IconButton, Dropdown } from '@coze-arch/coze-design';

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
              // Just index through groupId.
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
