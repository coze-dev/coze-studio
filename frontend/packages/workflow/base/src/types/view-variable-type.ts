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
/**
 * Variable types that use JSON to represent values
 */
export const JSON_INPUT_TYPES = [
  ViewVariableType.Object,
  ViewVariableType.ArrayString,
  ViewVariableType.ArrayInteger,
  ViewVariableType.ArrayBoolean,
  ViewVariableType.ArrayNumber,
  ViewVariableType.ArrayObject,
  ViewVariableType.ArrayTime,
];

export const FILE_TYPES = [
  ViewVariableType.File,
  ViewVariableType.Image,
  ViewVariableType.Doc,
  ViewVariableType.Code,
  ViewVariableType.Ppt,
  ViewVariableType.Txt,
  ViewVariableType.Excel,
  ViewVariableType.Audio,
  ViewVariableType.Zip,
  ViewVariableType.Video,
  ViewVariableType.Svg,
  ViewVariableType.Voice,

  ViewVariableType.ArrayImage,
  ViewVariableType.ArrayFile,
  ViewVariableType.ArrayDoc,
  ViewVariableType.ArrayCode,
  ViewVariableType.ArrayPpt,
  ViewVariableType.ArrayTxt,
  ViewVariableType.ArrayExcel,
  ViewVariableType.ArrayAudio,
  ViewVariableType.ArrayZip,
  ViewVariableType.ArrayVideo,
  ViewVariableType.ArraySvg,
  ViewVariableType.ArrayVoice,
];

// Base types, and pairing with their corresponding array types
export const BASE_ARRAY_PAIR: [ViewVariableType, ViewVariableType][] = [
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

export const VARIABLE_TYPE_ALIAS_MAP: Record<ViewVariableType, string> = {
  [ViewVariableType.String]: 'String',
  [ViewVariableType.Integer]: 'Integer',
  [ViewVariableType.Boolean]: 'Boolean',
  [ViewVariableType.Number]: 'Number',
  [ViewVariableType.Object]: 'Object',
  [ViewVariableType.Image]: 'Image',
  [ViewVariableType.File]: 'File',
  [ViewVariableType.Doc]: 'Doc',
  [ViewVariableType.Code]: 'Code',
  [ViewVariableType.Ppt]: 'PPT',
  [ViewVariableType.Txt]: 'Txt',
  [ViewVariableType.Excel]: 'Excel',
  [ViewVariableType.Audio]: 'Audio',
  [ViewVariableType.Zip]: 'Zip',
  [ViewVariableType.Video]: 'Video',
  [ViewVariableType.Svg]: 'Svg',
  [ViewVariableType.Voice]: 'Voice',
  [ViewVariableType.Time]: 'Time',
  [ViewVariableType.ArrayString]: 'Array<String>',
  [ViewVariableType.ArrayInteger]: 'Array<Integer>',
  [ViewVariableType.ArrayBoolean]: 'Array<Boolean>',
  [ViewVariableType.ArrayNumber]: 'Array<Number>',
  [ViewVariableType.ArrayObject]: 'Array<Object>',
  [ViewVariableType.ArrayImage]: 'Array<Image>',
  [ViewVariableType.ArrayFile]: 'Array<File>',
  [ViewVariableType.ArrayDoc]: 'Array<Doc>',
  [ViewVariableType.ArrayCode]: 'Array<Code>',
  [ViewVariableType.ArrayPpt]: 'Array<PPT>',
  [ViewVariableType.ArrayTxt]: 'Array<Txt>',
  [ViewVariableType.ArrayExcel]: 'Array<Excel>',
  [ViewVariableType.ArrayAudio]: 'Array<Audio>',
  [ViewVariableType.ArrayZip]: 'Array<Zip>',
  [ViewVariableType.ArrayVideo]: 'Array<Video>',
  [ViewVariableType.ArraySvg]: 'Array<Svg>',
  [ViewVariableType.ArrayVoice]: 'Array<Voice>',
  [ViewVariableType.ArrayTime]: 'Array<Time>',
};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ViewVariableType {
  export const LabelMap = VARIABLE_TYPE_ALIAS_MAP;
  export const ArrayTypes = BASE_ARRAY_PAIR.map(_pair => _pair[1]);

  export function getLabel(type: ViewVariableType): string {
    return LabelMap[type];
  }

  /**
   * Get the complement of all variable types
   * This function is generated by GPT
   * @param inputTypes
   */
  export function getComplement(inputTypes: ViewVariableType[]) {
    const allTypes: ViewVariableType[] = [
      ...BASE_ARRAY_PAIR.map(_pair => _pair[0]),
      ...BASE_ARRAY_PAIR.map(_pair => _pair[1]),
    ];

    return allTypes.filter(type => !inputTypes.includes(type));
  }

  export function canDrilldown(type: ViewVariableType): boolean {
    return [ViewVariableType.Object, ViewVariableType.ArrayObject].includes(
      type,
    );
  }

  export function isArrayType(type: ViewVariableType): boolean {
    const arrayTypes = BASE_ARRAY_PAIR.map(_pair => _pair[1]);
    return arrayTypes.includes(type);
  }

  export function isFileType(type: ViewVariableType): boolean {
    return FILE_TYPES.includes(type);
  }

  export function isVoiceType(type: ViewVariableType): boolean {
    return [ViewVariableType.Voice].includes(type);
  }

  /**
   * Variable types that use JSON to represent values
   * @param type
   * @returns
   */
  export function isJSONInputType(type: ViewVariableType): boolean {
    return JSON_INPUT_TYPES.includes(type);
  }

  export function getArraySubType(type: ViewVariableType): ViewVariableType {
    const subType = BASE_ARRAY_PAIR.find(_pair => _pair[1] === type)?.[0];

    if (!subType) {
      throw new Error('WorkflowVariableEntity Error: Unknown Variable Type');
    }

    return subType;
  }

  export function wrapToArrayType(type: ViewVariableType): ViewVariableType {
    const arrayType = BASE_ARRAY_PAIR.find(_pair => _pair[0] === type)?.[1];

    if (!arrayType) {
      throw new Error('WorkflowVariableEntity Error: Unknown Variable Type');
    }

    return arrayType;
  }

  export function getAllArrayType(): ViewVariableType[] {
    const allTypes: ViewVariableType[] = [
      ...BASE_ARRAY_PAIR.map(_pair => _pair[0]),
      ...BASE_ARRAY_PAIR.map(_pair => _pair[1]),
    ];

    return allTypes.filter(isArrayType);
  }
}

export interface InputVariable {
  name: string;
  /**
   * The id does not necessarily have a front-end and back-end convention, imposed by the front-end. Risk: This property may be deleted when workflowSchema is structured
   * If you need an id, define it in the nodes schema:
   *  getDefaultAppendValue: () => ({
          id: nanoid(),
        }),
   * Reference packages/workflow/nodes/src/workflow-nodes/image-canvas/index.ts
   * It can only be guaranteed to be unique within the same node, it can only be guaranteed to be unique within the same node, and it can only be guaranteed to be unique within the same node.
   * Because nodes can create replicas
   */
  id?: string;
  type: ViewVariableType;
  /**
   * index
   */
  index: number;
}

/** Variable display labels on cards */
export interface VariableTagProps {
  key?: string;
  /* Variable type */
  type?: ViewVariableType;
  /* Variable name, when empty, is displayed as Undefined/Undefined */
  label?: ReactNode;
  /** Is it valid? */
  invalid?: boolean;
}
