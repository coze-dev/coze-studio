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

import React, { type FC } from 'react';

import classnames from 'classnames';
import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

interface Props {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseDown?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  readonly?: boolean;
  disabled?: boolean;
  disabledTooltip?: string;
  testId?: string;
}

export const AddItemButton: FC<Props> = ({
  onClick,
  onMouseDown,
  disabled,
  disabledTooltip,
  className,
  style,
  title,
  testId,
}) => {
  const ButtonContent = (
    <IconButton
      color="highlight"
      size="small"
      icon={<IconCozPlus className="text-sm" />}
      onMouseDown={e => onMouseDown?.(e)}
      onClick={e => onClick?.(e)}
      className={classnames('!block', className)}
      style={style}
      disabled={disabled}
      data-testid={testId}
    />
  );

  if (disabledTooltip) {
    return <Tooltip content={disabledTooltip}>{ButtonContent}</Tooltip>;
  }

  return !disabled ? ButtonContent : null;
};
