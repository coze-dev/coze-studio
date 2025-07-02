/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from 'react';

import { Select } from '@coze-arch/coze-design';

import { Uploader } from './uploader';
import { TextType } from './text-type';
import { TextFamily } from './text-family';
import { TextAlign } from './text-align';
import { SingleSelect } from './single-select';
import { RefSelect } from './ref-select';
import { LineHeight } from './line-height';
import { LabelSelect } from './label-select';
import { InputNumber } from './input-number';
import { FontSize } from './font-size';
import { ColorPicker } from './color-picker';
import { BorderWidth } from './border-width';

export const setters: Record<string, FC<any>> = {
  ColorPicker,
  TextAlign,
  InputNumber,
  TextType,
  SingleSelect,
  BorderWidth,
  Select,
  TextFamily,
  FontSize,
  LineHeight,
  LabelSelect,
  Uploader,
  RefSelect,
};
