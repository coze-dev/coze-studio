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

import cls from 'classnames';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import s from './index.module.less';

interface TitleWithTooltipProps {
  title: React.ReactNode;
  tooltip?: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TitleWithTooltip: React.FC<TitleWithTooltipProps> = ({
  title,
  tooltip,
  extra,
  className,
  onClick,
}) => (
  <div className={cls(s['title-container'], className)} onClick={onClick}>
    <div className={s['title-with-tip']}>
      {title}
      <Tooltip content={tooltip}>
        <IconCozInfoCircle />
      </Tooltip>
    </div>
    <div className={s.extra} onClick={e => e.stopPropagation()}>
      {extra}
    </div>
  </div>
);
