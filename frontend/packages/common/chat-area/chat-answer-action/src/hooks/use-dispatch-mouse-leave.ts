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

import { type RefObject, useEffect } from 'react';

/**
 * Click the like and step on the button to close the reason for opening and fill in the panel.
 * When the fill panel is closed, a Reflow will be caused. At this time, the position of the like and step buttons will change, and the mouse is no longer on the button, but the corresponding button element will not penalize the mouseleave event.
 * Because the mouseleave is not triggered, the tooltip on the button does not disappear, misplaced, etc.
 * So you need to patch a mouseleave event when the panel changes visible
 */
export const useDispatchMouseLeave = (
  ref: RefObject<HTMLDivElement>,
  isFrownUponPanelVisible: boolean,
) => {
  useEffect(() => {
    ref.current?.dispatchEvent(
      new MouseEvent('mouseleave', {
        view: window,
        bubbles: true,
        cancelable: true,
      }),
    );
  }, [isFrownUponPanelVisible, ref.current]);
};
