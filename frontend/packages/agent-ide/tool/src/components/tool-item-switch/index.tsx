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

import { type ReactNode, type FC, type ChangeEvent } from 'react';

import { Switch } from '@coze-arch/coze-design';

import { ToolTooltip } from '../tool-tooltip';
import { ToolItemIconInfo } from '../tool-item-icon/icons/tool-item-icon-info';

interface ToolItemSwitchProps {
  title: string;
  tooltips?: ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?:
    | ((checked: boolean, e: ChangeEvent<HTMLInputElement>) => void)
    | undefined;
}

export const ToolItemSwitch: FC<ToolItemSwitchProps> = ({
  title,
  tooltips,
  checked,
  disabled,
  onChange,
}) => (
  <div className="w-full px-[12px] py-[10px] coz-bg-max flex flex-row items-center rounded-[8px]">
    <div className="flex flex-row items-center flex-1 min-w-0">
      <p className="coz-fg-primary text-[14px] leading-[20px] mr-[4px]">
        {title}
      </p>
      <ToolTooltip content={tooltips}>
        <div>
          <ToolItemIconInfo />
        </div>
      </ToolTooltip>
    </div>
    <Switch
      size="mini"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
  </div>
);
