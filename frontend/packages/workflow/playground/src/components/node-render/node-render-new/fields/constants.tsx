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

import { type ReactElement } from 'react';

import { ViewVariableType } from '@coze-workflow/base';
import {
  IconCozNumber,
  IconCozString,
  IconCozBoolean,
  IconCozFolder,
  IconCozBrace,
  IconCozImage,
  IconCozStringBracket,
  IconCozImageBracket,
  IconCozBooleanBracket,
  IconCozNumberBracket,
  IconCozNumberInt,
  IconCozNumberIntBracket,
  IconCozBraceBracket,
  IconCozFolderBracket,
  IconCozSound,
  IconCozClock,
  IconCozClockBracket,
} from '@coze-arch/coze-design/icons';

const iconFile = <IconCozFolder />;
const iconFileArray = <IconCozFolderBracket />;
export const VARIABLE_TYPE_ICON_MAP: Record<ViewVariableType, ReactElement> = {
  [ViewVariableType.String]: <IconCozString />,
  [ViewVariableType.Integer]: <IconCozNumberInt />,
  [ViewVariableType.Number]: <IconCozNumber />,
  [ViewVariableType.Boolean]: <IconCozBoolean />,
  [ViewVariableType.Object]: <IconCozBrace />,
  [ViewVariableType.Image]: <IconCozImage />,
  [ViewVariableType.Time]: <IconCozClock />,
  [ViewVariableType.File]: iconFile,
  [ViewVariableType.Doc]: iconFile,
  [ViewVariableType.Code]: iconFile,
  [ViewVariableType.Ppt]: iconFile,
  [ViewVariableType.Txt]: iconFile,
  [ViewVariableType.Excel]: iconFile,
  [ViewVariableType.Audio]: iconFile,
  [ViewVariableType.Zip]: iconFile,
  [ViewVariableType.Video]: iconFile,
  [ViewVariableType.Svg]: iconFile,
  [ViewVariableType.Voice]: <IconCozSound />,
  [ViewVariableType.ArrayString]: <IconCozStringBracket />,
  [ViewVariableType.ArrayInteger]: <IconCozNumberIntBracket />,
  [ViewVariableType.ArrayNumber]: <IconCozNumberBracket />,
  [ViewVariableType.ArrayBoolean]: <IconCozBooleanBracket />,
  [ViewVariableType.ArrayObject]: <IconCozBraceBracket />,
  [ViewVariableType.ArrayImage]: <IconCozImageBracket />,
  [ViewVariableType.ArrayFile]: iconFileArray,
  [ViewVariableType.ArrayDoc]: iconFileArray,
  [ViewVariableType.ArrayCode]: iconFileArray,
  [ViewVariableType.ArrayPpt]: iconFileArray,
  [ViewVariableType.ArrayTxt]: iconFileArray,
  [ViewVariableType.ArrayExcel]: iconFileArray,
  [ViewVariableType.ArrayAudio]: iconFileArray,
  [ViewVariableType.ArrayZip]: iconFileArray,
  [ViewVariableType.ArrayVideo]: iconFileArray,
  [ViewVariableType.ArraySvg]: iconFileArray,
  [ViewVariableType.ArrayVoice]: iconFileArray,
  [ViewVariableType.ArrayTime]: <IconCozClockBracket />,
};
