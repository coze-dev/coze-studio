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
  type ComponentProps,
  useRef,
  useImperativeHandle,
  useMemo,
  useEffect,
  type ForwardedRef,
} from 'react';

import isNumber from 'lodash-es/isNumber';
import cs from 'classnames';
import { useReactive } from 'ahooks';
import { type TooltipProps } from '@coze-arch/bot-semi/Tooltip';
import { type PopoverProps } from '@coze-arch/bot-semi/Popover';
import { type InputProps } from '@coze-arch/bot-semi/Input';
import { Input, Popover, Tooltip } from '@coze-arch/bot-semi';

import s from './index.module.less';

export interface SLInputRefType {
  triggerFocus?: () => void;
}

export type SLInputProps = ComponentProps<typeof Input> & {
  value: string | undefined;
  onRef?: ForwardedRef<SLInputRefType>;
  ellipsis?: boolean;
  handleChange?: (v: string) => void;
  handleBlur?: (v: string) => void;
  handleFocus?: (v: string) => void;
  ellipsisPopoverProps?: PopoverProps;
  onFocusPopoverProps?: PopoverProps;
  tooltipProps?: TooltipProps;
  inputProps?: InputProps & { 'data-dtestid'?: string; 'data-testid'?: string };
  errorMsg?: string;
  errorMsgFloat?: boolean;
  maxCount?: number;
  className?: string;
  style?: React.CSSProperties;
};

export const SLInput: React.FC<SLInputProps> = props => {
  const { ellipsis = true, maxCount, errorMsgFloat } = props;
  const showCount = isNumber(maxCount) && maxCount > 0;
  useImperativeHandle(props.onRef, () => ({
    triggerFocus,
  }));
  const $state = useReactive({
    value: props.value,
    inputOnFocus: false,
    inputEle: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const triggerFocus = () => {
    $state.inputEle = true;
    inputRef?.current?.focus();
  };

  const onFocus = () => {
    $state.inputOnFocus = true;
    $state.inputEle = true;
    props?.handleFocus?.($state.value || '');
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    $state.inputOnFocus = false;
    props?.handleBlur?.($state.value || '');
    props?.onBlur?.(e);
    $state.inputEle = false;
  };

  const onChange = (v: string) => {
    $state.value = v;
    props?.handleChange?.(v);
  };

  const onclick = () => {
    if (!$state.inputEle) {
      setTimeout(() => {
        inputRef?.current?.focus();
      }, 10);
    }
    $state.inputEle = true;
  };
  const hasEllipsis = useMemo(() => {
    const clientWidth = inputRef.current?.clientWidth || 0;
    const scrollWidth = inputRef.current?.scrollWidth || 0;
    return clientWidth < scrollWidth - 1;
  }, [
    ellipsis,
    $state.inputOnFocus,
    $state.value,
    inputRef.current?.clientWidth,
    inputRef.current?.scrollWidth,
    $state.inputEle,
  ]);

  useEffect(() => {
    $state.value = props.value;
  }, [props.value]);

  const LimitCountNode = (
    <span className={s['limit-count']}>
      {$state.value?.length || 0}/{maxCount}
    </span>
  );

  return (
    <div
      className={cs(s['input-wrapper'], props.className)}
      style={props.style}
    >
      {!$state.inputEle && hasEllipsis ? (
        <Tooltip
          content={
            <article
              style={{
                maxWidth: 200,
                wordWrap: 'break-word',
                wordBreak: 'normal',
              }}
            >
              {$state.value}
            </article>
          }
          position={'top'}
          showArrow
          mouseEnterDelay={300}
          {...props.tooltipProps}
        >
          <div
            className={cs(props?.errorMsg ? s['error-wrapper'] : null)}
            onClick={onclick}
          >
            <Input
              {...props.inputProps}
              ref={inputRef}
              value={$state.value}
              className={ellipsis ? s.input : ''}
              suffix={showCount ? LimitCountNode : undefined}
            ></Input>
          </div>
        </Tooltip>
      ) : (
        <div className={cs(props?.errorMsg ? s['error-wrapper'] : null)}>
          <Popover
            {...props.onFocusPopoverProps}
            trigger="custom"
            visible={
              Boolean(props.onFocusPopoverProps?.content) && $state.inputOnFocus
            }
            showArrow
          >
            <Input
              {...props.inputProps}
              ref={inputRef}
              value={$state.value}
              className={ellipsis ? s.input : ''}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              suffix={showCount ? LimitCountNode : undefined}
            ></Input>
          </Popover>
        </div>
      )}
      {props?.errorMsg ? (
        <div
          className={cs({
            [s['error-content']]: true,
            [s['error-float']]: Boolean(errorMsgFloat),
          })}
        >
          <div className={s['error-text']}>{props?.errorMsg}</div>
        </div>
      ) : null}
    </div>
  );
};
