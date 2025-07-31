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

import { getKeyLabel, isKeyStringMatch } from '../utils';

export interface Keybinding {
  /**
   * Associated command, the command executed after the keybinding is triggered
   */
  command: string;
  /**
   * Associated shortcuts, like: meta c
   */
  keybinding: string;
  /**
   * Whether to block the browser's default behavior
   */
  preventDefault?: boolean;
  /**
   * Keybinding triggering context, associated with the contextkey service
   */
  when?: string;
  /**
   * Parameters to trigger commands via keybinding
   */
  args?: any;
}

/**
 * KiyBinding related export method
 */
export namespace Keybinding {
  /**
   * Match keyboard event whether macth shortcut configuration
   */
  export const isKeyEventMatch = isKeyStringMatch;

  export const getKeybindingLabel = getKeyLabel;
}
