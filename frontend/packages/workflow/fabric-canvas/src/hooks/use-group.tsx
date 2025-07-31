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

/**
 * This is a work in progress, I won't do it for the time being, I'll think about it later.
 * 1. After forming a group, support drilling down and continue to select.
 *  Realization idea:
 *    A. Double-click to ungroup and record the group relationship;
 *    B. Drill down to select subgroups, continue to ungroup, and record group relationships;
 *    Click on the canvas (when no elements are selected) and restore the group (note the z-index).
 *
 * 2. When copying and pasting groups, you need to exclude reference elements
 * 3. Delete group Yes, also need to exclude reference elements
 * 4. Due to the introduction of the group, the principle that all elements are flattened is broken. Be aware of the destructive nature of this change.
 *  eg：
 *    A. Get all elements
 *    B. The position calculation of the element is superimposed by each layer of parent elements
 *    C.server-side rendering: Iterate to find all image elements. Restore group after finishing image download
 */
import { useCallback } from 'react';

import {
  ActiveSelection,
  type Canvas,
  type FabricObject,
  type Group,
} from 'fabric';

import { isGroupElement } from '../utils/fabric-utils';
import { createElement } from '../utils';
import { Mode, type FabricObjectWithCustomProps } from '../typings';

export const useGroup = ({ canvas }: { canvas?: Canvas }) => {
  const group = useCallback(async () => {
    const activeObject = canvas?.getActiveObject();
    const objects = (activeObject as ActiveSelection)?.getObjects();
    // You can only group when multiple elements are selected.
    if ((objects?.length ?? 0) > 1) {
      const _group = await createElement({
        mode: Mode.GROUP,
        elementProps: {
          left: activeObject?.left,
          top: activeObject?.top,
          width: activeObject?.width,
          height: activeObject?.height,
        },
      });

      (_group as Group).add(...objects);
      canvas?.add(_group as Group);
      canvas?.setActiveObject(_group as Group);
      canvas?.remove(...objects);
    }
  }, [canvas]);

  const unGroup = useCallback(async () => {
    const activeObject = canvas?.getActiveObject();

    // Ungroup can only be done if a group element is selected
    if (isGroupElement(activeObject)) {
      const _group = activeObject as Group;
      const objects = _group.getObjects();

      await Promise.all(
        objects.map(async d => {
          const element = await createElement({
            mode: (d as FabricObjectWithCustomProps).customType,
            element: d as FabricObjectWithCustomProps,
          });

          _group.remove(d);
          canvas?.add(element as FabricObject);
        }),
      );

      canvas?.discardActiveObject();
      canvas?.remove(_group);

      const activeSelection = new ActiveSelection(objects);
      canvas?.setActiveObject(activeSelection);
      canvas?.requestRenderAll();
    }
  }, [canvas]);

  return {
    group,
    unGroup,
  };
};
