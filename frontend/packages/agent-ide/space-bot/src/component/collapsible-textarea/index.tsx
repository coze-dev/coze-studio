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
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
} from 'react';

import { nanoid } from 'nanoid';
import classNames from 'classnames';
import { useBoolean } from 'ahooks';
import { type TextAreaProps } from '@coze-arch/bot-semi/Input';
import { TextArea } from '@coze-arch/bot-semi';

import styles from './index.module.less';

interface CommonTextareaType {
  textAreaClassName?: string;
  textAreaProps?: Partial<TextAreaProps>;
  // A special treatment for placeholders, where:: placeholders do not meet expectations
  emptyClassName?: string;
}
interface ChatflowCustomTextareaProps extends TextAreaProps {
  value: string;
  onChange: (
    value: string,
    e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>,
  ) => void;
  /** Configuration of presentation mode (i.e. when omitted)  */
  ellipse?: {
    rows?: number;
  } & CommonTextareaType;
  /** Configuration of editing mode (i.e. requires automatic adaptation) */
  autoSize?: {
    maxHeight?: number;
  } & CommonTextareaType;
  readonly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CollapsibleTextarea = forwardRef(
  (
    {
      value,
      onChange,
      onBlur,
      ellipse = { rows: 4 },
      autoSize = { maxHeight: 340 },
      readonly,
      className,
      style,
      maxCount,
      maxLength,
      onFocus,
      ...restCommonTextAreaProps
    }: ChatflowCustomTextareaProps,
    ref: ForwardedRef<HTMLTextAreaElement>,
  ) => {
    const textAreaId = useMemo(() => nanoid(), []);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const [focused, { setTrue: setFocusedTrue, setFalse: setFocusedFalse }] =
      useBoolean(false);

    useImperativeHandle(ref, () => ({
      ...(textAreaRef.current as HTMLTextAreaElement),
      focus: () => setFocusedTrue(),
    }));

    useEffect(() => {
      if (focused) {
        // Add timeout to scroll to the bottom and cursor at the end when focusing.
        setTimeout(() => {
          if (textAreaRef.current) {
            // Default cursor at the end
            textAreaRef.current.setSelectionRange(
              Number.MAX_SAFE_INTEGER,
              Number.MAX_SAFE_INTEGER,
            );
            textAreaRef.current.focus();
            textAreaRef.current.scroll({ top: textAreaRef.current.scrollTop });
          }
        });
      }
    }, [focused]);

    const renderTextArea = () => {
      if (focused) {
        return (
          <TextArea
            autosize
            // The key is to ensure readonly after changes
            key="not-readonly"
            style={
              autoSize?.maxHeight
                ? // The style here will be applied to the wrapper, and the scroll bar will appear unexpectedly when the height is not limited. You can only modify the overflow of the textarea through variables.
                  // In addition, max-height causes an unexpected blur event, and max-height can only be dynamically passed to textarea through the css variable
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- pass css variable
                  ({
                    '--chatflow-custom-textarea-overflow-y': 'auto',
                    '--chatflow-custom-textarea-focused-max-height': `${autoSize.maxHeight}px`,
                  } as CSSProperties)
                : undefined
            }
            id={textAreaId}
            ref={textAreaRef}
            value={value}
            onBlur={e => {
              setFocusedFalse();
              onBlur?.(e);
            }}
            onChange={onChange}
            readonly={readonly}
            className={classNames(
              styles['auto-size'],
              autoSize?.textAreaClassName,
              { [autoSize?.emptyClassName || '']: !value },
            )}
            maxCount={maxCount}
            maxLength={maxLength}
            {...restCommonTextAreaProps}
            {...autoSize?.textAreaProps}
          />
        );
      }
      return (
        <TextArea
          // The key is to ensure readonly after changes
          key="readonly"
          style={{ WebkitLineClamp: ellipse?.rows }}
          value={value}
          rows={ellipse?.rows}
          onFocus={e => {
            onFocus?.(e);
            setFocusedTrue();
          }}
          className={classNames(styles.ellipse, ellipse?.textAreaClassName, {
            [ellipse?.emptyClassName || '']: !value,
          })}
          {...restCommonTextAreaProps}
          {...ellipse?.textAreaProps}
        />
      );
    };

    return (
      <div className={classNames(styles.container, className)} style={style}>
        {renderTextArea()}
      </div>
    );
  },
);
