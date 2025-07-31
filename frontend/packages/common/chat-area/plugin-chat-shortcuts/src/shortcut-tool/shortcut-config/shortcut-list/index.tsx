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

import { type FC } from 'react';

import cls from 'classnames';
import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import { ToolItemList } from '@coze-agent-ide/tool';
import { SortableList } from '@coze-studio/components/sortable-list';

import style from '../index.module.less';
import { ShortcutItem } from './shortcut-item';

interface ShortcutsListProps {
  shortcuts: ShortCutCommand[];
  isReadonly: boolean;
  onRemove?: (shortcut: ShortCutCommand) => void;
  onDisorder?: (orderList: ShortCutCommand[]) => void;
  onEdit?: (shortcut: ShortCutCommand) => void;
}
const SortableListSymbol = Symbol('Shortcut-config-list-sortlist');

export const ShortcutList: FC<ShortcutsListProps> = props => {
  const { shortcuts, onDisorder, onEdit, onRemove, isReadonly } = props;
  const handleRemove = (shortcut: ShortCutCommand) => {
    onRemove?.(shortcut);
  };

  const handleDisorder = (orderList: ShortCutCommand[]) => {
    onDisorder?.(orderList);
  };

  const handleEdit = (shortcut: ShortCutCommand) => {
    onEdit?.(shortcut);
  };

  return (
    <>
      <div className={cls(style['shortcut-list'])}>
        <ToolItemList>
          <SortableList
            type={SortableListSymbol}
            list={shortcuts}
            getId={shortcut => shortcut.command_id}
            enabled={shortcuts.length > 1 && !isReadonly}
            onChange={handleDisorder}
            itemRender={({ data: shortcut, connect, isDragging }) => (
              <ShortcutItem
                isDragging={Boolean(isDragging)}
                connect={connect}
                key={shortcut.command_id}
                shortcut={shortcut}
                isReadonly={isReadonly}
                onRemove={() => handleRemove(shortcut)}
                onEdit={() => handleEdit(shortcut)}
              />
            )}
          />
        </ToolItemList>
      </div>
    </>
  );
};
