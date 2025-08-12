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
import { I18n } from '@coze-arch/i18n';
import { IconCozArrowDown, IconCozPalette } from '@coze-arch/coze-design/icons';
import { Tooltip } from '@coze-arch/coze-design';

import { MyIconButton } from '../icon-button';
import { defaultProps } from '../../utils';
import { ColorMode, ImageFixedType, Mode, type FormMeta } from '../../typings';
import { fontTreeData } from '../../assert/font';

const createTextMeta = (
  textType: Mode.BLOCK_TEXT | Mode.INLINE_TEXT,
): FormMeta => ({
  display: 'row',
  style: {
    padding: '8px',
  },
  content: [
    {
      name: 'customId',
      setter: 'RefSelect',
      setterProps: {
        label: I18n.t('imageflow_canvas_reference', {}, '引用'),
        labelInside: true,
        className: 'w-[160px]',
      },
    },

    {
      name: 'fontFamily',
      splitLine: false,
      setter: 'TextFamily',
      setterProps: {
        treeData: fontTreeData,
        defaultValue: defaultProps[textType].fontFamily,
      },
    },
    {
      name: 'fontSize',
      setter: 'FontSize',
      setterProps: {
        min: 10,
        max: 300,
        optionList: [12, 16, 20, 24, 32, 40, 48, 56, 72, 92, 120, 160, 220].map(
          d => ({
            value: d,
            label: `${d}`,
          }),
        ),
        defaultValue: defaultProps[textType].fontSize,
      },
    },

    {
      name: 'lineHeight',
      splitLine: false,
      setter: 'LineHeight',
      setterProps: {
        optionList: [10, 50, 100, 120, 150, 200, 250, 300, 350, 400].map(d => ({
          value: d,
          label: `${d}%`,
        })),
        min: 10,
        max: 400,
        defaultValue: defaultProps[textType].lineHeight,
      },
    },
    {
      setter: ({ tooltipVisible }) => (
        <Tooltip
          mouseEnterDelay={300}
          mouseLeaveDelay={300}
          content={I18n.t('imageflow_canvas_style_tooltip')}
        >
          <MyIconButton
            inForm
            className="!w-[48px]"
            color={tooltipVisible ? 'highlight' : 'secondary'}
            icon={
              <div className="flex flex-row items-center gap-[2px]">
                <IconCozPalette className="text-[16px]" />
                <IconCozArrowDown className="text-[16px]" />
              </div>
            }
          />
        </Tooltip>
      ),
      tooltip: {
        content: [
          {
            name: 'colorMode',
            cacheSave: true,
            setter: 'SingleSelect',
            setterProps: {
              options: [
                {
                  value: ColorMode.FILL,
                  label: I18n.t('imageflow_canvas_fill'),
                },
                {
                  value: ColorMode.STROKE,
                  label: I18n.t('imageflow_canvas_stroke'),
                },
              ],
              layout: 'fill',
              defaultValue: ColorMode.FILL,
            },
          },
          {
            name: 'strokeWidth',
            visible: formValue =>
              (formValue as { colorMode: ColorMode })?.colorMode ===
              ColorMode.STROKE,
            setter: 'BorderWidth',
            setterProps: {
              min: 0,
              max: 20,
              defaultValue: defaultProps[textType].strokeWidth,
            },
            splitLine: true,
          },
          {
            name: 'stroke',
            visible: formValue =>
              (formValue as { colorMode: ColorMode })?.colorMode ===
              ColorMode.STROKE,
            setter: 'ColorPicker',
            setterProps: {
              showOpacity: false,
              defaultValue: defaultProps[textType].stroke,
            },
          },

          {
            name: 'fill',
            visible: formValue =>
              (formValue as { colorMode: ColorMode })?.colorMode !==
              ColorMode.STROKE,
            setter: 'ColorPicker',
            setterProps: {
              defaultValue: defaultProps[textType].fill,
            },
          },
        ],
      },
    },
    {
      name: 'textAlign',
      setter: 'TextAlign',
      setterProps: {
        defaultValue: defaultProps[textType].textAlign,
      },
    },
    {
      name: 'customType',
      setter: 'TextType',
      setterProps: {
        defaultValue: textType,
      },
    },
  ],
});

const createShapeMeta = (
  shapeType: Mode.RECT | Mode.CIRCLE | Mode.TRIANGLE,
): FormMeta => ({
  display: 'col',
  style: {
    padding: '16px',
  },
  content: [
    {
      name: 'colorMode',
      cacheSave: true,
      setter: 'SingleSelect',
      setterProps: {
        options: [
          {
            value: ColorMode.FILL,
            label: I18n.t('imageflow_canvas_fill'),
          },
          {
            value: ColorMode.STROKE,
            label: I18n.t('imageflow_canvas_stroke'),
          },
        ],
        layout: 'fill',
        defaultValue: ColorMode.FILL,
      },
    },
    {
      title: I18n.t('imageflow_canvas_fill'),
      name: 'fill',
      visible: formValue =>
        (formValue as { colorMode: ColorMode })?.colorMode === ColorMode.FILL,
      setter: 'ColorPicker',
      setterProps: {
        defaultValue: defaultProps[shapeType].fill,
      },
    },
    {
      title: I18n.t('imageflow_canvas_stroke'),
      name: 'strokeWidth',
      visible: formValue =>
        (formValue as { colorMode: ColorMode })?.colorMode === ColorMode.STROKE,
      setter: 'BorderWidth',
      setterProps: {
        min: 0,
        max: 50,
        defaultValue: defaultProps[shapeType].strokeWidth,
      },
      splitLine: true,
    },
    {
      name: 'stroke',
      visible: formValue =>
        (formValue as { colorMode: ColorMode })?.colorMode === ColorMode.STROKE,
      setter: 'ColorPicker',
      setterProps: {
        showOpacity: false,
        defaultValue: defaultProps[shapeType].stroke,
      },
    },
  ],
});

const createLineMeta = (
  lineType: Mode.STRAIGHT_LINE | Mode.PENCIL,
): FormMeta => ({
  display: 'col',
  style: {
    padding: '16px',
  },
  content: [
    {
      title: I18n.t('imageflow_canvas_line_style'),
      name: 'strokeWidth',
      setter: 'BorderWidth',
      setterProps: {
        min: 0,
        max: 20,
        defaultValue: defaultProps[lineType].strokeWidth,
      },
      splitLine: true,
    },
    {
      name: 'stroke',
      setter: 'ColorPicker',
      setterProps: {
        showOpacity: false,
        defaultValue: defaultProps[lineType].stroke,
      },
    },
  ],
});

type IFormMeta = Partial<Record<Mode, FormMeta>>;
export const formMetas: IFormMeta = {
  [Mode.BLOCK_TEXT]: createTextMeta(Mode.BLOCK_TEXT),
  [Mode.INLINE_TEXT]: createTextMeta(Mode.INLINE_TEXT),
  [Mode.RECT]: createShapeMeta(Mode.RECT),
  [Mode.CIRCLE]: createShapeMeta(Mode.CIRCLE),
  [Mode.TRIANGLE]: createShapeMeta(Mode.TRIANGLE),
  [Mode.STRAIGHT_LINE]: createLineMeta(Mode.STRAIGHT_LINE),
  [Mode.PENCIL]: createLineMeta(Mode.PENCIL),
  [Mode.IMAGE]: {
    display: 'col',
    style: {
      padding: '16px',
    },
    content: [
      {
        name: 'customId',
        setter: 'RefSelect',
        setterProps: {
          label: I18n.t('imageflow_canvas_reference', {}, '引用'),
          labelInside: false,
          className: 'flex-1 overflow-hidden max-w-[320px]',
        },
        splitLine: true,
      },
      {
        name: 'colorMode',
        cacheSave: true,
        setter: 'SingleSelect',
        setterProps: {
          options: [
            {
              value: ColorMode.FILL,
              label: I18n.t('imageflow_canvas_fill'),
            },
            {
              value: ColorMode.STROKE,
              label: I18n.t('imageflow_canvas_stroke'),
            },
          ],
          layout: 'fill',
          defaultValue: ColorMode.FILL,
        },
      },
      {
        name: 'src',
        visible: formValue =>
          (formValue as { colorMode: ColorMode })?.colorMode === ColorMode.FILL,
        setter: 'Uploader',
        setterProps: {
          getLabel: (isRefElement: boolean) => {
            if (isRefElement) {
              return I18n.t('imageflow_canvas_fill_preview', {}, '内容预览');
            } else {
              return I18n.t('imageflow_canvas_fill_image', {}, '内容');
            }
          },
        },
      },
      {
        name: 'customFixedType',
        visible: formValue =>
          (formValue as { colorMode: ColorMode })?.colorMode === ColorMode.FILL,
        setter: 'LabelSelect',
        setterProps: {
          className: 'flex-1',
          label: I18n.t('imageflow_canvas_fill_mode'),
          optionList: [
            {
              value: ImageFixedType.AUTO,
              label: I18n.t('imageflow_canvas_fill1'),
            },
            {
              value: ImageFixedType.FILL,
              label: I18n.t('imageflow_canvas_fill2'),
            },
            {
              value: ImageFixedType.FULL,
              label: I18n.t('imageflow_canvas_fill3'),
            },
          ],
          defaultValue: ImageFixedType.FILL,
        },
      },
      {
        name: 'opacity',
        visible: formValue =>
          (formValue as { colorMode: ColorMode })?.colorMode === ColorMode.FILL,
        setter: 'ColorPicker',
        setterProps: {
          showColor: false,
          defaultValue: defaultProps[Mode.IMAGE].opacity,
        },
      },
      {
        title: I18n.t('imageflow_canvas_stroke'),
        name: 'strokeWidth',
        visible: formValue =>
          (formValue as { colorMode: ColorMode })?.colorMode ===
          ColorMode.STROKE,
        setter: 'BorderWidth',
        setterProps: {
          min: 0,
          max: 50,
          defaultValue: defaultProps[Mode.IMAGE].strokeWidth,
        },
        splitLine: true,
      },
      {
        name: 'stroke',
        visible: formValue =>
          (formValue as { colorMode: ColorMode })?.colorMode ===
          ColorMode.STROKE,
        setter: 'ColorPicker',
        setterProps: {
          showOpacity: false,
          defaultValue: defaultProps[Mode.IMAGE].stroke,
        },
      },
    ],
  },
};
