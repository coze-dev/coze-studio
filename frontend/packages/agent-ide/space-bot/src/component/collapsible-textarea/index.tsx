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
  // 一种特殊的针对placeholder处理方式，::placeholder达不到预期
  emptyClassName?: string;
}
interface ChatflowCustomTextareaProps extends TextAreaProps {
  value: string;
  onChange: (
    value: string,
    e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>,
  ) => void;
  /** 展示模式（即需要省略时）的配置  */
  ellipse?: {
    rows?: number;
  } & CommonTextareaType;
  /** 编辑模式（即需要自动适应）的配置 */
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
        // 加timeout可以实现focus的时候滚动到最底并光标在最后
        setTimeout(() => {
          if (textAreaRef.current) {
            // 默认光标在最后
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
            // key是保证readonly变化后重新渲染
            key="not-readonly"
            style={
              autoSize?.maxHeight
                ? // 这里的 style 会应用到 wrapper 上，不限定高度时会意外出现滚动条，只能通过变量修改 textarea 的 overflow
                  // 此外，max-height 会导致预期外的 blur 事件，也只能通过 css 变量将 max-height 动态传给 textarea
                  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- 传递 css 变量
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
          // key是保证readonly变化后重新渲染
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
