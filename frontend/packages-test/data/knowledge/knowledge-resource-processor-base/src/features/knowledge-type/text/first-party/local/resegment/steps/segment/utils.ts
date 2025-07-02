import { FooterBtnStatus } from '@coze-data/knowledge-resource-processor-core';

import { SegmentMode, SeperatorType, type CustomSegmentRule } from '@/types';

export const getButtonNextStatus = (
  segmentMode: SegmentMode,
  segmentRule: CustomSegmentRule,
): FooterBtnStatus => {
  if (segmentMode === SegmentMode.CUSTOM) {
    const maxTokens = segmentRule?.maxTokens || 0;
    const separator = segmentRule?.separator;
    const isCustomSeperatorEmpty =
      separator?.type === SeperatorType.CUSTOM && !separator?.customValue;

    if (maxTokens === 0 || isCustomSeperatorEmpty) {
      return FooterBtnStatus.DISABLE;
    }
  }
  // TODO: 分层相关

  return FooterBtnStatus.ENABLE;
};
