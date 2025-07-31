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

import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tag, Tooltip, Typography } from '@coze-arch/coze-design';

import css from './item.module.less';

export interface FieldItemProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  tag?: React.ReactNode;
  tooltip?: React.ReactNode;
  feedback?: string;
  required?: boolean;
  ['data-testid']?: string;
}

export const FieldItem: React.FC<React.PropsWithChildren<FieldItemProps>> = ({
  title,
  required,
  tooltip,
  tag,
  description,
  children,
  feedback,
  ...props
}) => (
  <div className={css['field-item']} data-testid={props['data-testid']}>
    {/* title */}
    <div className={css['item-title']}>
      <div className={css['item-label']}>
        <Typography.Text className={css['title-text']} strong size="small">
          {title}
        </Typography.Text>
        {required ? (
          <Typography.Text className={css['title-required']}>*</Typography.Text>
        ) : null}
        {tooltip ? (
          <Tooltip content={tooltip}>
            <IconCozInfoCircle className={css['tooltip-icon']} />
          </Tooltip>
        ) : null}

        {tag ? (
          <Tag className={css['item-tag']} size="mini" color="primary">
            {tag}
          </Tag>
        ) : null}
      </div>
      {description ? (
        <Typography.Text
          ellipsis={{
            showTooltip: {
              opts: {
                position: 'left',
                style: {
                  maxWidth: 500,
                },
              },
            },
          }}
          className={css['item-description']}
          size="small"
        >
          {description}
        </Typography.Text>
      ) : null}
    </div>
    {/* children */}
    <div>{children}</div>
    {/* feedback */}
    {feedback ? <div className={css['item-feedback']}>{feedback}</div> : null}
  </div>
);
