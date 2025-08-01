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

import React, { type ReactNode, type CSSProperties } from 'react';

import classNames from 'classnames';
import { Space } from '@coze-arch/bot-semi';

import s from './index.module.less';

export interface LinkListItem {
  extra?: string;
  icon?: ReactNode;
  label: string;
  link?: string;
  onClick?: () => void;
}

export const LinkList = ({
  className,
  style,
  data,
  pointerClassName,
  itemClassName,
}: {
  className?: string;
  style?: CSSProperties;
  data: LinkListItem[];
  pointerClassName?: string;
  itemClassName?: string;
}) => (
  <div className={classNames(s['link-list'], className)} style={style}>
    {data?.map(item => (
      <div
        className={classNames(s['link-list-item'], itemClassName)}
        key={`link-list-${item.label}`}
      >
        {!!item.extra && <span style={{ marginRight: 4 }}>{item.extra}</span>}
        <div
          className={classNames(
            s['click-area'],
            (item.link || item.onClick) && s.pointer,
            (item.link || item.onClick) && pointerClassName,
          )}
          onClick={() => {
            if (item.link) {
              window.open(item.link);
            } else {
              item.onClick?.();
            }
          }}
        >
          <Space spacing={4}>
            {item.icon}
            {item.label}
          </Space>
        </div>
      </div>
    ))}
  </div>
);
