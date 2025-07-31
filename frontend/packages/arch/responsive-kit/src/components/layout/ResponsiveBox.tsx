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

import classNames from 'classnames';

import { tokenMapToStr } from '../../utils/token-map-to-str';
import { type ResponsiveTokenMap } from '../../types';
import { type ScreenRange } from '../../constant';

interface ResponsiveBoxProps {
  contents: React.ReactNode[]; // array of content
  colReverse?: boolean; // direction is col or col-reverse
  rowReverse?: boolean; // direction is row or row-reverse
  gaps?: ResponsiveTokenMap<ScreenRange>;
}
export const ResponsiveBox = ({
  contents = [],
  colReverse = false,
  rowReverse = false,
  gaps,
}: ResponsiveBoxProps) => (
  <div
    className={classNames(
      'w-full flex overflow-hidden',
      colReverse
        ? 'flex-col-reverse sm:flex-col-reverse'
        : 'flex-col sm:flex-col',
      rowReverse
        ? 'md:flex-row-reverse lg:flex-row-reverse'
        : 'md:flex-row lg:flex-row',
      gaps && tokenMapToStr(gaps, 'gap'),
    )}
  >
    {contents}
  </div>
);

export const ResponsiveBox2 = ({
  contents = [],
  colReverse = false,
  rowReverse = false,
  gaps,
}: ResponsiveBoxProps) => (
  <div
    className={classNames(
      'w-full flex overflow-hidden',
      colReverse ? 'flex-col-reverse' : 'flex-col',
      rowReverse ? 'lg:flex-row-reverse' : 'lg:flex-row',
      gaps && tokenMapToStr(gaps, 'gap'),
    )}
  >
    {contents}
  </div>
);
