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
