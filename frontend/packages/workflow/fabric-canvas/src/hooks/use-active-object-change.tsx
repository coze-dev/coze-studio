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
 
/* eslint-disable complexity */
/* eslint-disable @coze-arch/max-line-per-function */
import { useCallback, useEffect, useState, useRef } from 'react';

import {
  type Canvas,
  type FabricImage,
  type FabricObject,
  type Group,
  type IText,
  type Rect,
} from 'fabric';

import { resetElementClip } from '../utils/fabric-utils';
import {
  createElement,
  getPopPosition,
  loadFont,
  selectedBorderProps,
} from '../utils';
import {
  Mode,
  type FabricObjectSchema,
  type FabricObjectWithCustomProps,
} from '../typings';
import { setImageFixed } from '../share';
import { useCanvasChange } from './use-canvas-change';

// 设置元素属性
const setElementProps = async ({
  element,
  props,
  canvas,
}: {
  element: FabricObject;
  props: Partial<FabricObjectSchema>;
  canvas?: Canvas;
}): Promise<void> => {
  // 特化一：img 的属性设置需要设置到 img 元素上，而不是外层包裹的 group
  if (
    element?.isType('group') &&
    (element as Group)?.getObjects()?.[0]?.isType('image')
  ) {
    const { stroke, strokeWidth, src, ...rest } = props;
    const group = element as Group;
    const img = group.getObjects()[0] as FabricImage;
    const borderRect = group.getObjects()[1] as Rect;

    // 边框颜色设置到 borderRect 上
    if (stroke) {
      borderRect.set({
        stroke,
      });
    }

    // 边框粗细设置到 borderRect 上
    if (typeof strokeWidth === 'number') {
      borderRect.set({
        strokeWidth,
      });
    }

    // 替换图片
    if (src) {
      const newImg = document.createElement('img');
      await new Promise((done, reject) => {
        newImg.onload = () => {
          img.setElement(newImg);
          done(0);
        };
        newImg.src = src;
      });
    }

    if (Object.keys(rest).length > 0) {
      img.set(rest);
    }

    setImageFixed({ element: group });
  } else {
    // 特化二：文本与段落切换，需要特化处理
    const { customType, ...rest } = props;
    if (
      customType &&
      [Mode.BLOCK_TEXT, Mode.INLINE_TEXT].includes(customType)
    ) {
      const oldElement = element;
      let newLeft = oldElement.left;
      if (newLeft < 0) {
        newLeft = 0;
      } else if (newLeft > (canvas?.width as number)) {
        newLeft = canvas?.width as number;
      }
      let newTop = oldElement.top;
      if (newTop < 0) {
        newTop = 0;
      } else if (newTop > (canvas?.height as number)) {
        newTop = canvas?.height as number;
      }

      const newFontSize = Math.round(
        (oldElement as IText).fontSize * (oldElement as IText).scaleY,
      );
      const needExtendPropKeys = [
        'customId',
        'text',
        'fontSize',
        'fontFamily',
        'fill',
        'stroke',
        'strokeWidth',
        'textAlign',
        'lineHeight',
        'editable',
      ];

      const extendsProps: Record<string, unknown> = {};
      needExtendPropKeys.forEach(key => {
        if ((oldElement as FabricObjectWithCustomProps)[key]) {
          extendsProps[key] = (oldElement as FabricObjectWithCustomProps)[key];
        }
      });
      const newElement = await createElement({
        mode: customType,
        canvas,
        position: [newLeft, newTop],
        elementProps: {
          ...extendsProps,
          ...(props.customType === Mode.INLINE_TEXT
            ? // 块状 -> 单行
              {}
            : // 单行 -> 块状
              {
                // 单行切块状，尽量保持字体大小不变化
                fontSize: newFontSize,
                padding: newFontSize / 4,
                width: 200,
                height: 200,
              }),
        },
      });

      // 如果还有别的属性，设置到新 element 上
      if (Object.keys(rest).length > 0) {
        newElement?.set(rest);
      }

      // 添加新的，顺序不能错，否则删除时引用关系会被判定为无用关系而被删除掉
      canvas?.add(newElement as FabricObject);
      // 删掉老的
      canvas?.remove(oldElement);

      canvas?.discardActiveObject();
      canvas?.setActiveObject(newElement as FabricObject);
      canvas?.requestRenderAll();

      // 普通的属性设置
    } else {
      const { fontFamily } = props;
      // 特化三： 字体需要异步加载
      if (fontFamily) {
        await loadFont(fontFamily);
      }
      /**
       * textBox 比较恶心，不知道什么时机会给每个字都生成样式文件（对应 styles）
       * 这里主动清除下，否则字体相关的设置（fontSize、fontFamily...）不生效
       */
      if (element?.isType('textbox')) {
        element?.set({
          styles: {},
        });
      }

      // 特化四：padding = fontSize/2 , 避免文本上下被截断
      if (element?.isType('textbox') && typeof props.fontSize === 'number') {
        element?.set({
          padding: props.fontSize / 4,
        });
        resetElementClip({
          element: element as FabricObject,
        });
      }

      element?.set(props);
    }
  }
};

export const useActiveObjectChange = ({
  canvas,
  scale,
}: {
  canvas?: Canvas;
  scale: number;
}) => {
  const [activeObjects, setActiveObjects] = useState<
    FabricObject[] | undefined
  >();

  const [activeObjectsPopPosition, setActiveObjectsPopPosition] = useState<{
    tl: {
      x: number;
      y: number;
    };
    br: {
      x: number;
      y: number;
    };
  }>({
    tl: {
      x: -9999,
      y: -9999,
    },
    br: {
      x: -9999,
      y: -9999,
    },
  });

  const [isActiveObjectsInFront, setIsActiveObjectsInFront] =
    useState<boolean>(false);
  const [isActiveObjectsInBack, setIsActiveObjectsInBack] =
    useState<boolean>(false);

  const _setActiveObjectsState = useCallback(() => {
    const objects = canvas?.getObjects();
    setIsActiveObjectsInFront(
      activeObjects?.length === 1 &&
        objects?.[objects.length - 1] === activeObjects?.[0],
    );
    setIsActiveObjectsInBack(
      activeObjects?.length === 1 && objects?.[0] === activeObjects?.[0],
    );
  }, [canvas, activeObjects]);

  useCanvasChange({
    canvas,
    onChange: _setActiveObjectsState,
    listenerEvents: ['object:modified-zIndex'],
  });

  useEffect(() => {
    _setActiveObjectsState();
  }, [activeObjects, _setActiveObjectsState]);

  const _setActiveObjectsPopPosition = () => {
    if (canvas) {
      setActiveObjectsPopPosition(
        getPopPosition({
          canvas,
          scale,
        }),
      );
    }
  };

  useEffect(() => {
    const disposers = (
      ['selection:created', 'selection:updated'] as (
        | 'selection:created'
        | 'selection:updated'
      )[]
    ).map(eventName =>
      canvas?.on(eventName, e => {
        setActiveObjects(canvas?.getActiveObjects());
        _setActiveObjectsPopPosition();

        const selected = canvas?.getActiveObject();
        if (selected) {
          selected.set(selectedBorderProps);
          /**
           * 为什么禁用选中多元素的控制点？
           * 因为直线不期望有旋转，旋转会影响控制点的计算逻辑。
           * 想要放开这个限制，需要在直线的控制点内考虑旋转 & 缩放因素
           */
          if (selected.isType('activeselection')) {
            selected.setControlsVisibility({
              tl: false,
              tr: false,
              bl: false,
              br: false,
              ml: false,
              mt: false,
              mr: false,
              mb: false,
              mtr: false,
            });
          }
          canvas?.requestRenderAll();
        }
      }),
    );

    const disposerCleared = canvas?.on('selection:cleared', e => {
      setActiveObjects(undefined);
      _setActiveObjectsPopPosition();
    });
    disposers.push(disposerCleared);

    return () => {
      disposers.forEach(disposer => disposer?.());
    };
  }, [canvas]);

  // 窗口大小变化时，修正下位置
  useEffect(() => {
    _setActiveObjectsPopPosition();
  }, [scale]);

  useCanvasChange({
    canvas,
    onChange: _setActiveObjectsPopPosition,
    listenerEvents: [
      'object:modified',
      'object:added',
      'object:removed',
      'object:moving',
    ],
  });

  const setActiveObjectsProps = async (
    props: Partial<FabricObjectSchema>,
    customId?: string,
  ) => {
    let elements = activeObjects;
    if (customId) {
      const element = canvas
        ?.getObjects()
        .find(d => (d as FabricObjectWithCustomProps).customId === customId);
      if (element) {
        elements = [element];
      }
    }
    await Promise.all(
      (elements ?? []).map(element =>
        setElementProps({
          element,
          props,
          canvas,
        }),
      ),
    );

    canvas?.requestRenderAll();
    canvas?.fire('object:modified');
  };

  // 实现 shift 水平/垂直移动
  useEffect(() => {
    if (!canvas) {
      return;
    }
    let originalPos = { left: 0, top: 0 };

    const disposers = [
      // 监听对象移动开始事件
      canvas.on('object:moving', function (e) {
        const obj = e.target;
        // 手动 canvas.fire('object:moving') 获取不到 obj
        if (!obj) {
          return;
        }

        // 如果是第一次移动，记录对象的原始位置
        if (originalPos.left === 0 && originalPos.top === 0) {
          originalPos = { left: obj.left, top: obj.top };
        }

        // 检查是否按下了Shift键
        if (e?.e?.shiftKey) {
          // 计算从开始移动以来的水平和垂直距离
          const distanceX = obj.left - originalPos.left;
          const distanceY = obj.top - originalPos.top;

          // 根据移动距离的绝对值判断是水平移动还是垂直移动
          if (Math.abs(distanceX) > Math.abs(distanceY)) {
            // 水平移动：保持垂直位置不变
            obj.set('top', originalPos.top);
          } else {
            // 垂直移动：保持水平位置不变
            obj.set('left', originalPos.left);
          }
        }
      }),

      // 监听对象移动结束事件
      canvas.on('object:modified', function (e) {
        // 移动结束后重置原始位置
        originalPos = { left: 0, top: 0 };
      }),
    ];

    return () => {
      disposers.forEach(disposer => disposer?.());
    };
  }, [canvas]);

  const controlsVisibility = useRef<
    | {
        [key: string]: boolean;
      }
    | undefined
  >();

  // 元素移动过程中，隐藏控制点
  useEffect(() => {
    const disposers: (() => void)[] = [];
    if (activeObjects?.length === 1) {
      const element = activeObjects[0];
      disposers.push(
        element.on('moving', () => {
          if (!controlsVisibility.current) {
            controlsVisibility.current = Object.assign(
              // fabric 规则： undefined 认为是 true
              {
                ml: true, // 中点左
                mr: true, // 中点右
                mt: true, // 中点上
                mb: true, // 中点下
                bl: true, // 底部左
                br: true, // 底部右
                tl: true, // 顶部左
                tr: true, // 顶部右
              },
              element._controlsVisibility,
            );
          }
          element.setControlsVisibility({
            ml: false, // 中点左
            mr: false, // 中点右
            mt: false, // 中点上
            mb: false, // 中点下
            bl: false, // 底部左
            br: false, // 底部右
            tl: false, // 顶部左
            tr: false, // 顶部右
          });
        }),
      );

      disposers.push(
        element.on('mouseup', () => {
          if (controlsVisibility.current) {
            element.setControlsVisibility(controlsVisibility.current);
            controlsVisibility.current = undefined;
          }
        }),
      );
    }

    return () => {
      disposers.forEach(dispose => dispose());
    };
  }, [activeObjects]);

  return {
    activeObjects,
    activeObjectsPopPosition,
    setActiveObjectsProps,
    isActiveObjectsInBack,
    isActiveObjectsInFront,
  };
};
