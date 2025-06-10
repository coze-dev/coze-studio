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
   * 在 onChange 后触发，但是等待一个 Promise，避开闭包问题
   */
  onAfterOnChange?: () => void;
}
