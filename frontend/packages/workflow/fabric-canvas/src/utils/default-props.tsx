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

import {
  ImageFixedType,
  Mode,
  TextAlign,
  type FabricObjectSchema,
} from '../typings';

/**
 * Selected border and control point styles
 */
export const selectedBorderProps = {
  borderColor: '#4D53E8',
  borderWidth: 2,
  cornerStyle: 'circle',
  cornerColor: '#ffffff',
  cornerStrokeColor: '#4D53E8',
  transparentCorners: false,
  borderOpacityWhenMoving: 0.8,
};

const defaultFontSize = 24;
const textProps = {
  fontSize: defaultFontSize,
  fontFamily: '常规体-思源黑体',
  fill: '#000000ff',
  stroke: '#000000ff',
  strokeWidth: 0,
  textAlign: TextAlign.LEFT,
  lineHeight: 1.2,
};

const shapeProps = {
  fill: '#ccccccff',
  stroke: '#000000ff',
  strokeWidth: 0,
  width: 200,
  height: 200,
};

export const defaultProps: Record<Mode, Partial<FabricObjectSchema>> = {
  [Mode.INLINE_TEXT]: textProps,
  [Mode.BLOCK_TEXT]: {
    ...textProps,
    width: 200,
    height: 200,
    padding: defaultFontSize / 2,
    // It must be split (true), otherwise Chinese will not wrap lines. splitByGrapheme: true is approximately equal to wordBreak: break-all
    splitByGrapheme: true,
  },
  [Mode.RECT]: shapeProps,
  [Mode.CIRCLE]: {
    ...shapeProps,
    rx: shapeProps.width / 2,
    ry: shapeProps.height / 2,
  },
  [Mode.TRIANGLE]: shapeProps,
  [Mode.STRAIGHT_LINE]: {
    strokeWidth: 1,
    stroke: '#ccccccff',
    strokeLineCap: 'round',
  },
  [Mode.PENCIL]: {
    strokeWidth: 1,
    stroke: '#000000ff',
  },
  [Mode.IMAGE]: {
    customFixedType: ImageFixedType.FILL,
    stroke: '#000000ff',
    strokeWidth: 0,
    width: 400,
    height: 400,
    opacity: 1,
  },
  [Mode.GROUP]: {},
};
