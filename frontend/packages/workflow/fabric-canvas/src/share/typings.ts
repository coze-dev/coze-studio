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
 
import { type FabricObject } from 'fabric';

export const REF_VARIABLE_ID_PREFIX = 'variable';

export interface FabricObjectSchema extends CustomFabricProps {
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  textAlign?: TextAlign;
  width?: number;
  height?: number;
  lineHeight?: number;
  text?: string;
  /**
   * 图片链接
   */
  src?: string;
  objects?: FabricObjectSchema[];
}

export interface VariableRef {
  variableId: string;
  objectId: string;
  variableName: string;
}
export interface FabricSchema extends FabricObjectSchema {
  width: number;
  height: number;
  background: string;
  objects: FabricObjectSchema[];
  customVariableRefs: VariableRef[];
}

/**
 * 为什么不用 FabricObject.type？
 * 因为 fabricSchema.type 跟 fabricObject.type 对不上
 * eg： Textbox 在 schema 里是 textbox，实例化后是 Textbox
 */
export enum Mode {
  INLINE_TEXT = 'inline_text',
  BLOCK_TEXT = 'block_text',
  RECT = 'rect',
  TRIANGLE = 'triangle',
  CIRCLE = 'ellipse',
  STRAIGHT_LINE = 'straight_line',
  PENCIL = 'pencil',
  IMAGE = 'img',
  GROUP = 'group',
}

/**
 * 填充和描边
 */
export enum ColorMode {
  FILL = 'fill',
  STROKE = 'stroke',
}

/**
 * 文本对齐方式
 */
export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}
/**
 * 图片填充方式
 */
export enum ImageFixedType {
  AUTO = 'auto',
  FILL = 'fill',
  FULL = 'full',
}

export interface CustomFabricProps {
  customType: Mode;
  customId: string;
  customFixedHeight?: number;
  customFixedType?: ImageFixedType;
  /** @deprecated 兼容历史，不可新增消费 */
  customVariableName?: string;
  [k: string]: unknown;
}

export interface FabricObjectWithCustomProps
  extends FabricObject,
    CustomFabricProps {}

export const UNKNOWN_VARIABLE_NAME = '__unknown__';
