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

import { isAppleDevice } from './device';

const BaseKey: Record<string, string> = {
  RIGHTARROW: '→',
  LEFTARROW: '←',
  UPARROW: '↑',
  DOWNARROW: '↓',
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  SPACE: 'Space',
  SHIFT: '⇧',
  PERIOD: '.',
  SLASH: '/',
  BACKSLASH: '\\',
  EQUALS: '=',
  MINUS: '-',
  BRACKETLEFT: '[',
  BRACKETRIGHT: ']',
  QUOTE: "'",
  SEMICOLON: ';',
  BACKQUOTE: '`',
  OPENBRACKET: '[',
  CLOSEBRACKET: ']',
  COMMA: ',',
};

const ControlKey: Record<string, string> = isAppleDevice
  ? {
      ...BaseKey,
      META: '⌘',
      OPTION: '⌥',
      ALT: '⌥',
      CONTROL: '^',
    }
  : {
      ...BaseKey,
      META: 'Alt',
      CAPSLOCK: '⇪',
      CTRL: 'Ctrl',
      ALT: 'Alt',
    };

export const getKeyLabel = (keyString: string): string[] =>
  keyString.split(/\s+/).map(key => {
    const k = key.toLocaleUpperCase();
    return ControlKey[k] || k;
  });
