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
import { type InputProps } from '@coze-arch/bot-semi/Input';
import { UIInput } from '@coze-arch/bot-semi';

import AutoSizeTooltip from '../auto-size-tooltip';

import s from './index.module.less';

export interface WorkflowSLInputRefType {
  triggerFocus?: () => void;
}

export type WorkflowSLInputProps = ComponentProps<typeof UIInput> & {
  value: string | undefined;
  onRef?: ForwardedRef<WorkflowSLInputRefType>;
  ellipsis?: boolean;
  handleChange?: (v: string) => void;
  handleBlur?: (v: string) => void;
  handleFocus?: (v: string) => void;
  ellipsisTooltipProps?: TooltipProps;
  onFocusTooltipProps?: TooltipProps;
  tooltipProps?: TooltipProps;
  inputProps?: InputProps;
  errorMsg?: string;
  errorMsgFloat?: boolean;
  maxCount?: number;
  className?: string;
  style?: React.CSSProperties;
};

const SL_INPUT_TIMEOUT = 10;

export default function WorkflowSLInput(props: WorkflowSLInputProps) {
  const { ellipsis = true, maxCount } = props;
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
      }, SL_INPUT_TIMEOUT);
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
        <AutoSizeTooltip
          content={$state.value}
          position={'top'}
          showArrow
          mouseEnterDelay={300}
          {...props.tooltipProps}
        >
          <div
            className={cs(props?.errorMsg ? s['error-wrapper'] : null)}
            onClick={onclick}
          >
            <UIInput
              {...props.inputProps}
              validateStatus={props.validateStatus}
              ref={inputRef}
              value={$state.value}
              className={ellipsis ? s.input : ''}
              suffix={showCount ? LimitCountNode : undefined}
            ></UIInput>
          </div>
        </AutoSizeTooltip>
      ) : (
        <div className={cs(props?.errorMsg ? s['error-wrapper'] : null)}>
          <AutoSizeTooltip
            {...props.onFocusTooltipProps}
            trigger="custom"
            visible={
              Boolean(props.onFocusTooltipProps?.content) && $state.inputOnFocus
            }
            showArrow
          >
            <UIInput
              {...props.inputProps}
              validateStatus={props.validateStatus}
              ref={inputRef}
              value={$state.value}
              className={ellipsis ? s.input : ''}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              suffix={showCount ? LimitCountNode : undefined}
            ></UIInput>
          </AutoSizeTooltip>
        </div>
      )}
      {props?.errorMsg && (
        <div
          className={cs(
            s['error-content'],
            props?.errorMsgFloat ? s['error-float'] : null,
          )}
        >
          <div className={s['error-text']}>{props?.errorMsg}</div>
        </div>
      )}
    </div>
  );
}
