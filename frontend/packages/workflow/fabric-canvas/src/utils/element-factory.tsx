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
 
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable complexity */
/**
 * 托管所有的图形创建，赋予业务改造
 * 调用时机
 * 1. 初次创建
 * 2. loadFromSchema
 */
import { nanoid } from 'nanoid';
import {
  Ellipse,
  FabricImage,
  Group,
  IText,
  Line,
  Rect,
  Textbox,
  Triangle,
  type Canvas,
  FabricObject,
  type ObjectEvents,
} from 'fabric';
import { I18n } from '@coze-arch/i18n';

import {
  Mode,
  type FabricObjectWithCustomProps,
  type FabricObjectSchema,
} from '../typings';
import { setImageFixed } from '../share';
import { resetElementClip } from './fabric-utils';
import { defaultProps } from './default-props';
import { createControls, setLineControlVisible } from './create-controls';

/**
 * 覆盖默认的 Textbox height 计算逻辑
 * 默认：根据内容，撑起 Textbox
 * 预期：严格按照给定高度渲染，溢出隐藏
 */
const _calcTextHeight = Textbox.prototype.calcTextHeight;
Textbox.prototype.calcTextHeight = function () {
  return ((this as Textbox & { customFixedHeight?: number })
    .customFixedHeight ?? _calcTextHeight.call(this)) as number;
};

/**
 * 修复 fabric bug：使用某些自定义字体后，Text 宽度计算异常
 * 修复方案 from https://github.com/fabricjs/fabric.js/issues/9852
 */
IText.getDefaults = () => ({});
// for each class in the chain that has a ownDefaults object:
Object.assign(IText.prototype, Textbox.ownDefaults);
Object.assign(Text.prototype, IText.ownDefaults);
Object.assign(FabricObject.prototype, FabricObject.ownDefaults);

const textDefaultText = I18n.t('imageflow_canvas_text_default');
const textBoxDefaultText = I18n.t('imageflow_canvas_text_default');

export const createCommonObjectOptions = (
  mode: Mode,
): Partial<FabricObjectWithCustomProps> => ({
  customId: nanoid(),
  customType: mode as Mode,
});

/**
 * 元素创建入口，所有的元素创建逻辑都走这里
 */
export const createElement = async ({
  mode,
  position,
  element,
  elementProps = {},
  canvas,
}: {
  mode?: Mode;
  position?: [x?: number, y?: number];
  canvas?: Canvas;
  element?: FabricObjectWithCustomProps;
  elementProps?: Partial<FabricObjectSchema>;
}): Promise<FabricObject | undefined> => {
  const left = element?.left ?? position?.[0] ?? 0;
  const top = element?.top ?? position?.[1] ?? 0;

  const _mode = mode ?? element?.customType;

  const commonNewObjectOptions = createCommonObjectOptions(_mode as Mode);

  switch (_mode) {
    case Mode.RECT: {
      let _element: FabricObject | undefined = element;
      if (!_element) {
        _element = new Rect({
          ...commonNewObjectOptions,
          ...defaultProps[_mode],
          ...elementProps,
          left,
          top,
          width: 1,
          height: 1,
        });
      }

      createControls[_mode]?.({
        element: _element,
      });
      return _element;
    }
    case Mode.CIRCLE: {
      let _element: FabricObject | undefined = element;
      if (!_element) {
        _element = new Ellipse({
          ...commonNewObjectOptions,
          ...defaultProps[_mode],
          ...elementProps,
          left,
          top,
          rx: 1,
          ry: 1,
        });
      }

      createControls[_mode]?.({
        element: _element,
      });
      return _element;
    }
    case Mode.TRIANGLE: {
      let _element: FabricObject | undefined = element;
      if (!_element) {
        _element = new Triangle({
          ...commonNewObjectOptions,
          ...defaultProps[_mode],
          ...elementProps,
          left,
          top,
          width: 1,
          height: 1,
        });
      }

      createControls[_mode]?.({
        element: _element as Triangle,
      });
      return _element;
    }

    case Mode.STRAIGHT_LINE: {
      let _element: FabricObject | undefined = element;
      if (!_element) {
        _element = new Line([left, top, left, top], {
          ...commonNewObjectOptions,
          ...defaultProps[_mode],
          ...elementProps,
        });

        // 创建直线时的起始点不是通过控制点触发的，需要额外监听
        _element.on('start-end:modified' as keyof ObjectEvents, () => {
          setLineControlVisible({
            element: _element as Line,
          });
        });
      }

      createControls[_mode]?.({
        element: _element as Line,
      });
      return _element;
    }

    case Mode.INLINE_TEXT: {
      let _element: FabricObject | undefined = element;

      if (!_element) {
        _element = new IText(elementProps?.text ?? textDefaultText, {
          ...commonNewObjectOptions,
          ...defaultProps[_mode],
          ...elementProps,
          left,
          top,
        });
      }

      createControls[_mode]?.({
        element: _element,
      });

      return _element;
    }

    case Mode.BLOCK_TEXT: {
      let _element: FabricObject | undefined = element;
      const width = elementProps?.width ?? _element?.width ?? 1;
      const height = elementProps?.height ?? _element?.height ?? 1;

      if (!_element) {
        _element = new Textbox(
          (elementProps?.text as string) ?? textBoxDefaultText,
          {
            ...commonNewObjectOptions,
            ...defaultProps[_mode],
            customFixedHeight: height,
            left,
            top,
            width,
            height,
            ...elementProps,
          },
        );
        const rect = new Rect();

        _element.set({
          clipPath: rect,
        });
      }
      resetElementClip({ element: _element as FabricObject });

      createControls[_mode]?.({
        element: _element,
      });

      return _element;
    }

    case Mode.IMAGE: {
      let _element: FabricObject | undefined = element;

      /**
       * FabricImage 不支持拉伸/自适应
       * 需要用 Group 包一下，根据 Group 大小，计算 image 的位置
       * 1. customId customType 要给到 Group。（根其他元素保持一致，从 element 上能直接取到）
       * 2. 边框的相关设置要给到图片
       *
       * 因此而产生的 Hack：
       * 1. 属性表单根据 schema 解析成 formValue ，需要取 groupSchema.objects[0]
       * 2. 属性表单设置元素属性(边框)，需要调用 group.getObjects()[0].set
       */
      if (!_element) {
        if (elementProps?.src) {
          const img = await FabricImage.fromURL(elementProps?.src);

          const defaultWidth = defaultProps[_mode].width as number;
          const defaultHeight = defaultProps[_mode].height as number;
          const defaultLeft =
            left ??
            ((elementProps?.left ?? defaultProps[_mode].left) as number);
          const defaultTop =
            top ?? ((elementProps?.top ?? defaultProps[_mode].top) as number);

          /**
           * stroke, strokeWidth 设置给 borderRect objects[1]
           */
          const { stroke, strokeWidth, ...rest } = {
            ...defaultProps[_mode],
            ...elementProps,
          };
          img.set(rest);

          _element = new Group([img]);

          const groupProps = {
            ...commonNewObjectOptions,
            left: defaultLeft,
            top: defaultTop,
            width: defaultWidth,
            height: defaultHeight,
            customId: elementProps?.customId ?? commonNewObjectOptions.customId,
          };

          const borderRect = new Rect({
            width: groupProps.width,
            height: groupProps.height,
            stroke,
            strokeWidth,
            fill: '#00000000',
          });

          (_element as Group).add(borderRect);
          _element.set(groupProps);

          // 比例填充时，图片会溢出，所以加了裁剪
          const clipRect = new Rect();
          _element.set({
            clipPath: clipRect,
          });
        }
      }

      resetElementClip({ element: _element as FabricObject });

      // 计算 image 的渲染位置
      setImageFixed({
        element: _element as Group,
      });

      createControls[_mode]?.({
        element: _element as FabricImage,
      });

      return _element;
    }

    case Mode.GROUP: {
      let _element: FabricObject | undefined = element;
      if (!_element) {
        const { objects = [] } = elementProps;
        _element = new Group(objects as unknown as FabricObject[], {
          ...commonNewObjectOptions,
          ...defaultProps[_mode],
          ...elementProps,
        });
      }
      return _element;
    }

    case Mode.PENCIL: {
      if (element) {
        createControls[_mode]?.({
          element,
        });
      }
      return element;
    }
    default:
      return element;
  }
};

// hook element 加载到画布
export const setElementAfterLoad = async ({
  element,
  options: { readonly },
  canvas,
}: {
  element: FabricObject;
  options: { readonly: boolean };
  canvas?: Canvas;
}) => {
  element.selectable = !readonly;
  await createElement({
    element: element as FabricObjectWithCustomProps,
    canvas,
  });

  if (readonly) {
    element.set({
      hoverCursor: 'default',
    });
  }
};
