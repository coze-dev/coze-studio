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

/* eslint-disable max-lines */
/* eslint-disable max-params */
import {
  Control,
  controlsUtils,
  type FabricObject,
  type Transform,
  type TPointerEvent,
  type ControlCursorCallback,
} from 'fabric';

import { Snap } from '../typings';
import { snap } from './snap/snap';

const getAngle = (a: number) => {
  if (a >= 360) {
    return getAngle(a - 360);
  }
  if (a < 0) {
    return getAngle(a + 360);
  }
  return a;
};

const svg0 =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><g filter="url(#a)"><mask id="b" width="16" height="16" x="8" y="8" fill="#000" maskUnits="userSpaceOnUse"><path fill="#fff" d="M8 8h16v16H8z"/><path fill-rule="evenodd" d="M12.87 22 10 19.13h1.99v-.659a6.483 6.483 0 0 1 6.482-6.482h.723V10l2.869 2.87-2.87 2.869v-1.99h-.722a4.722 4.722 0 0 0-4.722 4.722v.66h1.989L12.869 22" clip-rule="evenodd"/></mask><path fill="#000" fill-rule="evenodd" d="M12.87 22 10 19.13h1.99v-.659a6.483 6.483 0 0 1 6.482-6.482h.723V10l2.869 2.87-2.87 2.869v-1.99h-.722a4.722 4.722 0 0 0-4.722 4.722v.66h1.989L12.869 22" clip-rule="evenodd"/><path fill="#fff" d="M10 19.13v-.8H8.068l1.366 1.367.566-.566M12.87 22l-.567.566.566.566.566-.566L12.87 22m-.88-2.87v.801h.8v-.8h-.8m6.482-7.141v-.8.8m.723 0v.8h.8v-.8h-.8m0-1.989.565-.566-1.366-1.366V10h.8m2.869 2.87.566.565.566-.566-.566-.566-.566.566m-2.87 2.869h-.8v1.932l1.366-1.366-.566-.566m0-1.99h.8v-.8h-.8v.8m-.722 0v-.8.8m-4.722 5.382h-.8v.8h.8v-.8m1.989 0 .566.566 1.366-1.367h-1.932v.8m-6.305.566 2.87 2.869 1.131-1.132-2.87-2.87-1.13 1.133m2.555-1.367H10v1.601h1.99v-1.6m-.8.142v.659h1.6v-.66h-1.6m7.283-7.284a7.283 7.283 0 0 0-7.283 7.283h1.6a5.682 5.682 0 0 1 5.683-5.682v-1.6m.723 0h-.723v1.601h.723v-1.6m.8.8V10h-1.6v1.989h1.6m-1.366-1.422 2.869 2.87 1.132-1.133-2.87-2.869-1.131 1.132m2.869 1.737-2.87 2.87 1.132 1.132 2.87-2.87-1.132-1.132m-1.503 3.436v-1.99h-1.6v1.99h1.6m-1.523-1.19h.723v-1.6h-.723v1.6m-3.922 3.922a3.922 3.922 0 0 1 3.922-3.921v-1.601a5.522 5.522 0 0 0-5.523 5.522h1.601m0 .66v-.66h-1.6v.66h1.6m1.189-.8h-1.99v1.6h1.99v-1.6m-2.304 4.235 2.87-2.87-1.132-1.131-2.87 2.87 1.132 1.13" mask="url(#b)"/></g><defs><filter id="a" width="18.728" height="18.665" x="6.268" y="7.268" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feGaussianBlur stdDeviation=".9"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_184_36430"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_184_36430" result="shape"/></filter></defs></svg>';
const svg90 =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><g filter="url(#a)"><mask id="b" width="16" height="16" x="8" y="8" fill="#000" maskUnits="userSpaceOnUse"><path fill="#fff" d="M8 8h16v16H8z"/><path fill-rule="evenodd" d="M10 12.87 12.87 10v1.99h.658a6.482 6.482 0 0 1 6.482 6.482v.722H22l-2.87 2.87-2.868-2.87h1.989v-.722a4.722 4.722 0 0 0-4.722-4.722h-.659v1.988L10 12.87" clip-rule="evenodd"/></mask><path fill="#000" fill-rule="evenodd" d="M10 12.87 12.87 10v1.99h.658a6.482 6.482 0 0 1 6.482 6.482v.722H22l-2.87 2.87-2.868-2.87h1.989v-.722a4.722 4.722 0 0 0-4.722-4.722h-.659v1.988L10 12.87" clip-rule="evenodd"/><path fill="#fff" d="M12.87 10h.8V8.068l-1.367 1.366.566.566M10 12.87l-.566-.567-.566.566.566.566.566-.566m2.87-.88h-.801v.8h.8v-.8m7.14 7.204h-.8v.8h.8v-.8m1.989 0 .566.566 1.366-1.366H22v.8m-2.87 2.87-.565.565.566.566.566-.566-.566-.566m-2.868-2.87v-.8h-1.932l1.366 1.366.566-.566m1.989 0v.8h.8v-.8h-.8m-5.38-5.443v-.8h-.801v.8h.8m0 1.987-.567.566 1.366 1.366v-1.932h-.8m-.567-6.304-2.869 2.87 1.132 1.131 2.869-2.87-1.132-1.13m1.366 2.556V10h-1.6v1.99h1.6m-.141-.8h-.659v1.6h.659v-1.6m7.283 7.282a7.283 7.283 0 0 0-7.283-7.282v1.6a5.682 5.682 0 0 1 5.682 5.682h1.6m0 .722v-.722h-1.6v.722h1.6m-.8.8h1.988v-1.6H20.01v1.6m1.422-1.366-2.869 2.87 1.132 1.131 2.869-2.869-1.132-1.132m-1.737 2.87-2.87-2.87-1.131 1.132 2.869 2.87 1.132-1.132m-3.435-1.503h1.989v-1.6h-1.99v1.6m1.188-1.523v.722h1.601v-.722h-1.6m-3.921-3.921a3.921 3.921 0 0 1 3.921 3.921h1.601a5.522 5.522 0 0 0-5.522-5.522v1.6m-.659 0h.659v-1.6h-.659v1.6m.8 1.187v-1.987h-1.6v1.987h1.6m-4.235-2.303 2.87 2.87 1.131-1.133-2.87-2.869-1.13 1.132" mask="url(#b)"/></g><defs><filter id="a" width="18.663" height="18.727" x="7.068" y="7.268" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feGaussianBlur stdDeviation=".9"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_184_36425"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_184_36425" result="shape"/></filter></defs></svg>';
const svg180 =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><g filter="url(#a)"><mask id="b" width="16" height="16" x="8" y="8" fill="#000" maskUnits="userSpaceOnUse"><path fill="#fff" d="M8 8h16v16H8z"/><path fill-rule="evenodd" d="M19.13 10 22 12.87h-1.99v.659a6.483 6.483 0 0 1-6.482 6.482h-.723V22l-2.869-2.87 2.87-2.869v1.99h.722a4.722 4.722 0 0 0 4.722-4.723v-.659h-1.989L19.131 10" clip-rule="evenodd"/></mask><path fill="#000" fill-rule="evenodd" d="M19.13 10 22 12.87h-1.99v.659a6.483 6.483 0 0 1-6.482 6.482h-.723V22l-2.869-2.87 2.87-2.869v1.99h.722a4.722 4.722 0 0 0 4.722-4.723v-.659h-1.989L19.131 10" clip-rule="evenodd"/><path fill="#fff" d="M22 12.87v.8h1.932l-1.366-1.367-.566.566M19.13 10l.567-.566-.566-.566-.566.566.566.566m.88 2.87v-.801h-.8v.8h.8m0 .659h-.8.8m-7.205 6.482v-.8h-.8v.8h.8m0 1.989-.565.566 1.366 1.366V22h-.8m-2.869-2.87-.566-.565-.566.566.566.566.566-.566m2.87-2.869h.8V14.33l-1.366 1.366.566.566m0 1.99h-.8v.8h.8v-.8m5.444-4.723h-.8.8m0-.659h.8v-.8h-.8v.8m-1.989 0-.566-.566-1.366 1.367h1.932v-.8m6.305-.566-2.87-2.869-1.131 1.132 2.87 2.87 1.13-1.133M20.01 13.67H22v-1.601h-1.99v1.6m.8-.142v-.659h-1.6v.66h1.6m-7.283 7.284a7.283 7.283 0 0 0 7.283-7.284h-1.6a5.682 5.682 0 0 1-5.683 5.683v1.6m-.723 0h.723V19.21h-.723v1.6m-.8-.8V22h1.6V20.01h-1.6m1.366 1.422-2.869-2.87-1.132 1.133 2.87 2.869 1.131-1.132m-2.869-1.737 2.87-2.87-1.132-1.132-2.87 2.87 1.132 1.132m1.503-3.436v1.99h1.6v-1.99h-1.6m1.523 1.19h-.723v1.6h.723v-1.6m3.922-3.923a3.922 3.922 0 0 1-3.922 3.922v1.601a5.522 5.522 0 0 0 5.522-5.522h-1.6m0-.659v.66h1.6v-.66h-1.6m-1.189.8h1.99v-1.6h-1.99v1.6m2.304-4.235-2.87 2.87 1.132 1.131 2.87-2.87-1.132-1.13" mask="url(#b)"/></g><defs><filter id="a" width="18.728" height="18.665" x="7.004" y="8.067" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feGaussianBlur stdDeviation=".9"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_184_36440"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_184_36440" result="shape"/></filter></defs></svg>';
const svg270 =
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"><g filter="url(#a)"><mask id="b" width="16" height="16" x="8" y="8" fill="#000" maskUnits="userSpaceOnUse"><path fill="#fff" d="M8 8h16v16H8z"/><path fill-rule="evenodd" d="M22 19.13 19.13 22v-1.99h-.658a6.483 6.483 0 0 1-6.483-6.483v-.722H10l2.87-2.87 2.869 2.87h-1.99v.722a4.722 4.722 0 0 0 4.723 4.722h.659v-1.988L22 19.131" clip-rule="evenodd"/></mask><path fill="#000" fill-rule="evenodd" d="M22 19.13 19.13 22v-1.99h-.658a6.483 6.483 0 0 1-6.483-6.483v-.722H10l2.87-2.87 2.869 2.87h-1.99v.722a4.722 4.722 0 0 0 4.723 4.722h.659v-1.988L22 19.131" clip-rule="evenodd"/><path fill="#fff" d="M19.13 22h-.8v1.932l1.367-1.366L19.13 22M22 19.13l.566.567.566-.566-.566-.566-.566.566m-2.87.88h.801v-.8h-.8v.8m-7.141-6.483h.8-.8m0-.722h.8v-.8h-.8v.8m-1.989 0-.566-.566-1.366 1.366H10v-.8m2.87-2.87.565-.565-.566-.566-.566.566.566.566m2.869 2.87v.8h1.932l-1.366-1.366-.566.566m-1.99 0v-.8h-.8v.8h.8m0 .722h.801-.8m5.382 4.722v.8h.8v-.8h-.8m0-1.988.566-.566-1.367-1.366v1.932h.8m.566 6.305 2.869-2.87-1.132-1.131-2.87 2.87 1.133 1.13M18.33 20.01V22h1.601v-1.99h-1.6m.142.8h.659v-1.6h-.66v1.6m-7.284-7.283a7.283 7.283 0 0 0 7.284 7.283v-1.6a5.682 5.682 0 0 1-5.683-5.683h-1.6m0-.722v.722h1.601v-.722h-1.6m.8-.8H10v1.6h1.989v-1.6m-1.422 1.366 2.87-2.87-1.133-1.131-2.869 2.869 1.132 1.132m1.737-2.87 2.87 2.87 1.132-1.132-2.87-2.87-1.132 1.133m3.436 1.504h-1.99v1.6h1.99v-1.6m-1.189 1.522v-.722h-1.6v.722h1.6m3.922 3.922a3.922 3.922 0 0 1-3.922-3.922h-1.6a5.522 5.522 0 0 0 5.522 5.523v-1.601m.659 0h-.66v1.6h.66v-1.6m-.8-1.188v1.988h1.6v-1.988h-1.6m4.235 2.304-2.87-2.87-1.131 1.132 2.87 2.87 1.13-1.132" mask="url(#b)"/></g><defs><filter id="a" width="18.664" height="18.727" x="6.268" y="8.005" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="1"/><feGaussianBlur stdDeviation=".9"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_184_36435"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_184_36435" result="shape"/></filter></defs></svg>';

const svg2Base64 = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`;

const cursorRotate0 = svg2Base64(svg0);
const cursorRotate90 = svg2Base64(svg90);
const cursorRotate180 = svg2Base64(svg180);
const cursorRotate270 = svg2Base64(svg270);

const getCursor = (angle: number) => {
  const a = getAngle(angle);
  if (a >= 225 && a < 315) {
    return cursorRotate270;
  } else if (a >= 135 && a < 225) {
    return cursorRotate180;
  } else if (a >= 45 && a < 135) {
    return cursorRotate90;
  } else {
    return cursorRotate0;
  }
};

const {
  scalingEqually,
  scaleCursorStyleHandler,
  rotationWithSnapping,
  scalingX,
  scalingY,
} = controlsUtils;

type GetControls = (props?: {
  x?: number;
  y?: number;
  callback?: (data: { element: FabricObject }) => void;
  needResetScaleAndSnap?: boolean;
}) => Control;
/**
 * Straight Start Control Point
 */
export const getLineStartControl: GetControls = (props = {}) => {
  const { x, y, callback } = props;
  return new Control({
    x,
    y,
    actionHandler: (e, transformData, _x, _y) => {
      transformData.target.set({
        x1: _x,
        y1: _y,
        x2:
          transformData.lastX +
          transformData.width * (transformData.corner === 'tl' ? 1 : -1),
        y2: transformData.lastY + transformData.height,
      });

      callback?.({ element: transformData.target });
      return true;
    },
    actionName: 'startControl', // The name of the control point
  });
};

/**
 * straight endpoint control point
 */
export const getLineEndControl: GetControls = (props = {}) => {
  const { x, y, callback } = props;
  return new Control({
    x,
    y,
    actionHandler: (e, transformData, _x, _y) => {
      transformData.target.set({
        x1:
          transformData.lastX -
          transformData.width * (transformData.corner === 'br' ? 1 : -1),
        y1: transformData.lastY - transformData.height,
        x2: _x,
        y2: _y,
      });

      callback?.({ element: transformData.target });
      return true;
    },
    actionName: 'endControl', // The name of the control point
  });
};

const originData = {
  width: 0,
  height: 0,
  top: 0,
  left: 0,
};

type LeftTopCalcFn = (originData: {
  angle: number;
  originTop: number;
  originLeft: number;
  originWidth: number;
  originHeight: number;
  newWidth: number;
  newHeight: number;
}) => {
  left: number;
  top: number;
};

const scaleToSize = (
  transformData: Transform,
  options?: {
    scaleEqual?: boolean;
    leftTopCalcFn?: LeftTopCalcFn;
  },
) => {
  const { width, height, scaleX, scaleY, strokeWidth, angle } =
    transformData.target;

  let targetWidth = Math.max((width + strokeWidth) * scaleX - strokeWidth, 1);
  let targetHeight = Math.max((height + strokeWidth) * scaleY - strokeWidth, 1);

  if (options?.scaleEqual) {
    if (targetWidth - originData.width > targetHeight - originData.height) {
      targetHeight = (originData.height / originData.width) * targetWidth;
    } else {
      targetWidth = (originData.width / originData.height) * targetHeight;
    }
  }

  let targetLeft = originData.left;
  let targetTop = originData.top;
  if (options?.leftTopCalcFn) {
    const rs = options.leftTopCalcFn({
      angle,
      originTop: originData.top,
      originLeft: originData.left,
      originWidth: originData.width,
      originHeight: originData.height,
      newWidth: targetWidth,
      newHeight: targetHeight,
    });
    targetLeft = rs.left;
    targetTop = rs.top;
  }

  transformData.target.set({
    width: targetWidth,
    height: targetHeight,
    // textBox specialization property
    customFixedHeight: targetHeight,
    scaleX: 1,
    scaleY: 1,
    top: targetTop,
    left: targetLeft,
  });
};
/**
 * Ask the GPT directly:
 A rectangle, width w, height h
 Rotate the rectangle clockwise by angle a with the upper left coordinate x1 y1.
 Stretch the upper left corner of the rectangle so that the lower right corner of the rectangle remains unchanged, increasing the width to w1 and the height to h1.
 Find the coordinates of the upper left corner
 */
const calcLeftTopByTopLeft: LeftTopCalcFn = ({
  angle,
  originTop,
  originLeft,
  originWidth,
  originHeight,
  newWidth,
  newHeight,
}) => {
  const anglePI = angle * (Math.PI / 180);
  return {
    left:
      originLeft +
      originWidth * Math.cos(anglePI) -
      originHeight * Math.sin(anglePI) -
      newWidth * Math.cos(anglePI) +
      newHeight * Math.sin(anglePI),
    top:
      originTop +
      originWidth * Math.sin(anglePI) +
      originData.height * Math.cos(anglePI) -
      newWidth * Math.sin(anglePI) -
      newHeight * Math.cos(anglePI),
  };
};

/**
 * Ask the GPT directly:
A rectangle, width w, height h
Rotate the rectangle clockwise by angle a, with the upper left coordinate x1 y1.
Stretch the upper right corner of the rectangle so that the lower left corner of the rectangle remains unchanged, increasing the width to w1 and the height to h1.
Find the coordinates of the upper left corner
(The answer given by GPT is inaccurate, you need to understand it a little, modify it, add and subtract)
 */
const calcLeftTopByTopRight: LeftTopCalcFn = ({
  angle,
  originTop,
  originLeft,
  originHeight,
  newHeight,
}) => {
  const anglePI = angle * (Math.PI / 180);
  return {
    left: originLeft - (originHeight - newHeight) * Math.sin(anglePI),
    top: originTop + (originHeight - newHeight) * Math.cos(anglePI),
  };
};

/**
 * Ask the GPT directly:
A rectangle, width w, height h
Rotate the rectangle clockwise by angle a, with the upper left coordinate x1 y1.
Stretch the lower left corner of the rectangle so that the upper right corner of the rectangle remains unchanged, increasing the width to w1 and the height to h1.
Find the coordinates of the upper left corner

The answer given by GPT is inaccurate, which is more troublesome, so I wrote out the derivation process of each step
 */
const calcLeftTopByBottomLeft: LeftTopCalcFn = ({
  angle,
  originTop,
  originLeft,
  originWidth,
  newWidth,
  newHeight,
}) => {
  // Convert angle to radians
  const aRad = (angle * Math.PI) / 180;

  // Calculate the coordinates of the upper right corner after rotation
  const x2 = originLeft + originWidth * Math.cos(aRad);
  const y2 = originTop + originWidth * Math.sin(aRad);

  // Calculate the lower left corner coordinates after stretching
  const x3 = x2 - newHeight * Math.sin(aRad) - newWidth * Math.cos(aRad);
  const y3 = y2 + newHeight * Math.cos(aRad) - newWidth * Math.sin(aRad);

  // Calculate the coordinates of the upper left corner after stretching
  const x1New = x3 + newHeight * Math.sin(aRad);
  const y1New = y3 - newHeight * Math.cos(aRad);
  return {
    left: x1New,
    top: y1New,
  };
};

const _mouseDownHandler = (
  e: TPointerEvent,
  transformData: Transform,
): boolean => {
  originData.width = transformData.target.width;
  originData.height = transformData.target.height;
  originData.top = transformData.target.top;
  originData.left = transformData.target.left;
  return false;
};

const cursorMap: Record<string, string> = {
  'e-resize': 'ew-resize',
  'w-resize': 'ew-resize',
  'n-resize': 'ns-resize',
  's-resize': 'ns-resize',
  'nw-resize': 'nwse-resize',
  'ne-resize': 'nesw-resize',
  'sw-resize': 'nesw-resize',
  'se-resize': 'nwse-resize',
};
const customCursorStyleHandler: ControlCursorCallback = (a, b, c) => {
  const cursor = scaleCursorStyleHandler(a, b, c);
  return cursorMap[cursor] ?? cursor;
};

const _actionHandler = ({
  e,
  transformData,
  x,
  y,
  needResetScaleAndSnap,
  fn,
  callback,
  snapPosition,
  leftTopCalcFn,
}: {
  e: TPointerEvent;
  transformData: Transform;
  x: number;
  y: number;
  needResetScaleAndSnap?: boolean;
  callback: ((data: { element: FabricObject }) => void) | undefined;
  fn: (
    eventData: TPointerEvent,
    transform: Transform,
    x: number,
    y: number,
  ) => boolean;
  snapPosition: Snap.ControlType;
  leftTopCalcFn?: LeftTopCalcFn;
}) => {
  const rs = fn(
    // Disable default scaling if adsorption is used; otherwise reverse
    { ...e, shiftKey: needResetScaleAndSnap ? true : !e.shiftKey },
    transformData,
    x,
    y,
  );

  if (needResetScaleAndSnap) {
    scaleToSize(transformData, {
      scaleEqual: e.shiftKey,
      leftTopCalcFn,
    });
    snap.resize(transformData.target, snapPosition);
  }
  callback?.({ element: transformData.target });
  return rs;
};

/**
 * upper left
 */
export const getResizeTLControl: GetControls = (props = {}) => {
  const { callback, needResetScaleAndSnap = true } = props;
  return new Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: customCursorStyleHandler,
    actionHandler: (e, transformData, _x, _y) => {
      const rs = _actionHandler({
        e,
        transformData,
        x: _x,
        y: _y,
        needResetScaleAndSnap,
        callback,
        fn: scalingEqually,
        leftTopCalcFn: calcLeftTopByTopLeft,
        snapPosition: Snap.ControlType.TopLeft,
      });
      return rs;
    },
    mouseDownHandler: _mouseDownHandler,
    actionName: 'resizeTLControl', // The name of the control point
  });
};
/**
 * upper middle school
 */
export const getResizeMTControl: GetControls = (props = {}) => {
  const { callback, needResetScaleAndSnap = true } = props;
  return new Control({
    x: 0,
    y: -0.5,
    cursorStyleHandler: customCursorStyleHandler,
    actionHandler: (e, transformData, _x, _y) => {
      const rs = _actionHandler({
        e,
        transformData,
        x: _x,
        y: _y,
        needResetScaleAndSnap,
        callback,
        fn: scalingY,
        leftTopCalcFn: calcLeftTopByTopLeft,
        snapPosition: Snap.ControlType.Top,
      });
      return rs;
    },
    mouseDownHandler: _mouseDownHandler,
    actionName: 'resizeMTControl', // The name of the control point
  });
};

/**
 * upper right
 */
export const getResizeTRControl: GetControls = (props = {}) => {
  const { callback, needResetScaleAndSnap } = props;
  return new Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: customCursorStyleHandler,
    actionHandler: (e, transformData, _x, _y) => {
      const rs = _actionHandler({
        e,
        transformData,
        x: _x,
        y: _y,
        needResetScaleAndSnap,
        callback,
        fn: scalingEqually,
        leftTopCalcFn: calcLeftTopByTopRight,
        snapPosition: Snap.ControlType.TopRight,
      });
      return rs;
    },
    mouseDownHandler: _mouseDownHandler,
    actionName: 'resizeTRControl', // The name of the control point
  });
};

/**
 * center left
 */
export const getResizeMLControl: GetControls = (props = {}) => {
  const { callback, needResetScaleAndSnap } = props;
  return new Control({
    x: -0.5,
    y: 0,
    cursorStyleHandler: customCursorStyleHandler,
    actionHandler: (e, transformData, _x, _y) => {
      const rs = _actionHandler({
        e,
        transformData,
        x: _x,
        y: _y,
        needResetScaleAndSnap,
        callback,
        fn: scalingX,
        leftTopCalcFn: calcLeftTopByBottomLeft,
        snapPosition: Snap.ControlType.Left,
      });

      return rs;
    },
    mouseDownHandler: _mouseDownHandler,
    actionName: 'resizeMLControl', // The name of the control point
  });
};

/**
 * center right
 */
export const getResizeMRControl: GetControls = (props = {}) => {
  const { callback, needResetScaleAndSnap } = props;
  return new Control({
    x: 0.5,
    y: 0,
    cursorStyleHandler: customCursorStyleHandler,
    actionHandler: (e, transformData, _x, _y) => {
      const rs = _actionHandler({
        e,
        transformData,
        x: _x,
        y: _y,
        needResetScaleAndSnap,
        callback,
        fn: scalingX,
        snapPosition: Snap.ControlType.Right,
      });

      return rs;
    },
    mouseDownHandler: _mouseDownHandler,
    actionName: 'resizeMRControl', // The name of the control point
  });
};

/**
 * Lower left
 */
export const getResizeBLControl: GetControls = (props = {}) => {
  const { callback, needResetScaleAndSnap } = props;
  return new Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: customCursorStyleHandler,
    actionHandler: (e, transformData, _x, _y) => {
      const rs = _actionHandler({
        e,
        transformData,
        x: _x,
        y: _y,
        needResetScaleAndSnap,
        callback,
        fn: scalingEqually,
        leftTopCalcFn: calcLeftTopByBottomLeft,
        snapPosition: Snap.ControlType.BottomLeft,
      });

      return rs;
    },
    mouseDownHandler: _mouseDownHandler,
    actionName: 'resizeBLControl', // The name of the control point
  });
};

/**
 * lower middle
 */
export const getResizeMBControl: GetControls = (props = {}) => {
  const { callback, needResetScaleAndSnap } = props;
  return new Control({
    x: 0,
    y: 0.5,
    cursorStyleHandler: customCursorStyleHandler,
    actionHandler: (e, transformData, _x, _y) => {
      const rs = _actionHandler({
        e,
        transformData,
        x: _x,
        y: _y,
        needResetScaleAndSnap,
        callback,
        fn: scalingY,
        snapPosition: Snap.ControlType.Bottom,
      });

      return rs;
    },
    mouseDownHandler: _mouseDownHandler,
    actionName: 'resizeMBControl', // The name of the control point
  });
};

/**
 * Lower right
 */
export const getResizeBRControl: GetControls = (props = {}) => {
  const { callback, needResetScaleAndSnap } = props;
  return new Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: customCursorStyleHandler,
    actionHandler: (e, transformData, _x, _y) => {
      const rs = _actionHandler({
        e,
        transformData,
        x: _x,
        y: _y,
        needResetScaleAndSnap,
        callback,
        fn: scalingEqually,
        snapPosition: Snap.ControlType.BottomRight,
      });

      return rs;
    },
    mouseDownHandler: _mouseDownHandler,
    actionName: 'resizeBRControl', // The name of the control point
  });
};

const _getRotateControl =
  ({
    x,
    y,
    offsetY,
    offsetX,
    actionName,
    rotateStaff,
  }: {
    x: number;
    y: number;
    offsetY: -1 | 1;
    offsetX: -1 | 1;
    actionName: string;
    rotateStaff: number;
  }): GetControls =>
  (props = {}) => {
    const { callback } = props;
    // This size depends on the size of the resize control point
    const offset = 12;
    return new Control({
      x,
      y,
      sizeX: 20,
      sizeY: 20,
      offsetY: offsetY * offset,
      offsetX: offsetX * offset,
      // Override the rotation control point rendering, it is not expected to be displayed, so nothing is written.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      render: () => {},
      // You can only do the cursor when hovering, and the cursor cannot be modified during rotation.
      cursorStyleHandler: (eventData, control, object) =>
        `url(${getCursor(object.angle + rotateStaff)}) 16 16, crosshair`,

      actionHandler: (e, transformData, _x, _y) => {
        // Rotational adsorption, unit: angle, one turn = 360 degrees
        if (e.shiftKey) {
          transformData.target.set({
            snapAngle: 15,
          });
        } else {
          transformData.target.set({
            snapAngle: undefined,
          });
        }

        const rs = rotationWithSnapping(
          e,
          { ...transformData, originX: 'center', originY: 'center' },
          _x,
          _y,
        );

        // scaleToSize(transformData);

        // transformData.target.canvas?.requestRenderAll();
        callback?.({ element: transformData.target });

        return rs;
      },
      actionName, // The name of the control point
    });
  };

// Top Left Rotation Point
export const getRotateTLControl: GetControls = (props = {}) =>
  _getRotateControl({
    x: -0.5,
    y: -0.5,
    offsetY: -1,
    offsetX: -1,
    rotateStaff: 0,
    actionName: 'rotateTLControl',
  })(props);

// Top right rotation point
export const getRotateTRControl: GetControls = (props = {}) =>
  _getRotateControl({
    x: 0.5,
    y: -0.5,
    offsetY: -1,
    offsetX: 1,
    rotateStaff: 90,
    actionName: 'rotateTRControl',
  })(props);

// Lower right rotation point
export const getRotateBRControl: GetControls = (props = {}) =>
  _getRotateControl({
    x: 0.5,
    y: 0.5,
    offsetY: 1,
    offsetX: 1,
    rotateStaff: 180,
    actionName: 'rotateBRControl',
  })(props);

// Lower left rotation point
export const getRotateBLControl: GetControls = (props = {}) =>
  _getRotateControl({
    x: -0.5,
    y: 0.5,
    offsetY: 1,
    offsetX: -1,
    rotateStaff: 270,
    actionName: 'rotateBLControl',
  })(props);
