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

import { type FC, useState } from 'react';

import cls from 'classnames';
import type { ShortCutCommand } from '@coze-agent-ide/tool-config';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/bot-semi';
import { SendType } from '@coze-arch/bot-api/playground_api';

import styles from '../index.module.less';
import { type OnBeforeSendQueryShortcutParams } from '../../shortcut-bar/types';
import { useSendTextQueryMessage } from '../../hooks/shortcut';
import { LoadMoreList } from '../../components/load-more-list';
import SplitLine from '../../assets/split-line.svg';
import DefaultShortcutIcon from '../../assets/shortcut-icon-default.svg';
import { shortcutIconAndNameVisibleControl } from './method';

const { Text } = Typography;

export const ShortcutsLoadMoreList: FC<{
  shortcuts: ShortCutCommand[];
  onSelect?: (shortcut: ShortCutCommand) => void;
  defaultId?: string;
  onBeforeSendTextMessage?: (
    params: OnBeforeSendQueryShortcutParams,
  ) => OnBeforeSendQueryShortcutParams;
}> = ({ shortcuts, onSelect, onBeforeSendTextMessage, defaultId }) => {
  const sendQueryMessage = useSendTextQueryMessage();
  const [activeId, setActiveId] = useState('');
  const onShortcutClick = (shortcut: ShortCutCommand) => {
    onSelect?.(shortcut);
    if (shortcut.send_type === SendType.SendTypeQuery) {
      shortcut?.template_query &&
        sendQueryMessage({
          queryTemplate: shortcut.template_query,
          onBeforeSend: onBeforeSendTextMessage,
          shortcut,
        });
      return;
    }
  };

  return (
    <div className="p-2">
      <div className="text-xs coz-fg-secondary mb-2 pl-2 pt-1">
        {I18n.t('bot_ide_shortcut')}
      </div>
      <LoadMoreList<ShortCutCommand>
        className={cls(
          'w-full max-h-[312px] overflow-y-auto cursor-pointer',
          styles['load-more-list'],
        )}
        defaultId={defaultId}
        getId={(item: ShortCutCommand) => item.command_id}
        onActiveId={id => setActiveId(id)}
        getMoreListService={() =>
          Promise.resolve({
            list: shortcuts,
            hasMore: false,
          })
        }
        onSelect={onShortcutClick}
        itemRender={(shortcut: ShortCutCommand) => {
          const { splitLineVisible, iconVisible, nameVisible } =
            shortcutIconAndNameVisibleControl(shortcut);
          return (
            <div
              className={cls(
                'flex justify-start items-center max-w-full overflow-hidden h-[52px] px-2 py-[6px]',
                {
                  'coz-mg-primary-hovered': activeId === shortcut.command_id,
                  'rounded-md': activeId === shortcut.command_id,
                },
              )}
            >
              <img
                src={shortcut.shortcut_icon?.url || DefaultShortcutIcon}
                alt="icon"
                className="w-9 h-9 p-[10px] rounded bg-white border-[0.5px] border-solid coz-stroke-primary mr-2"
              />
              <div className="grow-0 shrink max-w-[37%] overflow-hidden box-border mr-3 flex items-center">
                <Text
                  className="text-sm coz-fg-plus font-medium"
                  ellipsis={{
                    showTooltip: {
                      opts: {
                        content: shortcut.command_name,
                        position: 'top',
                        style: {
                          wordBreak: 'break-word',
                        },
                      },
                    },
                  }}
                >
                  {shortcut.command_name}
                </Text>
              </div>
              {shortcut.description ? (
                <div className="flex-0 max-w-[60%] overflow-hidden box-border mr-3 flex items-center">
                  <Text
                    className="coz-fg-secondary text-xs"
                    ellipsis={{
                      showTooltip: {
                        opts: {
                          content: shortcut.description,
                          position: 'top',
                          style: {
                            wordBreak: 'break-word',
                          },
                        },
                      },
                    }}
                  >
                    {shortcut.description}
                  </Text>
                </div>
              ) : null}
              <div className="flex items-center max-w-full flex-0 overflow-hidden box-border min-w-[100px]">
                {splitLineVisible ? <img src={SplitLine} alt="" /> : null}
                {iconVisible ? (
                  <img
                    alt="bot icon"
                    className="w-[14px] h-[14px] rounded-full mr-1 ml-3"
                    src={shortcut.bot_info?.icon_url}
                  />
                ) : null}
                {nameVisible ? (
                  <Text
                    className="coz-fg-secondary text-xs"
                    ellipsis={{
                      showTooltip: {
                        opts: {
                          content: shortcut.bot_info?.name,
                          position: 'top',
                          style: {
                            wordBreak: 'break-word',
                          },
                        },
                      },
                    }}
                  >
                    {shortcut.bot_info?.name}
                  </Text>
                ) : null}
              </div>
            </div>
          );
        }}
      ></LoadMoreList>
    </div>
  );
};
