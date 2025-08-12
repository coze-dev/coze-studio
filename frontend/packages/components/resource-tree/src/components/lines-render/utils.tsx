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

import { type IPoint, Rectangle } from '@flowgram-adapter/fixed-layout-editor';

export enum BezierControlType {
  RIGHT_TOP,
  RIGHT_BOTTOM,
  LEFT_TOP,
  LEFT_BOTTOM,
}

const CONTROL_MAX = 300;

/**
 * Get the control node for the vertical direction of the Bézier curve
 * @param fromPos starting point
 * @param toPos destination
 */
export function getBezierVerticalControlPoints(
  fromPos: IPoint,
  toPos: IPoint,
): IPoint[] {
  const rect = Rectangle.createRectangleWithTwoPoints(fromPos, toPos);
  let type: BezierControlType;

  if (fromPos.y <= toPos.y) {
    type =
      fromPos.x <= toPos.x
        ? BezierControlType.RIGHT_BOTTOM
        : BezierControlType.LEFT_BOTTOM;
  } else {
    type =
      fromPos.x <= toPos.x
        ? BezierControlType.RIGHT_TOP
        : BezierControlType.LEFT_TOP;
  }

  let controls: IPoint[];

  switch (type) {
    case BezierControlType.RIGHT_BOTTOM:
      controls = [
        {
          x: rect.leftTop.x,
          y: rect.leftTop.y + rect.height / 2,
        },
        {
          x: rect.rightBottom.x,
          y: rect.rightBottom.y - rect.height / 2,
        },
      ];
      break;
    case BezierControlType.LEFT_BOTTOM:
      controls = [
        {
          x: rect.rightTop.x,
          y: rect.rightTop.y + rect.height / 2,
        },
        {
          x: rect.leftBottom.x,
          y: rect.leftBottom.y - rect.height / 2,
        },
      ];
      break;
    case BezierControlType.RIGHT_TOP:
      controls = [
        {
          x: rect.leftBottom.x,
          y: rect.leftBottom.y + Math.min(rect.height, CONTROL_MAX),
        },
        {
          x: rect.rightTop.x,
          y: rect.rightTop.y - Math.min(rect.height, CONTROL_MAX),
        },
      ];
      break;
    case BezierControlType.LEFT_TOP:
      controls = [
        {
          x: rect.rightBottom.x,
          y: rect.rightBottom.y + Math.min(rect.height, CONTROL_MAX),
        },
        {
          x: rect.leftTop.x,
          y: rect.leftTop.y - Math.min(rect.height, CONTROL_MAX),
        },
      ];
      break;
    default:
      controls = [];
  }

  return controls;
}
