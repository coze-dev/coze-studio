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

import React, { useState } from 'react';

import { type IPoint } from '@flowgram-adapter/fixed-layout-editor';

import { type CustomLine } from '../../typings';
import { ARROW_HEIGHT } from '../../constants';
import { getBezierVerticalControlPoints } from './utils';
import { LineSVG } from './line-svg';

export interface PropsType {
  line: CustomLine;
  activated: boolean;
}

function getPath(params: {
  fromPos: IPoint;
  toPos: IPoint;
  controls: IPoint[];
}): string {
  const { fromPos } = params;
  const toPos = {
    x: params.toPos.x,
    y: params.toPos.y - ARROW_HEIGHT,
  };

  const { controls } = params;

  // Render endpoint position calculation
  const renderToPos: IPoint = { x: toPos.x, y: toPos.y };

  const getPathData = (): string => {
    const controlPoints = controls.map(s => `${s.x} ${s.y}`).join(',');
    const curveType = controls.length === 1 ? 'S' : 'C';

    return `M${fromPos.x} ${fromPos.y} ${curveType} ${controlPoints}, ${renderToPos.x} ${renderToPos.y}`;
  };
  const path = getPathData();
  return path;
}

export function RenderLine(props: PropsType) {
  const { activated, line } = props;
  const [hovered, setHovered] = useState(false);

  const { from } = line;

  const controls = getBezierVerticalControlPoints(line.fromPoint, line.toPoint);

  const path = getPath({
    fromPos: line.fromPoint,
    toPos: line.toPoint,
    controls,
  });

  return (
    <LineSVG
      line={line}
      path={path}
      fromEntity={from}
      toPos={line.toPoint}
      activated={activated}
      hovered={hovered}
      setHovered={setHovered}
    />
  );
}
