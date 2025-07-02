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

  // 渲染端点位置计算
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
