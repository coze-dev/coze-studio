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
 * 渲染为形如下方例子的内容:
 * 论文 1：过滤第 2 / 4 / 6 页；设置了页面局部过滤
 * 论文 2：过滤第 1 页...
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
