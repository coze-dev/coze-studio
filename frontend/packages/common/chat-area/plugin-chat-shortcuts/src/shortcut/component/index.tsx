import React, { type FC, type PropsWithChildren, useState } from 'react';

import type { ShortCutCommand } from '@coze-agent-ide/tool-config';
import { useChatAreaLayout } from '@coze-common/chat-area';
import { Tooltip } from '@coze-arch/coze-design';
import { Typography } from '@coze-arch/bot-semi';
import { Layout } from '@coze-common/chat-uikit-shared';

const { Paragraph, Text } = Typography;

interface TooltipWithContentProps {
  shortcut: ShortCutCommand;
  toolTipFooterSlot?: React.ReactNode;
  showBotInfo?: boolean;
}

export const TooltipWithContent: FC<
  PropsWithChildren<TooltipWithContentProps>
> = ({
  children,
  shortcut,
  toolTipFooterSlot,
  showBotInfo: propShowBotInfo = false,
}) => {
  const layout = useChatAreaLayout();
  const showTooltip = layout !== Layout.MOBILE;
  const [visible, setVisible] = useState(false);
  const { description, command_name } = shortcut;
  const { icon_url, name } = shortcut.bot_info || {};
  const showBotInfo = propShowBotInfo && !!(name || icon_url);

  const renderContent = () => (
    <div className="flex flex-col items-start justify-center min-w-9">
      {command_name ? (
        <div className="max-w-[250px] mb-1">
          <Paragraph ellipsis className="coz-fg-plus font-bold text-sm">
            {command_name}
          </Paragraph>
        </div>
      ) : null}
      {description ? (
        <div className="max-w-[250px]">
          <div className="coz-fg-secondary text-xs">{description}</div>
        </div>
      ) : null}
      {showBotInfo ? (
        <div className="flex mt-3 gap-1 items-center">
          {icon_url ? (
            <img
              className="rounded-full w-[14px] h-[14px]"
              src={icon_url}
              alt="bot_icon"
            />
          ) : null}
          {name ? (
            <Text className="coz-fg-secondary text-xs">{name}</Text>
          ) : null}
        </div>
      ) : null}
      {toolTipFooterSlot}
    </div>
  );
  return (
    <Tooltip
      trigger={'custom'}
      visible={visible}
      style={{ maxWidth: '283px', padding: '16px' }}
      content={() => renderContent()}
    >
      <div
        onMouseEnter={() => setVisible(showTooltip)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
    </Tooltip>
  );
};
