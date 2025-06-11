import React from 'react';

import { IconCozInfoCircle } from '@coze/coze-design/icons';
import { Tag, Tooltip, Typography } from '@coze/coze-design';

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
