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

import { useScrollViewSize } from '../../context/scroll-view-size';
import { usePreference } from '../../context/preference';

export const useOnboardingCenterOffset = ({
  onboardingHeight = 0,
  // Default minimum margin by ui design Top reserved 24px supported by top-safe-area
  minOffset = 0,
}: {
  onboardingHeight?: number;
  minOffset?: number;
}) => {
  const { isOnboardingCentered } = usePreference();
  const scrollViewSize = useScrollViewSize();
  if (!isOnboardingCentered) {
    return;
  }

  if (!scrollViewSize?.height) {
    return;
  }

  return Math.max((scrollViewSize.height - onboardingHeight) / 2, minOffset);
};
