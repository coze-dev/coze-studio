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

import React, {
  type FC,
  type ReactNode,
  type CSSProperties,
  type PropsWithChildren,
} from 'react';

import classNames from 'classnames';
import { type WithCustomStyle } from '@coze-workflow/base/types';
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Row, Col } from '@coze-arch/coze-design';
import { type ColProps } from '@coze-arch/bot-semi/Grid';

import {
  FormItemFeedback,
  type FormItemErrorProps,
} from '../form-item-feedback';
import AutoSizeTooltip from '../../../ui-components/auto-size-tooltip';

import s from './index.module.less';

export interface FormItemProps {
  required?: boolean;
  hideRequiredTag?: boolean;
  layout?: 'horizontal' | 'vertical';
  label?: ReactNode;
  tooltip?: ReactNode;
  tag?: ReactNode;
  labelAlign?: 'left' | 'right';
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  labelBlockStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  labelColStyle?: CSSProperties;
  labelClassName?: string;
  wrapperColStyle?: CSSProperties;
  feedbackText?: FormItemErrorProps['feedbackText'];
  feedbackStatus?: FormItemErrorProps['feedbackStatus'];
  disableFeedback?: boolean;
}

/**
 * Since the semi-ui Form does not provide a FormItem component for layout, it encapsulates a FormItem separately and continues to iterate with requirements
 */
export const FormItem: FC<
  PropsWithChildren<WithCustomStyle<FormItemProps>>
> = props => {
  const {
    className,
    style = {},
    required,
    hideRequiredTag = false,
    layout = 'horizontal',
    label,
    tooltip,
    tag,
    labelAlign = 'left',
    labelCol = {
      span: 9,
    },
    wrapperCol = {
      span: 15,
    },
    labelBlockStyle = {},
    labelStyle = {},
    labelColStyle = {},
    wrapperColStyle = {},
    labelClassName,
    feedbackText,
    feedbackStatus,
    children,
    disableFeedback = false,
  } = props;
  const renderLabelContent = () => (
    <div className="flex items-center">
      <div className="flex overflow-hidden items-center">
        <AutoSizeTooltip
          content={label}
          showArrow
          position="top"
          className="flex-1 grow-1 truncate"
        >
          <span
            className={classNames(
              'flex-1 grow-1 truncate coz-fg-primary text-[12px] leading-[24px]',
              labelClassName,
            )}
            style={labelStyle}
          >
            {label}
          </span>
        </AutoSizeTooltip>

        {required && !hideRequiredTag ? (
          <span
            className="mt-[2px]"
            style={{ color: 'var(--light-usage-danger-color-danger,#f93920)' }}
          >
            *
          </span>
        ) : null}
        {tooltip ? (
          <AutoSizeTooltip
            showArrow
            position="top"
            className={s.popover}
            content={tooltip}
          >
            <IconCozInfoCircle className="coz-fg-secondary text-xs" />
          </AutoSizeTooltip>
        ) : null}
      </div>
      {tag ? (
        <div className="flex-1 shrink-0 grow-1 flex items-center">{tag}</div>
      ) : null}
    </div>
  );

  const showLabel = !!label;
  if (layout === 'horizontal') {
    return (
      <div
        className={classNames(s.formItem, className, {
          [s.formItemHorizontal]: layout === 'horizontal',
        })}
        style={style}
      >
        <Row type="flex" align="middle">
          <Col
            {...labelCol}
            style={{
              ...{ alignSelf: 'flex-start' },
              ...labelColStyle,
            }}
          >
            <div
              className={classNames(s.formItemLabel, {
                [s.formItemLabelRight]: labelAlign === 'right',
              })}
            >
              {renderLabelContent()}
            </div>
          </Col>
          <Col {...wrapperCol} style={wrapperColStyle}>
            {children}
            {!disableFeedback && (
              <FormItemFeedback
                feedbackText={feedbackText}
                feedbackStatus={feedbackStatus}
              />
            )}
          </Col>
        </Row>
      </div>
    );
  } else {
    return (
      <div
        className={classNames(s.formItem, className, {
          [s.formItemVertical]: layout === 'vertical',
        })}
        style={style}
      >
        {showLabel ? (
          <div
            className={classNames(s.formItemLabel, {
              [s.formItemLabelRight]: labelAlign === 'right',
            })}
            style={labelBlockStyle}
          >
            {renderLabelContent()}
          </div>
        ) : null}
        <div>{children}</div>
        {!disableFeedback && (
          <FormItemFeedback
            feedbackText={feedbackText}
            feedbackStatus={feedbackStatus}
          />
        )}
      </div>
    );
  }
};
