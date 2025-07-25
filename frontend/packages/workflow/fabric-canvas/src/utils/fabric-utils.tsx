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
  type Canvas,
  type FabricObject,
  type Point,
  type TMat2D,
  type Textbox,
} from 'fabric';

import { Mode, type FabricObjectWithCustomProps } from '../typings';

/**
 * 缩放到指定点
 */
export const zoomToPoint = ({
  canvas,
  point,
  zoomLevel,
  minZoom,
  maxZoom,
}: {
  point: Point;
  zoomLevel: number;
  canvas?: Canvas;
  minZoom: number;
  maxZoom: number;
}): TMat2D => {
  // 设置缩放级别的限制
  zoomLevel = Math.max(zoomLevel, minZoom); // 最小缩放级别
  zoomLevel = Math.min(zoomLevel, maxZoom); // 最大缩放级别

  // 以鼠标位置为中心进行缩放
  canvas?.zoomToPoint(point, zoomLevel);
  return [...(canvas?.viewportTransform as TMat2D)];
};

/**
 * 设置 canvas 视图
 */
export const setViewport = ({
  canvas,
  vpt,
}: {
  vpt: TMat2D;
  canvas?: Canvas;
}): TMat2D => {
  canvas?.setViewportTransform(vpt);
  canvas?.requestRenderAll();
  return [...(canvas?.viewportTransform as TMat2D)];
};

/**
 * 画布坐标点距离画布左上角距离（单位：px）
 */
export const canvasXYToScreen = ({
  canvas,
  scale,
  point,
}: {
  canvas: Canvas;
  scale: number;
  point: { x: number; y: number };
}) => {
  // 获取画布的变换矩阵
  const transform = canvas.viewportTransform;

  // 应用缩放和平移
  const zoomX = transform[0];
  const zoomY = transform[3];
  const translateX = transform[4];
  const translateY = transform[5];

  const screenX = (point.x * zoomX + translateX) * scale;
  const screenY = (point.y * zoomY + translateY) * scale;

  // 获取画布在屏幕上的位置
  const x = screenX;
  const y = screenY;

  // 不做限制
  return {
    x,
    y,
  };
};

/**
 * 得到选中元素的屏幕坐标（左上 tl、右下 br）
 */
export const getPopPosition = ({
  canvas,
  scale,
}: {
  canvas: Canvas;
  scale: number;
}) => {
  const selection = canvas?.getActiveObject();
  if (canvas && selection) {
    const boundingRect = selection.getBoundingRect();

    // 左上角坐标
    const tl = {
      x: boundingRect.left,
      y: boundingRect.top,
    };

    // 右下角坐标
    const br = {
      x: boundingRect.left + boundingRect.width,
      y: boundingRect.top + boundingRect.height,
    };

    return {
      tl: canvasXYToScreen({ canvas, scale, point: tl }),
      br: canvasXYToScreen({ canvas, scale, point: br }),
    };
  }

  return {
    tl: {
      x: -9999,
      y: -9999,
    },
    br: {
      x: -9999,
      y: -9999,
    },
  };
};

export const resetElementClip = ({ element }: { element: FabricObject }) => {
  if (!element.clipPath) {
    return;
  }

  const clipRect = element.clipPath;
  const padding = (element as Textbox).padding ?? 0;

  const { height, width } = element as FabricObject;

  const _height = height + padding * 2;
  const _width = width + padding * 2;

  const newPosition = {
    originX: 'left',
    originY: 'top',
    left: -_width / 2,
    top: -_height / 2,
    height: _height,
    width: _width,
    absolutePositioned: false,
  };

  clipRect?.set(newPosition);
};

export const isGroupElement = (obj?: FabricObject) =>
  (obj as FabricObjectWithCustomProps)?.customType === Mode.GROUP;
