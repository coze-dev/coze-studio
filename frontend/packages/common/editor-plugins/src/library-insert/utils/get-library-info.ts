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
// Get the corresponding information according to the resource type
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
