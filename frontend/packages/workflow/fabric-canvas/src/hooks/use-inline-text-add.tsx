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

import { useRef } from 'react';

import { type Canvas } from 'fabric';

import { createElement } from '../utils';
import { type FabricObjectWithCustomProps, Mode } from '../typings';

export const useInlineTextAdd = ({
  canvas,
  onShapeAdded,
}: {
  canvas?: Canvas;
  onShapeAdded?: (data: { element: FabricObjectWithCustomProps }) => void;
}) => {
  const disposers = useRef<(() => void)[]>([]);

  const enterAddInlineText = () => {
    if (!canvas) {
      return;
    }

    const mouseDownDisposer = canvas.on('mouse:down', async ({ e }) => {
      const pointer = canvas.getScenePoint(e);
      e.preventDefault();

      canvas.selection = false;
      const text = await createElement({
        mode: Mode.INLINE_TEXT,
        position: [pointer.x, pointer.y],
        canvas,
      });

      if (text) {
        canvas.add(text);
        canvas.setActiveObject(text);

        onShapeAdded?.({ element: text as FabricObjectWithCustomProps });
      }
    });
    disposers.current.push(mouseDownDisposer);
  };

  const exitAddInlineText = () => {
    if (!canvas) {
      return;
    }

    canvas.selection = true;

    if (disposers.current.length > 0) {
      disposers.current.forEach(disposer => disposer());
      disposers.current = [];
    }
  };

  return {
    enterAddInlineText,
    exitAddInlineText,
  };
};
