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
import { Tag } from '@coze-arch/coze-design';

const ViewDataTypeMap = {
  [ViewVariableType.String]: 'String',
  [ViewVariableType.Integer]: 'Integer',
  [ViewVariableType.Boolean]: 'Boolean',
  [ViewVariableType.Number]: 'Number',
  [ViewVariableType.Time]: 'Time',
  [ViewVariableType.File]: 'File',
  [ViewVariableType.Image]: 'File/Image',
  [ViewVariableType.Doc]: 'File/Doc',
  [ViewVariableType.Excel]: 'File/Excel',
  [ViewVariableType.Code]: 'File/Code',
  [ViewVariableType.Ppt]: 'File/PPT',
  [ViewVariableType.Txt]: 'File/Text',
  [ViewVariableType.Audio]: 'File/Audio',
  [ViewVariableType.Zip]: 'File/ZIP',
  [ViewVariableType.Video]: 'File/Video',
  [ViewVariableType.Svg]: 'File/SVG',
  [ViewVariableType.Voice]: 'File/Voice',
};

interface DataTypeTagProps {
  type?: ViewVariableType;
  disabled?: boolean;
}

export function DataTypeTag({ type, disabled }: DataTypeTagProps) {
  return (
    <Tag color="primary" size="mini" disabled={disabled}>
      {type === undefined ? 'undefined' : ViewDataTypeMap[type]}
    </Tag>
  );
}
