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

// Quick command bar
import { type CSSProperties, type FC, useRef, useState } from 'react';

import cls from 'classnames';
import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import { useMessageWidth } from '@coze-common/chat-area';
import { OverflowList, Popover } from '@coze-arch/bot-semi';
import { SendType } from '@coze-arch/bot-api/playground_api';

import {
  enableSendTypePanelHideTemplate,
  getFormValueFromShortcut,
} from '../shortcut-tool/shortcut-edit/method';
import { ShortcutTemplate } from '../shortcut-template';
import { ShortcutsLoadMoreList } from '../shortcut/load-more/shortcuts-load-more-list';
import { TemplateShortcut, LoadMore, QueryShortcut } from '../shortcut';
import { useSendUseToolMessage } from '../hooks/shortcut';
import { type TValue } from '../components/short-cut-panel/widgets/types';
import {
  type OnBeforeSendQueryShortcutParams,
  type OnBeforeSendTemplateShortcutParams,
  type UIMode,
} from './types';

import style from './index.module.less';

interface ChatShortCutBarProps {
  shortcuts: ShortCutCommand[];
  onActiveShortcutChange?: (
    shortcutInfo?: ShortCutCommand,
    isTemplateShortcutActive?: boolean,
  ) => void;
  className?: string;
  wrapperClassName?: string;
  uiMode?: UIMode; // The default is white, and it is blurred when there is a background.
  defaultId?: string;
  wrapperStyle?: CSSProperties;
  toolTipFooterSlot?: React.ReactNode;
  onBeforeSendTemplateShortcut?: (
    params: OnBeforeSendTemplateShortcutParams,
  ) => OnBeforeSendTemplateShortcutParams;
  onBeforeSendTextMessage?: (
    params: OnBeforeSendQueryShortcutParams,
  ) => OnBeforeSendQueryShortcutParams;
  popoverTipShowBotInfo?: boolean;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export const ShortcutBar: FC<ChatShortCutBarProps> = props => {
  const {
    shortcuts,
    onActiveShortcutChange,
    className,
    wrapperClassName,
    defaultId,
    uiMode = 'white',
    wrapperStyle,
    toolTipFooterSlot,
    onBeforeSendTemplateShortcut,
    onBeforeSendTextMessage,
    popoverTipShowBotInfo = false,
  } = props;
  const overflowListRef = useRef<HTMLDivElement>(null);
  const [isShowLoadMoreList, setIsShowLoadMoreList] = useState(false);
  const [activeShortcut, setActiveShortcut] = useState<
    ShortCutCommand | undefined
  >(undefined);
  const [shortcutTemplateVisible, setShortcutTemplateVisible] = useState(false);
  const sendUseToolMessage = useSendUseToolMessage();
  const messageWidth = useMessageWidth();

  const handleActiveShortcutChange = (
    shortcut: ShortCutCommand | undefined,
    hideTemplate = false,
  ) => {
    setActiveShortcut(shortcut);

    const isTemplateShortcutActive =
      shortcut?.send_type === SendType.SendTypePanel && !hideTemplate;

    onActiveShortcutChange?.(shortcut, isTemplateShortcutActive);
    setShortcutTemplateVisible(isTemplateShortcutActive);
  };

  const shortcutClick = (shortcut: ShortCutCommand) => {
    /**
     * send_type = SendTypePanel and components_list hide is true
     * send directly
     */
    const hideTemplate = enableSendTypePanelHideTemplate(shortcut);

    if (hideTemplate) {
      onShortcutTemplateNoParamsSubmit(
        getFormValueFromShortcut(shortcut),
        shortcut,
      );
    }

    handleActiveShortcutChange(shortcut, hideTemplate);

    setIsShowLoadMoreList(false);
  };

  const closeShortcutTemplate = () => {
    setShortcutTemplateVisible(false);
    handleActiveShortcutChange(undefined);
  };

  const renderShortcut = (shortcut: ShortCutCommand) => (
    <>
      {shortcut.send_type === SendType.SendTypeQuery && (
        <QueryShortcut
          uiMode={uiMode}
          key={shortcut.command_id}
          shortcut={shortcut}
          onBeforeSend={onBeforeSendTextMessage}
          toolTipFooterSlot={toolTipFooterSlot}
          popoverTipShowBotInfo={popoverTipShowBotInfo}
          onClick={() => shortcutClick(shortcut)}
        />
      )}
      {shortcut.send_type === SendType.SendTypePanel && (
        <TemplateShortcut
          uiMode={uiMode}
          key={shortcut.command_id}
          shortcut={shortcut}
          toolTipFooterSlot={toolTipFooterSlot}
          popoverTipShowBotInfo={popoverTipShowBotInfo}
          onClick={() => shortcutClick(shortcut)}
        />
      )}
    </>
  );

  const onShortcutTemplateSubmit = (
    componentsFormValues: Record<string, TValue>,
  ) => {
    if (!activeShortcut) {
      return;
    }
    const { agent_id, object_id } = activeShortcut;
    sendUseToolMessage({
      shortcut: activeShortcut,
      options: {
        extendFiled: {
          extra: {
            bot_state: JSON.stringify({
              agent_id,
              bot_id: object_id,
            }),
          },
        },
      },
      componentsFormValues,
      onBeforeSendTemplateShortcut,
    });
    closeShortcutTemplate();
  };

  /**
   * sendType = panel supports sending directly without displaying components
   */
  const onShortcutTemplateNoParamsSubmit = (
    componentsFormValues: Record<string, TValue>,
    shortcut?: ShortCutCommand,
  ) => {
    if (!shortcut) {
      return;
    }

    const { agent_id, object_id, components_list, tool_info } = shortcut;
    /**
     * sendType = panel, useTool = true Send directly without parameters
     */
    const withoutComponentsList =
      !!tool_info?.tool_name && !components_list?.length;

    sendUseToolMessage({
      shortcut,
      options: {
        extendFiled: {
          extra: {
            bot_state: JSON.stringify({
              agent_id,
              bot_id: object_id,
            }),
          },
        },
      },
      componentsFormValues,
      onBeforeSendTemplateShortcut,
      withoutComponentsList,
    });
    closeShortcutTemplate();
  };

  if (!shortcuts?.length) {
    return null;
  }

  if (shortcutTemplateVisible && activeShortcut) {
    return (
      <ShortcutTemplate
        shortcut={activeShortcut}
        onSubmit={onShortcutTemplateSubmit}
        visible={shortcutTemplateVisible}
        onClose={() => {
          handleActiveShortcutChange(undefined);
        }}
      />
    );
  }

  return (
    <div
      className={cls(
        style['shortcut-bar'],
        className,
        'flex justify-center items-center w-full',
      )}
    >
      <Popover
        content={
          <ShortcutsLoadMoreList
            defaultId={defaultId}
            shortcuts={shortcuts}
            onBeforeSendTextMessage={onBeforeSendTextMessage}
            onSelect={shortcutClick}
          />
        }
        onVisibleChange={setIsShowLoadMoreList}
        position={'topLeft'}
        trigger="custom"
        visible={isShowLoadMoreList}
        spacing={{
          x: 0,
          y: 9,
        }}
        getPopupContainer={() => overflowListRef.current || document.body}
        onClickOutSide={() => setIsShowLoadMoreList(false)}
        onEscKeyDown={() => setIsShowLoadMoreList(false)}
      >
        <div
          ref={overflowListRef}
          className={cls(wrapperClassName, 'relative flex justify-start pb-4')}
          style={{
            maxWidth: messageWidth,
            ...wrapperStyle,
          }}
        >
          <OverflowList
            style={{
              width: '100%',
            }}
            minVisibleItems={1}
            items={shortcuts}
            // @ts-expect-error visibleItemRenderer has a problem
            visibleItemRenderer={renderShortcut}
            overflowRenderer={overflowItems => {
              if (!overflowItems.length) {
                return null;
              }
              return (
                <LoadMore
                  uiMode={uiMode}
                  isLoadMoreActive={isShowLoadMoreList}
                  shortcuts={shortcuts}
                  onOpen={() => setIsShowLoadMoreList(true)}
                  onClose={() => setIsShowLoadMoreList(false)}
                  getPopupContainer={() => overflowListRef.current}
                />
              );
            }}
          />
        </div>
      </Popover>
    </div>
  );
};
