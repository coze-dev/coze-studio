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

import { type Snap } from '../../typings';

export const getObjectPoints = (
  object: FabricObject,
): Snap.ObjectPointsWithMiddle => {
  const {
    left,
    top,
    height: _height,
    width: _width,
    scaleX,
    scaleY,
    angle,
    strokeWidth,
  } = object;

  const height = _height * scaleY + strokeWidth;
  const width = _width * scaleX + strokeWidth;

  const tl = { x: left, y: top };
  const anglePI = angle * (Math.PI / 180);
  const tr = {
    x: left + width * Math.cos(anglePI),
    y: top + width * Math.sin(anglePI),
  };

  const bl = {
    x: left - height * Math.sin(anglePI),
    y: top + height * Math.cos(anglePI),
  };
  const br = {
    x: left - height * Math.sin(anglePI) + width * Math.cos(anglePI),
    y: top + height * Math.cos(anglePI) + width * Math.sin(anglePI),
  };

  return fixedMiddlePoint({ tl, tr, bl, br });
};

export const getBBoxWidth = (target: FabricObject) => {
  const { width: _width, scaleX, strokeWidth } = target;
  const width = _width * scaleX + strokeWidth;
  return width;
};

export const getBBoxHeight = (target: FabricObject) => {
  const { height: _height, scaleY, strokeWidth } = target;
  const height = _height * scaleY + strokeWidth;
  return height;
};

export const bboxWidthToWidth = ({
  nextWidth,
  target,
}: {
  nextWidth: number;
  target: FabricObject;
}) => {
  const width = (nextWidth - target.strokeWidth) / target.scaleX;
  return width;
};

export const bboxHeightToHeight = ({
  nextHeight,
  target,
}: {
  nextHeight: number;
  target: FabricObject;
}) => {
  const height = (nextHeight - target.strokeWidth) / target.scaleY;
  return height;
};

export const numberEqual = (a: number, b: number) => Math.abs(a - b) < 0.01;

export const fixedMiddlePoint = (
  objectPoints: Snap.ObjectPoints,
): Snap.ObjectPointsWithMiddle => {
  const { tl, tr, bl, br } = objectPoints;
  return {
    tl,
    tr,
    m: { x: tl.x + (br.x - tl.x) / 2, y: tl.y + (br.y - tl.y) / 2 },
    bl,
    br,
  };
};

// Find the specified point, the nearest element, and the point
export const findLatestObject = (
  otherPoints: Snap.ObjectPointsWithMiddle[],
  targets: number[],
  direction: 'x' | 'y' = 'y',
) => {
  let latestObject: Snap.ObjectPointsWithMiddle[] = [];
  let latestSnapPoint: Snap.Point[] = [];
  let latestDistance = Infinity;
  let latestDistanceAbs = Infinity;

  targets.forEach(target => {
    otherPoints.forEach(point => {
      Object.values(point).forEach(p => {
        const abs = Math.abs(p[direction] - target);
        if (numberEqual(abs, latestDistanceAbs)) {
          latestObject.push(point);
          latestSnapPoint.push(p);
        } else if (abs < latestDistanceAbs) {
          latestObject = [point];
          latestSnapPoint = [p];
          latestDistance = p[direction] - target;
          latestDistanceAbs = abs;
        }
      });
    });
  });
  return {
    object: latestObject,
    snapPoints: latestSnapPoint,
    distance: latestDistance,
    distanceAbs: latestDistanceAbs,
  };
};

export const getLatestSnapRs = (
  snapRs: (Snap.SnapLine | undefined)[] = [],
): Snap.SnapLine => {
  const snapRsFilterEmpty = snapRs.filter(Boolean) as Snap.SnapLine[];

  const sortedSnapRs = snapRsFilterEmpty.sort(
    (a, b) => a.snapDistance - b.snapDistance,
  );
  // Find the nearest distance
  const latestSnapRs = sortedSnapRs[0];

  // Find the helplines with the closest distance, there may be multiple closest distances, and merge the helplines.
  const helplinesRs = snapRsFilterEmpty
    .filter(rs => numberEqual(rs.snapDistance, latestSnapRs.snapDistance))
    .map(rs => rs.helplines)
    .flat();

  return {
    ...latestSnapRs,
    helplines: helplinesRs,
  };
};
