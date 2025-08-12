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
