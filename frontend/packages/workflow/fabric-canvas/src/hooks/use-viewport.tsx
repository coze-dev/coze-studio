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

import { useCallback, useState } from 'react';

import { type Point, type TMat2D, type Canvas } from 'fabric';

import { setViewport, zoomToPoint } from '../utils';
import { type FabricSchema } from '../typings';

export const useViewport = ({
  canvas,
  schema,
  minZoom,
  maxZoom: maxZoom,
}: {
  canvas?: Canvas;
  schema: FabricSchema;
  minZoom: number;
  maxZoom: number;
}) => {
  const [viewport, _setViewport] = useState<TMat2D>([1, 0, 0, 1, 0, 0]);

  const setCanvasViewport = useCallback(
    (vpt: TMat2D) => {
      if (!canvas) {
        return;
      }
      const _vpt: TMat2D = [...vpt];
      // Limit viewport movement area: Cannot move out of canvas
      if (_vpt[4] > 0) {
        _vpt[4] = 0;
      }

      if (_vpt[4] < -schema.width * (_vpt[0] - 1)) {
        _vpt[4] = -schema.width * (_vpt[0] - 1);
      }

      if (_vpt[5] > 0) {
        _vpt[5] = 0;
      }

      if (_vpt[5] < -schema.height * (_vpt[0] - 1)) {
        _vpt[5] = -schema.height * (_vpt[0] - 1);
      }

      setViewport({ canvas, vpt: _vpt });
      _setViewport(_vpt);
      canvas.fire('object:moving');
    },
    [canvas, schema, minZoom, maxZoom],
  );

  const _zoomToPoint = useCallback(
    (point: Point, zoomLevel: number) => {
      const vpt = zoomToPoint({
        canvas,
        point,
        zoomLevel,
        minZoom,
        maxZoom,
      });
      setCanvasViewport(vpt);
    },
    [setCanvasViewport],
  );

  return {
    setViewport: setCanvasViewport,
    viewport,
    zoomToPoint: _zoomToPoint,
  };
};
