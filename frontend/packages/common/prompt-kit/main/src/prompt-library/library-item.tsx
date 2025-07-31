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

import { useState } from 'react';

import cls from 'classnames';
import { ActionKey } from '@coze-arch/idl/resource';
import { type ResourceAction } from '@coze-arch/idl/plugin_develop';
import { I18n } from '@coze-arch/i18n';
import { IconCozMore } from '@coze-arch/coze-design/icons';
import { Tooltip, Typography } from '@coze-arch/coze-design';
const { Text } = Typography;

export interface LibraryItemProps {
  id: string;
  title: string;
  description: string;
  isSelected?: boolean;
  onActive?: (id: string) => void;
  actions?: ResourceAction[];
  onDeleteAction?: (id: string) => void;
  onEditAction?: (id: string) => void;
}
const actionsMap: {
  [key in ActionKey.Delete | ActionKey.Edit]: string;
} = {
  [ActionKey.Delete]: I18n.t('Delete'),
  [ActionKey.Edit]: I18n.t('Edit'),
};

export const LibraryItem = ({
  id,
  title,
  description,
  actions,
  isSelected,
  onActive,
  onDeleteAction,
  onEditAction,
}: LibraryItemProps) => {
  const [isHover, setIsHover] = useState(false);
  const handleActions = (action: ActionKey) => {
    if (action === ActionKey.Delete) {
      onDeleteAction?.(id);
      return;
    }
    if (action === ActionKey.Edit) {
      onEditAction?.(id);
    }
  };
  return (
    <>
      <div
        className={cls(
          'w-full flex flex-row justify-between items-center overflow-hidden px-3 h-[64px]',
          'relative',
          'after:content-[""] after:absolute after:left-0 after:right-0',
          'after:bottom-0 after:h-[1px] after:coz-mg-primary',
          'hover:coz-mg-secondary-hovered hover:rounded hover:after:hidden',
          'cursor-pointer',
          {
            'rounded coz-mg-primary after:hidden': isSelected,
          },
        )}
        onClick={() => {
          onActive?.(id);
        }}
        onMouseEnter={() => {
          setIsHover(true);
        }}
        onMouseLeave={() => {
          setIsHover(false);
        }}
      >
        <div className="flex flex-1 min-w-[0px] w-0 flex-col gap-[2px]">
          <Text className="text-lg flex-1 font-medium" ellipsis>
            {title}
          </Text>
          <Text
            className="text-base"
            ellipsis={{
              rows: 1,
              showTooltip: {
                opts: {
                  position: 'right',
                },
              },
            }}
          >
            {description}
          </Text>
        </div>
        <Tooltip
          position="bottom"
          className="!p-1"
          content={
            <div className="flex flex-col gap-[2px] w-[120px]">
              {actions
                ?.filter(action => action.enable)
                ?.filter(action => action.key in actionsMap)
                .map(action => (
                  <div
                    key={action.key}
                    onClick={() => handleActions(action.key as ActionKey)}
                    className="w-full text-sm h-[32px] p-2 flex items-center cursor-pointer hover:coz-mg-primary-hovered hover:rounded-mini"
                  >
                    {actionsMap[action.key as keyof typeof actionsMap]}
                  </div>
                ))}
            </div>
          }
        >
          <div
            className={cls(
              'w-6 h-6 rounded-little coz-mg-secondary-hovered flex items-center justify-center',
              {
                hidden: !actions?.length || !isHover,
              },
            )}
            onClick={e => e.stopPropagation()}
          >
            <IconCozMore />
          </div>
        </Tooltip>
      </div>
    </>
  );
};
