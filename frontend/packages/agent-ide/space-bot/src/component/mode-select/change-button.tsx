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

  // Support soon, so stay tuned.
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
