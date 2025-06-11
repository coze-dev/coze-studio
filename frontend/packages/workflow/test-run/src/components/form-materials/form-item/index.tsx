/**
 * test run test form 布局的 FormItem
 */
import React, { type FC, type ReactNode, type PropsWithChildren } from 'react';

import { connect, mapProps } from '@formily/react';
import { isDataField } from '@formily/core';
import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tooltip, Typography, Tag } from '@coze/coze-design';

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
