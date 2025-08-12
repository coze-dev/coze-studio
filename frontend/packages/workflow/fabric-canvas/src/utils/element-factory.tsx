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
 * Hosting all graphics creation, empowering business transformation
 * call timing
 * 1. Initial creation
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
 * Override default Textbox height calculation logic
 * Default: Hold up Textbox according to content
 * Expected: Render strictly according to the given height, overflow hidden
 */
const _calcTextHeight = Textbox.prototype.calcTextHeight;
Textbox.prototype.calcTextHeight = function () {
  return ((this as Textbox & { customFixedHeight?: number })
    .customFixedHeight ?? _calcTextHeight.call(this)) as number;
};

/**
 * Fix fabric bug: Text width calculation is abnormal after using some custom fonts
 * Repair plan from https://github.com/fabricjs/fabric.js/issues/9852
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
 * Element creation portal, where all element creation logic goes
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

        // The starting point when creating a line is not triggered by a control point and requires additional listening
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
       * FabricImage does not support stretching/adaptive
       * You need to wrap it in Group, and calculate the position of the image according to the size of the Group.
       * 1. customId customType should be given to the Group. (The root of other elements is consistent and can be directly retrieved from element)
       * 2. The relevant settings of the border should be given to the picture.
       *
       * The resulting hack:
       * 1. The attribute form is parsed into formValue according to the schema, and you need to take groupSchema.objects [0]
       * 2. The property form sets the element properties (borders), you need to call group.getObjects () [0] .set
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
           * Stroke, strokeWidth set for borderRect objects [1]
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

          // When filling in proportions, the image will overflow, so cropping is added.
          const clipRect = new Rect();
          _element.set({
            clipPath: clipRect,
          });
        }
      }

      resetElementClip({ element: _element as FabricObject });

      // Calculate the render position of the image
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

// Load hook elements to canvas
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
