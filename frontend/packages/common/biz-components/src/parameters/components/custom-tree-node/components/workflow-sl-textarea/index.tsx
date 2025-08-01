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

/* eslint-disable @coze-arch/max-line-per-function */
import React, {
  type ComponentProps,
  useRef,
  useImperativeHandle,
  useMemo,
  useEffect,
  type ForwardedRef,
} from 'react';

import cs from 'classnames';
import { useReactive } from 'ahooks';
import { type TooltipProps } from '@coze-arch/bot-semi/Tooltip';
import { type TextAreaProps } from '@coze-arch/bot-semi/Input';
import { TextArea } from '@coze-arch/bot-semi';

import AutoSizeTooltip from '../auto-size-tooltip';

import s from './index.module.less';

export interface WorkflowSLTextAreaRefType {
  triggerFocus?: () => void;
}

export type WorkflowSLTextAreaProps = ComponentProps<typeof TextArea> & {
  value: string | undefined;
  onRef?: ForwardedRef<WorkflowSLTextAreaRefType>;
  ellipsis?: boolean;
  handleChange?: (v: string) => void;
  handleBlur?: (v: string) => void;
  handleFocus?: (v: string) => void;
  ellipsisTooltipProps?: TooltipProps;
  onFocusTooltipProps?: TooltipProps;
  textAreaProps?: TextAreaProps;
  errorMsg?: string;
  errorMsgFloat?: boolean;
  disabled?: boolean;
};

/**
 * @Component TextArea secondary encapsulation in Workflow scenarios;
 * When focusing (inputting), it provides multi-line scrolling input capability, and when blur, it provides ellipsis and tooltip prompt capability.
 */
export default function WorkflowSLTextArea(props: WorkflowSLTextAreaProps) {
  const { ellipsis = true } = props;
  useImperativeHandle(props.onRef, () => ({
    triggerFocus,
  }));
  const $state = useReactive({
    value: props.value,
    inputOnFocus: false,
    inputHover: false,
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const triggerFocus = () => {
    $state.inputOnFocus = true;
    textAreaRef?.current?.focus();
  };

  const onFocus = () => {
    $state.inputOnFocus = true;
    props?.handleFocus?.($state.value || '');
  };

  const onBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    $state.inputOnFocus = false;
    props?.handleBlur?.($state.value || '');
    props?.onBlur?.(e);
    // When out of focus, scroll to the top
    if (textAreaRef?.current) {
      textAreaRef.current.scrollTop = 0;
    }
  };

  const onChange = (v: string) => {
    $state.value = v;
    props?.handleChange?.(v);
  };

  // Input method input end
  const onCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;

    if (
      props.textAreaProps?.maxCount &&
      (target.textLength || 0) > props.textAreaProps?.maxCount
    ) {
      const v = target.value?.slice(0, props.textAreaProps?.maxCount);
      $state.value = v;
      props?.handleChange?.(v);
    }
  };

  const hasEllipsis = useMemo(() => {
    const clientHeight = textAreaRef.current?.clientHeight || 0;
    const scrollHeight = textAreaRef.current?.scrollHeight || 0;
    return clientHeight < scrollHeight - 1;
  }, [
    ellipsis,
    $state.inputOnFocus,
    $state.value,
    textAreaRef.current?.clientHeight,
    textAreaRef.current?.scrollHeight,
    props.textAreaProps?.rows,
  ]);

  useEffect(() => {
    $state.value = props.value;
  }, [props.value]);

  /** Is it in an out-of-focus thumbnail state? */
  const ellipsisWithBlur = useMemo(
    () => !$state.inputOnFocus && hasEllipsis,
    [hasEllipsis, $state.inputOnFocus],
  );

  const showTooltip = useMemo(
    () =>
      ellipsisWithBlur
        ? Boolean($state.value) && $state.inputHover
        : Boolean(props.onFocusTooltipProps?.content) && $state.inputOnFocus,
    [
      ellipsisWithBlur,
      $state.inputHover,
      $state.inputOnFocus,
      props.onFocusTooltipProps?.content,
    ],
  );

  return (
    <div className={cs(s['input-wrapper'], props.className)}>
      <AutoSizeTooltip
        content={
          <article
            style={{
              maxWidth: 200,
              wordWrap: 'break-word',
              wordBreak: 'normal',
              textAlign: 'left',
            }}
          >
            {$state.value}
          </article>
        }
        position={'top'}
        showArrow
        mouseEnterDelay={300}
        trigger="custom"
        visible={showTooltip}
        {...(ellipsisWithBlur
          ? props.ellipsisTooltipProps
          : props.onFocusTooltipProps)}
      >
        <div
          className={cs(props?.errorMsg ? s['error-wrapper'] : null)}
          onMouseEnter={() => {
            $state.inputHover = true;
          }}
          onMouseLeave={() => {
            $state.inputHover = false;
          }}
        >
          <TextArea
            {...props.textAreaProps}
            ref={textAreaRef}
            value={$state.value}
            className={
              ellipsis
                ? !$state.inputOnFocus
                  ? s['input-blur']
                  : s.inputting
                : ''
            }
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={props.disabled}
            onCompositionEnd={onCompositionEnd}
          ></TextArea>
        </div>
      </AutoSizeTooltip>

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
