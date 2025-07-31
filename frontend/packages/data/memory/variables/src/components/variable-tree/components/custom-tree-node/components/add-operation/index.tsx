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

import { IconAdd } from '@coze-arch/bot-icons';
import { IconCozAddNode } from '@coze-arch/coze-design/icons';
import { IconButton, type ButtonProps } from '@coze-arch/coze-design';

type AddOperationProps = React.PropsWithChildren<{
  readonly?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  subitem?: boolean;
  size?: ButtonProps['size'];
  color?: ButtonProps['color'];
}>;

export default function AddOperation({
  readonly,
  onClick,
  className,
  style,
  disabled,
  subitem = false,
  size,
  color,
  ...restProps
}: AddOperationProps) {
  if (readonly) {
    return null;
  }

  return (
    <IconButton
      data-testid={restProps['data-testid']}
      onClick={onClick}
      className={`${
        disabled ? 'disabled:text-[rgb(28,31,35,0.35)]' : 'text-[#4d53e8]'
      } ${className}`}
      style={style}
      icon={
        subitem ? (
          <IconCozAddNode />
        ) : (
          <IconAdd className="text-[#4d53e8] disabled:text-[rgb(28,31,35,0.35)]" />
        )
      }
      disabled={disabled}
      size={size}
      color={color}
    />
  );
}
