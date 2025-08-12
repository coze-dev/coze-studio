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

import { I18n } from '@coze-arch/i18n';

import {
  type FilterPageConfig,
  type PDFDocumentFilterValue,
} from '@/features/knowledge-type/text/interface';

export const getSortedFilterPages = (filterPagesConfig: FilterPageConfig[]) =>
  filterPagesConfig
    .filter(config => config.isFilter)
    .map(config => config.pageIndex)
    .sort((prev, after) => prev - after);

export const getFilterPagesString = (pages: number[]) => pages.join(' / ');

/**
 * Render as the following example:
 * Paper 1: Filter page 2/4/6; set page local filtering
 * Paper 2: Filtering Page 1...
 */
export const renderDocumentFilterValue = ({
  filterValue,
  pdfList,
}: {
  filterValue: PDFDocumentFilterValue[];
  pdfList: { name: string; uri: string }[];
}) =>
  filterValue
    .map(value => {
      const pdf = pdfList.find(item => item.uri === value.uri);
      if (!pdf) {
        return null;
      }

      const filterPages = getSortedFilterPages(value.filterPagesConfig);

      if (!filterPages.length) {
        return null;
      }
      const filterPagesString = getFilterPagesString(filterPages);
      return `${pdf.name}: ${I18n.t('data_filter_values', {
        filterPages: filterPagesString,
      })}`;
    })
    .filter((filterString): filterString is string => Boolean(filterString))
    .join('\n');
