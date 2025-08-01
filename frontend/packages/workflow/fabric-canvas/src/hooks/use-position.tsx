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

import { useCallback, useEffect, useState } from 'react';

import {
  type Canvas,
  type FabricObject,
  type Group,
  type TMat2D,
} from 'fabric';

import {
  type FabricObjectWithCustomProps,
  type IRefPosition,
  Mode,
} from '../typings';
import { useCanvasChange } from './use-canvas-change';

const getElementTitlePosition = ({
  element,
  scale,
}: {
  element: FabricObjectWithCustomProps;
  scale: number;
}): IRefPosition => {
  const isImg = (element as FabricObject).isType('group');
  const isInlineText = element.customType === Mode.INLINE_TEXT;

  const targetElement = isImg
    ? (element as unknown as Group).getObjects()[0]
    : element;
  const targetElementTopLeft = targetElement.calcOCoords().tl;
  const { width, scaleX = 1, padding = 0 } = targetElement;

  let left = targetElementTopLeft.x * scale;
  let top = targetElementTopLeft.y * scale;

  // Image specialization, proportional stretching needs to be considered, and the position is limited to the group range
  if (isImg) {
    const strokeWidth =
      (element as unknown as Group).getObjects()?.[1]?.strokeWidth ?? 0;
    top = top - strokeWidth / 2;
    left = left - strokeWidth / 2;

    const groupTopLeft = element.calcOCoords().tl;
    left = Math.max(groupTopLeft.x * scale, left);
    top = Math.max(groupTopLeft.y * scale, top);
  }

  return {
    left,
    top,
    angle: element.angle,
    id: element.customId,
    maxWidth: isInlineText ? 999 : (width * scaleX + padding * 2) * scale,
    isImg,
  };
};

export const usePosition = ({
  canvas,
  scale,
  viewport,
}: {
  canvas?: Canvas;
  scale: number;
  viewport?: TMat2D;
}) => {
  // const [objects, setObjects] = useState<FabricObjectWithCustomProps[]>([]);
  const [screenPositions, setScreenPositions] = useState<IRefPosition[]>([]);

  const _setPositions = useCallback(() => {
    // Why setTimeout? When batching, you need to delay to get the correct coordinates.
    setTimeout(() => {
      if (!canvas) {
        return;
      }
      const _objects = canvas.getObjects() as FabricObjectWithCustomProps[];
      // setObjects(_objects);
      const _positions = _objects?.map(ref =>
        getElementTitlePosition({
          element: ref,
          scale,
        }),
      );
      setScreenPositions(_positions);
    }, 0);
  }, [canvas, scale, viewport]);

  useEffect(() => {
    _setPositions();
  }, [_setPositions]);

  useCanvasChange({
    canvas,
    onChange: _setPositions,
  });

  return {
    allObjectsPositionInScreen: screenPositions,
  };
};
