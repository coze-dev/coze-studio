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
