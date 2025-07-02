import { FooterBtnStatus } from '@coze-data/knowledge-resource-processor-core';

import { type CustomSegmentRule, SegmentMode, SeperatorType } from '@/types';

export const getButtonNextStatus = (
  segmentMode: SegmentMode,
  segmentRule: CustomSegmentRule,
): FooterBtnStatus => {
  if (segmentMode === SegmentMode.CUSTOM) {
    const maxTokens = segmentRule?.maxTokens || 0;
    const separator = segmentRule?.separator;
    const isCustomSeperatorEmpty =
      separator?.type === SeperatorType.CUSTOM && !separator?.customValue;

    if (maxTokens === 0 || isCustomSeperatorEmpty || !segmentRule.overlap) {
      return FooterBtnStatus.DISABLE;
    }
  }
  return FooterBtnStatus.ENABLE;
};
