import { type FC, useRef } from 'react';

import { type ShortCutCommand } from '@coze-agent-ide/tool-config';
import { Button } from '@coze/coze-design';
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
