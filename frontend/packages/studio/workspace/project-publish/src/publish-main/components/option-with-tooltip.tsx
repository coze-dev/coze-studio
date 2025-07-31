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

import { type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { IconCozCheckMarkFill } from '@coze-arch/coze-design/icons';
import {
  type optionRenderProps,
  Tooltip,
  Typography,
} from '@coze-arch/coze-design';

export type OptionWithTooltipProps = PropsWithChildren<{
  option: optionRenderProps;
  tooltip?: string;
}>;

export function OptionWithTooltip({
  option,
  tooltip,
  children,
}: OptionWithTooltipProps) {
  const optionNode = (
    <div
      className={classNames(
        'coz-select-option-item p-[8px] gap-x-[8px] items-center',
        {
          '!cursor-not-allowed': option.disabled,
        },
      )}
      onClick={option.onClick}
    >
      <div className="w-[16px] h-[16px] shrink-0">
        {option.selected ? (
          <IconCozCheckMarkFill className="coz-fg-hglt" />
        ) : null}
      </div>
      {children ?? (
        <Typography.Text className="leading-[16px]" disabled={option.disabled}>
          {option.label}
        </Typography.Text>
      )}
    </div>
  );
  return tooltip ? (
    <Tooltip theme="dark" position="right" trigger="hover" content={tooltip}>
      {optionNode}
    </Tooltip>
  ) : (
    optionNode
  );
}
