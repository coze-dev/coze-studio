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

import { type KeyboardEvent, type KeyboardEventHandler } from 'react';

export interface InputState {
  inputText: string;
  isComposing: boolean;
  isDisabled: boolean;
  selection: { start: number; end: number };
  hasSelection: boolean;
}

export interface InputController {
  readState: () => InputState;
  /**
   * by imperative layoutEffect
   */
  requireSetMousePosition: (pos: number) => void;
  setInputText: (updater: string | ((pre: string) => string)) => void;
  focus: () => void;
}

type ProcessRet =
  | {
      exit: boolean;
    }
  | undefined;

export type OnBeforeProcessKeyDown = (
  evt: KeyboardEvent<HTMLTextAreaElement>,
) => ProcessRet;

export interface InputNativeCallbacks {
  onAfterProcessKeyUp?: KeyboardEventHandler<HTMLTextAreaElement>;
  onBeforeProcessKeyDown?: OnBeforeProcessKeyDown;
  getController?: (controller: InputController) => void;
  /**
   * Fired after onChange, but waiting for a promise to avoid closure issues
   */
  onAfterOnChange?: () => void;
}
