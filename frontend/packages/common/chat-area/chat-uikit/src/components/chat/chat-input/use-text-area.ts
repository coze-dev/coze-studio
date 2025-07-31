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

import {
  useState,
  type KeyboardEvent,
  useRef,
  useEffect,
  type KeyboardEventHandler,
  type CompositionEvent,
} from 'react';

import { type TextAreaRef } from 'rc-textarea';
import {
  type InputNativeCallbacks,
  type InputController,
  type InputState,
} from '@coze-common/chat-uikit-shared';
import { useImperativeLayoutEffect } from '@coze-common/chat-hooks';

type KeyboardGeneralEvent = KeyboardEvent<HTMLElement>;

// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function -- x.x
export const useTextSend = ({
  onSubmit,
  defaultValue = '',
  allowEmpty = false,
  onBeforeSubmit,
  isDisabled = false,
  inputNativeCallbacks = {},
}: {
  onSubmit: (text: string) => void;
  defaultValue?: string;
  /**
   * Whether to allow empty string submission
   * @default false
   */
  allowEmpty?: boolean;
  onBeforeSubmit?: () => boolean;
  isDisabled?: boolean;
  inputNativeCallbacks?: InputNativeCallbacks;
}) => {
  const [inputText, setInputText] = useState(defaultValue);
  const composingRef = useRef(false);
  const rcTextareaRef = useRef<TextAreaRef>(null);
  const selectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });
  const getTextarea = () => rcTextareaRef.current?.resizableTextArea.textArea;
  const waitAndUpdateSelectPos = useImperativeLayoutEffect(() =>
    updateSelectPos(),
  );

  const readState = (): InputState => {
    const state: InputState = {
      inputText,
      isComposing: composingRef.current,
      isDisabled,
      selection: selectionRef.current,
      hasSelection: selectionRef.current.start !== selectionRef.current.end,
    };
    return state;
  };
  const readStateRef = useRef<() => InputState>();
  readStateRef.current = readState;

  useEffect(() => {
    if (!inputNativeCallbacks.getController) {
      return;
    }
    const controller: InputController = {
      requireSetMousePosition,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- .
      readState: () => readStateRef.current!(),
      setInputText: (updater: string | ((pre: string) => string)) => {
        setInputText(updater);
        waitAndUpdateSelectPos();
      },
      focus: () => {
        getTextarea()?.focus();
      },
    };
    inputNativeCallbacks.getController(controller);
  }, [inputNativeCallbacks.getController]);

  const requireSetMousePosition = useImperativeLayoutEffect((pos: number) => {
    const textarea = getTextarea();
    if (!textarea) {
      return;
    }
    textarea.focus();
    textarea.setSelectionRange(pos, pos);
  });

  const updateSelectPos = () => {
    const textarea = getTextarea();
    if (!textarea) {
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    selectionRef.current = { start, end };
  };

  const submit = () => {
    if (!allowEmpty && !inputText.trim()) {
      return;
    }

    if (isDisabled) {
      return;
    }
    if (onBeforeSubmit && !onBeforeSubmit()) {
      return;
    }

    onSubmit(inputText);

    setInputText('');
  };

  const onKeydownToSubmit = (evt: KeyboardGeneralEvent) => {
    if (evt.code !== 'Enter') {
      return;
    }

    if (composingRef.current || isPressEnterToChangeLine(evt)) {
      return;
    }
    evt.preventDefault();

    submit();
  };

  const onKeyUp: KeyboardEventHandler<HTMLTextAreaElement> = e => {
    updateSelectPos();
    inputNativeCallbacks.onAfterProcessKeyUp?.(e);
  };

  const onKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>) => {
    updateSelectPos();
    const res = inputNativeCallbacks.onBeforeProcessKeyDown?.(evt);
    if (res?.exit) {
      return;
    }

    if ((evt.metaKey || evt.altKey || evt.ctrlKey) && evt.code === 'Enter') {
      handleNewLine();
      return;
    }

    onKeydownToSubmit(evt);
  };

  const handleNewLine = () => {
    const textarea = getTextarea();
    if (!textarea) {
      return;
    }

    // Calculate the current position of the cursor
    const cursorPosition = textarea.selectionStart;

    // Inserts a new row at the cursor position
    const newValue = `${inputText.substring(
      0,
      cursorPosition,
    )}\n${inputText.substring(cursorPosition)}`;

    setInputText(newValue);

    setTimeout(() => {
      textarea.selectionStart = cursorPosition + 1;
      textarea.selectionEnd = cursorPosition + 1;
    }, 0);
  };

  const onChange = (evt: { target: { value: string } }) => {
    updateSelectPos();
    const val = evt.target.value;
    setInputText(val);
    Promise.resolve().then(() => {
      inputNativeCallbacks?.onAfterOnChange?.();
    });
  };

  return {
    onChange,
    setIsComposing: (
      _: CompositionEvent<HTMLTextAreaElement>,
      composing: boolean,
    ) => {
      composingRef.current = composing;
    },
    submit,
    onKeyDown,
    inputText,
    setInputText,
    rcTextareaRef,
    updateSelectPos,
    onKeyUp,
  };
};

const isPressEnterToChangeLine = (evt: KeyboardGeneralEvent) => {
  if (evt.code !== 'Enter') {
    return false;
  }
  return evt.shiftKey || evt.altKey || evt.metaKey;
};
