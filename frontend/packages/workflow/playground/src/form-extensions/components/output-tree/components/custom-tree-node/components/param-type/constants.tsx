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

import { type ReactNode } from 'react';

import { ViewVariableType } from '@coze-workflow/base/types';
import {
  IconCozNumber,
  IconCozNumberBracket,
  IconCozString,
  IconCozStringBracket,
  IconCozBoolean,
  IconCozBooleanBracket,
  IconCozBrace,
  IconCozBraceBracket,
  IconCozFolder,
  IconCozFolderBracket,
  IconCozImage,
  IconCozImageBracket,
  IconCozSound,
  IconCozNumberInt,
  IconCozNumberIntBracket,
  IconCozClock,
  IconCozClockBracket,
} from '@coze-arch/coze-design/icons';

export const VARIABLE_TYPE_ICONS_MAP: Record<ViewVariableType, ReactNode> = {
  [ViewVariableType.String]: <IconCozString />,
  [ViewVariableType.Integer]: <IconCozNumberInt />,
  [ViewVariableType.Boolean]: <IconCozBoolean />,
  [ViewVariableType.Number]: <IconCozNumber />,
  [ViewVariableType.Object]: <IconCozBrace />,
  [ViewVariableType.Image]: <IconCozImage />,
  [ViewVariableType.File]: <IconCozFolder />,
  [ViewVariableType.Doc]: <IconCozFolder />,
  [ViewVariableType.Code]: <IconCozFolder />,
  [ViewVariableType.Ppt]: <IconCozFolder />,
  [ViewVariableType.Txt]: <IconCozFolder />,
  [ViewVariableType.Excel]: <IconCozFolder />,
  [ViewVariableType.Audio]: <IconCozFolder />,
  [ViewVariableType.Zip]: <IconCozFolder />,
  [ViewVariableType.Video]: <IconCozFolder />,
  [ViewVariableType.Svg]: <IconCozImage />,
  [ViewVariableType.Voice]: <IconCozSound />,
  [ViewVariableType.Time]: <IconCozClock />,
  [ViewVariableType.ArrayString]: <IconCozStringBracket />,
  [ViewVariableType.ArrayInteger]: <IconCozNumberIntBracket />,
  [ViewVariableType.ArrayBoolean]: <IconCozBooleanBracket />,
  [ViewVariableType.ArrayNumber]: <IconCozNumberBracket />,
  [ViewVariableType.ArrayObject]: <IconCozBraceBracket />,
  [ViewVariableType.ArrayImage]: <IconCozImageBracket />,
  [ViewVariableType.ArrayFile]: <IconCozFolderBracket />,
  [ViewVariableType.ArrayDoc]: <IconCozFolderBracket />,
  [ViewVariableType.ArrayCode]: <IconCozFolderBracket />,
  [ViewVariableType.ArrayPpt]: <IconCozFolderBracket />,
  [ViewVariableType.ArrayTxt]: <IconCozFolderBracket />,
  [ViewVariableType.ArrayExcel]: <IconCozFolderBracket />,
  [ViewVariableType.ArrayAudio]: <IconCozFolderBracket />,
  [ViewVariableType.ArrayZip]: <IconCozFolderBracket />,
  [ViewVariableType.ArrayVideo]: <IconCozFolderBracket />,
  [ViewVariableType.ArraySvg]: <IconCozImageBracket />,
  [ViewVariableType.ArrayVoice]: <IconCozFolderBracket />,
  [ViewVariableType.ArrayTime]: <IconCozClockBracket />,
};
