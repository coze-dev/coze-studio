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

import { type UnitItem } from '@coze-data/knowledge-resource-processor-core';
import { type DocumentTaskInfo } from '@coze-arch/bot-api/memory';
import {
  type ChunkStrategy,
  ChunkType,
  DocumentSource,
  FormatType,
} from '@coze-arch/bot-api/knowledge';

import {
  SegmentMode,
  SeperatorType,
  PreProcessRule,
  type CustomSegmentRule,
} from '@/types';

import { type LevelChunkStrategy } from './interface';

export const getCustomValues = (
  segmentMode: SegmentMode,
  segmentRule: CustomSegmentRule,
  levelChunkStrategy?: LevelChunkStrategy,
): ChunkStrategy => {
  if (segmentMode === SegmentMode.AUTO) {
    return {
      chunk_type: ChunkType.DefaultChunk,
    };
  }
  if (segmentMode === SegmentMode.LEVEL) {
    return {
      chunk_type: ChunkType.LevelChunk,
      max_level: levelChunkStrategy?.maxLevel,
      save_title: levelChunkStrategy?.isSaveTitle,
    };
  }
  const separator =
    segmentRule.separator.type === SeperatorType.CUSTOM
      ? segmentRule.separator.customValue
      : segmentRule.separator.type;
  return {
    separator,
    max_tokens: segmentRule.maxTokens,
    remove_extra_spaces: segmentRule?.preProcessRules?.includes(
      PreProcessRule.REMOVE_SPACES,
    ),
    remove_urls_emails: segmentRule?.preProcessRules?.includes(
      PreProcessRule.REMOVE_EMAILS,
    ),
    chunk_type: ChunkType.CustomChunk,
    overlap: segmentRule.overlap,
  };
};

export function filterTextList(
  unitList: UnitItem[],
  documentSourceType?: DocumentSource,
): DocumentTaskInfo[] {
  return unitList.map(item => ({
    name: item.name,
    source_info: {
      tos_uri: item.uri,
      document_source: documentSourceType ?? DocumentSource.Document,
    },
  }));
}

export function getCreateDocumentParams({
  unitList,
  segmentMode,
  segmentRule,
  documentSourceType,
  levelChunkStrategy,
}: {
  unitList: UnitItem[];
  segmentMode: SegmentMode;
  segmentRule: CustomSegmentRule;
  documentSourceType?: DocumentSource;
  levelChunkStrategy: LevelChunkStrategy;
}) {
  return {
    format_type: FormatType.Text,
    document_bases: filterTextList(unitList, documentSourceType),
    chunk_strategy: getCustomValues(
      segmentMode,
      segmentRule,
      levelChunkStrategy,
    ),
  };
}

export function validateSegmentRules(
  segmentMode: SegmentMode,
  segmentRule: CustomSegmentRule,
): boolean {
  if (segmentMode === SegmentMode.CUSTOM) {
    const maxTokens = segmentRule?.maxTokens || 0;
    const separator = segmentRule?.separator;
    const isCustomSeperatorEmpty =
      separator?.type === SeperatorType.CUSTOM && !separator?.customValue;

    if (maxTokens === 0 || isCustomSeperatorEmpty) {
      false;
    }
  }
  return true;
}
