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

import { useResizableSidePanelStore } from '@/hooks/use-resizable-side-panel-store';
import { useFloatLayoutSize } from '@/hooks';

import { getConstraintWidth } from './utils';
import { MAX_WIDTH } from './constants';

const PADDING = 16;

export function useSidePanelWidth(): { max: number; width: number } {
  const storeWidth = useResizableSidePanelStore(state => state.width);
  const { width: layoutWidth } = useFloatLayoutSize();
  const maxLayoutWidth = layoutWidth ? layoutWidth - PADDING : 0;
  const max = maxLayoutWidth ? Math.min(maxLayoutWidth, MAX_WIDTH) : MAX_WIDTH;
  const width = getConstraintWidth(storeWidth, max);

  return {
    max,
    width,
  };
}
