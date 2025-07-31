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
  IconCozArrowLeftFill,
  IconCozArrowRightFill,
} from '@coze-arch/coze-design/icons';

export const LeftScrollButton = ({
  handleScroll,
}: {
  handleScroll: () => void;
}) => (
  <div
    className="absolute bottom-0 left-0 top-0 w-8 z-10"
    style={{
      background:
        'linear-gradient(90deg, #F9F9F9 0%, rgba(249, 249, 249, 0.00) 100%)',
    }}
  >
    <div
      onClick={handleScroll}
      className="w-6 h-6 coz-bg-max flex justify-center items-center absolute left-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer rounded-lg coz-stroke-primary coz-shadow-small"
    >
      <IconCozArrowLeftFill className="w-4 h-4" />
    </div>
  </div>
);

export const RightScrollButton = ({
  handleScroll,
}: {
  handleScroll: () => void;
}) => (
  <div
    className="absolute bottom-0 right-0 top-0 w-8"
    style={{
      background:
        'linear-gradient(270deg, #F9F9F9 0%, rgba(249, 249, 249, 0.00) 100%)',
    }}
  >
    <div
      onClick={handleScroll}
      className="w-6 h-6 coz-bg-max flex justify-center items-center absolute right-0 top-1/2 -translate-y-1/2 z-20 cursor-pointer rounded-lg coz-stroke-primary coz-shadow-small"
    >
      <IconCozArrowRightFill className="w-4 h-4" />
    </div>
  </div>
);
