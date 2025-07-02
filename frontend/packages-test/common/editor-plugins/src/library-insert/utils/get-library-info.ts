import { merge } from 'lodash-es';

import {
  type LibraryType,
  type ILibraryList,
  type ILibraryItem,
  type LibraryBlockInfo,
} from '../types';
import {
  pluginIcon,
  workflowIcon,
  imageflowIcon,
  tableIcon,
  textIcon,
  imageIcon,
} from '../assets';
import { type TemplateParser } from '../../shared/utils/template-parser';
import { checkLibraryId } from './library-validate';
const defaultLibraryBlockInfo: Record<
  LibraryType,
  {
    icon: string;
  }
> = {
  plugin: {
    icon: pluginIcon,
  },
  workflow: {
    icon: workflowIcon,
  },
  imageflow: {
    icon: imageflowIcon,
  },
  table: {
    icon: tableIcon,
  },
  text: {
    icon: textIcon,
  },
  image: {
    icon: imageIcon,
  },
};
// 根据资源类型获取对应的信息
export const getLibraryBlockInfoFromTemplate = (props: {
  template: string;
  templateParser: TemplateParser;
}): LibraryBlockInfo | null => {
  const { template, templateParser } = props;
  const data = templateParser.getData(template);
  if (!data) {
    return null;
  }
  const { type, ...rest } = data as LibraryBlockInfo;
  const libraryBlockInfo = merge({}, defaultLibraryBlockInfo[type], {
    type,
    ...rest,
  });
  return libraryBlockInfo;
};

export const getLibraryInfoByBlockInfo = (
  librarys: ILibraryList,
  blockInfo: LibraryBlockInfo,
): ILibraryItem | null => {
  if (!librarys || !blockInfo) {
    return null;
  }
  const libraryTypeList = librarys.find(
    library => library.type === blockInfo.type,
  );
  return (
    (libraryTypeList?.items as ILibraryItem[])?.find(item =>
      checkLibraryId(item, blockInfo),
    ) ?? null
  );
};
