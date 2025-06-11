import { Bezier } from 'bezier-js';
import { type IPoint, Point } from '@flowgram-adapter/fixed-layout-editor';

import { type CustomLine } from '../typings';
import { getBezierVerticalControlPoints } from '../components/lines-render/utils';

export const getLineId = (line?: CustomLine) => {
  if (!line) {
    return undefined;
  }
  return `${line.from.id}${line.to.id}`;
};

export const calcDistance = (pos: IPoint, line?: CustomLine) => {
  if (!line) {
    return Number.MAX_SAFE_INTEGER;
  }
  const { fromPoint, toPoint } = line;
  const controls = getBezierVerticalControlPoints(line.fromPoint, line.toPoint);
  const bezier = new Bezier([fromPoint, ...controls, toPoint]);
  return Point.getDistance(pos, bezier.project(pos));
};
