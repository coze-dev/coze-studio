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

import { ViewVariableType } from '@coze-workflow/base';

export const ACCEPT_MAP = {
  // [ViewVariableType.File]: ['*'],

  [ViewVariableType.Image]: ['image/*'],

  [ViewVariableType.Doc]: ['.docx', '.doc', '.pdf'],

  [ViewVariableType.Audio]: [
    '.mp3',
    '.wav',
    '.aac',
    '.flac',
    '.ogg',
    '.wma',
    '.alac',
    '.mid',
    '.midi',
    '.ac3',
    '.dsd',
  ],

  [ViewVariableType.Excel]: ['.xls', '.xlsx', '.csv'],

  [ViewVariableType.Video]: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],

  [ViewVariableType.Zip]: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],

  [ViewVariableType.Code]: ['.py', '.java', '.c', '.cpp', '.js', '.css'],

  [ViewVariableType.Txt]: ['.txt'],

  [ViewVariableType.Ppt]: ['.ppt', '.pptx'],

  [ViewVariableType.Svg]: ['.svg'],
};

export const getAccept = (
  inputType: ViewVariableType,
  availableFileTypes?: ViewVariableType[],
) => {
  let accept: string;
  const itemType = ViewVariableType.isArrayType(inputType)
    ? ViewVariableType.getArraySubType(inputType)
    : inputType;

  if (itemType === ViewVariableType.File) {
    if (availableFileTypes?.length) {
      accept = availableFileTypes
        .map(type => ACCEPT_MAP[type]?.join(','))
        .join(',');
    } else {
      accept = Object.values(ACCEPT_MAP)
        .map(items => items.join(','))
        .join(',');
    }
  } else {
    accept = (ACCEPT_MAP[itemType] || []).join(',');
  }

  return accept;
};
