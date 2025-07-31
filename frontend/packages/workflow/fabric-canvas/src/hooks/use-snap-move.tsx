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

import { useEffect } from 'react';

import { type Canvas } from 'fabric';

import { createSnap, snap } from '../utils/snap/snap';

export const useSnapMove = ({
  canvas,
  helpLineLayerId,
  scale,
}: {
  canvas?: Canvas;
  helpLineLayerId: string;
  scale: number;
}) => {
  useEffect(() => {
    if (!canvas) {
      return;
    }
    const _snap = createSnap(canvas, helpLineLayerId, scale);
    canvas.on('mouse:down', e => {
      snap.resetAllObjectsPosition(e.target);
    });

    canvas.on('mouse:up', e => {
      _snap.reset();
    });

    canvas?.on('object:moving', function (e) {
      if (e.target) {
        _snap.move(e.target);
      }
    });
    return () => {
      _snap.destroy();
    };
  }, [canvas]);

  useEffect(() => {
    if (snap) {
      snap.helpline.resetScale(scale);
    }
  }, [scale]);
};
