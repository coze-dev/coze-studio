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

import { type ResegmentRequest } from '@coze-arch/idl/knowledge';

import { type PDFDocumentFilterValue } from '@/features/knowledge-type/text/interface';

import { mapPDFFilterConfig } from './map-pdf-filter-config';

export const convertFilterStrategyToParams = (
  filterValue: PDFDocumentFilterValue | undefined,
): ResegmentRequest => {
  if (!filterValue) {
    return {};
  }
  // const { topPercent, rightPercent, bottomPercent, leftPercent } =
  //   filterValue.cropperSizePercent;
  return {
    filter_strategy: {
      // filter_box_position: [
      //   topPercent,
      //   rightPercent,
      //   bottomPercent,
      //   leftPercent,
      // ],
      filter_page: mapPDFFilterConfig(filterValue.filterPagesConfig),
    },
  };
};
