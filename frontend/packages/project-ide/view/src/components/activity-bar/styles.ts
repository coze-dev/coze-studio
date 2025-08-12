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

import { useStyling as useStylingCore } from '@coze-project-ide/core';

export const useStyling = () => {
  useStylingCore(
    'flowide-activity-bar-widget',
    (_, { getColor }) => `
    .activity-bar-widget-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;

      .top-container, .bottom-container {
        display: flex;
        flex-direction: column;
      }

      .item-container {
        cursor: pointer;
        position: relative;
        color: ${getColor('flowide.color.base.text.2')};
      }
      .item-container.active {
        color: ${getColor('flowide.color.base.text.0')};
      }
      .item-container.selected {
        color: ${getColor('flowide.color.base.text.0')};
      }
      .item-container.selected::before {
        content: "";
        position: absolute;
        width: 2px;
        height: 100%;
        background: ${getColor('flowide.color.base.primary')};
      }
      .item-container:hover {
        color: ${getColor('flowide.color.base.text.0')};
      }

      .item-container > i {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        text-align: center;
        color: inherit;

        width: 36px;
        height: 36px;
        mask-repeat: no-repeat;
        -webkit-mask-repeat: no-repeat;
        mask-size: 24px;
        -webkit-mask-size: 24px;
        mask-position: 50% 50%;
        -webkit-mask-position: 50% 50%;
      }
    }`,
  );
};
