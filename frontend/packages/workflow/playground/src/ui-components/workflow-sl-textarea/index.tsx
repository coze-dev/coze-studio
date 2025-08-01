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
  useState,
  useRef,
  type ForwardedRef,
} from 'react';

import cs from 'classnames';
import { TextArea } from '@coze-arch/coze-design';
import { sleep } from '@coze-arch/bot-utils';
import { type TooltipProps } from '@coze-arch/bot-semi/Tooltip';
import { type TextAreaProps } from '@coze-arch/bot-semi/Input';

import AutoSizeTooltip from '../auto-size-tooltip';

import s from './index.module.less';

export interface WorkflowSLTextAreaRefType {
  triggerFocus?: () => void;
}

export type WorkflowSLTextAreaProps = ComponentProps<typeof TextArea> & {
  value: string | undefined;
  onRef?: ForwardedRef<WorkflowSLTextAreaRefType>;
  handleChange?: (v: string) => void;
  handleBlur?: () => void;
  handleFocus?: () => void;
  ellipsisTooltipProps?: TooltipProps;
  onFocusTooltipProps?: TooltipProps;
  inputFocusProps: TextAreaProps;
  inputBlurProps?: TextAreaProps;
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
  const { value, handleChange, inputFocusProps, inputBlurProps, disabled } =
    props;

  const [focus, setFocus] = useState<boolean>(false);

  const selectionCacheRef = useRef<number>();
  const focusInputRef = useRef<HTMLTextAreaElement>(null);
  const blurInputRef = useRef<HTMLTextAreaElement>(null);

  const hasEllipsis = (() => {
    const clientHeight =
      blurInputRef.current?.clientHeight ||
      focusInputRef.current?.clientHeight ||
      0;
    const scrollHeight =
      blurInputRef.current?.scrollHeight ||
      focusInputRef.current?.scrollHeight ||
      0;

    return clientHeight < scrollHeight - 1 && (value as string).length > 0;
  })();

  /* In the non-focus state, it is only used for display, and tooltip is provided when overflowing. */
  const InputDisplay = () => {
    const handleFocus = async () => {
      // 1. Get the cursor position, focus to the same position
      await sleep(50);
      selectionCacheRef.current = blurInputRef.current?.selectionStart;
      setFocus(true);

      // 2. Trigger the focus of the real input component
      await sleep(50);
      focusInputRef.current?.focus();
    };

    if (!hasEllipsis) {
      return (
        <TextArea
          className={s['text-input-placeholder']}
          {...inputBlurProps}
          ref={blurInputRef}
          value={value}
          onFocus={handleFocus}
          disabled={disabled}
        />
      );
    }
    return (
      <AutoSizeTooltip
        content={
          <article
            style={{
              wordWrap: 'break-word',
              wordBreak: 'normal',
              textAlign: 'left',
            }}
          >
            {value}
          </article>
        }
        position={'top'}
        showArrow
        mouseEnterDelay={300}
        trigger="hover"
      >
        <TextArea
          className={s['.text-input-placeholder']}
          {...inputBlurProps}
          ref={blurInputRef}
          value={value}
          onFocus={handleFocus}
          disabled={disabled}
        />
      </AutoSizeTooltip>
    );
  };

  return (
    <div className={cs(s['input-wrapper'], props.className)}>
      <div className={cs(props?.errorMsg ? s['error-wrapper'] : null)}>
        {!focus ? (
          <InputDisplay />
        ) : (
          <TextArea
            {...inputFocusProps}
            ref={focusInputRef}
            value={value}
            onChange={handleChange}
            onFocus={() => {
              if (selectionCacheRef.current !== undefined) {
                focusInputRef.current?.setSelectionRange(
                  selectionCacheRef.current,
                  selectionCacheRef.current,
                );

                selectionCacheRef.current = undefined;
              }
              props.handleFocus?.();
            }}
            onBlur={() => {
              setFocus(false);
              props.handleBlur?.();
            }}
            disabled={disabled}
          />
        )}
      </div>

      {props?.errorMsg ? (
        <div
          className={cs(
            s['error-content'],
            props?.errorMsgFloat ? s['error-float'] : null,
          )}
        >
          <div className={s['error-text']}>{props?.errorMsg}</div>
        </div>
      ) : null}
    </div>
  );
}
