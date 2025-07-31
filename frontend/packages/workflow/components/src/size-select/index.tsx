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

import { useEffect, useState, type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { CozInputNumber, Select } from '@coze-arch/coze-design';

export interface SizeSelectProps {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  value?: {
    width?: number;
    height?: number;
  };
  defaultValue?: {
    width?: number;
    height?: number;
  };
  onChange: (value: { width?: number; height?: number }) => void;
  readonly?: boolean;
  options?: {
    label: string;
    value: {
      width: number;
      height: number;
    };
    disabled?: boolean;
  }[];
  selectClassName?: string;
  layoutStyle?: 'vertical' | 'horizontal';
}

interface SizeOption {
  label: string;
  originValue?: {
    width: number;
    height: number;
  };
  value: string;
  disabled?: boolean;
}

function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

export const SizeSelect: FC<SizeSelectProps> = props => {
  const {
    options = [],
    value,
    defaultValue,
    minWidth = 0,
    maxWidth = Infinity,
    minHeight = 0,
    maxHeight = Infinity,
    onChange,
    readonly,
    selectClassName = '',
    layoutStyle = 'horizontal',
  } = props;

  const width = value?.width ?? defaultValue?.width ?? 0;
  const height = value?.height ?? defaultValue?.height ?? 0;

  const [sizeOptionList, setSizeOptionList] = useState<SizeOption[]>([]);
  const [sizeValue, setSizeValue] = useState<string>();

  const stringToWidthHeight = (str: string) => ({
    width: Number(str.split('x')[0]),
    height: Number(str.split('x')[1]),
  });

  const widthHeightToString = (v: { width: number; height: number }) =>
    `${v.width}x${v.height}`;

  useEffect(() => {
    const _sizeValue = widthHeightToString({ width, height });
    const _options: SizeOption[] = options.map(d => ({
      ...d,
      originValue: d.value,
      value: widthHeightToString(d.value),
    }));
    const selected = _options.find(d => d.value === _sizeValue);

    if (!selected) {
      _options.push({
        label: I18n.t('customize_key_1'),
        value: 'custom',
      });
    }

    setSizeValue(selected?.value ?? 'custom');
    setSizeOptionList(_options);
  }, [width, height, options]);

  return (
    <div className="flex flex-wrap gap-[12px]">
      <Select
        onChange={v => {
          if (v === 'custom') {
            return;
          }

          const wh = stringToWidthHeight(v as string);
          onChange(wh);
        }}
        disabled={readonly}
        className={`${selectClassName} ${
          layoutStyle === 'horizontal' ? '' : 'w-full'
        }`}
        value={sizeValue}
        optionList={sizeOptionList}
        size="small"
      />

      <div className="flex-1 flex items-center">
        <CozInputNumber
          size="small"
          prefix={I18n.t('imageflow_canvas_width')}
          hideButtons
          onNumberChange={w => {
            if (isNaN(w as number)) {
              return;
            }
            onChange({
              width: Number(w),
              height,
            });
          }}
          onBlur={e => {
            if (
              e.target.value === '' ||
              (isNumber(minWidth) && Number(e.target.value) < minWidth)
            ) {
              onChange({
                width: minWidth ?? 0,
                height,
              });
            } else if (Number(e.target.value) > maxWidth) {
              onChange({
                width: maxWidth,
                height,
              });
            }
          }}
          value={width}
          disabled={readonly}
          min={minWidth}
          max={maxWidth}
          className="flex-1"
        />
      </div>
      <div className="flex-1 flex items-center">
        <CozInputNumber
          prefix={I18n.t('imageflow_canvas_height')}
          size="small"
          hideButtons
          onNumberChange={h => {
            if (isNaN(h as number)) {
              return;
            }
            onChange({
              height: Number(h),
              width,
            });
          }}
          onBlur={e => {
            if (
              e.target.value === '' ||
              (isNumber(minHeight) && Number(e.target.value) < minHeight)
            ) {
              onChange({
                width,
                height: minHeight ?? 0,
              });
            } else if (
              isNumber(maxHeight) &&
              Number(e.target.value) > maxHeight
            ) {
              onChange({
                width,
                height: maxHeight,
              });
            }
          }}
          value={height}
          disabled={readonly}
          min={minHeight}
          max={maxHeight}
          className="flex-1"
        />
      </div>
    </div>
  );
};
