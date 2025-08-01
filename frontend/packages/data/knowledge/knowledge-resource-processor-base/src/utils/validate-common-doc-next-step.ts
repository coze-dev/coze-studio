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

import { FooterBtnStatus } from '@coze-data/knowledge-resource-processor-core';

import { type CustomSegmentRule, SegmentMode, SeperatorType } from '../types';

export const validateCommonDocResegmentStep = (
  segmentMode: SegmentMode,
  segmentRule: CustomSegmentRule,
): FooterBtnStatus => {
  if (segmentMode === SegmentMode.CUSTOM) {
    const maxTokens = segmentRule?.maxTokens || 0;
    const separator = segmentRule?.separator;
    const isCustomSeperatorEmpty =
      separator?.type === SeperatorType.CUSTOM && !separator?.customValue;

    if (
      maxTokens === 0 ||
      isCustomSeperatorEmpty ||
      typeof segmentRule.overlap !== 'number' ||
      Number.isNaN(segmentRule.overlap)
    ) {
      return FooterBtnStatus.DISABLE;
    }
  }

  return FooterBtnStatus.ENABLE;
};
