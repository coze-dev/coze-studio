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

import React, { useEffect } from 'react';

import {
  useService,
  type FlowNodeEntity,
  type IPoint,
} from '@flowgram-adapter/fixed-layout-editor';

import { getLineId } from '../../utils';
import { type CustomLine } from '../../typings';
import { CustomHoverService } from '../../services';
import { LINE_CLASS_NAME } from '../../constants/line';
import { STROKE_WIDTH, ARROW_HEIGHT } from '../../constants';

const defaultColor = 'rgba(216, 219, 232, 1)';
const activateColor = '#5147FF';

export const LineSVG = (props: {
  line: CustomLine;
  hovered: boolean;
  path: string;
  fromEntity: FlowNodeEntity;
  toPos: IPoint;
  activated: boolean;
  setHovered: (_hovered: boolean) => void;
}) => {
  const {
    line,
    path: bezierPath,
    fromEntity,
    toPos,
    activated,
    hovered,
    setHovered,
  } = props;

  const strokeWidth = STROKE_WIDTH;

  const customHoverService = useService<CustomHoverService>(CustomHoverService);

  useEffect(() => {
    const disposable = customHoverService.onHoverCollapse(
      (node?: FlowNodeEntity) => {
        if (node?.id && node?.id.includes(fromEntity.id)) {
          setHovered(true);
        } else {
          setHovered(false);
        }
      },
    );
    const disposableLine = customHoverService.onHoverLine((l?: CustomLine) => {
      if (getLineId(l) === getLineId(line)) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    });
    return () => {
      disposable.dispose();
      disposableLine?.dispose();
    };
  }, []);

  if (fromEntity.collapsed) {
    return null;
  }

  return (
    <>
      <path
        className={LINE_CLASS_NAME}
        d={bezierPath}
        stroke={activated || hovered ? activateColor : defaultColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <polygon
        className={LINE_CLASS_NAME}
        points={`${toPos.x},${toPos.y} ${toPos.x - 4.5},${
          toPos.y - ARROW_HEIGHT
        } ${toPos.x + 4.5},${toPos.y - ARROW_HEIGHT}`}
        fill={activated || hovered ? activateColor : defaultColor}
      />
    </>
  );
};
