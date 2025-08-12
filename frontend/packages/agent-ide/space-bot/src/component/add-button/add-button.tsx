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

import { type CSSProperties, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { type ButtonProps, type Theme } from '@coze-arch/bot-semi/Button';
import { UIButton } from '@coze-arch/bot-semi';
import { BotE2e } from '@coze-data/e2e';

import s from './index.module.less';

interface AddButtonProps {
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  theme?: Theme;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const AddButton: React.FC<
  PropsWithChildren<AddButtonProps & ButtonProps>
> = ({
  onClick,
  className,
  style,
  children,
  theme,
  icon,
  disabled,
  type,
  ...props
}) => {
  const isReadonly = useBotDetailIsReadonly();

  if (isReadonly) {
    return null;
  }
  return (
    <UIButton
      data-testid={BotE2e.BotVariableAddModalAddBtn}
      disabled={disabled}
      style={style}
      className={classNames(s.add, className)}
      type={type || 'tertiary'}
      theme={theme || 'light'}
      icon={icon}
      onClick={onClick}
      {...props}
    >
      {children}
    </UIButton>
  );
};
