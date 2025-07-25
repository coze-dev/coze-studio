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
 
/**
 * 这个文件仅实现 setImageFixed 一个函数就好
 * nodejs 图片渲染同样需要计算位置。要在 packages/workflow/nodejs/fabric-render 实现一份功能完全一致的 js 版
 */
import {
  type FabricImage,
  type FabricObject,
  type Group,
  type Rect,
} from 'fabric';

import { ImageFixedType, type FabricObjectWithCustomProps } from './typings';

/**
 * 调整 img 位置
 */
export const setImageFixed = ({ element }: { element: FabricObject }) => {
  const { width, height } = element;
  const img = (element as Group).getObjects()[0] as FabricImage;
  const { customFixedType } = img as unknown as FabricObjectWithCustomProps;

  const borderRect = (element as Group).getObjects()[1] as Rect;
  const { strokeWidth = 0 } = borderRect;

  // 填充/拉伸时，框适配 group 大小即可
  const borderRectWidth = width - strokeWidth;
  const borderRectHeight = height - strokeWidth;
  borderRect.set({
    width: borderRectWidth,
    height: borderRectHeight,
    left: -width / 2,
    top: -height / 2,
  });

  const { width: originWidth, height: originHeight } = img.getOriginalSize();

  /**
   * 为什么 +1？
   * 经过计算后，存储位数有限，不管是 scaleX/Y width/height top/left，都会丢失一点点精度
   * 这点精度反馈到图片上，就是图片与边框有一点点间隙
   * 这里 +1 让图片显示的稍微大一点，弥补精度带来的间隙。
   * 弊端：边框会覆盖一点点图片（覆盖多少看缩放比），用户基本无感
   */
  const realScaleX = (width - strokeWidth * 2 + 1) / originWidth;
  const realScaleY = (height - strokeWidth * 2 + 1) / originHeight;
  const minScale = Math.min(realScaleX, realScaleY);
  const maxScale = Math.max(realScaleX, realScaleY);
  let scaleX = minScale;
  let scaleY = minScale;
  if (customFixedType === ImageFixedType.FILL) {
    scaleX = maxScale;
    scaleY = maxScale;
  } else if (customFixedType === ImageFixedType.FULL) {
    scaleX = realScaleX;
    scaleY = realScaleY;
  }

  const imgLeft = -(originWidth * scaleX) / 2;
  const imgTop = -(originHeight * scaleY) / 2;

  // 自适应时需要对图片描边
  if (customFixedType === ImageFixedType.AUTO) {
    borderRect.set({
      width: Math.min(borderRectWidth, originWidth * scaleX + strokeWidth),
      height: Math.min(borderRectHeight, originHeight * scaleY + strokeWidth),
      left: Math.max(-width / 2, imgLeft - strokeWidth),
      top: Math.max(-height / 2, imgTop - strokeWidth),
    });
  }

  img.set({
    left: imgLeft,
    top: imgTop,
    width: originWidth,
    height: originHeight,
    scaleX,
    scaleY,
  });
};
