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

import { type FC, type PropsWithChildren, type MouseEventHandler } from 'react';

import classNames from 'classnames';

import { ToolTooltip } from '../tool-tooltip';
import { type ToolButtonCommonProps } from '../../typings/button';

type ToolItemActionProps = ToolButtonCommonProps & {
  /** Whether to display hover style **/
  hoverStyle?: boolean;
};

export const ToolItemAction: FC<PropsWithChildren<ToolItemActionProps>> = ({
  children,
  disabled,
  tooltips,
  onClick,
  hoverStyle = true,
  ...restProps
}) => {
  const handleClick: MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <ToolTooltip content={tooltips} disableFocusListener={disabled}>
      <div
        className={classNames(
          'w-[24px] h-[24px] flex justify-center items-center rounded-mini',
          {
            'hover:coz-mg-secondary-hovered active:coz-mg-secondary-pressed cursor-pointer':
              !disabled && hoverStyle,
          },
          {
            'coz-fg-dim hover:coz-fg-dim active:coz-fg-dim cursor-not-allowed':
              disabled,
          },
        )}
        onClick={disabled ? undefined : handleClick}
        data-testid={restProps['data-testid']}
      >
        {children}
      </div>
    </ToolTooltip>
  );
};
