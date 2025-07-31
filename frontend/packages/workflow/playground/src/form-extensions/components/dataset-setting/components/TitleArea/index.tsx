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

import { Tooltip } from '@coze-arch/coze-design';
import { IconInfo } from '@coze-arch/bot-icons';

import s from './index.module.less';

interface TitleAreaProps {
  title: string;
  tip?: string;
  titleClassName?: string;
}
export const TitleArea: React.FC<TitleAreaProps> = ({
  title,
  tip,
  titleClassName,
}) => (
  <div className={s['title-area']}>
    <span className={titleClassName}>{title}</span>
    {!!tip && (
      <Tooltip
        showArrow
        position="top"
        style={{
          maxWidth: '380px',
          padding: '8px 12px',
          borderRadius: '6px',
        }}
        content={tip}
      >
        <IconInfo className={s['title-area-icon']} />
      </Tooltip>
    )}
  </div>
);
