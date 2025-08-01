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

import { IconInfo } from '@coze-arch/bot-icons';
import { Popover } from '@coze-arch/coze-design';

import styles from './index.module.less';

interface TitleAreaProps {
  title: string;
  tipStyle?: Record<string, string | number>;
  tip?: string | React.ReactNode;
}

export function TitleArea({ title, tip, tipStyle = {} }: TitleAreaProps) {
  return (
    <div className={styles['title-area']}>
      {title}
      {!!tip && (
        <Popover
          showArrow
          position="top"
          zIndex={1031}
          style={{
            maxWidth: '276px',
            ...tipStyle,
          }}
          content={tip}
        >
          <IconInfo className={styles['title-area-icon']} />
        </Popover>
      )}
    </div>
  );
}
