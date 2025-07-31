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

import { merge } from 'lodash-es';
import { type UnitItem } from '@coze-data/knowledge-resource-processor-core';
import {
  type CreateDocumentRequest,
  type DocumentBase,
  DocumentSource,
  FormatType,
  type OpenSearchConfig,
  type Review,
  StorageLocation,
} from '@coze-arch/bot-api/knowledge';

import { convertFilterStrategyToParams } from '@/utils/convert-filter-strategy-to-params';
import { type CustomSegmentRule, type SegmentMode } from '@/types';
import { getCustomValues } from '@/features/knowledge-type/text/utils';
import {
  type LevelChunkStrategy,
  type PDFDocumentFilterValue,
} from '@/features/knowledge-type/text/interface';

export function filterTextList(
  unitList: UnitItem[],
  pdfFilterValueList: PDFDocumentFilterValue[],
  docReviewList: Review[],
): DocumentBase[] {
  return unitList.map((item, index) => {
    const target = pdfFilterValueList.find(pdf => pdf.uri === item.uri);

    const base: DocumentBase = {
      name: item.name,
      source_info: {
        tos_uri: item.uri,
        document_source: DocumentSource.Document,
        review_id: docReviewList[index]?.review_id,
      },
    };

    return merge({}, base, convertFilterStrategyToParams(target));
  });
}

export function getCreateDocumentParams({
  unitList,
  segmentMode,
  segmentRule,
  pdfFilterValueList,
  levelChunkStrategy,
  enableStorageStrategy,
  storageLocation,
  openSearchConfig,
  docReviewList,
}: {
  unitList: UnitItem[];
  segmentMode: SegmentMode;
  segmentRule: CustomSegmentRule;
  pdfFilterValueList: PDFDocumentFilterValue[];
  levelChunkStrategy: LevelChunkStrategy;
  enableStorageStrategy: boolean;
  storageLocation: StorageLocation;
  openSearchConfig: OpenSearchConfig;
  docReviewList: Review[];
}): Pick<
  CreateDocumentRequest,
  'format_type' | 'document_bases' | 'chunk_strategy' | 'storage_strategy'
> {
  const req: CreateDocumentRequest = {
    format_type: FormatType.Text,
    document_bases: filterTextList(unitList, pdfFilterValueList, docReviewList),
    chunk_strategy: getCustomValues(
      segmentMode,
      segmentRule,
      levelChunkStrategy,
    ),
  };
  // Volcano [Cloud Search Service] is only available in the domestic environment
  if (IS_CN_REGION && enableStorageStrategy) {
    req.storage_strategy = {
      storage_location: storageLocation,
      open_search_config:
        storageLocation === StorageLocation.OpenSearch
          ? openSearchConfig
          : undefined,
    };
  }
  return req;
}
