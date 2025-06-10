import { Icon } from '@coze-arch/bot-semi';

import { ReactComponent as ExcelSVG } from '../../../assets/icon_wiki-excel_colorful.svg';
import { ReactComponent as CSVSVG } from '../../../assets/icon_wiki-csv_colorful.svg';

export const getFileIcon = (extension: string) => {
  if (extension === 'xlsx' || extension === 'xltx') {
    return <Icon svg={<ExcelSVG />} />;
  }
  if (extension === 'csv') {
    return <Icon svg={<CSVSVG />} />;
  }
  // TODO
  return <Icon svg={<ExcelSVG />} />;
};
