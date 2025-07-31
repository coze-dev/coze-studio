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

// modified from @coze-workflow/nodes

/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Front-end variable type
 */
export enum ViewVariableType {
  String = 1,
  Integer,
  Boolean,
  Number,
  Object = 6,
  Image,
  File,
  Doc,
  Code,
  Ppt,
  Txt,
  Excel,
  Audio,
  Zip,
  Video,
  Svg,
  Voice,
  Time,
  // The above is the InputType defined in the api. The following is the integrated one. Start from 99 to avoid collisions with the backend definition.
  ArrayString = 99,
  ArrayInteger,
  ArrayBoolean,
  ArrayNumber,
  ArrayObject,
  ArrayImage,
  ArrayFile,
  ArrayDoc,
  ArrayCode,
  ArrayPpt,
  ArrayTxt,
  ArrayExcel,
  ArrayAudio,
  ArrayZip,
  ArrayVideo,
  ArraySvg,
  ArrayVoice,
  ArrayTime,
}

const BASE_ARRAY_PAIR: [ViewVariableType, ViewVariableType][] = [
  [ViewVariableType.String, ViewVariableType.ArrayString],
  [ViewVariableType.Integer, ViewVariableType.ArrayInteger],
  [ViewVariableType.Boolean, ViewVariableType.ArrayBoolean],
  [ViewVariableType.Number, ViewVariableType.ArrayNumber],
  [ViewVariableType.Object, ViewVariableType.ArrayObject],
  [ViewVariableType.Image, ViewVariableType.ArrayImage],
  [ViewVariableType.File, ViewVariableType.ArrayFile],
  [ViewVariableType.Doc, ViewVariableType.ArrayDoc],
  [ViewVariableType.Code, ViewVariableType.ArrayCode],
  [ViewVariableType.Ppt, ViewVariableType.ArrayPpt],
  [ViewVariableType.Txt, ViewVariableType.ArrayTxt],
  [ViewVariableType.Excel, ViewVariableType.ArrayExcel],
  [ViewVariableType.Audio, ViewVariableType.ArrayAudio],
  [ViewVariableType.Zip, ViewVariableType.ArrayZip],
  [ViewVariableType.Video, ViewVariableType.ArrayVideo],
  [ViewVariableType.Svg, ViewVariableType.ArraySvg],
  [ViewVariableType.Voice, ViewVariableType.ArrayVoice],
  [ViewVariableType.Time, ViewVariableType.ArrayTime],
];

const ArrayTypes = BASE_ARRAY_PAIR.map(_pair => _pair[1]);

export function isArrayType(type: ViewVariableType): boolean {
  return ArrayTypes.includes(type);
}
