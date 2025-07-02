import React from 'react';

import classNames from 'classnames';
import { IconCozArrowDown } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';
import { UIButton } from '@coze-arch/bot-semi';
import { useFlags } from '@coze-arch/bot-flags';

import { type ModeOption } from './mode-change-view';

import s from './index.module.less';

export interface ChangeButtonProps {
  disabled: boolean;
  tooltip?: string;
  modeInfo: ModeOption | undefined;
}

export function ChangeButton({
  modeInfo,
  disabled,
  tooltip,
}: ChangeButtonProps) {
  const [FLAGS] = useFlags();

  // 社区版暂不支持该功能
  const showText = modeInfo?.showText || FLAGS['bot.studio.prompt_diff'];
  const ToolTipFragment = tooltip ? Tooltip : React.Fragment;

  const content = (
    <ToolTipFragment content={tooltip}>
      <UIButton
        theme="outline"
        size="small"
        className={classNames(s['mode-change-title-space'], {
          '!coz-mg-primary': disabled,
        })}
        icon={
          <div className="coz-fg-primary text-[16px] flex items-center">
            {modeInfo?.icon}
          </div>
        }
        disabled={disabled}
        data-testid="bot-edit-agent-mode-open-button"
      >
        <div
          className={classNames(s['mode-change-title'], 'flex items-center')}
        >
          {showText ? modeInfo?.title : null}
          <IconCozArrowDown className="w-4 h-5 coz-fg-secondary" />
        </div>
      </UIButton>
    </ToolTipFragment>
  );
  return showText ? (
    content
  ) : (
    <Tooltip content={modeInfo?.title}>{content}</Tooltip>
  );
}
