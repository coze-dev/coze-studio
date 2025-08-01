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
import { type StorageLocation } from '@coze-arch/idl/knowledge';

import { type CustomSegmentRule, type SegmentMode } from '@/types';
import { validateSegmentRules } from '@/features/knowledge-type/text/utils';

export function getButtonNextStatus(params: {
  segmentMode: SegmentMode;
  segmentRule: CustomSegmentRule;
  storageLocation: StorageLocation;
  testConnectionSuccess: boolean;
}): FooterBtnStatus {
  const segmentValid = validateSegmentRules(
    params.segmentMode,
    params.segmentRule,
  );
  return segmentValid ? FooterBtnStatus.ENABLE : FooterBtnStatus.DISABLE;
}
