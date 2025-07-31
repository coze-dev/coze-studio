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
import { Button } from '@coze-arch/coze-design';
import { IconShortcutComponentTag } from '@coze-arch/bot-icons';
import { SendType } from '@coze-arch/bot-api/playground_api';

import {
  typeSafeShortcutCommandTextVariants,
  typeSafeShortcutCommandVariants,
} from '../variants';
import { TooltipWithContent } from '../component';
import { enableSendTypePanelHideTemplate } from '../../shortcut-tool/shortcut-edit/method';
import { type UIMode } from '../../shortcut-bar/types';

interface TemplateShortcutProps {
  shortcut: ShortCutCommand;
  uiMode: UIMode;
  toolTipFooterSlot?: React.ReactNode;
  onClick?: () => void;
  popoverTipShowBotInfo?: boolean;
}

export const TemplateShortcut: FC<TemplateShortcutProps> = props => {
  const {
    shortcut,
    onClick,
    uiMode,
    toolTipFooterSlot,
    popoverTipShowBotInfo = false,
  } = props;
  const commandNameRef = useRef<HTMLDivElement>(null);
  const onShortcutClick = () => {
    onClick?.();
  };

  if (shortcut.send_type !== SendType.SendTypePanel) {
    return null;
  }

  const hideTemplate = enableSendTypePanelHideTemplate(shortcut);

  return (
    <div className={typeSafeShortcutCommandVariants({ color: uiMode })}>
      <TooltipWithContent
        shortcut={shortcut}
        toolTipFooterSlot={toolTipFooterSlot}
        showBotInfo={popoverTipShowBotInfo}
      >
        <Button
          data-testid={`chat-area.chat-input-shortcut.shortcut-button-${shortcut.command_name}`}
          contentClassName={typeSafeShortcutCommandTextVariants({
            color: uiMode,
          })}
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
          iconPosition={'left'}
          onClick={() => onShortcutClick()}
        >
          <div className="inline-flex items-center">
            <div
              ref={commandNameRef}
              className="max-w-[176px] overflow-hidden text-ellipsis"
            >
              {shortcut.command_name}
            </div>
            {!hideTemplate && (
              <IconShortcutComponentTag className="ml-[10px]" />
            )}
          </div>
        </Button>
      </TooltipWithContent>
    </div>
  );
};
