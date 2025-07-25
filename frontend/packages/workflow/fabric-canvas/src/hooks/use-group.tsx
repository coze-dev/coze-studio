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
 * 这是个半成品，暂时不做了，后面再考虑
 * 1. 成组后要支持下钻继续选择
 *  实现思路：
 *    a.双击解组，并记录组关系；
 *    b.下钻选择子组，继续解组，并记录组关系；
 *    c.点击画布（没有任何选中元素时），恢复组（要注意 z-index）。
 *
 * 2. 复制粘贴组时，需要排除掉引用元素
 * 3. 删除组是，也需要排除引用元素
 * 4. 因为组的引入，打破了所有元素都是拍平的原则，要注意这个改动的破坏性。
 *  eg：
 *    a. 获取所有元素
 *    b. 元素的位置计算是由每层父元素叠加来的
 *    c. 服务端渲染：遍历找所有的图片元素。完成图片下载后恢复组
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
    // 选中了多个元素时，才可以 group
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

    // 仅选中了一个 group 元素时，才可以 ungroup
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
