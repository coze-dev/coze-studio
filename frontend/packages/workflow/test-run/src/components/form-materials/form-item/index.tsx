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

/**
 * Test run test form layout FormItem
 */
import React, { type FC, type ReactNode, type PropsWithChildren } from 'react';

import { connect, mapProps } from '@formily/react';
import { isDataField } from '@formily/core';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Tooltip, Typography, Tag } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface FormItemProps {
  required?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  tag?: ReactNode;
  tooltip?: ReactNode;
  feedbackText?: ReactNode;
  action?: ReactNode;
}

export const FormItemAdapter: FC<PropsWithChildren<FormItemProps>> = props => {
  const {
    required,
    label,
    feedbackText,
    description,
    tooltip,
    tag,
    action,
    children,
  } = props;

  return (
    <div className={styles['form-item']}>
      <div className={styles['form-item-label']}>
        <div className={styles['form-item-label-top']}>
          <div className={styles['top-left']}>
            <span className={styles['form-item-label-text']}>{label}</span>
            {required ? (
              <span className={styles['form-item-label-asterisk']}>*</span>
            ) : null}
            {tooltip ? (
              <Tooltip content={tooltip}>
                <IconCozInfoCircle className={styles['label-tooltip']} />
              </Tooltip>
            ) : null}

            {tag ? (
              <Tag className={styles.tag} size="mini" color="primary">
                {tag}
              </Tag>
            ) : null}
          </div>
          {action}
        </div>
        {description ? (
          <Typography.Text
            size="small"
            type="secondary"
            ellipsis={{
              showTooltip: true,
            }}
          >
            {description}
          </Typography.Text>
        ) : null}
      </div>

      <div>{children}</div>
      {feedbackText ? (
        <div className={styles['form-item-feedback-wrap']}>
          <Typography.Text
            size="small"
            className={styles['form-item-feedback-text']}
          >
            {feedbackText}
          </Typography.Text>
        </div>
      ) : null}
    </div>
  );
};

const FormItem = connect(
  FormItemAdapter,
  mapProps(
    {
      title: 'label',
      required: true,
      tag: true,
      description: true,
    } as any,
    (props, field) => ({
      ...props,
      feedbackText:
        isDataField(field) && field.selfErrors?.length
          ? field.selfErrors
          : undefined,
    }),
  ),
);

export { FormItem };
