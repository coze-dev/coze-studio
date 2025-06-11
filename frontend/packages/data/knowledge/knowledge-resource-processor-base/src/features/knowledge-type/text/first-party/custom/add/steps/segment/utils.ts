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
