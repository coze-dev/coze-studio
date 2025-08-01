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

import { InteractiveType } from './mouse-pad-selector';
import { CACHE_KEY, SHOW_KEY, IS_MAC_OS } from './constants';

export const getPreferInteractiveType = () => {
  const data = localStorage.getItem(CACHE_KEY) as string;
  if (
    data &&
    [InteractiveType.Mouse, InteractiveType.Pad].includes(
      data as InteractiveType,
    )
  ) {
    return data;
  }
  return IS_MAC_OS ? InteractiveType.Pad : InteractiveType.Mouse;
};

/** Record the selected interaction mode */
export const setPreferInteractiveType = (type: InteractiveType) => {
  localStorage.setItem(CACHE_KEY, type);
};

export const hideGuidingPopover = () => {
  localStorage.setItem(SHOW_KEY, 'true');
};

export const needShowGuidingPopover = () => {
  const data = localStorage.getItem(SHOW_KEY) as string;
  return data !== 'true';
};
