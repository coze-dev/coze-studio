import {
  ChunkType,
  type ChunkStrategy,
  type DocumentInfo,
} from '@coze-arch/bot-api/knowledge';

import { defaultCustomSegmentRule } from '@/constants/text';

import {
  SegmentMode,
  PreProcessRule,
  SeperatorType,
  type Seperator,
} from '../types';

export const getSegmentMode = (rule: ChunkStrategy) => {
  if (rule.chunk_type === ChunkType.CustomChunk) {
    return SegmentMode.CUSTOM;
  }
  if (rule.chunk_type === ChunkType.LevelChunk) {
    return SegmentMode.LEVEL;
  }
  return SegmentMode.AUTO;
};

export const getSegmentCleanerParams = (docInfo: DocumentInfo) => {
  if (docInfo && Object.keys(docInfo) && docInfo?.chunk_strategy) {
    try {
      const rule = docInfo?.chunk_strategy || {};
      const preProcessRules: PreProcessRule[] = [];
      if (rule.remove_extra_spaces) {
        preProcessRules.push(PreProcessRule.REMOVE_SPACES);
      }
      if (rule.remove_urls_emails) {
        preProcessRules.push(PreProcessRule.REMOVE_EMAILS);
      }
      return {
        docInfo,
        segmentMode: getSegmentMode(docInfo?.chunk_strategy),
        segmentRule: {
          separator: rule.separator
            ? getSeparator(rule.separator as SeperatorType)
            : defaultCustomSegmentRule.separator,
          maxTokens: rule.max_tokens
            ? Number(rule.max_tokens)
            : defaultCustomSegmentRule.maxTokens,
          preProcessRules,
          overlap: rule.overlap
            ? Number(rule.overlap)
            : defaultCustomSegmentRule.overlap,
        },
      };
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
};

function getSeperatorTypeExceptCustom(
  seperatorType: typeof SeperatorType,
): string[] {
  const result: string[] = [];

  for (const [, value] of Object.entries(seperatorType)) {
    if (value !== seperatorType.CUSTOM) {
      result.push(value);
    }
  }

  return result;
}

export const getSeparator = (separator: SeperatorType): Seperator => {
  const seperatorType = getSeperatorTypeExceptCustom(SeperatorType);
  if (seperatorType.indexOf(separator) > -1) {
    return {
      type: separator,
    };
  }
  return {
    type: SeperatorType.CUSTOM,
    customValue: separator,
  };
};
