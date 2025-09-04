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

import { I18n } from '@coze-arch/i18n';
import { IconCozEdit, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Menu } from '@coze-arch/coze-design';

export const Operate = ({
  children,
  onRename,
  onDelete,
  visible,
  setVisible,
}: {
  children: React.ReactNode;
  onRename: () => void;
  onDelete: () => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}) => (
  <Menu
    trigger="custom"
    position="bottomLeft"
    visible={visible}
    onClickOutSide={() => setVisible(false)}
    render={
      <Menu.SubMenu mode="menu">
        <Menu.Item
          onClick={(_, e) => {
            e.stopPropagation();
            e.preventDefault();
            onRename();
          }}
          icon={<IconCozEdit />}
        >
          {I18n.t('workflow_detail_node_rename', {}, '重命名')}
        </Menu.Item>
        <Menu.Item
          onClick={(_, e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}
          icon={<IconCozTrashCan color="var(--coz-fg-hglt-red)" />}
        >
          <span style={{ color: 'var(--coz-fg-hglt-red)' }}>
            {I18n.t('web_sdk_delete', {}, '删除')}
          </span>
        </Menu.Item>
      </Menu.SubMenu>
    }
  >
    {children}
  </Menu>
);
