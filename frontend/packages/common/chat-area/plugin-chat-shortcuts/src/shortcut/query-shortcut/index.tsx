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

import { type FC, useRef } from 'react';

import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import { useIsSendMessageLock } from '@coze-common/chat-area';
import { Button } from '@coze-arch/coze-design';
import { SendType } from '@coze-arch/bot-api/playground_api';

import {
  typeSafeShortcutCommandTextVariants,
  typeSafeShortcutCommandVariants,
} from '../variants';
import { TooltipWithContent } from '../component';
import {
  type OnBeforeSendQueryShortcutParams,
  type UIMode,
} from '../../shortcut-bar/types';
import { useSendTextQueryMessage } from '../../hooks/shortcut';

interface QueryShortcutProps {
  shortcut: ShortCutCommand;
  onClick?: () => void;
  uiMode: UIMode;
  toolTipFooterSlot?: React.ReactNode;
  onBeforeSend?: (
    params: OnBeforeSendQueryShortcutParams,
  ) => OnBeforeSendQueryShortcutParams;
  popoverTipShowBotInfo?: boolean;
}

export const QueryShortcut: FC<QueryShortcutProps> = props => {
  const {
    shortcut,
    onClick,
    onBeforeSend,
    toolTipFooterSlot,
    popoverTipShowBotInfo = false,
  } = props;
  const sendQueryMessage = useSendTextQueryMessage();
  const commandNameRef = useRef<HTMLDivElement>(null);
  const isSendMessageLock = useIsSendMessageLock();
  const onShortcutClick = () => {
    const { template_query, agent_id, object_id } = shortcut;
    if (!template_query) {
      return;
    }
    onClick?.();
    sendQueryMessage({
      queryTemplate: template_query,
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
      onBeforeSend,
      shortcut,
    });
  };

  if (shortcut.send_type !== SendType.SendTypeQuery) {
    return null;
  }

  return (
    <div className={typeSafeShortcutCommandVariants({ color: props.uiMode })}>
      {/*Instruction name is not too long, display description*/}
      <TooltipWithContent
        shortcut={shortcut}
        toolTipFooterSlot={toolTipFooterSlot}
        showBotInfo={popoverTipShowBotInfo}
      >
        <Button
          disabled={isSendMessageLock}
          data-testid={`chat-area.chat-input-shortcut.shortcut-button-${shortcut.command_name}`}
          contentClassName={typeSafeShortcutCommandTextVariants({
            color: props.uiMode,
          })}
          onClick={() => onShortcutClick()}
          color="secondary"
          icon={
            shortcut.shortcut_icon?.url ? (
              <img
                alt="icon"
                src={shortcut.shortcut_icon.url}
                className="h-[14px]"
              />
            ) : null
          }
        >
          <div
            ref={commandNameRef}
            className="max-w-[198px] overflow-hidden text-ellipsis"
          >
            {shortcut.command_name}
          </div>
        </Button>
      </TooltipWithContent>
    </div>
  );
};
