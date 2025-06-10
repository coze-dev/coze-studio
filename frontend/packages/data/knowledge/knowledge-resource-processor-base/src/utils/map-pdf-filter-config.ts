import { type FilterPageConfig } from '@/features/knowledge-type/text/interface';

export const mapPDFFilterConfig = (list: FilterPageConfig[]) =>
  list
    .map(config => {
      if (config.isFilter) {
        return config.pageIndex;
      }
      return null;
    })
    .filter((page): page is number => typeof page === 'number');
